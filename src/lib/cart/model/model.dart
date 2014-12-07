part of cart;

class CartModel {

  static CartModel _model;

  static CartModel get instance {
    if (_model == null) {
      _model = new CartModel();
    }

    return _model;
  }

  CartPostList postList;
  CartCategoryList categoryList;
  CartTagList tagList;
  PinGoogleDrive _drive;

  CartModel() {
    // init data classes
    postList = new CartPostList();
    categoryList = new CartCategoryList();
    tagList = new CartTagList();

    // check web public dir & post data dir
    PinUtility.checkDirExistsSync(CartConst.WWW_POST_PUB_PATH, createWhenNotExist: true);
    PinUtility.checkDirExistsSync(CartConst.WWW_POST_DATA_PATH, createWhenNotExist: true);

    // google drive handle
    _drive = CartSystem.instance.drive;
  }

  void flush() {
    // clear all data in model classes
    postList.flush();
    categoryList.flush();
    tagList.flush();
  }

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* API: POST
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  Future<CartPost> savePost(String uuid, String markdown) {
    final completer = new Completer();
    int timestamp = PinTime.getTime();

    CartPostHeader header = null;
    bool isAddAction;

    // FIXME
    /**
     * 现有的附件逻辑是每次上传附件的时候，将附件上传到web服务器，并将附件资料写入post的头部
     * 在save post的时候，进行drive上传
     * 则该附件附着于post
     * 到这步的逻辑和wordpress的附件处理逻辑是一致的
     * 但是
     * 之后由于没有附件管理界面，所以无法删除
     * 之后需要添加相关的逻辑进行处理
     */
    /**
     * save post的逻辑需要额外处理category变更的情况（仅限于更新情况，新建post不存在这种情况）：
     * 当category变更的时候，post的markdown文件，和一系列已经有driveId（曾经上传过）的附件
     * 都需要将其parent从原来的category，变更为新的category
     */

    try {

      // validate uuid
      if (!PinUtility.isUuid(uuid)) {
        throw new Exception('[CartModel] savePost: uuid format invalid: ${uuid}}');
      }
      // parse headers
      header = CartPostHeader.parseFromMarkdown(uuid, markdown);
      PinLogger.instance.fine('[CartPost] savePost: header parsed from markdown: \n${header.toJson()}');
      // validate category
      if (categoryList.find(header.category.uuid) == null) {
        throw new Exception('[CartModel] savePost: category not found: ${header.category.toJson()}');
      }
      // remove header info from markdown string
      markdown = CartPost.parseMarkdownContent(markdown);

    } catch (e, trace) {
      PinUtility.handleError(e, trace);
      return new Future.error(e, trace);
    }

    // execute
    CartPost post = postList.find(uuid);
    if (post == null) {
      isAddAction = true;
      post = new CartPost.fromJson({
          "uuid": uuid,
          "title": header.title,
          "created": timestamp,
          "updated": timestamp,
          "category": header.category.uuid
      });
    } else {
      isAddAction = false;
      post.title = header.title;
      post.category = header.category.uuid;
      post.updated = timestamp;
    }

    // database: category
    categoryList.update(header.category);

    // database: tags
    header.tags.forEach((String tagUuid, CartTag headerTag) {
      tagList.update(headerTag);
    });
    post.tags = header.tags.keys.toList();

    // database: attachments
    post.attachments = header.attachments;
    PinLogger.instance.fine('[CartPost] savePost: post data updated: \n${post.toJson()}');

    // database: post
    if (isAddAction) {
      postList.add(post);
    } else {
      postList.update(post);
    }

    // create html file & sync with google drive & save db files
    _preparePostUpload(post)
    .then((CartPost _) {
      post = _;
      return _postUpload(post, markdown);
    })
    .then((CartPost _) {
      post = _;
      return saveDatabase();
    })
    .then((_) => completer.complete(post))
    .catchError((e, trace) {
      PinUtility.handleError(e, trace);
      completer.completeError(e, trace);
    });

    return completer.future;
  }

  Future removePost(String uuid) {
    final completer = new Completer();
    CartPost post = null;

    try {
      // validate uuid
      if (!PinUtility.isUuid(uuid)) {
        throw new Exception('[CartModel] removePost: uuid format invalid: ${uuid}');
      }
      // validate post
      post = postList.find(uuid);
      if (post == null) {
        throw new Exception('[CartModel] removePost: post not found: ${uuid}');
      }
    } catch (e, trace) {
      PinUtility.handleError(e, trace);
      return new Future.error(e, trace);
    }

    postList.remove(uuid);

    String postBaseDataDir = LibPath.join(CartConst.WWW_POST_DATA_PATH, post.uuid);
    var ioList = new List<Future>();
    // post
    ioList.add(PinUtility.deleteFileIfExists(LibPath.join(postBaseDataDir, post.uuid + '.md')));
    ioList.add(PinUtility.deleteFileIfExists(LibPath.join(postBaseDataDir, post.uuid + '.html')));
    ioList.add(_drive.drive_trash(post.driveId));
    // attachments
    if (post.attachments.length > 0) {
      post.attachments.forEach((String attUuid, CartPostAttachment attachment) {
        ioList.add(PinUtility.deleteFileIfExists(LibPath.join(CartConst.WWW_POST_PUB_PATH, post.uuid, attachment.title)));
        ioList.add(_drive.drive_trash(attachment.driveId));
      });
    }

    Future.wait(ioList)
    .then((_) => PinUtility.deleteDirIfExists(postBaseDataDir))
    .then((_) => saveDatabase())
    .then((_) => completer.complete(true))
    .catchError((e, trace) {
      PinUtility.handleError(e, trace);
      completer.completeError(e, trace);
    });

    return completer.future;
  }

  List<CartPost> searchPost(HashMap options, bool isUuidSearch, {bool isMaster: false, int pageNumber: 1}) {
    int postsPerPage = CartSystem.instance.setting['postsPerPage'];

    List<CartPost> posts = [];

    String categoryUuid = null;
    List<String> tagUuids = [];
    int start = 0;
    int end = PinTime.TIMESTAMP_MAX;

    // collect conditions
    if (options.containsKey('category')) {
      String identify = options['category'];
      CartCategory category = isUuidSearch ? categoryList.find(identify) : categoryList.findByTitle(identify);
      if (category == null) {
        throw new Exception('[CartModel] searchPost: target category data not found, identify: ${identify}');
      }
      categoryUuid = category.uuid;
    }
    if (options.containsKey('tags')) {
      if (!(options['tags'] is List)) {
        throw new Exception('[CartModel] searchPost: tags identify invalid: ${options['tags']}');
      }
      List<String> tagIdentifies = options['tags'];
      tagIdentifies.forEach((String tagIdentify) {
        CartTag tag = isUuidSearch ? tagList.find(tagIdentify) : tagList.findByTitle(tagIdentify);
        if (tag == null) {
          throw new Exception('[CartModel] searchPost: target tag data not found, identify: ${tagIdentify}');
        }
        tagUuids.add(tag.uuid);
      });
    }
    if (options.containsKey('start') && options['start'] is int) {
      start = options['start'];
    }
    if (options.containsKey('end') && options['end'] is int) {
      end = options['end'];
    }

    // filter posts in list
    postList.list.forEach((String uuid, CartPost post) {
      bool match = true;

      if (categoryUuid != null && post.category != categoryUuid) {
        match = false;
      }
      if (tagUuids.length > 0) {
        for (int index = 0; index < tagUuids.length; index++) {
          if (!post.tags.contains(tagUuids[index])) {
            match = false;
            break;
          }
        }
      }
      if (post.created < start || post.created > end) {
        match = false;
      }
      if (!isMaster && !post.isPublic()) {
        match = false;
      }

      if (match) {
        posts.add(post);
      }
    });

    // sort posts, DESC by post.created
    posts.sort((CartPost a, CartPost b) {
      if (a.created > b.created) {
        return -1;
      } else if (a.created == b.created) {
        return 0;
      } else {
        return 1;
      }
    });

    if (pageNumber > 0) { // normal search with pages, otherwise, get all posts
      int startPos = (pageNumber - 1) * postsPerPage;
      int endPos = startPos + postsPerPage;
      if (startPos >= posts.length) {
        return []; // target page not exists
      }
      if (endPos > posts.length) {
        endPos = posts.length; // endPos is exclusive in method "getRange"
      }
      posts = posts.getRange(startPos, endPos).toList();
    }

    return posts;
  }

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* API: CATEGORY
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  Future addCategory(String uuid, String name) {
    // validate uuid
    if (!PinUtility.isUuid(uuid)) {
      try {
        throw new Exception('[CartModel] addCategory: uuid format invalid: ${uuid}}');
      } catch (e, trace) {
        PinUtility.handleError(e, trace);
        return new Future.error(e, trace);
      }
    }

    final completer = new Completer();
    var timestamp = PinTime.getTime();

    CartCategory category = categoryList.addNewCategory(uuid, name, timestamp: timestamp);

    _drive.drive_folder(name, parents: [CartSystem.instance.googleDriveRootFolder])
    .then((GoogleDriveClient.File file) => new Future.value(file.id))
    .then((String driveId) {
      category = categoryList.find(uuid);
      category.driveId = driveId;
      categoryList.update(category);
      return saveDatabase();
    })
    .then((_) => completer.complete(category))
    .catchError((e, trace) {
      PinUtility.handleError(e, trace);
      completer.completeError(e, trace);
    });

    return completer.future;
  }

  Future removeCategory(String uuid) {
    CartCategory category = null;

    try {
      // validate uuid
      if (!PinUtility.isUuid(uuid)) {
        throw new Exception('[CartModel] removeCategory: uuid format invalid: ${uuid}}');
      }
      category = categoryList.find(uuid);
      if (category == null) {
        throw new Exception('[CartModel] removeCategory: Category not found, uuid: ${uuid}');
      }
      categoryList.remove(uuid, postList);
    } catch (e, trace) {
      PinUtility.handleError(e, trace);
      return new Future.error(e, trace);
    }

    final completer = new Completer();

    _drive.drive_trash(category.driveId)
    .then((GoogleDriveClient.File file) => saveDatabase())
    .then((_) => completer.complete(true))
    .catchError((e, trace) {
      PinUtility.handleError(e, trace);
      completer.completeError(e, trace);
    });

    return completer.future;
  }

  Future updateCategoryName(String uuid, String name) {
    CartCategory category = null;

    try {
      // validate uuid
      if (!PinUtility.isUuid(uuid)) {
        throw new Exception('[CartModel] updateCategoryName: uuid format invalid: ${uuid}}');
      }
      category = categoryList.find(uuid);
      if (category == null) {
        throw new Exception('[CartModel] updateCategoryName: Category not found, uuid: ${uuid}');
      }
      if (categoryList.findByTitle(name) != null) {
        throw new Exception('[CartModel] updateCategoryName: Category with name ${name} already exists');
      }
    } catch (e, trace) {
      PinUtility.handleError(e, trace);
      return new Future.error(e, trace);
    }

    category.title = name;
    category.updated = PinTime.getTime();
    categoryList.update(category);

    final completer = new Completer();

    _drive.renameFile(category.driveId, name)
    .then((GoogleDriveClient.File file) => saveDatabase())
    .then((_) => completer.complete(category))
    .catchError((e, trace) {
      PinUtility.handleError(e, trace);
      completer.completeError(e, trace);
    });

    return completer.future;
  }

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* API: TAG
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  Future addTag(String uuid, String name) {
    // validate uuid
    if (!PinUtility.isUuid(uuid)) {
      try {
        throw new Exception('[CartModel] addCategory: uuid format invalid: ${uuid}}');
      } catch (e, trace) {
        PinUtility.handleError(e, trace);
        return new Future.error(e, trace);
      }
    }

    final completer = new Completer();
    int timestamp = PinTime.getTime();

    CartTag tag = tagList.addNewTag(uuid, name, timestamp: timestamp);

    tagList.dump()
    .then((_) => completer.complete(tag))
    .catchError((e, trace) {
      PinUtility.handleError(e, trace);
      completer.completeError(e, trace);
    });

    return completer.future;
  }

  Future removeTag(String uuid) {
      try {
        // validate uuid
        if (!PinUtility.isUuid(uuid)) {
          throw new Exception('[CartModel] addCategory: uuid format invalid: ${uuid}}');
        }
      } catch (e, trace) {
        PinUtility.handleError(e, trace);
        return new Future.error(e, trace);
      }

    final completer = new Completer();

    tagList.remove(uuid, postList);

    tagList.dump()
    .then((_) => completer.complete(true))
    .catchError((e, trace) {
      PinUtility.handleError(e, trace);
      completer.completeError(e, trace);
    });

    return completer.future;
  }

  Future updateTagName(String uuid, String name) {
    CartTag tag = null;

    try {
      // validate uuid
      if (!PinUtility.isUuid(uuid)) {
        throw new Exception('[CartModel] updateTagName: uuid format invalid: ${uuid}}');
      }
      tag = tagList.find(uuid);
      if (tag == null) {
        throw new Exception('[CartModel] updateTagName: Tag not found, uuid: ${uuid}');
      }
      if (tagList.findByTitle(name) != null) {
        throw new Exception('[CartModel] updateTagName: Tag with name ${name} already exists');
      }
    } catch (e, trace) {
      PinUtility.handleError(e, trace);
      return new Future.error(e, trace);
    }

    tag.title = name;
    tag.updated = PinTime.getTime();
    tagList.update(tag);

    final completer = new Completer();

    saveDatabase()
    .then((_) => completer.complete(tag))
    .catchError((e, trace) {
      PinUtility.handleError(e, trace);
      completer.completeError(e, trace);
    });

    return completer.future;
  }

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* UTIL: SAVE DATABASE FILES
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  Future saveDatabase() {
    return Future.wait([
      postList.dump(),
      categoryList.dump(),
      tagList.dump()
    ]);
  }

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* UTIL: GOOGLE DRIVER
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  Future<String> searchBlogRootFolder() {
    final completer = new Completer();
    String rootFolderName = CartSystem.instance.setting['googleDriveRootFolder'];

    _drive.drive_list(maxResults: 1, queries: [
        PinGoogleDrive.qIsRootFiles,
        PinGoogleDrive.qIsFolder,
        "title = '${rootFolderName}'"
    ])
    .then((GoogleDriveClient.FileList files) {
      if (files.items.length <= 0) {
        return _drive.drive_folder(rootFolderName); // necessary root blog folder does not exist, create it
      } else {
        return new Future.value(files.items[0]); // shall only contains 1 item
      }
    })
    .then((GoogleDriveClient.File file) => completer.complete(file.id))
    .catchError((e, trace) {
      PinUtility.handleError(e, trace);
      completer.completeError(e, trace);
    });

    return completer.future;
  }

  Future<CartPost> _preparePostUpload(CartPost post) {
    final completer = new Completer();

    String postBasePubDir = LibPath.join(CartConst.WWW_POST_PUB_PATH, post.uuid);
    String postBaseDataDir = LibPath.join(CartConst.WWW_POST_DATA_PATH, post.uuid);
    var attachmentUploadList = new List<Future>(); // store upload futures
    var attachmentList = new List<CartPostAttachment>(); // store upload attachments

    CartCategory category = categoryList.find(post.category);

    // FIXME 需要先检查所有需要上传的附件在google drive里存在不存在，存在则报错退出

    PinUtility.createDir(postBasePubDir) // check & create local base public dir
    .then((bool created) {
      if (!created) {
        throw new Exception('[CartModel] _preparePostUpload: Create dir failed: "${postBasePubDir}"');
      }
      PinLogger.instance.fine('[CartPost] _preparePostUpload: directory "${postBasePubDir}" checked');
      return PinUtility.createDir(postBaseDataDir);
    })
    .then((bool created) { // check & create local base data dir
      if (!created) {
        throw new Exception('[CartModel] _preparePostUpload: Create dir failed: "${postBaseDataDir}"');
      }
      PinLogger.instance.fine('[CartPost] _preparePostUpload: directory "${postBaseDataDir}" checked');
      return new Future.value(true);
    })
    .then((_) {
      // upload attachments
      post.attachments.forEach((String attachmentUuid, CartPostAttachment attachment) {
        if (attachment.driveId == null) {
          // need to be uploaded
          attachmentList.add(attachment);
          attachmentUploadList.add(_drive.uploadFile(LibPath.join(postBasePubDir, attachment.title), parents: [category.driveId]));
          PinLogger.instance.fine('[CartPost] _preparePostUpload: attachment upload task added: "${attachment.title}"');
        }
      });
      return Future.wait(attachmentUploadList);
    })
    .then((List<GoogleDriveClient.File> responses) {
      for (int index = 0; index < responses.length; index++) {
        GoogleDriveClient.File file = responses[index];
        CartPostAttachment attachment = attachmentList[index];
        attachment.driveId = file.id;
        post.updateAttachment(attachment);
        PinLogger.instance.fine('[CartPost] _preparePostUpload: attachment upload task done: "${attachment.title}":"${attachment.driveId}"');
      }
      postList.update(post);
      return new Future.value(true);
    })
    .then((_) => completer.complete(post)) // finish process
    .catchError((e, trace) {
      PinUtility.handleError(e, trace);
      completer.completeError(e, trace);
    });

    return completer.future;
  }

  Future<CartPost> _postUpload(CartPost post, String markdown) {
    final completer = new Completer();

    CartCategory category = categoryList.find(post.category);

    String mdPath = LibPath.join(CartConst.WWW_POST_DATA_PATH, post.uuid, post.uuid + '.md');
    File mdFile = new File(mdPath);

    mdFile.exists()
    .then((bool exists) {
      if (!exists) {
        return mdFile.writeAsString(''); // create empty markdown file if it does not exist for google drive insert
      } else {
        return new Future.value(true);
      }
    })
    .then((_) {
      if (post.driveId == null) {
        return _drive.drive_insert(mdPath, parents: [category.driveId]);
      } else {
        return new Future.value(true);
      }
    })
    .then((_) {
      if (post.driveId == null) {
        post.driveId = _.id; // _ is GoogleDriveClient.File
        PinLogger.instance.fine('[CartPost] _postUpload: new markdown file created, driveId: "${_.id}"');
      }
      postList.update(post);
      // append header info
      markdown = post.generateMarkdownWithHeader(markdown);
      return mdFile.writeAsString(markdown);
    })
    .then((_) {
      PinLogger.instance.fine('[CartPost] _postUpload: local markdown file wrote: "${mdPath}"');
      return _drive.drive_update(post.driveId, markdown);
    })
    .then((GoogleDriveClient.File uploadedFile) {
      PinLogger.instance.fine('[CartPost] _postUpload: markdown file uploaded: "${uploadedFile.id}"');
      completer.complete(post);
    })
    .catchError((e, trace) {
      PinUtility.handleError(e, trace);
      completer.completeError(e, trace);
    });

    return completer.future;
  }

}