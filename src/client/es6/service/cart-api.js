import CartBase from './cart-base.js';

class CartApiService extends CartBase {
  constructor(...args) {
    super(...args);
    this.logInit('CartApiService');
  }

  static factory(CartPost) {
    return new CartApiService(CartPost);
  }
}

CartApiService.factory.$inject = [...CartBase.$inject];

export default CartApiService;
