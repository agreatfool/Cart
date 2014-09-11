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
      ctx.sendJson(buildResponse(CartSystem.oauth2.getOAuthUrl()));
    }
  }

  static handleOauth2Next(HttpContext ctx) {
    CartSystem.oauth2.processOAuthNext(ctx.params)
    .then((HashMap done) {
      if (done['result']) {
        CartSystem.instance.credentials = PinUtility.readJsonFileSync(CartSystem.instance.oauth['web']['credentialsFilePath']);
      }
      ctx.res.redirect(Uri.parse('/oauth2'));
    })
    .catchError((e, trace) {
      PinUtility.handleError(e, trace);
      ctx.res.redirect(Uri.parse('/error'));
    });
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

  static Map buildResponse(Map message, {bool valid: true}) {
    return {
        "valid": valid,
        "message": message
    };
  }

}