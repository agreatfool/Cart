part of cart;

class CartSystem {

  static CartSystem _instance;

  static CartSystem get instance {
    if (_instance == null) {
      _instance = new CartSystem();
    }
    return _instance;
  }

  HashMap setting = {};
  HashMap oauth = {};
  HashMap credentials = {};
  HashMap session = {};
  HashMap profile = {};

  String googleDriveRootFolder; // google drive id string
  HashMap tagPrivate = { "uuid": null, "title": null }; // { "uuid": "...", "title": "..." }

  PinGoogleDrive drive;
  PinGoogleOAuth oauth2;

  bool _isRestoring = false; // is cart blog system restoring site from google drive
  void restoreBlogFromDrive() {
    PinLogger.instance.fine('[CartSystem] restoreBlogFromDrive: start ...');

    _isRestoring = true; // mark status

    CartModel.instance.flush(); // remove all old data

    // FIXME 在这里读取google drive里的文件，在web服务器上下载图片、html和markdown，重构整个数据库
    // 如果整个系统里没有任何一篇博客，或者没有任何一篇博客里带有setting.json里配置的private tag
    // 则这里需要对这个tag进行创建，并写入到credentials.json对应字段内
    // 格式见当前class的tagPrivate字段，当然这个字段也需要更新
    // FIXME 测试restore功能

    _restorePosts()
    .then((_) => _restorePrivateTag())
    .then((_) => CartModel.instance.saveDatabase())
    .then((_) => _isRestoring = false) // reset status to normal only when site restored normally, otherwise need Administrator to fix first
    .catchError((e, trace) => PinUtility.handleError(e, trace));
  }

  Future _restorePosts() {
    final completer = new Completer();

    List<GoogleDriveClient.File> rootCategories = [];

    // retrieve all categories dir info
    PinLogger.instance.fine('[CartSystem] _restorePosts: start ...');
    drive.listAll(queries: [
        PinGoogleDrive.qIsFolder,
        sprintf(PinGoogleDrive.qIsChild, [googleDriveRootFolder])
    ])
    .then((List<GoogleDriveClient.File> categories) {
      // retrieve all markdown files info
      rootCategories = categories;
      List<Future<List<GoogleDriveClient.File>>> categoriesMds = [];
      categories.forEach((GoogleDriveClient.File category) {
        PinLogger.instance.fine('[CartSystem] _restorePosts: category: ${category.id} | ${category.mimeType} | ${category.title}');
        categoriesMds.add(drive.listAll(queries: [
            sprintf(PinGoogleDrive.qIsChild, [category.id]),
            sprintf(PinGoogleDrive.qTitleContains, ['.md'])
        ]));
      });
      if (categoriesMds.length == 0) {
        return new Future.value([]);
      } else {
        return Future.wait(categoriesMds);
      }
    })
    .then((List<List<GoogleDriveClient.File>> listOfMarkdowns) {
      // restore all markdown posts
      List<Future> markdownHandles = [];
      for (int index = 0; index < listOfMarkdowns.length; index++) {
        GoogleDriveClient.File category = rootCategories[index];
        List<GoogleDriveClient.File> markdowns = listOfMarkdowns[index];
        PinLogger.instance.fine('[CartSystem] _restorePosts: post count of category "${category.title}": ${markdowns.length}');
        markdowns.forEach((GoogleDriveClient.File markdown) {
          markdownHandles.add(_restorePost(markdown));
        });
      }
      if (markdownHandles.length == 0) {
        return new Future.value([]);
      } else {
        return Future.wait(markdownHandles);
      }
    })
    .then((_) => completer.complete(true))
    .catchError((e, trace) {
      PinUtility.handleError(e, trace);
      completer.completeError(e, trace);
    });

    return completer.future;
  }

  Future _restorePost(GoogleDriveClient.File markdown) {
    final completer = new Completer();
    CartModel model = CartModel.instance;
    PinLogger.instance.fine('[CartSystem] _restorePost: start ... post: ${markdown.id} | ${markdown.mimeType} | ${markdown.title}');

    String uuid = markdown.title.substring(0, markdown.title.indexOf('.'));
    String postBasePubDir = LibPath.join(CartConst.WWW_POST_PUB_PATH, uuid);
    String postBaseDataDir = LibPath.join(CartConst.WWW_POST_DATA_PATH, uuid);

    String driveId = markdown.id;
    HashMap markdownHeader = {};

    PinUtility.createDir(postBasePubDir) // check & create local base public dir
    .then((bool created) {
      if (!created) {
        throw new Exception('[CartModel] _restorePost: Create dir failed: "${postBasePubDir}"');
      }
      PinLogger.instance.fine('[CartPost] _restorePost: directory "${postBasePubDir}" checked');
      return PinUtility.createDir(postBaseDataDir);
    })
    .then((bool created) { // check & create local base data dir
      if (!created) {
        throw new Exception('[CartModel] _restorePost: Create dir failed: "${postBaseDataDir}"');
      }
      PinLogger.instance.fine('[CartPost] _restorePost: directory "${postBaseDataDir}" checked');
      return new Future.value(true);
    })
    .then((_) { // download markdown file
      return drive.downloadFile(driveId, postBaseDataDir);
    })
    .then((_) { // read markdown content
      PinLogger.instance.fine('[CartPost] _restorePost: markdown file downloaded ...');
      return (new File(LibPath.join(postBaseDataDir, markdown.title))).readAsString();
    })
    .then((String markdownContent) { // parse markdown header & build objects
      markdownHeader = CartPost.parseMarkdownHeader(markdownContent);

      String title = markdownHeader['title'];
      HashMap category = JSON.decode(markdownHeader['category']);
      HashMap tags = JSON.decode(markdownHeader['tags']);
      HashMap attachments = JSON.decode(markdownHeader['attachments']);
      int created = markdownHeader['created'];
      int updated = markdownHeader['updated'];
      PinLogger.instance.fine('[CartPost] _restorePost: markdown header parsed ...');

      CartPost postObj = new CartPost.fromJson({
          "uuid": uuid,
          "title": title,
          "created": created,
          "updated": updated,
          "category": category['uuid'],
          "driveId": driveId,
          "tags": tags.keys.toList(),
          "attachments": attachments
      });
      model.postList.add(postObj);

      CartCategory categoryObj = new CartCategory.fromJson(category);
      model.categoryList.add(categoryObj);

      tags.forEach((String tagUuid, HashMap tagData) {
        CartTag tag = new CartTag.fromJson(tagData);
        model.tagList.add(tag);
      });
      PinLogger.instance.fine('[CartPost] _restorePost: database info saved in memory ...');

      // download attachments
      List<Future> attachmentHandles = [];
      attachments.forEach((String attachUuid, HashMap attachment) {
        PinLogger.instance.fine('[CartPost] _restorePost: start to download attachment: ${attachment['driveId']} | ${attachment['title']}');
        attachmentHandles.add(drive.downloadFile(attachment['driveId'], LibPath.join(postBasePubDir, attachment['title'])));
      });
      if (attachmentHandles.length == 0) {
        return new Future.value([]);
      } else {
        return Future.wait(attachmentHandles);
      }
    })
    .then((List _) {
      if (_.length > 0) {
        PinLogger.instance.fine('[CartPost] _restorePost: all attachments downloaded ...');
      }
      completer.complete(true);
    })
    .catchError((e, trace) {
      PinUtility.handleError(e, trace);
      completer.completeError(e, trace);
    });

    return completer.future;
  }

  Future _restorePrivateTag() {
    int timestamp = PinTime.getTime();
    CartModel model = CartModel.instance;

    // at the end of restore process, system need to check whether private tag exists or not, create it if no
    CartTag privateTag = model.tagList.findByTitle(setting['tagPrivate']);
    if (privateTag == null) {
      PinLogger.instance.fine('[CartSystem] restoreBlogFromDrive: Private tag not found, create it ...');
      privateTag = new CartTag.fromJson({
          "uuid": PinUtility.uuid(),
          "title": setting['tagPrivate'],
          "created": timestamp,
          "updated": timestamp
      });
      model.tagList.add(privateTag);
    } else {
      PinLogger.instance.fine('[CartSystem] restoreBlogFromDrive: Private tag found: ${privateTag.toJson()}');
    }

    HashMap privateTagInfo = {
        "uuid": privateTag.uuid,
        "title": privateTag.title
    };
    tagPrivate = privateTagInfo;
    credentials['tagPrivate'] = privateTagInfo;

    return PinUtility.writeJsonFile(oauth['web']['credentialsFilePath'], credentials, withIndent: true);
  }

  bool actionPreProcess(HttpContext ctx, {bool responseDirectly: true}) {
    PinUtility.clearPrevErrorMsg();

    if (_isRestoring && responseDirectly) {
      ctx.sendJson(CartAction.buildResponse('CartSystem.actionPreProcess', { "error": "Cart blog system is restoring data from google drive, please be patient!" }, valid: false));
      ctx.end();
      return false;
    } else if (_isRestoring && !responseDirectly) {
      return false;
    } else {
      return true;
    }
  }

}