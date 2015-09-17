class CartBlogShortcutCtrl {
  constructor($mdBottomSheet) {
    this.$mdBottomSheet = $mdBottomSheet;

    this.bottomButtons = [
      { name: 'Home',     icon: 'home',     state: 'home' },
      { name: 'Create',   icon: 'create',   state: 'create' },
      { name: 'Category', icon: 'layers',   state: 'category' },
      { name: 'Tag',      icon: 'label',    state: 'tag' },
      { name: 'Search',   icon: 'search',   state: 'search' },
      { name: 'Settings', icon: 'settings', state: 'settings' },
    ];
  }

  hideSheet() {
    this.$mdBottomSheet.hide();
  }
}

CartBlogShortcutCtrl.$inject = ['$mdBottomSheet'];

export default CartBlogShortcutCtrl;
