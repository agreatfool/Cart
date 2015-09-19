import CartModalBase from '../base/cart-modal.js';

class CartModalMetaInfoCtrl extends CartModalBase {
  constructor($mdBottomSheet, ...args) {
    super(...args);

    this.$mdBottomSheet = $mdBottomSheet;
  }

  categoryContentChanged() {
    this.msgService.debug('categoryContentChanged: ', this.category.title);
    // 根据名字读取cateogry信息，更新当前的category
    // 并更新post内的category uuid
    // 如果不存在，则需要创建category，并交付给post
  }

  // tags及attachments类同于category
}

CartModalMetaInfoCtrl.$inject = ['$mdBottomSheet', ...CartModalBase.$inject];

export default CartModalMetaInfoCtrl;
