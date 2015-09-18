import CartBase from './base/cart-base.js';

class CartMessageService extends CartBase {
  constructor($mdToast, ...args) {
    super(...args);
    this.logInit('CartMessageService');

    this.$mdToast = $mdToast;
  }

  static factory(...args) {
    return new CartMessageService(...args);
  }

  debug(...args) {
    outputConsole(...args);
  }

  info() {

  }

  outputToast() {

  }

  outputConsole(...args) {
    if (!console) {
      return;
    }
    console.log(...args);
  }
}

CartMessageService.factory.$inject = ['$mdToast', ...CartBase.$inject];

export default CartMessageService;
