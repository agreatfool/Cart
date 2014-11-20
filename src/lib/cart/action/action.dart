part of cart;

class CartAction {

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* POSTS
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  static handlePostPage(HttpContext ctx) {
    if (!CartSystem.instance.actionPreProcess(ctx)) {
      return;
    }
    bool isUserMaster = isMaster(ctx);

    HttpBodyHandler.processRequest(ctx.req)
    .then((HttpRequestBody body) {
      /**
       * options: {
       *     "category": categoryName|uuid,
       *     "tags": [tagName|uuid, tagName|uuid, ...],
       *     "isUuidSearch": bool,
       *     "start": timestamp,
       *     "end": timestamp,
       *     "pageNumber": int
       * }
       */
      HashMap options = body.body;

      options['start'] = options.containsKey('start') ? options['start'] : 0;
      options['end'] = options.containsKey('end') ? options['end'] : PinTime.TIMESTAMP_MAX;

      if (!options.containsKey('isUuidSearch') || !(options['isUuidSearch'] is bool)) {
        options['isUuidSearch'] = false;
      }

      options['pageNumber'] = options.containsKey('pageNumber') ? options['pageNumber'] : 1;

      List<CartPost> result = CartModel.instance.searchPost(options, options['isUuidSearch'], isMaster: isUserMaster, pageNumber: options['pageNumber']);

      HashMap<String, HashMap> posts = {};
      HashMap<String, HashMap> categories = {};
      HashMap<String, HashMap> tags = {};
      result.forEach((CartPost post) {
        posts[post.uuid] = post.toJson();
        categories.addAll({ post.category: CartModel.instance.categoryList.find(post.category).toJson() });
        post.tags.forEach((String tagUuid) {
          tags.addAll({ tagUuid: CartModel.instance.tagList.find(tagUuid).toJson() });
        });
      });

      ctx.sendJson(buildResponse('handlePostPage', {
          "posts": posts,
          "categories": categories,
          "tags": tags,
          "total": posts.length
      }));
    })
    .catchError((e, trace) {
      PinUtility.handleError(e, trace);
      ctx.sendJson(buildResponse('handlePostPage', { "error": "Error encountered in list pages of posts!" }, valid: false));
    });
  }

  static handlePostSave(HttpContext ctx) {
    if (!CartSystem.instance.actionPreProcess(ctx)) {
      return;
    }
    if (!_filterIsMaster(ctx)) {
      return;
    }

    HttpBodyHandler.processRequest(ctx.req)
    .then((HttpRequestBody body) {
      String postId = body.body['postId'];
      String markdown = body.body['markdown'];
      if (!PinUtility.isUuid(postId)) {
        throw new Exception('[CartAction] handlePostSave: Invalid post uuid: ${postId}');
      } else if (markdown == null || markdown == '') {
        throw new Exception('[CartAction] handlePostSave: Invalid markdown!');
      } else {
        return CartModel.instance.savePost(postId, markdown);
      }
    })
    .then((CartPost _) => ctx.sendJson(buildResponse('handlePostSave', { "post": _.toJson() })))
    .catchError((e, trace) {
      PinUtility.handleError(e, trace);
      ctx.sendJson(buildResponse('handleUpload', { "error": "Error encountered in handling file!" }, valid: false));
    });
  }

  static handlePostRemove(HttpContext ctx) {
    if (!CartSystem.instance.actionPreProcess(ctx)) {
      return;
    }
    if (!_filterIsMaster(ctx)) {
      return;
    }

    HttpBodyHandler.processRequest(ctx.req)
    .then((HttpRequestBody body) {
      String postId = body.body['postId'];
      if (!PinUtility.isUuid(postId)) {
        throw new Exception('[CartAction] handlePostRemove: Invalid post uuid: ${postId}');
      } else {
        return CartModel.instance.removePost(postId);
      }
    })
    .then((_) => ctx.sendJson(buildResponse('handlePostRemove', {})))
    .catchError((e, trace) {
      PinUtility.handleError(e, trace);
      ctx.sendJson(buildResponse('handlePostRemove', { "error": "Error encountered in removing post!" }, valid: false));
    });
  }

  static handleUpload(HttpContext ctx) {
    if (!CartSystem.instance.actionPreProcess(ctx)) {
      return;
    }
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
        throw new Exception('[CartAction] handleUpload: File type not supported: ${fileUploaded.contentType.toString()}');
      } else if (!PinUtility.isUuid(postId)) {
        throw new Exception('[CartAction] handleUpload: Invalid post uuid: ${postId}');
      } else {
        String postPath = LibPath.join(CartConst.WWW_POST_PUB_PATH, postId);
        filePath = LibPath.join(postPath, fileUploaded.filename);
        return PinUtility.createDir(postPath);
      }
    })
    .then((_) {
      return new File(filePath).exists();
    })
    .then((bool uploadTargetAlreadyExists) {
      if (uploadTargetAlreadyExists) {
        ctx.sendJson(buildResponse('handleUpload', { "error": "File ${fileUploaded.filename} already exists!" }, valid: false));
        return new Future.value(false);
      } else {
        return new File(filePath)..writeAsBytes(fileUploaded.content, mode: FileMode.WRITE);
      }
    })
    .then((_) {
      if (_ == false) {
        // means file already exists exception encountered, end process
        ctx.end();
      } else {
        ctx.sendJson(buildResponse('handleUpload', { "fileName": fileUploaded.filename, "fileType": fileUploaded.contentType.toString() }));
        ctx.end();
      }
    })
    .catchError((e, trace) {
      PinUtility.handleError(e, trace);
      ctx.sendJson(buildResponse('handleUpload', { "error": "Error encountered in handling file!" }, valid: false));
    });
  }

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* CATEGORIES
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  static handleCategoryCreate(HttpContext ctx) {
    if (!CartSystem.instance.actionPreProcess(ctx)) {
      return;
    }
    if (!_filterIsMaster(ctx)) {
      return;
    }

    _parseHttpReqBody(ctx)
    .then((HttpRequestBody body) {
      String uuid = body.body['uuid'];
      String name = body.body['name'];
      if (!PinUtility.isUuid(uuid)) {
        throw new Exception('[CartAction] handleCategoryCreate: Invalid category uuid: ${uuid}');
      } else if (name == null || name == '') {
        throw new Exception('[CartAction] handleCategoryCreate: Invalid category name!');
      } else {
        return CartModel.instance.addCategory(uuid, name);
      }
    })
    .then((CartCategory category) {
      ctx.sendJson(buildResponse('handleCategoryCreate', { "category": category.toJson() }));
    })
    .catchError((e, trace) {
      PinUtility.handleError(e, trace);
      ctx.sendJson(buildResponse('handleCategoryCreate', { "error": "Error in creating request!" }, valid: false));
    });
  }

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* TAGS
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  static handleCategoryAll(HttpContext ctx) {
    if (!CartSystem.instance.actionPreProcess(ctx)) {
      return;
    }

    ctx.sendJson(buildResponse('handleCategoryAll', { "categories": CartModel.instance.categoryList.toJson() }));
  }

  static handleTagCreate(HttpContext ctx) {
    if (!CartSystem.instance.actionPreProcess(ctx)) {
      return;
    }
    if (!_filterIsMaster(ctx)) {
      return;
    }
    _parseHttpReqBody(ctx)
    .then((HttpRequestBody body) {
      String uuid = body.body['uuid'];
      String name = body.body['name'];
      if (!PinUtility.isUuid(uuid)) {
        throw new Exception('[CartAction] handleCategoryCreate: Invalid tag uuid: ${uuid}');
      } else if (name == null || name == '') {
        throw new Exception('[CartAction] handleCategoryCreate: Invalid tag name!');
      } else {
        return CartModel.instance.addTag(uuid, name);
      }
    })
    .then((CartTag tag) {
      ctx.sendJson(buildResponse('handleTagCreate', {"tag": tag.toJson()}));
    })
    .catchError((e, trace) {
      PinUtility.handleError(e, trace);
      ctx.sendJson(buildResponse('handleTagCreate', { "error": "Error in creating tag!" }, valid: false));
    });
  }

  static handleTagAll(HttpContext ctx) {
    if (!CartSystem.instance.actionPreProcess(ctx)) {
      return;
    }

    ctx.sendJson(buildResponse('handleTagAll', { "tags": CartModel.instance.tagList.toJson() }));
  }

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* SYSTEM
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  static handleLogin(HttpContext ctx) {
    if (!CartSystem.instance.actionPreProcess(ctx)) {
      return;
    }

    if (CartSystem.instance.credentials.length <= 0) {
      PinLogger.instance.shout('[CartAction] handleLogin: Site has not been initialized yet!');
      ctx.sendJson(buildResponse('handleLogin', { "error": "Site has not been initialized yet!" }, valid: false));
    } else {
      ctx.sendJson(buildResponse('handleLogin', {
          "url": CartSystem.instance.oauth2.getLoginUrl()
      }));
    }

    ctx.end();
  }

  static void handleLogout(HttpContext ctx) {
    if (!CartSystem.instance.actionPreProcess(ctx)) {
      return;
    }
    if (!_filterIsMaster(ctx)) {
      return;
    }

    _removeSessionToken(ctx)
    .then((_) {
      ctx.sendJson(buildResponse('handleLogout', {}));
      ctx.end();
    })
    .catchError((e, trace) {
      PinUtility.handleError(e, trace);
      ctx.res.redirect(Uri.parse('/error'));
    });
  }

  static handleRestoreStatus(HttpContext ctx) {
    // TODO 汇报系统恢复状态
  }

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* OAUTH
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  static handleOauth2(HttpContext ctx) {
    if (!CartSystem.instance.actionPreProcess(ctx)) {
      return;
    }

    if (CartSystem.instance.credentials.length > 0) {
      PinLogger.instance.shout('[CartAction] handleOauth2: Already authorized!');
      ctx.sendJson(buildResponse('handleOauth2', { "error": "Already authorized!" }, valid: false));
    } else {
      ctx.sendJson(buildResponse('handleOauth2', {
          "url": CartSystem.instance.oauth2.getOAuthUrl()
      }));
    }
    ctx.end();
  }

  static handleOauth2Next(HttpContext ctx) {
    if (!CartSystem.instance.actionPreProcess(ctx)) {
      return;
    }

    String email = '';
    HashMap credentials = {};

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
        // write additional credential file for google refresh purpose, otherwise the credential file would be overwritten by google api
        PinUtility.writeJsonFile(CartSystem.instance.oauth['web']['credentialsRefreshFilePath'],  credentials, withIndent: true);
        return PinUtility.writeJsonFile(CartSystem.instance.oauth['web']['credentialsFilePath'], credentials, withIndent: true);
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
        // root drive id
        String rootFolderDriveId = _;
        credentials['googleDriveRootFolder'] = rootFolderDriveId;
        CartSystem.instance.googleDriveRootFolder = rootFolderDriveId;
        // private tag
        HashMap defaultTagPrivateInfo = { "uuid": null, "title": null };
        credentials['tagPrivate'] = defaultTagPrivateInfo;
        CartSystem.instance.tagPrivate = defaultTagPrivateInfo;
        // save credentials
        CartSystem.instance.credentials = credentials;
        return PinUtility.writeJsonFile(CartSystem.instance.oauth['web']['credentialsFilePath'], credentials, withIndent: true);
      } else {
        // just pass the result to next step
        return new Future.value(_);
      }
    })
    .then((_) {
      if (!isAuthed) {
        // start restoring site from google drive
        CartSystem.instance.restoreBlogFromDrive(); // this action will not block the process of oauth2 logic, just start it here
        return new Future.value(true);
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
    if (!CartSystem.instance.actionPreProcess(ctx)) {
      return;
    }

    var isAuthed = false;

    if (CartSystem.instance.credentials.length > 0) {
      isAuthed = true;
    }

    ctx.sendJson(buildResponse('handleIsAuthed', {
        "isAuthed": isAuthed
    }));
    ctx.end();
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
      ctx.sendJson(buildResponse('filterIsMaster', { "error": "User not logged in, pls login first!" }, valid: false));
      ctx.end();
    }

    return isUserMaster;
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

    var expires = new DateTime.now();
    expires = expires.add(new Duration(seconds: CartSystem.instance.setting['cookieLive']));
    _setCookie(ctx, CartConst.SESSION_TOKEN_KEY, token, expires: expires);

    HashMap session = {
        CartConst.SESSION_TOKEN_KEY: token,
        CartConst.SESSION_EXPIRES_KEY: expires.millisecondsSinceEpoch
    };
    CartSystem.instance.session = session;
    return PinUtility.writeJsonFile(CartConst.CONFIG_SESSION_PATH, session, withIndent: true);
  }

  static Future<File> _removeSessionToken(HttpContext ctx) {
    _setCookie(ctx, CartConst.SESSION_TOKEN_KEY, '');
    CartSystem.instance.session = {};
    return PinUtility.writeJsonFile(CartConst.CONFIG_SESSION_PATH, {});
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