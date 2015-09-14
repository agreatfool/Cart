var libPath = require('path');

module.exports = function(server) {
  // Install a `/` route that returns server status
  var router = server.loopback.Router();
  //router.get('/', server.loopback.status()); // loopback default router, change it to do production work
  router.get('/', function(req, res) {
    res.sendFile('client/public/index.html', { root: libPath.join(__dirname, '..', '..') });
  });
  server.use(router);
};
