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

  String googleDriveRootFolder; // google drive id string
  HashMap tagPrivate = { "uuid": null, "title": null }; // { "uuid": "...", "title": "..." }

  PinGoogleDrive drive;
  PinGoogleOAuth oauth2;

  bool _isRestoring = false; // is cart blog system restoring site from google drive
  void restoreBlogFromDrive() {
    PinLogger.instance.fine('[CartSystem] restoreBlogFromDrive: start ...');

    _isRestoring = true; // mark status

    int timestamp = PinTime.getTime();

    CartModel model = CartModel.instance;

    // FIXME 在这里读取google drive里的文件，在web服务器上下载图片、html和markdown，重构整个数据库
    // 如果整个系统里没有任何一篇博客，或者没有任何一篇博客里带有setting.json里配置的private tag
    // 则这里需要对这个tag进行创建，并写入到credentials.json对应字段内
    // 格式见当前class的tagPrivate字段，当然这个字段也需要更新

    // at the end of restore process, system need to check whether private tag exists or not, create it if no
    CartTag private = model.tagList.findByTitle(setting['tagPrivate']);
    if (private == null) {
      PinLogger.instance.fine('[CartSystem] restoreBlogFromDrive: Private tag not found, create it ...');
      private = new CartTag.fromJson({
          "uuid": PinUtility.uuid(),
          "title": setting['tagPrivate'],
          "created": timestamp,
          "updated": timestamp
      });
      model.tagList.add(private);
    } else {
      PinLogger.instance.fine('[CartSystem] restoreBlogFromDrive: Private tag found: ${private.toJson()}');
    }

    HashMap privateTagInfo = {
        "uuid": private.uuid,
        "title": private.title
    };
    tagPrivate = privateTagInfo;
    credentials['tagPrivate'] = privateTagInfo;

    PinUtility.writeJsonFile(oauth['web']['credentialsFilePath'], credentials, withIndent: true)
    .then((_) => model.saveDatabase())
    .then((_) => _isRestoring = false) // reset status to normal only when site restored normally, otherwise need Administrator to fix first
    .catchError((e, trace) => PinUtility.handleError(e, trace));
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