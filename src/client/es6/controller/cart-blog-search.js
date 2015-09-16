import CartBase from './cart-base.js';

class CartBlogSearchCtrl extends CartBase {
  constructor(...args) {
    super(...args);
    this.logInit('CartBlogListCtrl');
  }
}

CartBlogSearchCtrl.$inject = [...CartBase.$inject];

export default CartBlogSearchCtrl;
