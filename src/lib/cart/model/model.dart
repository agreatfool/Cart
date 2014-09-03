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

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* API: POST
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  Future savePost(String uuid, String markdown) {
    final completer = new Completer();

    // validate uuid
    if (!PinUtility.isUuid(uuid)) {
      PinLogger.instance.shout('[CartModel] savePost: uuid format invalid: ${uuid}}');
      completer.complete(null);
    }

    // parse headers
    var header = new CartPostHeader.fromMarkdown(markdown);
    if (header == null) {
      completer.complete(null); // invalid headers format
    }

    // parse markdown to html & escape html
    String html = markdownToHtml(markdown);
    html = (const HtmlEscape()).convert(html);

    if (posts.find(uuid) != null) {
      // update
      _updatePost(uuid, markdown, header, html).then((_) => completer.complete(_));
    } else {
      // add
      _addPost(uuid, markdown, header, html).then((_) => completer.complete(_));
    }

    return completer.future;
  }

  Future removePost(String uuid) {

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
    _saveDatabase().then((_) {
      _uploadPost(post, markdown, html).then((_) {
        completer.complete();
      });
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
    List<String> addedAttList = processList.keys;
    List<Future> addedAttFutures = processList.values;

    Future.wait(addedAttFutures)
    .then((List<GoogleDriveClient.File> responses) {
      // upload all attachments
      addedAttList.forEach((String attUuid) {
        CartPostAttachment attachment = post.findAttachment(attUuid);
        GoogleDriveClient.File file = responses.removeAt(0);
        attachment.driveId = file.id;
        post.updateAttachment(attachment);
      });
      return new Future.value(true);
    })
    .then((_) {
      _saveDatabase().then((_) {
        completer.complete();
      });
    });

    return completer.future;
  }

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* API: CATEGORY
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  Future addCategory(String uuid, String name) {
    final completer = new Completer();

    var timestamp = PinTime.getTime();

    categories.addNewCategory(uuid, name, timestamp: timestamp);

    // TODO database files & drive

    return completer.future;
  }

  Future removeCategory(String uuid) {

  }

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* API: TAG
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  Future addTag(String uuid, String name) {
    final completer = new Completer();

    int timestamp = PinTime.getTime();

    tags.addNewTag(uuid, name, timestamp: timestamp);

    tags.dump().then((_) {
      completer.complete(_);
    });

    return completer.future;
  }

  Future removeTag(String uuid) {

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
  Future _uploadPost(CartPost post, String markdown, String html) {
    final completer = new Completer();
    String postBaseDir = LibPath.join(CartConst.WWW_POST_PATH, post.uuid);
    String mdPath = LibPath.join(postBaseDir, post.uuid + '.md');
    String htmlPath = LibPath.join(postBaseDir, post.uuid + '.html');

    PinUtility.createDir(postBaseDir)
    .then((bool created) {
      // check & create local base dir first
      if (!created) {
        PinLogger.instance.shout('[CartModel] _uploadPost: Create dir failed: ${postBaseDir}');
        completer.complete(false);
      }
      return new Future.value(created);
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
      final completer = new Completer();
      CartCategory category = categories.find(post.category);
      _drive.uploadFile(mdPath, driveId: post.driveId, parents: [category.driveId]).then((GoogleDriveClient.File file) {
        post.driveId = file.id; // new post has no drive id, update it
        posts.update(post);
        completer.complete(file);
      });
      return completer.future;
    })
    .then((_) {
      // upload attachments
      final completer = new Completer();
      var uploadList = new List<Future>(); // store upload futures
      var attachmentList = new List<CartPostAttachment>(); // store upload attachments
      post.attachments.forEach((String attachmentUuid, CartPostAttachment attachment) {
        if (attachment.driveId == null) {
          // need to be uploaded
          attachmentList.add(attachment);
          uploadList.add(_drive.uploadFile(LibPath.join(postBaseDir, attachment.title), parents: [post.category]));
        }
      });
      Future.wait(uploadList).then((List<GoogleDriveClient.File> responses) {
        attachmentList.forEach((CartPostAttachment attachment) {
          GoogleDriveClient.File file = responses.removeAt(0);
          attachment.driveId = file.id;
          post.updateAttachment(attachment);
        });
        completer.complete();
      });
      return completer.future;
    })
    .then((_) {
      // finish process
      completer.complete(true);
    });

    return completer.future;
  }

}