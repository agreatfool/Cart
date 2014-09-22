part of cart;

class CartAction {

  static handleIndex(HttpContext ctx) {
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

    ctx.sendJson(buildResponse(indexData));
    ctx.end();
  }

  static handleOauth2(HttpContext ctx) {
    if (CartSystem.instance.credentials.length > 0) {
      ctx.sendJson(buildResponse('Already authorized!', valid: false));
    } else {
      ctx.sendJson(buildResponse({
        "url": CartSystem.instance.oauth2.getOAuthUrl()
      }));
    }
  }

  static handleOauth2Next(HttpContext ctx) {
    CartSystem.instance.oauth2.processOAuthNext(ctx.params)
    .then((HashMap done) {
      if (done['result']) {
        CartSystem.instance.credentials = PinUtility.readJsonFileSync(CartSystem.instance.oauth['web']['credentialsFilePath']);
        return _updateSessionToken(ctx);
      } else {
        throw new Exception('[CartAction] handleOauth2Next: Oauth failed, ${done['message']}');
      }
    })
    .then((_) {
      ctx.res.redirect(Uri.parse('/master'));
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

    ctx.sendJson(buildResponse({
      "isAuthed": isAuthed
    }));
    ctx.end();
  }

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* UTILITIES
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  static bool isMaster(HttpContext ctx) {
    bool isMaster = false;
    String tokenKey = CartConst.SESSION_TOKEN_KEY;
    if (ctx.req.session.containsKey(tokenKey)
      && ctx.req.session[tokenKey] == CartSystem.instance.session[tokenKey]) {
      isMaster = true;
    }
    return isMaster;
  }

  static Map buildResponse(dynamic message, {bool valid: true}) {
    return {
        "valid": valid,
        "message": message
    };
  }

  static Future<File> _updateSessionToken(HttpContext ctx) {
    String token = PinUtility.uuid();
    ctx.req.session[CartConst.SESSION_TOKEN_KEY] = token;
    HashMap session = { CartConst.SESSION_TOKEN_KEY: token };
    CartSystem.instance.session = session;
    final decoder = new JsonEncoder.withIndent('    ');
    return (new File(CartConst.CONFIG_SESSION_PATH)).writeAsString(decoder.convert(session));
  }

}