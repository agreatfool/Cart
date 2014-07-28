library Cart;

import 'dart:io';
import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as libhttp;
import 'package:start/start.dart' as libstart;
import 'package:google_drive_v2_api/drive_v2_api_console.dart' as GoogleDrive;

import 'package:oauth2/oauth2.dart' as OAuth2;

import '../lib/pin.dart';

main() {
  int counter = 0;
  Map oauth = null;

  PinUtility.setCwdToRoot('../..');

  new File('config/oauth.json').readAsString().then((String contents) {
    oauth = JSON.decode(contents);

    libstart.start(port: 18090).then((libstart.Server app) {

      PinLogger.instance.fine('[EvernoteBlog Web] App server started, listening on port 18090 ...');

      app.get('/error').listen((libstart.Request request) {
        var err = new ArgumentError('custom error in handler');

        try {
          throw err;
        } catch(ex, stackTrace) {
          request.response.header('Content-Type', 'text/plain; charset=UTF-8').send(
              stackTrace.toString()
          );
        }
      });

      app.get('/counter').listen((libstart.Request request) {
        request.response.header('Content-Type', 'application/json; charset=UTF-8').json(
            {'counter': counter++}
        );
      });

      app.get('/blog').listen((libstart.Request request) {
        request.response.json(Uri.splitQueryString(request.uri.query));
      });

      app.get('/oauth2').listen((libstart.Request request) {
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

      app.get('/oauth2next').listen((libstart.Request request) {
        // error: https://oauth2-login-demo.appspot.com/code?error=access_denied
        // succeed: https://oauth2-login-demo.appspot.com/code?code=4/P7q7W91a-oMsCeLvIaQm6bTrgtp7
        Map queries = Uri.splitQueryString(request.uri.query);
        if (queries.containsKey('code')) {
          // oauth code got, process next step
          libhttp.post(
              oauth['google_oauth_token_url'],
              headers: {'Content-Type': 'application/x-www-form-urlencoded'},
              body: {
                'code': queries['code'],
                'client_id': oauth['web']['client_id'],
                'client_secret': oauth['web']['client_secret'],
                'redirect_uri': oauth['web']['redirect_url'],
                'grant_type': 'authorization_code'
              }
          ).then((libhttp.Response response) {
            // token got
//            {
//              "access_token" : "ya29.UACD48pvUVNbBxwAAAB-QhCLdx1oGiKa2TLray9FYM6QdFcyeCSnLAMAw6uqXA",
//              "token_type" : "Bearer",
//              "expires_in" : 3600,
//              "id_token" : "eyJhbGciOiJSUzI1NiIsImtpZCI6IjIyMGRjZGUyMGI5OTcyMDc4ZWNiODE5MTJkZjJmNjZiNDZmZjJiNTcifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiaWQiOiIxMTA3MzY5NTc1NTg4ODA4MDI2NDMiLCJzdWIiOiIxMTA3MzY5NTc1NTg4ODA4MDI2NDMiLCJhenAiOiI1MjQxMDMxMTQyNTktZjZmcnJoYWdubjgxMTFsMGRudDNhcm8xMTdzdmwyNDEuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJlbWFpbCI6Im5pZ2h0Z2hvc3Q1MDc4QGdtYWlsLmNvbSIsImF0X2hhc2giOiJIdnBsMHo0cHlOandMZ2hKRVFpb3VBIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF1ZCI6IjUyNDEwMzExNDI1OS1mNmZycmhhZ25uODExMWwwZG50M2FybzExN3N2bDI0MS5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInRva2VuX2hhc2giOiJIdnBsMHo0cHlOandMZ2hKRVFpb3VBIiwidmVyaWZpZWRfZW1haWwiOnRydWUsImNpZCI6IjUyNDEwMzExNDI1OS1mNmZycmhhZ25uODExMWwwZG50M2FybzExN3N2bDI0MS5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImlhdCI6MTQwNjU0MDA1MCwiZXhwIjoxNDA2NTQzOTUwfQ.xKKwOqf2VqyMl-aY70_wSTyz29xERI_2tg1ud77_bIsS4BrmunICnnUakQ-EdZoxgPL4Jt6NJWIMRYrdb07GzM79sPGxXl0ROTRpT4EOw5NQ8UylnTK9MwbY6uItOSPrIFUEHY4p3lRkbDoAsxt_597R3-atD0bglaoOH05gXtQ",
//              "refresh_token" : "1/why2cEP9h9hxPF-vK6G8PBXBKLJc7pnV4iWZKR24An8"
//            }
            request.response.send(response.body);
          });
        } else if (queries.containsKey('error')) {
          // error
          request.response.send('Error: ${queries['error']}');
        }
      });

    });

  });

}