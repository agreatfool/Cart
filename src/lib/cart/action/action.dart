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

    ctx.sendJson(_buildResponse('handleDataInit', indexData, doLog: false));
    ctx.end();
  }

  static handleTagCreate(HttpContext ctx) {
    if (!_filterIsMaster(ctx)) {
      return;
    }
    _parseHttpReqBody(ctx)
    .then((HttpRequestBody body) {
      String uuid = ctx.params['uuid'];
      String name = ctx.params['name'];
      if (!PinUtility.isUuid(uuid)) {
        throw new Exception('[CartAction] handleCategoryCreate: Invalid tag uuid!');
      } else if (name == null || name == '') {
        throw new Exception('[CartAction] handleCategoryCreate: Invalid tag name!');
      } else {
        CartModel.instance.addTag(uuid, name);
      }
    })
    .then((CartTag tag) {
      ctx.sendJson(_buildResponse('handleTagCreate', {"tag": tag.toJson()}));
    })
    .catchError((e, trace) {
      PinUtility.handleError(e, trace);
      ctx.sendJson(_buildResponse('handleTagCreate', { "error": "Error in creating tag!" }, valid: false));
    });
  }

  static handleCategoryCreate(HttpContext ctx) {
    if (!_filterIsMaster(ctx)) {
      return;
    }
    _parseHttpReqBody(ctx)
    .then((HttpRequestBody body) {
      String uuid = body.body['uuid'];
      String name = body.body['name'];
      if (!PinUtility.isUuid(uuid)) {
        throw new Exception('[CartAction] handleCategoryCreate: Invalid category uuid!');
      } else if (name == null || name == '') {
        throw new Exception('[CartAction] handleCategoryCreate: Invalid category name!');
      } else {
        return CartModel.instance.addCategory(uuid, name);
      }
    })
    .then((CartCategory category) {
      ctx.sendJson(_buildResponse('handleCategoryCreate', {"category": category.toJson()}));
    })
    .catchError((e, trace) {
      PinUtility.handleError(e, trace);
      ctx.sendJson(_buildResponse('handleCategoryCreate', { "error": "Error in creating request!" }, valid: false));
    });
  }

  static handleOauth2(HttpContext ctx) {
    if (CartSystem.instance.credentials.length > 0) {
      PinLogger.instance.shout('[CartAction] handleOauth2: Already authorized!');
      ctx.sendJson(_buildResponse('handleOauth2', { "error": "Already authorized!" }, valid: false));
    } else {
      ctx.sendJson(_buildResponse('handleOauth2', {
        "url": CartSystem.instance.oauth2.getOAuthUrl()
      }));
    }
    ctx.end();
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
        // add oauth owner email, and save the credentials first, since google api request need them
        credentials['email'] = email;
        return (new File(CartSystem.instance.oauth['web']['credentialsFilePath'])).writeAsString(decoder.convert(credentials));
      } else {
        // validate is valid owner or not
        if (email == CartSystem.instance.credentials['email']) {
          return new Future.value(true); // login user is the same as oauth user
        } else {
          return new Future.value(false); // not the same, invalid
        }
      }
    })
    .then((_) {
      if (!isAuthed) {
        // search google drive for root blog folder drive id
        return CartModel.instance.searchBlogRootFolder();
      } else {
        // just pass the result to next step
        return new Future.value(_);
      }
    })
    .then((_) {
      if (!isAuthed) {
        String rootFolderDriveId = _;
        credentials['googleDriveRootFolder'] = rootFolderDriveId;
        CartSystem.instance.googleDriveRootFolder = rootFolderDriveId;
        CartSystem.instance.credentials = credentials;
        return (new File(CartSystem.instance.oauth['web']['credentialsFilePath'])).writeAsString(decoder.convert(credentials));
      } else {
        // just pass the result to next step
        return new Future.value(_);
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

    ctx.sendJson(_buildResponse('handleIsAuthed', {
      "isAuthed": isAuthed
    }));
    ctx.end();
  }

  static handleLogin(HttpContext ctx) {
    if (CartSystem.instance.credentials.length <= 0) {
      PinLogger.instance.shout('[CartAction] handleLogin: Site has not been initialized yet!');
      ctx.sendJson(_buildResponse('handleLogin', { "error": "Site has not been initialized yet!" }, valid: false));
    } else {
      ctx.sendJson(_buildResponse('handleLogin', {
          "url": CartSystem.instance.oauth2.getLoginUrl()
      }));
    }
    ctx.end();
  }

  static void handleLogout(HttpContext ctx) {
    if (!_filterIsMaster(ctx)) {
      return;
    }
    _removeSessionToken(ctx)
    .then((_) {
      ctx.sendJson(_buildResponse('handleLogout', {}));
      ctx.end();
    })
    .catchError((e, trace) {
      PinUtility.handleError(e, trace);
      ctx.res.redirect(Uri.parse('/error'));
    });
  }

  static handleUpload(HttpContext ctx) {
    if (!_filterIsMaster(ctx)) {
      return;
    }
    String filePath;
    HttpBodyFileUpload fileUploaded;

    PinLogger.instance.fine('[CartAction] handleUpload: Start to handle file upload action.');
    HttpBodyHandler.processRequest(ctx.req)
    .then((HttpRequestBody body) {
      String postId = body.body['postId'];
      fileUploaded = body.body['file'];
      if (postId == null || fileUploaded == null) {
        throw new Exception('[CartAction] handleUpload: Failed in parsing file!');
      } else if (['image/png', 'image/jpeg', 'image/gif'].indexOf(fileUploaded.contentType.toString()) == -1) {
        throw new Exception('[CartAction] handleUpload: File type not supported: ${fileUploaded.contentType}');
      } else {
        String postPath = LibPath.join(CartConst.WWW_POST_PUB_PATH, postId);
        filePath = LibPath.join(postPath, fileUploaded.filename);
        return PinUtility.createDir(postPath);
      }
    })
    .then((_) {
      return new File(filePath)..writeAsBytes(fileUploaded.content, mode: FileMode.WRITE);
    })
    .then((_) {
      ctx.sendJson(_buildResponse('handleUpload', { "fileName": fileUploaded.filename, "fileType": fileUploaded.contentType.toString() }));
    })
    .catchError((e, trace) {
      PinUtility.handleError(e, trace);
      ctx.sendJson(_buildResponse('handleUpload', { "error": "Error encountered in handling file!" }, valid: false));
    });
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

  static bool _filterIsMaster(HttpContext ctx) {
    bool isUserMaster = isMaster(ctx);

    if(!isUserMaster) {
      ctx.sendJson(_buildResponse('filterIsMaster', { "error": "User not logged in, pls login first!" }, valid: false));
      ctx.end();
    }

    return isUserMaster;
  }

  static Map _buildResponse(String actionName, HashMap message, {bool valid: true, bool doLog: true}) {
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

  static Future<HttpRequestBody> _parseHttpReqBody(HttpContext ctx) {
    return HttpBodyHandler.processRequest(ctx.req);
  }

}