import CartBase from './cart-base.js';

class CartBlogEditorCtrl extends CartBase {
  constructor(...args) {
    super(...args);

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
    this.$mdBottomSheet.show({
      templateUrl: 'meta-info.html',
      controller: 'CartBlogMetaInfoCtrl as ctrl',
      targetEvent: $event,
      scope: {name: 123}
    }).then(function(resolved) {
      console.log(resolved);
    });
  }
}

CartBlogEditorCtrl.$inject = [...CartBase.$inject];

export default CartBlogEditorCtrl;
