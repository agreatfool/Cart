import CartBase from './cart-base.js';

class CartBlogCategoryCtrl extends CartBase {
  constructor(...args) {
    super(...args);
    this.logInit('CartBlogCategoryCtrl');
  }
}

CartBlogCategoryCtrl.$inject = [...CartBase.$inject];

export default CartBlogCategoryCtrl;
