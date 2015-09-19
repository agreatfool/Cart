import CartModalBase from '../base/cart-modal.js';

class CartModalToastCtrl extends CartModalBase {
  constructor($mdToast, ...args) {
    super(...args);

    this.$mdToast = $mdToast;
  }

  closeToast() {
    this.$mdToast.hide();
  }
}

CartModalToastCtrl.$inject = ['$mdToast', ...CartModalBase.$inject];

export default CartModalToastCtrl;
