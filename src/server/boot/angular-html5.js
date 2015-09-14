var libPath = require('path');

module.exports = function supportAngularHtml5(server) {
  var router = server.loopback.Router();

  router.all('/*', function(req, res, next) {
    var reqUrl = req.originalUrl;

    if (reqUrl.match(/^\/js\/.*/) !== null) {
      // static javascript resources, skip it
      next();
    } else if (reqUrl.match(/^\/views\/.*/)) {
      // static html view resources, skip it
      next();
    } else {
      // otherwise just gave the index.html for angular HTML5 mode support
      res.sendFile('client/public/index.html', { root: libPath.join(__dirname, '..', '..') });
    }
  });

  server.use(router);
};
