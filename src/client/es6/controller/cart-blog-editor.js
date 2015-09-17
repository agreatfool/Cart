import CartBase from './cart-base.js';

class CartBlogEditorCtrl extends CartBase {
  constructor(CartPostTmpSaveService, ...args) {
    super(...args);

    this.postTmpSaveService = CartPostTmpSaveService;

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
    console.log('CartBlogEditorCtrl::save');
  }

  showMetaInfo($event) {
    this.postTmpSaveService.savePost(this.post);
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

CartBlogEditorCtrl.$inject = ['CartPostTmpSaveService', ...CartBase.$inject];

export default CartBlogEditorCtrl;
