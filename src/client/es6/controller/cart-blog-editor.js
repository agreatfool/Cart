import CartBase from './cart-base.js';

class CartBlogEditorCtrl extends CartBase {
  constructor(...args) {
    super(...args);
  }

  preview() {
    console.log('CartBlogEditorCtrl::preview');
  }

  save() {
    console.log('CartBlogEditorCtrl::save');
  }
}

CartBlogEditorCtrl.$inject = [...CartBase.$inject];

export default CartBlogEditorCtrl;
