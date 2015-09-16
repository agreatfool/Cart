class CartBlogFooterCtrl {
  constructor($mdBottomSheet) {
    this.$mdBottomSheet = $mdBottomSheet;

    this.bottomButtons = [
      { name: 'Create',   icon: 'create',   state: 'create' },
      { name: 'Category', icon: 'layers',   state: 'category' },
      { name: 'Tag',      icon: 'bookmark', state: 'tag' },
      { name: 'Search',   icon: 'search',   state: 'search' },
      { name: 'Settings', icon: 'settings', state: 'settings' },
    ];
  }

  footerClick() {
    this.$mdBottomSheet.hide();
  }
}

CartBlogFooterCtrl.$inject = ['$mdBottomSheet'];

export default CartBlogFooterCtrl;
