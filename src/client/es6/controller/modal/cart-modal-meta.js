import CartModalBase from '../base/cart-modal.js';

class CartModalMetaInfoCtrl extends CartModalBase {
  constructor($mdBottomSheet, ...args) {
    super(...args);

    this.$mdBottomSheet = $mdBottomSheet;
  }
}

CartModalMetaInfoCtrl.$inject = ['$mdBottomSheet', ...CartModalBase.$inject];

export default CartModalMetaInfoCtrl;
