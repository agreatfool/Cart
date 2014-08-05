library Cart;

import 'dart:io';
import 'dart:convert';
import 'package:express/express.dart';

import '../lib/pin/pin.dart';
import '../lib/cart/cart.dart';

main() {

  PinUtility.setCwdToRoot('../..');

  Map setting = JSON.decode(new File('config/setting.json').readAsStringSync());
  Map oauth = JSON.decode(new File('config/oauth.json').readAsStringSync());
  Map credentials = {};
  var credentialsFile = new File(oauth['web']['credentialsFilePath']);
  if (credentialsFile.existsSync()) {
    var fileContent = credentialsFile.readAsStringSync();
    if (fileContent.isNotEmpty) {
      try {
        credentials = JSON.decode(fileContent);
      } catch (e) {
        PinLogger.instance.shout('[WebMain] Error in JSON parsing credentials data: ${fileContent}');
      }
    }
  }

  var pinGoogleOAuth = new PinGoogleOAuth.fromJson(oauth['web']);
  var pinGoogleDrive = new PinGoogleDrive(pinGoogleOAuth);

  bool isSignedIn(HttpContext ctx) {
    bool signedIn = true;

    if (!signedIn) {
      ctx.res.redirect(new Uri(path: '/'));
    }

    return signedIn;
  }

  var app = new Express();

  app.get('/oauth2', (HttpContext ctx) {
    ctx.res.redirect(Uri.parse(pinGoogleOAuth.getOAuthUrl()));
  });

  app.get('/oauth2next', (HttpContext ctx) {
    pinGoogleOAuth.processOAuthNext(ctx.params).then((Map done) {
      if (done['result']) {
        credentials = JSON.decode(credentialsFile.readAsStringSync());
        ctx.sendHtml('<h1>OAuth done!</h1>');
      } else {
        ctx.sendJson(done);
      }
    });
  });

  app.listen('127.0.0.1', setting['port']).then((_) {
    PinLogger.instance.fine('[WebMain] App server started, listening on http://127.0.0.1:${setting['port']} ...');
  });

}