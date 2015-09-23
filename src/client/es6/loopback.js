import conf from '../../common/config.json';

class CartLoopback {
  constructor(LoopBackResourceProvider) {
    // Use a custom auth header instead of the default 'Authorization'
    LoopBackResourceProvider.setAuthHeader('X-Access-Token');
    // Change the URL where to access the LoopBack REST API server
    LoopBackResourceProvider.setUrlBase(`${conf['protocol']}://${conf['host']}:${conf['port']}/api`);
  }

  static factory(...args) {
    return new CartLoopback(...args);
  }
}

CartLoopback.factory.$inject = ['LoopBackResourceProvider'];

export default CartLoopback;
