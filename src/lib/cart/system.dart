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
  Future restoreBlogFromDrive() {
    // FIXME 在这里读取google drive里的文件，在web服务器上下载图片、html和markdown，重构整个数据库
    // 如果整个系统里没有任何一篇博客，或者没有任何一篇博客里带有setting.json里配置的private tag
    // 则这里需要对这个tag进行创建，并写入到credentials.json对应字段内
    // 格式见当前class的tagPrivate字段，当然这个字段也需要更新
    return new Future.value(true);
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