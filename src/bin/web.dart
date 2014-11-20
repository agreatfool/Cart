library Cart;

import 'dart:collection';

import 'package:express/express.dart';

import '../lib/pin/pin.dart';
import '../lib/cart/cart.dart';

main() {

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* Set system root path
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  PinUtility.setCwdToRoot('../..');

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* Read config files & prepare google oauth libs & register system resources
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  HashMap setting = PinUtility.readJsonFileSync(CartConst.CONFIG_SETTING_PATH);
  HashMap oauth = PinUtility.readJsonFileSync(CartConst.CONFIG_OAUTH_PATH);
  HashMap credentials = PinUtility.readJsonFileSync(oauth['web']['credentialsFilePath']);
  HashMap session = PinUtility.readJsonFileSync(CartConst.CONFIG_SESSION_PATH);

  CartSystem.instance.setting = setting;
  CartSystem.instance.oauth = oauth;
  CartSystem.instance.credentials = credentials;
  CartSystem.instance.googleDriveRootFolder = credentials['googleDriveRootFolder']; // google drive id string
  CartSystem.instance.session = session;
  if (credentials.containsKey('tagPrivate') && credentials['tagPrivate'].length > 0) {
    // site already initialized && restored from google drive
    CartSystem.instance.tagPrivate = credentials['tagPrivate'];
  }

  var pinGoogleOAuth = new PinGoogleOAuth.fromJson(oauth['web']);
  var pinGoogleDrive = new PinGoogleDrive(pinGoogleOAuth);

  CartSystem.instance.drive = pinGoogleDrive;
  CartSystem.instance.oauth2 = pinGoogleOAuth;

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* Initialize database models
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  CartModel.instance;

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* ROUTERS
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  var app = new Express();
  app.post('/api/oauth2',             (HttpContext ctx) => CartAction.handleOauth2(ctx));
  app.get('/api/oauth2next',          (HttpContext ctx) => CartAction.handleOauth2Next(ctx));
  app.post('/api/isauthed',           (HttpContext ctx) => CartAction.handleIsAuthed(ctx));
  app.post('/api/login',              (HttpContext ctx) => CartAction.handleLogin(ctx));
  app.post('/api/logout',             (HttpContext ctx) => CartAction.handleLogout(ctx));
  app.post('/api/upload',             (HttpContext ctx) => CartAction.handleUpload(ctx));
  app.post('/api/tag/create',         (HttpContext ctx) => CartAction.handleTagCreate(ctx));
  app.post('/api/category/create',    (HttpContext ctx) => CartAction.handleCategoryCreate(ctx));
  app.post('/api/restore/status',     (HttpContext ctx) => CartAction.handleRestoreStatus(ctx));
  app.post('/api/post/page',          (HttpContext ctx) => CartAction.handlePostPage(ctx));
  app.post('/api/post/save',          (HttpContext ctx) => CartAction.handlePostSave(ctx));
  app.post('/api/post/remove',        (HttpContext ctx) => CartAction.handlePostRemove(ctx));
  app.post('/api/post/published',     (HttpContext ctx) => CartAction.handlePostPublishedCheck(ctx));
  app.post('/api/category/all',       (HttpContext ctx) => CartAction.handleCategoryAll(ctx));
  app.post('/api/category/search',    (HttpContext ctx) => CartAction.handleCategorySearch(ctx));
  app.post('/api/tag/all',            (HttpContext ctx) => CartAction.handleTagAll(ctx));

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* SERVER
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  app.listen('127.0.0.1', setting['port']).then((_) {
    // enable GZIP
    app.server.autoCompress = true;
    // handle server errors
    app.errorHandler = (e, trace, HttpContext ctx) {
      // FIXME this is the default handler of Express, shall be fixed to own solution
      var error = trace != null
      ? "$e\n\nStackTrace:\n$trace"
      : e;

      try{
        if (!ctx.closed){
          ctx.sendText(error, contentType: ContentTypes.TEXT,
          httpStatus: 500, statusReason: "Internal ServerError");
        }
      } catch(e){/*ignore*/}
      finally{
        ctx.end();
      }

      logError(error);
    };
    // log info
    PinLogger.instance.fine('[WebMain] App server started, listening on http://127.0.0.1:${setting['port']} ...');
  });

}