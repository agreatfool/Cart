import CartBlogEditorCtrl from './base/cart-blog-editor.js';

class CartBlogCreateCtrl extends CartBlogEditorCtrl {
  constructor(...args) {
    super(...args);
    this.logInit('CartBlogCreateCtrl');

    this.init();
  }

  init() {
  }
  }
}

CartBlogCreateCtrl.$inject = [...CartBlogEditorCtrl.$inject];

export default CartBlogCreateCtrl;
