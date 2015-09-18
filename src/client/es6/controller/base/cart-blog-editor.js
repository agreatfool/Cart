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
    console.log('CartBlogEditorCtrl::preview');
  }

  save() {
    console.log('CartBlogEditorCtrl::save');
  }

  showMetaInfo($event) {
    this.tmpSaveService.save(this.post);
    this.$mdBottomSheet.show({
      templateUrl: 'meta-info.html',
      controller: 'CartModalMetaInfoCtrl as ctrl',
      targetEvent: $event
    }).then(
      () => console.log('solved', this.postTmpSaveService.fetchPost()),
      () => console.log('rejected', this.postTmpSaveService.fetchPost())
    );
  }
}

CartBlogEditorCtrl.$inject = ['CartTmpSaveService', ...CartBase.$inject];

export default CartBlogEditorCtrl;
