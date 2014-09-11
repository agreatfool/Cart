part of cart;

class CartModel {

  static CartModel _model;

  static CartModel get instance {
    if (_model == null) {
      _model = new CartModel();
    }

    return _model;
  }

  CartPostList posts;
  CartCategoryList categories;
  CartTagList tags;
  PinGoogleDrive _drive;

  CartModel() {
    // init data classes
    posts = new CartPostList();
    categories = new CartCategoryList(posts);
    tags = new CartTagList(posts);

    // check web public dir
    PinUtility.checkDirExistsSync(CartConst.WWW_POST_PATH, createWhenNotExist: true);

    // handle
    _drive = CartSystem.instance.drive;
  }

  // FIXME posts list shall have some privilege control, some posts shall only be available to logged in user

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
      if (categories.find(header.category) == null) {
        throw new Exception('[CartModel savePost: category not found: ${header.category}]');
      }
      // parse markdown to html & escape html
      html = (const HtmlEscape()).convert(markdownToHtml(markdown));
    } catch (e, trace) {
      PinUtility.handleError(e, trace);
      return new Future.error(e, trace);
    }

    // execute
    if (posts.find(uuid) != null) {
      // update
      saveResult = _updatePost(uuid, markdown, header, html);
    } else {
      // add
      saveResult = _addPost(uuid, markdown, header, html);
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
      post = posts.find(uuid);
      if (post == null) {
        throw new Exception('[CartModel] removePost: post not found: ${uuid}');
      }
    } catch (e, trace) {
      PinUtility.handleError(e, trace);
      return new Future.error(e, trace);
    }

    posts.remove(uuid, categories, tags);

    var driveIoList = new List<Future>();
    driveIoList.add(_drive.drive_trash(post.driveId));
    if (post.attachments.length > 0) {
      post.attachments.forEach((String attUuid, CartPostAttachment attachment) {
        driveIoList.add(_drive.drive_trash(attachment.driveId));
      });
    }

    Future.wait(driveIoList)
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
      'link': header.link,
      'created': timestamp,
      'updated': timestamp,
      'author': CartSystem.instance.session['name'],
      'category': header.category
    };
    var post = new CartPost.fromJson(data);

    // database: category
    CartCategory category = categories.find(post.category);
    category.updated = timestamp;
    categories.update(category);
    categories.addPostIntoCategory(post.category, uuid);

    // database: tags
    header.tags.forEach((HashMap<String, String> tagData) {
      CartTag tag = tags.find(tagData['uuid']);
      if (tag != null) {
        tag.updated = timestamp;
        tags.update(tag);
      } else {
        tags.addNewTag(tagData['uuid'], tagData['name'], timestamp: timestamp);
      }
      post.addTagUuid(tagData['uuid']);
      tags.addPostIntoTag(tagData['uuid'], uuid);
    });

    // database: attachments
    header.attachments.forEach((HashMap<String, String> attachmentData) {
      post.addNewAttachment(attachmentData['uuid'], attachmentData['name'], timestamp: timestamp);
    });

    // database: post
    posts.add(post);

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

    CartPost post = posts.find(uuid);
    post.title = header.title;
    post.link = header.link;
    post.updated = timestamp;

    // category check
    if (post.category != header.category) {
      categories.switchPostCategory(post.category, header.category, uuid);
      post.category = header.category;
    }

    // tags check
    post.checkPostTagsChange(tags, header);

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

    categories.addNewCategory(uuid, name, timestamp: timestamp);

    _drive.drive_folder(name, parents: [CartSystem.instance.googleDriveRootFolder])
    .then((GoogleDriveClient.File file) {
      return new Future.value(file.id);
    })
    .then((String driveId) {
      CartCategory category = categories.find(uuid);
      category.driveId = driveId;
      categories.update(category);
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

  Future removeCategory(String uuid) {
    CartCategory category = null;

    try {
      // validate uuid
      if (!PinUtility.isUuid(uuid)) {
        throw new Exception('[CartModel] removeCategory: uuid format invalid: ${uuid}}');
      }
      category = categories.find(uuid);
      if (category == null) {
        throw new Exception('[CartModel] removeCategory: Category not found, uuid: ${uuid}');
      }
      categories.remove(uuid, posts, tags);
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

    tags.addNewTag(uuid, name, timestamp: timestamp);

    tags.dump()
    .then((_) {
      completer.complete(true);
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

    tags.remove(uuid, posts);

    tags.dump()
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
      posts.dump(),
      categories.dump(),
      tags.dump()
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
        // no necessary root blog folder, create it
        return _drive.drive_folder(rootFolderName);
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
    String postBaseDir = LibPath.join(CartConst.WWW_POST_PATH, post.uuid);
    String mdPath = LibPath.join(postBaseDir, post.uuid + '.md');
    String htmlPath = LibPath.join(postBaseDir, post.uuid + '.html');
    var attachmentUploadList = new List<Future>(); // store upload futures
    var attachmentList = new List<CartPostAttachment>(); // store upload attachments

    PinUtility.createDir(postBaseDir) // check & create local base dir first
    .then((bool created) {
      if (!created) {
        throw new Exception('[CartModel] _uploadPost: Create dir failed: ${postBaseDir}');
      }
      return new Future.value(true);
    })
    .then((_) {
      // update or create local markdown & html files
      return Future.wait([
          (new File(mdPath)).writeAsString(markdown),
          (new File(htmlPath)).writeAsString(html)
      ]);
    })
    .then((_) {
      // upload markdown file
      CartCategory category = categories.find(post.category);
      if (category == null) {
        throw new Exception('[CartModel _uploadPost: category not found: ${post.category}]');
      }
      return _drive.uploadFile(mdPath, driveId: post.driveId, parents: [category.driveId]);
    })
    .then((GoogleDriveClient.File file) {
      post.driveId = file.id; // new post has no drive id, update it
      posts.update(post);
      return new Future.value(true);
    })
    .then((_) {
      // upload attachments
      post.attachments.forEach((String attachmentUuid, CartPostAttachment attachment) {
        if (attachment.driveId == null) {
          // need to be uploaded
          attachmentList.add(attachment);
          attachmentUploadList.add(_drive.uploadFile(LibPath.join(postBaseDir, attachment.title), parents: [post.category]));
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