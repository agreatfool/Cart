part of cart;

class CartAction {

  static handleIndex(HttpContext ctx) {
    ctx.sendJson({
        "posts": CartModel.instance.posts.toJson(),
        "categories": CartModel.instance.categories.toJson(),
        "tags": CartModel.instance.tags.toJson()
    });
    ctx.end();
  }

  static handleOauth2(HttpContext ctx) {
    ctx.sendText(CartSystem.oauth2.getOAuthUrl());
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

}