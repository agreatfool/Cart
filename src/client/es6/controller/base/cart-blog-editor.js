import CartBase from './cart-base.js';

class CartBlogEditorCtrl extends CartBase {
  constructor(CartTmpSaveService, ...args) {
    super(...args);

    this.tmpSaveService = CartTmpSaveService;

    this.category = {}; // category object this post belongs to, shall be overwrote in child class
    this.tags = []; // tag objects this post has, shall be overwrote in child class
    this.attachments = []; // attachment objects this post has, shall be overwrote in child class
    this.post = {}; // post object defined in editor parent class, shall be overwrote in child class
  }

  preview() {
    this.msgService.debug('CartBlogEditorCtrl::preview');
  }

  save() {
    this.msgService.debug('CartBlogEditorCtrl::save');
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
    }).then(
      // only reject handler shall be implemented, since there is no normal close event in this modal window
      null,
      () => {
        let savedData = this.tmpSaveService.fetch();
        this.post = savedData['post'];
        this.category = savedData['category'];
        this.tags = savedData['tags'];
        this.attachments = savedData['attachments'];
      }
    );
  }
}

CartBlogEditorCtrl.$inject = ['CartTmpSaveService', ...CartBase.$inject];

export default CartBlogEditorCtrl;
