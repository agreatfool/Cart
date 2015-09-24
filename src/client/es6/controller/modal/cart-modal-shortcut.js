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
    } else {
      // $ionicPopup didn't provide method to close panel cross controller, do some thing dirty
      let backdrop = document.getElementsByClassName('backdrop')[0];
      backdrop.className = backdrop.className.replace(/(visible|active)/g, '');
    }
  }

  hideSheet() {
    if (this.conf.platform === 'desktop') {
      this.$mdBottomSheet.hide();
    } else {
      // $ionicPopup didn't provide method to close panel cross controller, do some thing dirty
      let backdrop = document.getElementsByClassName('backdrop')[0];
      backdrop.className = backdrop.className.replace(/(visible|active)/g, '');
      let popup = document.getElementsByClassName('popup-container')[0];
      popup.parentElement.removeChild(popup);
      let body = document.getElementsByTagName('body')[0];
      body.className = body.className.replace(/popup-open/, '');
    }
  }
}

CartModalShortcutCtrl.$inject = [...CartModalBase.$inject];

export default CartModalShortcutCtrl;
