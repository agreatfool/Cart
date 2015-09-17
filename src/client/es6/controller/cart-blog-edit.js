import CartBlogEditorCtrl from './base/cart-blog-editor.js';

class CartBlogEditCtrl extends CartBlogEditorCtrl {
  constructor(...args) {
    super(...args);
    this.logInit('CartBlogEditCtrl');
  }
}

CartBlogEditCtrl.$inject = [...CartBlogEditorCtrl.$inject];

export default CartBlogEditCtrl;
