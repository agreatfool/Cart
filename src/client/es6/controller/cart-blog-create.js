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
      uuid: null,
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

  //noinspection ES6Validation
  async save() {
    try {
      //noinspection ES6Validation
      let post = await this.apiService.postUpsert(this.post);
      this.msgService.info('Post saved: ', post);
    } catch (e) {
      this.msgService.error('Error when creating post: ', e.data.error.message);
    }
  }
}

CartBlogCreateCtrl.$inject = [...CartBlogEditorCtrl.$inject];

export default CartBlogCreateCtrl;
