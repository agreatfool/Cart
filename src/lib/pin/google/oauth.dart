part of pin;

class PinGoogleOAuth {

  static const String GOOGLE_OAUTH_URL = 'https://accounts.google.com/o/oauth2/auth?access_type=offline&approval_prompt=force';
  static const String GOOGLE_OAUTH_TOKEN_URL = 'https://accounts.google.com/o/oauth2/token';

  static const String SCOPE_EMAIL = 'https://www.googleapis.com/auth/userinfo.email';
  static const String SCOPE_DRIVE_ALL = 'https://www.googleapis.com/auth/drive';

  GoogleOAuth.OAuth2Console _oauth2;

  GoogleOAuth.OAuth2Console get oauth2 => _oauth2;

  String _identifier;
  String _secret;
  List<String> _scopes;
  String _redirectUrl;
  String _credentialsFilePath;

  String get credentialsFilePath => _credentialsFilePath;

  PinGoogleOAuth(this._identifier, this._secret, this._scopes, this._redirectUrl, this._credentialsFilePath) {
    _oauth2 = new GoogleOAuth.OAuth2Console(
        identifier: _identifier,
        secret: _secret,
        scopes: _scopes,
        authorizedRedirect: _redirectUrl,
        credentialsFilePath: _credentialsFilePath
    );
  }

  PinGoogleOAuth.fromJson(Map json) {
    // validate keys
    PinUtility.validate(json.containsKey('identifier'), 'PinGoogleOAuth construct, necessary key not found: identifier');
    PinUtility.validate(json.containsKey('secret'), 'PinGoogleOAuth construct, necessary key not found: secret');
    PinUtility.validate(json.containsKey('scopes'), 'PinGoogleOAuth construct, necessary key not found: scopes');
    PinUtility.validate(json.containsKey('redirectUrl'), 'PinGoogleOAuth construct, necessary key not found: redirectUrl');
    PinUtility.validate(json.containsKey('credentialsFilePath'), 'PinGoogleOAuth construct, necessary key not found: credentialsFilePath');

    // validate type
    PinUtility.validate(json['identifier'] is String, 'PinGoogleOAuth construct, value of key identifier is not String');
    PinUtility.validate(json['secret'] is String, 'PinGoogleOAuth construct, value of key secret is not String');
    PinUtility.validate(json['scopes'] == null || json['scopes'] is List, 'PinGoogleOAuth construct, value of key scopes is not List');
    PinUtility.validate(json['redirectUrl'] is String, 'PinGoogleOAuth construct, value of key redirectUrl is not String');
    PinUtility.validate(json['credentialsFilePath'] is String, 'PinGoogleOAuth construct, value of key credentialsFilePath is not String');

    _identifier = json['identifier'];
    _secret = json['secret'];
    _scopes = json['scopes'];
    _redirectUrl = json['redirectUrl'];
    _credentialsFilePath = json['credentialsFilePath'];

    _oauth2 = new GoogleOAuth.OAuth2Console(
        identifier: _identifier,
        secret: _secret,
        scopes: _scopes,
        authorizedRedirect: _redirectUrl,
        credentialsFilePath: _credentialsFilePath
    );
  }

  String getOAuthUrl() {
    var grant = new OAuth2.AuthorizationCodeGrant(
        _identifier,
        _secret,
        Uri.parse(GOOGLE_OAUTH_URL),
        Uri.parse(GOOGLE_OAUTH_TOKEN_URL)
    );
    Uri authUrl = grant.getAuthorizationUrl(
        Uri.parse(_redirectUrl),
        scopes: _scopes
    );
    String url = authUrl.toString();

    PinLogger.instance.fine('[PinGoogleOAuth] getOAuthUrl: ${url}');

    return url;
  }

  Future<Map> processOAuthNext(Map data) {
    var completer = new Completer();

    Map res = {
      'result': false,
      'message': ''
    };

    PinLogger.instance.fine('[PinGoogleOAuth] processOAuthNext data: ${JSON.encode(data)}');

    if (data.containsKey('code')) {
      // oauth code got, process next step
      LibHttp.post(
          GOOGLE_OAUTH_TOKEN_URL,
          body: {
              'code': data['code'],
              'client_id': _identifier,
              'client_secret': _secret,
              'redirect_uri': _redirectUrl,
              'grant_type': 'authorization_code'
          }
      ).then((LibHttp.Response response) {
        // token response got
        PinLogger.instance.fine('[PinGoogleOAuth] processOAuthNext auth response: ${response.body}');
        Map authResponse;
        try {
          authResponse = JSON.decode(response.body);
        } catch (e) {
          res['message'] = response.body;
          completer.complete(res);
        }
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
              'tokenEndpoint': GOOGLE_OAUTH_TOKEN_URL,
              'scopes': _scopes,
              'expiration': expiration
          };
          if (authResponse.containsKey('id_token')) {
            credentials['idToken'] = authResponse['id_token'];
          }
          var decoder = new JsonEncoder.withIndent('    ');
          new File(_credentialsFilePath).writeAsString(decoder.convert(credentials)).then((_) {
            res['result'] = true;
            completer.complete(res);
          });
        } else if (authResponse.containsKey('error')) {
          // error
          res['message'] = 'Error: ${authResponse['error']}';
          completer.complete(res);
        } else {
          // unrecognized
          res['message'] = 'Error: Unrecognized oauth response';
          completer.complete(res);
        }
      });
    } else if (data.containsKey('error')) {
      // error
      res['message'] = 'Error: ${data['error']}';
      completer.complete(res);
    } else {
      // unrecognized
      res['message'] = 'Error: Unrecognized oauth response';
      completer.complete(res);
    }

    return completer.future;
  }

}