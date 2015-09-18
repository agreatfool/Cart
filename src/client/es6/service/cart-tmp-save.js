import CartBase from './base/cart-base.js';

class CartTmpSaveService extends CartBase {
  constructor(...args) {
    super(...args);
    this.logInit('CartTmpSaveService');

    this.data = null; // tmp saved data object
  }

  static factory(...args) {
    return new CartTmpSaveService(...args);
  }

  save(data) {
    this.data = data;
  }

  fetch() {
    let data = this.data;
    this.data = null;
    return data;
  }
}

CartTmpSaveService.factory.$inject = [...CartBase.$inject];

export default CartTmpSaveService;
