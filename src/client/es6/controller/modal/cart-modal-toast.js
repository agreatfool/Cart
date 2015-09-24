import CartModalBase from '../base/cart-modal.js';

class CartModalToastCtrl extends CartModalBase {
  constructor(...args) {
    super(...args);

    if (this.conf.platform === 'desktop') {
      this.$mdToast = this.$injector.get('$mdToast');
    }
  }

  closeToast() {
    if (this.conf.platform === 'desktop') {
      this.$mdToast.hide();
    }
  }
}

CartModalToastCtrl.$inject = [...CartModalBase.$inject];

export default CartModalToastCtrl;
