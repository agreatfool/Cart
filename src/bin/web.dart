library Cart;

import 'dart:io';
import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as LibHttp;
import 'package:start/start.dart' as LibStart;
import 'package:google_drive_v2_api/drive_v2_api_console.dart' as GoogleDrive;
import 'package:google_oauth2_client/google_oauth2_console.dart' as GoogleOAuth;

import 'package:oauth2/oauth2.dart' as OAuth2;

import '../lib/pin.dart';

main() {
  Map oauth;

  PinUtility.setCwdToRoot('../..');

  new File('config/oauth.json').readAsString().then((String contents) {
    oauth = JSON.decode(contents);

    LibStart.start(port: 18090).then((LibStart.Server app) {

      PinLogger.instance.fine('[EvernoteBlog Web] App server started, listening on port 18090 ...');

      app.get('/error').listen((LibStart.Request request) {
        var err = new ArgumentError('custom error in handler');

        try {
          throw err;
        } catch(ex, stackTrace) {
          request.response.header('Content-Type', 'text/plain; charset=UTF-8').send(
              stackTrace.toString()
          );
        }
      });

      app.get('/blog').listen((LibStart.Request request) {
        request.response.json(Uri.splitQueryString(request.uri.query));

        var auth = new GoogleOAuth.OAuth2Console();
        var drive = new GoogleDrive.Drive(auth);

        drive.request();
      });

      app.get('/oauth2').listen((LibStart.Request request) {
        var grant = new OAuth2.AuthorizationCodeGrant(
            oauth['web']['client_id'],
            oauth['web']['client_secret'],
            Uri.parse(oauth['google_oauth_url']),
            Uri.parse(oauth['google_oauth_token_url'])
        );
        Uri authUrl = grant.getAuthorizationUrl(
            Uri.parse(oauth['web']['redirect_url']),
            scopes: [oauth['scope']['email'], oauth['scope']['drive']]
        );
        request.response.redirect(authUrl.toString());
      });

      app.get('/oauth2next').listen((LibStart.Request request) {
        // error: https://oauth2-login-demo.appspot.com/code?error=access_denied
        // succeed: https://oauth2-login-demo.appspot.com/code?code=4/P7q7W91a-oMsCeLvIaQm6bTrgtp7
        Map queries = Uri.splitQueryString(request.uri.query);
        if (queries.containsKey('code')) {
          // oauth code got, process next step
          LibHttp.post(
              oauth['google_oauth_token_url'],
              body: {
                'code': queries['code'],
                'client_id': oauth['web']['client_id'],
                'client_secret': oauth['web']['client_secret'],
                'redirect_uri': oauth['web']['redirect_url'],
                'grant_type': 'authorization_code'
              }
          ).then((LibHttp.Response response) {
            // token response got
            Map authResponse = JSON.decode(response.body);
            if (authResponse.containsKey('access_token')) {
              // access token got
              var expiration = null;
              if (authResponse.containsKey('expires_in')) {
                var now = new DateTime.now();
                now.add(new Duration(seconds: authResponse['expires_in']));
                expiration = now.millisecondsSinceEpoch;
              }
              Map credentials = {
                'accessToken': authResponse['access_token'],
                'refreshToken': authResponse['refresh_token'],
                'tokenEndpoint': oauth['google_oauth_token_url'],
                'scopes': [oauth['scope']['email'], oauth['scope']['drive']],
                'expiration': expiration
              };
              if (authResponse.containsKey('id_token')) {
                credentials['idToken'] = authResponse['id_token'];
              }
              new File('config/credentials.json').writeAsString(JSON.encode(credentials)).then((_) {
                request.response.redirect(request.uri.host + '/blog');
              });
            } else if (authResponse.containsKey('error')) {
              // error
              request.response.send('Error: ${queries['error']}');
            } else {
              // unrecognized
              request.response.send('Error: Unrecognized oauth response');
            }
          });
        } else if (queries.containsKey('error')) {
          // error
          request.response.send('Error: ${queries['error']}');
        } else {
          // unrecognized
          request.response.send('Error: Unrecognized oauth response');
        }
      });

    });

  });

}