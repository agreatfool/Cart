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

  // FIXME session?
  CartSystem.instance.setting = setting;
  CartSystem.instance.oauth = oauth;
  CartSystem.instance.credentials = credentials;
  CartSystem.instance.googleDriveRootFolder = credentials['googleDriveRootFolder']; // google drive id string

  var pinGoogleOAuth = new PinGoogleOAuth.fromJson(oauth['web']);
  var pinGoogleDrive = new PinGoogleDrive(pinGoogleOAuth);

  CartSystem.instance.drive = pinGoogleDrive;

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* Initialize database models
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  CartModel.instance;

  // FIXME DUMMY?
  bool isSignedIn(HttpContext ctx) {
    bool signedIn = true;

    if (!signedIn) {
      ctx.res.redirect(new Uri(path: '/'));
    }

    return signedIn;
  }

  var app = new Express();

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* ROUTERS
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  app.get('/api/index', (HttpContext ctx) {
    ctx.sendJson({
        "posts": CartModel.instance.posts.toJson(),
        "categories": CartModel.instance.categories.toJson(),
        "tags": CartModel.instance.tags.toJson()
    });
  });

  app.get('/api/oauth2', (HttpContext ctx) {
    ctx.sendText(pinGoogleOAuth.getOAuthUrl());
  });

  app.get('/api/oauth2next', (HttpContext ctx) {
    pinGoogleOAuth.processOAuthNext(ctx.params)
    .then((HashMap done) {
      if (done['result']) {
        credentials = PinUtility.readJsonFileSync(oauth['web']['credentialsFilePath']);
      }
      ctx.res.redirect(Uri.parse('/oauth2'));
    })
    .catchError((e, trace) {
      PinUtility.handleError(e, trace);
      ctx.res.redirect(Uri.parse('/error'));
    });
  });

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* SERVER
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  app.listen('127.0.0.1', setting['port']).then((_) {
    PinLogger.instance.fine('[WebMain] App server started, listening on http://127.0.0.1:${setting['port']} ...');
  });

}