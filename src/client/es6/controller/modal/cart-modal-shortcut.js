import CartModalBase from '../base/cart-modal.js';

class CartModalShortcutCtrl extends CartModalBase {
  constructor(...args) {
    super(...args);

    this.bottomButtons = [
      { name: 'Home',     icon: 'home',     state: 'home' },
      { name: 'Create',   icon: 'create',   state: 'create' },
      { name: 'Category', icon: 'layers',   state: 'category' },
      { name: 'Tag',      icon: 'label',    state: 'tag' },
      { name: 'Search',   icon: 'search',   state: 'search' },
      { name: 'Settings', icon: 'settings', state: 'settings' },
    ];

    if (this.conf.platform === 'desktop') {
      this.$mdBottomSheet = this.$injector.get('$mdBottomSheet');
    }
  }

  hideSheet() {
    if (this.conf.platform === 'desktop') {
      this.$mdBottomSheet.hide();
    }
  }
}

CartModalShortcutCtrl.$inject = [...CartModalBase.$inject];

export default CartModalShortcutCtrl;
