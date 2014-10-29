library Cart;

import 'dart:io';
import 'dart:collection';
import 'dart:convert';

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
  app.post('/api/init',               (HttpContext ctx) => CartAction.handleDataInit(ctx));
  app.get('/api/oauth2',              (HttpContext ctx) => CartAction.handleOauth2(ctx));
  app.get('/api/oauth2next',          (HttpContext ctx) => CartAction.handleOauth2Next(ctx));
  app.get('/api/isauthed',            (HttpContext ctx) => CartAction.handleIsAuthed(ctx));
  app.get('/api/login',               (HttpContext ctx) => CartAction.handleLogin(ctx));
  app.post('/api/logout',             (HttpContext ctx) => CartAction.handleLogout(ctx));
  app.post('/api/upload',             (HttpContext ctx) => CartAction.handleUpload(ctx));
  app.post('/api/tag/create',         (HttpContext ctx) => CartAction.handleTagCreate(ctx));
  app.post('/api/category/create',    (HttpContext ctx) => CartAction.handleCategoryCreate(ctx));

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* SERVER
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  app.listen('127.0.0.1', setting['port']).then((_) {
    PinLogger.instance.fine('[WebMain] App server started, listening on http://127.0.0.1:${setting['port']} ...');
  });

}