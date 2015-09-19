import CartBase from './cart-base.js';

class CartBlogEditorCtrl extends CartBase {
  constructor(...args) {
    super(...args);

    this.category = {}; // category object this post belongs to, shall be overwrote in child class
    this.tags = []; // tag objects this post has, shall be overwrote in child class
    this.attachments = []; // attachment objects this post has, shall be overwrote in child class
    this.post = {}; // post object defined in editor parent class, shall be overwrote in child class
  }

  preview() {
    this.msgService.debug('CartBlogEditorCtrl::preview');
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

  showMetaInfo($event) {
    this.$mdBottomSheet.show({
      templateUrl: 'meta-info.html',
      controller: 'CartModalMetaInfoCtrl as ctrl',
      targetEvent: $event,
      locals: {
        post: this.post,
        category: this.category,
        tags: this.tags,
        attachments: this.attachments
      },
      bindToController: true
    });
  }
}

CartBlogEditorCtrl.$inject = [...CartBase.$inject];

export default CartBlogEditorCtrl;
