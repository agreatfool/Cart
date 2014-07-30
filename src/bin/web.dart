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

  app.get('/blog', (HttpContext ctx) {
    if (credentials.length == 0) {
      // TODO redirect to '/oauth2'
      ctx.sendHtml('<h1>BLOG PAGE</h1>');
    } else {
      pinGoogleDrive.listFiles(queryParams: {
          'maxResults': 250,
          'q': "mimeType = 'application/vnd.google-apps.folder' and 'root' in parents"
      }).then((Map data) {
        var decoder = new JsonEncoder.withIndent('    ');
        new File('dummy/data.json').writeAsString(decoder.convert(data['items']));
        String info = 'Dirs: <br/>';
        if (data.containsKey('items')) {
          List items = data['items'];
          items.forEach((element) {
            info += element['title'] + '<br/>';
          });
          new File('dummy/dirs.txt').writeAsString(info);
        }
        ctx.sendHtml(info);
      });
    }
  });

  app.get('/oauth2', (HttpContext ctx) {
    // FIXME validate already authorized or not
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