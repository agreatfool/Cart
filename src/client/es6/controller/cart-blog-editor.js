import CartBase from './cart-base.js';

class CartBlogEditorCtrl extends CartBase {
  constructor(CartPostService, ...args) {
    super(...args);

    this.postService = CartPostService;

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
    this.postService.savePost(this.post);
    this.$mdBottomSheet.show({
      templateUrl: 'meta-info.html',
      controller: 'CartBlogMetaInfoCtrl as ctrl',
      targetEvent: $event
    }).then(
      () => console.log('solved', this.postService.fetchPost()),
      () => console.log('rejected', this.postService.fetchPost())
    );
  }
}

CartBlogEditorCtrl.$inject = ['CartPostService', ...CartBase.$inject];

export default CartBlogEditorCtrl;
