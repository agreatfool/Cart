import conf from '../../../../common/config.json';

class CartModalBase {
  constructor(CartMessageService, $injector) {
    this.msgService = CartMessageService;

    this.$injector = $injector;

    this.conf = conf;
  }
}

CartModalBase.$inject = ['CartMessageService', '$injector'];

export default CartModalBase;
