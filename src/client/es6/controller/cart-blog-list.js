import CartBase from './cart-base.js';

class CartBlogListCtrl extends CartBase {
  constructor(...args) {
    super(...args);
    this.logInit('CartBlogListCtrl');
  }
}

CartBlogListCtrl.$inject = [...CartBase.$inject];

export default CartBlogListCtrl;