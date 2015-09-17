import CartBase from './base/cart-base.js';

class CartBlogSettingCtrl extends CartBase {
  constructor(...args) {
    super(...args);
    this.logInit('CartBlogListCtrl');
  }
}

CartBlogSettingCtrl.$inject = [...CartBase.$inject];

export default CartBlogSettingCtrl;
