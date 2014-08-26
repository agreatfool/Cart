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
  //-* Read config files & prepare google oauth libs
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  HashMap setting = PinUtility.readJsonFileSync(CartConst.CONFIG_SETTING_PATH);
  HashMap oauth = PinUtility.readJsonFileSync(CartConst.CONFIG_OAUTH_PATH);
  HashMap credentials = PinUtility.readJsonFileSync(oauth['web']['credentialsFilePath']);
  if (credentials == null) {
    credentials = {}; // credentials file is possible not created yet here
  }

  CartSystem.instance.setting = setting;
  CartSystem.instance.oauth = oauth;
  CartSystem.instance.credentials = credentials;

  var pinGoogleOAuth = new PinGoogleOAuth.fromJson(oauth['web']);
  var pinGoogleDrive = new PinGoogleDrive(pinGoogleOAuth);

  CartSystem.instance.drive = pinGoogleDrive;

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* Initialize database models
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  CartModel.instance;

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
  app.get('/oauth2', (HttpContext ctx) {
    ctx.res.redirect(Uri.parse(pinGoogleOAuth.getOAuthUrl()));
  });

  app.get('/oauth2next', (HttpContext ctx) {
    pinGoogleOAuth.processOAuthNext(ctx.params).then((HashMap done) {
      if (done['result']) {
        credentials = PinUtility.readJsonFileSync(oauth['web']['credentialsFilePath']);
        ctx.sendHtml('<h1>OAuth done!</h1>');
      } else {
        ctx.sendJson(done);
      }
    });
  });

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* SERVER
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  app.listen('127.0.0.1', setting['port']).then((_) {
    PinLogger.instance.fine('[WebMain] App server started, listening on http://127.0.0.1:${setting['port']} ...');
  });

}