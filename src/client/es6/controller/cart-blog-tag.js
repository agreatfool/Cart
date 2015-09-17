import CartBase from './base/cart-base.js';

class CartBlogTagCtrl extends CartBase {
  constructor(...args) {
    super(...args);
    this.logInit('CartBlogTagCtrl');
  }
}

CartBlogTagCtrl.$inject = [...CartBase.$inject];

export default CartBlogTagCtrl;
