part of cart;

class CartAction {

  static handleDataInit(HttpContext ctx) {
    HashMap<String, Map> indexData = {
        "posts": {},
        "categories": {},
        "tags": {}
    };

    Map postList = CartModel.instance.posts.toJson()['list'];
    Map categoryList = CartModel.instance.categories.toJson()['list'];
    Map tagList = CartModel.instance.tags.toJson()['list'];

    if (isMaster(ctx)) {
      indexData['posts'] = postList;
    } else {
      postList.forEach((String postUuid, Map post) {
        if (post['isPublic']) {
          indexData['posts'].addAll({postUuid: post});
        }
      });
    }
    indexData['categories'] = categoryList;
    indexData['tags'] = tagList;

    ctx.sendJson(buildResponse('handleDataInit', indexData, doLog: false));
    ctx.end();
  }

  static handleOauth2(HttpContext ctx) {
    if (CartSystem.instance.credentials.length > 0) {
      PinLogger.instance.shout('[CartAction] handleOauth2: Already authorized!');
      ctx.sendJson(buildResponse('handleOauth2', { "message": "Already authorized!" }, valid: false));
    } else {
      ctx.sendJson(buildResponse('handleOauth2', {
        "url": CartSystem.instance.oauth2.getOAuthUrl()
      }));
    }
  }

  static handleOauth2Next(HttpContext ctx) {
    String email = '';
    HashMap credentials = {};
    final decoder = new JsonEncoder.withIndent('    ');

    bool isAuthed = (CartSystem.instance.credentials.length > 0);

    CartSystem.instance.oauth2.processOAuthNext(ctx.params)
    .then((HashMap oauthResponse) {
      // get oauth response step
      if (oauthResponse['result']) {
        credentials = oauthResponse['message'];
        return CartSystem.instance.oauth2.decodeIdToken(credentials['idToken']);
      } else {
        throw new Exception('[CartAction] handleOauth2Next: Oauth failed, ${oauthResponse['message']}');
      }
    })
    .then((HashMap decodedResponse) {
      // parse id_token info
      if (decodedResponse['result']) {
        HashMap idTokenInfo = decodedResponse['message'];
        email = idTokenInfo['email'];
      } else {
        throw new Exception('[CartAction] handleOauth2Next: Decode id token failed, ${decodedResponse['message']}');
      }
      if (!isAuthed) {
        // save oauth data, also add oauth owner email
        credentials['email'] = email;
        CartSystem.instance.credentials = credentials;
        return (new File(CartSystem.instance.oauth['web']['credentialsFilePath'])).writeAsString(decoder.convert(credentials));
      } else {
        // just go to next step
        if (email == CartSystem.instance.credentials['email']) {
          return new Future.value(true); // login user is the same as oauth user
        } else {
          return new Future.value(false); // not the same, invalid
        }
      }
    })
    .then((_) {
      if (isAuthed && _ == false) {
        // login failed with invalid owner
        PinLogger.instance.shout('[CartAction] handleOauth2Next: login failed with invalid owner!');
        ctx.res.redirect(Uri.parse('/error'));
        return new Future.value(false);
      } else {
        return _updateSessionToken(ctx);
      }
    })
    .then((_) {
      if (_ == false) {
        // means login failed, do nothing
      } else {
        ctx.res.redirect(Uri.parse('/master'));
      }
    })
    .catchError((e, trace) {
      PinUtility.handleError(e, trace);
      ctx.res.redirect(Uri.parse('/error'));
    });
  }

  static handleIsAuthed(HttpContext ctx) {
    var isAuthed = false;

    if (CartSystem.instance.credentials.length > 0) {
      isAuthed = true;
    }

    ctx.sendJson(buildResponse('handleIsAuthed', {
      "isAuthed": isAuthed
    }));
    ctx.end();
  }

  static handleLogin(HttpContext ctx) {
    if (CartSystem.instance.credentials.length <= 0) {
      PinLogger.instance.shout('[CartAction] handleLogin: Site has not been authorized yet!');
      ctx.sendJson(buildResponse('handleLogin', { "message": "Already authorized!" }, valid: false));
    } else {
      ctx.sendJson(buildResponse('handleLogin', {
          "url": CartSystem.instance.oauth2.getLoginUrl()
      }));
    }
  }

  static handleLogout(HttpContext ctx) {
    if (isMaster(ctx)) {
      _removeSessionToken(ctx)
      .then((_) {
        ctx.sendJson(buildResponse('handleLogout', {}));
        ctx.end();
      })
      .catchError((e, trace) {
        PinUtility.handleError(e, trace);
        ctx.res.redirect(Uri.parse('/error'));
      });
    } else {
      ctx.sendJson(buildResponse('handleLogout', { "message": "No privilege to logout!" }, valid: false));
      ctx.end();
    }
  }

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* UTILITIES
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  static bool isMaster(HttpContext ctx) {
    var isMaster = false;
    String tokenKey = CartConst.SESSION_TOKEN_KEY;
    var now = new DateTime.now();

    if (CartSystem.instance.session.length > 0
      && CartSystem.instance.session[CartConst.SESSION_EXPIRES_KEY] < now.millisecondsSinceEpoch) {
      // saved session has expired, remove it
      _removeSessionToken(ctx);
    }

    if (ctx.req.cookies.length > 0) {
      ctx.req.cookies.forEach((Cookie cookie) {
        if (cookie.name == tokenKey && cookie.value == CartSystem.instance.session[tokenKey]) {
          isMaster = true;
        }
      });
    }

    return isMaster;
  }

  static Map buildResponse(String actionName, HashMap message, {bool valid: true, bool doLog: true}) {
    HashMap result = {
        "valid": valid,
        "message": message
    };
    if (doLog) {
      PinLogger.instance.fine('[CartAction] ${actionName}: ${JSON.encode(result)}');
    }

    return result;
  }

  static Future<File> _updateSessionToken(HttpContext ctx) {
    String token = PinUtility.uuid();
    final decoder = new JsonEncoder.withIndent('    ');

    var expires = new DateTime.now();
    expires = expires.add(new Duration(seconds: CartSystem.instance.setting['cookieLive']));
    _setCookie(ctx, CartConst.SESSION_TOKEN_KEY, token, expires: expires);

    HashMap session = {
        CartConst.SESSION_TOKEN_KEY: token,
        CartConst.SESSION_EXPIRES_KEY: expires.millisecondsSinceEpoch
    };
    CartSystem.instance.session = session;
    return (new File(CartConst.CONFIG_SESSION_PATH)).writeAsString(decoder.convert(session));
  }

  static Future<File> _removeSessionToken(HttpContext ctx) {
    _setCookie(ctx, CartConst.SESSION_TOKEN_KEY, '');
    CartSystem.instance.session = {};
    return (new File(CartConst.CONFIG_SESSION_PATH)).writeAsString(JSON.encode({})).catchError((e, trace) {
      PinUtility.handleError(e, trace);
    });
  }

  static void _setCookie(HttpContext ctx, String name, String value, {DateTime expires: null}) {
    if (expires == null) {
      expires = new DateTime.now();
      expires = expires.add(new Duration(seconds: CartSystem.instance.setting['cookieLive']));
    }

    var cookie = '${name}=${value}; Expires=${PinTime.formatRFC2616(expires)}; Path=/';
    ctx.res.headers.add('set-cookie', cookie);
  }

}