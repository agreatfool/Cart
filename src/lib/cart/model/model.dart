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
    Future saveResult = null;
    CartPostHeader header = null;
    String html = '';

    try {

      // validate uuid
      if (!PinUtility.isUuid(uuid)) {
        throw new Exception('[CartModel] savePost: uuid format invalid: ${uuid}}');
      }
      // parse headers
      header = CartPostHeader.parseFromMarkdown(markdown);
      if (header == null) {
        throw new Exception('[CartModel] savePost: invalid headers format: ${uuid}}');
      }
      // validate category
      if (categoryList.find(header.category) == null) {
        throw new Exception('[CartModel savePost: category not found: ${header.category}]');
      }
      // parse markdown to html & escape html
      html = (const HtmlEscape()).convert(markdownToHtml(markdown));

      // execute
      if (postList.find(uuid) != null) {
        // update
        saveResult = _updatePost(uuid, markdown, header, html);
      } else {
        // add
        saveResult = _addPost(uuid, markdown, header, html);
      }

    } catch (e, trace) {
      PinUtility.handleError(e, trace);
      return new Future.error(e, trace);
    }

    return saveResult;
  }

  Future removePost(String uuid) {
    final completer = new Completer();
    CartPost post = null;

    try {
      // validate uuid
      if (!PinUtility.isUuid(uuid)) {
        throw new Exception('[CartModel] removePost: uuid format invalid: ${uuid}}');
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

  Future _addPost(String uuid, String markdown, CartPostHeader header, String html) {
    final completer = new Completer();
    int timestamp = PinTime.getTime();

    HashMap data = {
      'title': header.title,
      'created': timestamp,
      'updated': timestamp,
      'category': header.category
    };
    var post = new CartPost.fromJson(data);

    // database: category
    CartCategory category = categoryList.find(post.category);
    category.updated = timestamp;
    categoryList.update(category);

    // database: tags
    header.tags.forEach((HashMap<String, String> tagData) {
      CartTag tag = tagList.find(tagData['uuid']);
      if (tag != null) {
        tag.updated = timestamp;
        tagList.update(tag);
      } else {
        tagList.addNewTag(tagData['uuid'], tagData['name'], timestamp: timestamp);
      }
      post.addTagUuid(tagData['uuid']);
    });

    // database: attachments
    header.attachments.forEach((HashMap<String, String> attachmentData) {
      post.addNewAttachment(attachmentData['uuid'], attachmentData['name'], timestamp: timestamp);
    });

    // database: post
    postList.add(post);

    // save db files & create html file & sync with google drive
    _saveDatabase()
    .then((_) {
      return _uploadPost(post, markdown, html);
    })
    .then((_) {
      completer.complete(true);
    })
    .catchError((e, trace) {
      PinUtility.handleError(e, trace);
      completer.completeError(e, trace);
    });

    return completer.future;
  }

  Future _updatePost(String uuid, String markdown, CartPostHeader header, String html) {
    final completer = new Completer();
    int timestamp = PinTime.getTime();

    CartPost post = postList.find(uuid);
    post.title = header.title;
    post.category = header.category;
    post.updated = timestamp;

    // tags check
    post.checkPostTagsChange(tagList, header);

    // attachments check
    HashMap<String, Future> processList = post.checkPostAttachmentsChange(header);
    List<String> addedAttUuids = processList.keys;
    List<Future> addedAttFutures = processList.values;

    Future.wait(addedAttFutures)
    .then((List<GoogleDriveClient.File> responses) {
      // upload all attachments
      addedAttUuids.forEach((String attUuid) {
        CartPostAttachment attachment = post.findAttachment(attUuid);
        GoogleDriveClient.File file = responses.removeAt(0);
        attachment.driveId = file.id;
        post.updateAttachment(attachment);
      });
      return new Future.value(true);
    })
    .then((_) {
      return _saveDatabase();
    })
    .then((_) {
      completer.complete(true);
    })
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
    .then((GoogleDriveClient.File file) {
      return new Future.value(file.id);
    })
    .then((String driveId) {
      category = categoryList.find(uuid);
      category.driveId = driveId;
      categoryList.update(category);
      return _saveDatabase();
    })
    .then((_) {
      completer.complete(category);
    })
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
    .then((GoogleDriveClient.File file) {
      return _saveDatabase();
    })
    .then((_) {
      completer.complete(true);
    })
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
    .then((_) {
      completer.complete(tag);
    })
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
    .then((_) {
      completer.complete(true);
    })
    .catchError((e, trace) {
      PinUtility.handleError(e, trace);
      completer.completeError(e, trace);
    });

    return completer.future;
  }

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* UTIL: SAVE DATABASE FILES
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  Future _saveDatabase() {
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
    .then((GoogleDriveClient.File file) {
      completer.complete(file.id);
    })
    .catchError((e, trace) {
      PinUtility.handleError(e, trace);
      completer.completeError(e, trace);
    });

    return completer.future;
  }

  Future _uploadPost(CartPost post, String markdown, String html) {
    final completer = new Completer();
    String postBasePubDir = LibPath.join(CartConst.WWW_POST_PUB_PATH, post.uuid);
    String postBaseDataDir = LibPath.join(CartConst.WWW_POST_DATA_PATH, post.uuid);
    String mdPath = LibPath.join(postBaseDataDir, post.uuid + '.md');
    var attachmentUploadList = new List<Future>(); // store upload futures
    var attachmentList = new List<CartPostAttachment>(); // store upload attachments

    PinUtility.createDir(postBasePubDir) // check & create local base public dir
    .then((bool created) {
      if (!created) {
        throw new Exception('[CartModel] _uploadPost: Create dir failed: ${postBasePubDir}');
      }
      return PinUtility.createDir(postBaseDataDir);
    })
    .then((bool created) { // check & create local base data dir
      if (!created) {
        throw new Exception('[CartModel] _uploadPost: Create dir failed: ${postBaseDataDir}');
      }
      return new Future.value(true);
    })
    .then((_) {
      // update or create local markdown & html files
      return Future.wait([
          (new File(mdPath)).writeAsString(markdown),
          (new File(LibPath.join(postBaseDataDir, post.uuid + '.html'))).writeAsString(html)
      ]);
    })
    .then((_) {
      // upload markdown file
      CartCategory category = categoryList.find(post.category);
      if (category == null) {
        throw new Exception('[CartModel _uploadPost: category not found: ${post.category}]');
      }
      return _drive.uploadFile(mdPath, driveId: post.driveId, parents: [category.driveId]);
    })
    .then((GoogleDriveClient.File file) {
      post.driveId = file.id; // new post has no drive id, update it
      postList.update(post);
      return new Future.value(true);
    })
    .then((_) {
      // upload attachments
      post.attachments.forEach((String attachmentUuid, CartPostAttachment attachment) {
        if (attachment.driveId == null) {
          // need to be uploaded
          attachmentList.add(attachment);
          attachmentUploadList.add(_drive.uploadFile(LibPath.join(postBasePubDir, attachment.title), parents: [post.category]));
        }
      });
      return Future.wait(attachmentUploadList);
    })
    .then((List<GoogleDriveClient.File> responses) {
      attachmentList.forEach((CartPostAttachment attachment) {
        GoogleDriveClient.File file = responses.removeAt(0);
        attachment.driveId = file.id;
        post.updateAttachment(attachment);
      });
      return new Future.value(true);
    })
    .then((_) {
      // finish process
      completer.complete(true);
    })
    .catchError((e, trace) {
      PinUtility.handleError(e, trace);
      completer.completeError(e, trace);
    });

    return completer.future;
  }

}