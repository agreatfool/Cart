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
    } else if (reqUrl.match(/^\/img\/.*/)) {
      // static image resources, skip it
      next();
    } else if (reqUrl.match(/^\/page\/.*/)) {
      // static html resources, skip it
      next();
    } else if (reqUrl.match(/^\/api.*/)) {
      // loopback api root, skip it
      next();
    } else if (reqUrl.match(/^\/explorer.*/)) {
      // loopback explorer root, skip it
      next();
    } else if (reqUrl.match(/^\/cordova\.js/)) {
      // root cordova.js, skip it
      next();
    } else {
      // otherwise just gave the index.html for angular HTML5 mode support
      res.sendFile('client/public/index.html', { root: libPath.join(__dirname, '..', '..') });
    }
  });

  server.use(router);
};
