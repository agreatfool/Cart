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
    categoryList = new CartCategoryList(postList);
    tagList = new CartTagList(postList);

    // check web public dir & post data dir
    PinUtility.checkDirExistsSync(CartConst.WWW_POST_PUB_PATH, createWhenNotExist: true);
    PinUtility.checkDirExistsSync(CartConst.WWW_POST_DATA_PATH, createWhenNotExist: true);

    // google drive handle
    _drive = CartSystem.instance.drive;
  }

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* API: POST
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  Future savePost(String uuid, String markdown) {
    final completer = new Completer();
    int timestamp = PinTime.getTime();

    CartPostHeader header = null;
    String html = '';
    bool isAddAction;

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
      // parse markdown to html & escape html
      html = markdownToHtml(markdown);

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
    _preparePostUpload(post, html)
    .then((CartPost _) {
      post = _;
      return _postUpload(post, markdown);
    })
    .then((CartPost _) => saveDatabase())
    .then((_) => completer.complete(true))
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
    ioList.add((new File(LibPath.join(postBaseDataDir, post.uuid + '.md'))).delete());
    ioList.add((new File(LibPath.join(postBaseDataDir, post.uuid + '.html'))).delete());
    ioList.add(_drive.drive_trash(post.driveId));
    // attachments
    if (post.attachments.length > 0) {
      post.attachments.forEach((String attUuid, CartPostAttachment attachment) {
        ioList.add((new File(LibPath.join(CartConst.WWW_POST_PUB_PATH, post.uuid, attachment.title))).delete());
        ioList.add(_drive.drive_trash(attachment.driveId));
      });
    }

    Future.wait(ioList)
    .then((_) => completer.complete(true))
    .catchError((e, trace) {
      PinUtility.handleError(e, trace);
      completer.completeError(e, trace);
    });

    return completer.future;
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

    tagList.remove(uuid, postList);

    tagList.dump()
    .then((_) => completer.complete(true))
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
        return new Future.value(files.items.removeAt(0)); // shall only contains 1 item
      }
    })
    .then((GoogleDriveClient.File file) => completer.complete(file.id))
    .catchError((e, trace) {
      PinUtility.handleError(e, trace);
      completer.completeError(e, trace);
    });

    return completer.future;
  }

  Future<CartPost> _preparePostUpload(CartPost post, String html) {
    final completer = new Completer();

    String postBasePubDir = LibPath.join(CartConst.WWW_POST_PUB_PATH, post.uuid);
    String postBaseDataDir = LibPath.join(CartConst.WWW_POST_DATA_PATH, post.uuid);
    var attachmentUploadList = new List<Future>(); // store upload futures
    var attachmentList = new List<CartPostAttachment>(); // store upload attachments

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
    .then((_) => new File(LibPath.join(postBaseDataDir, post.uuid + '.html'))..writeAsString(html)) // update or create local html file
    .then((_) {
      PinLogger.instance.fine('[CartPost] _preparePostUpload: html file "${LibPath.join(postBaseDataDir, post.uuid + '.html')}" wrote');
      // upload attachments
      post.attachments.forEach((String attachmentUuid, CartPostAttachment attachment) {
        if (attachment.driveId == null) {
          // need to be uploaded
          attachmentList.add(attachment);
          attachmentUploadList.add(_drive.uploadFile(LibPath.join(postBasePubDir, attachment.title), parents: [post.category]));
          PinLogger.instance.fine('[CartPost] _preparePostUpload: attachment upload task added: "${attachment.title}"');
        }
      });
      return Future.wait(attachmentUploadList);
    })
    .then((List<GoogleDriveClient.File> responses) {
      attachmentList.forEach((CartPostAttachment attachment) {
        GoogleDriveClient.File file = responses.removeAt(0);
        attachment.driveId = file.id;
        post.updateAttachment(attachment);
        PinLogger.instance.fine('[CartPost] _preparePostUpload: attachment upload task done: "${attachment.title}":"${attachment.driveId}"');
      });
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
        return mdFile.writeAsString(''); // create empty markdown file if it does not exist
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