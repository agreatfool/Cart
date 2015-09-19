import CartBlogEditorCtrl from './base/cart-blog-editor.js';

class CartBlogCreateCtrl extends CartBlogEditorCtrl {
  constructor(...args) {
    super(...args);
    this.logInit('CartBlogCreateCtrl');

    this.init();
  }

  init() {
    this.apiService.postDefaultCategory().then(
      (category) => {
        this.category = category;
        this.post.category = category.uuid;
      },
      (error) => this.msgService.error(error)
    );
    this.tags = [];
    this.attachments = [];
    this.post = {
      uuid: undefined, // have to be "undefined" to make stongloop server recognize this property shall apply defaultFn
      driveId: null,
      title: '',
      created: new Date(),
      updated: new Date(),
      category: null,
      tags: [],
      attachments: [],
      isPublic: this.apiService.postDefaultPrivacy()
    }
  }
}

CartBlogCreateCtrl.$inject = [...CartBlogEditorCtrl.$inject];

export default CartBlogCreateCtrl;
