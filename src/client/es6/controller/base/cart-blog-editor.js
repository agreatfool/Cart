import CartBase from './cart-base.js';

class CartBlogEditorCtrl extends CartBase {
  constructor(CartTmpSaveService, ...args) {
    super(...args);

    this.tmpSaveService = CartTmpSaveService;

    this.post = {
      title: 'defaultTitle',
      category: 'defaultCategory',
      tags: 'defaultTags'
    };
  }

  preview() {
    console.log('CartBlogEditorCtrl::preview');
  }

  save() {
    this.apiService.postCreate('new post');
  }

  showMetaInfo($event) {
    this.tmpSaveService.save(this.post);
    this.$mdBottomSheet.show({
      templateUrl: 'meta-info.html',
      controller: 'CartBlogMetaInfoCtrl as ctrl',
      targetEvent: $event
    }).then(
      () => console.log('solved', this.postTmpSaveService.fetchPost()),
      () => console.log('rejected', this.postTmpSaveService.fetchPost())
    );
  }
}

CartBlogEditorCtrl.$inject = ['CartTmpSaveService', ...CartBase.$inject];

export default CartBlogEditorCtrl;
