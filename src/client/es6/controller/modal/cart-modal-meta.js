import CartModalBase from '../base/cart-modal.js';

class CartModalMetaInfoCtrl extends CartModalBase {
  constructor(...args) {
    super(...args);

    if (this.conf.platform === 'desktop') {
      this.$mdBottomSheet = this.$injector.get('$mdBottomSheet');
    }
  }

  categoryContentChanged() {
    this.msgService.debug('categoryContentChanged: ', this.category.title);
    // 根据名字读取cateogry信息，更新当前的category
    // 并更新post内的category uuid
    // 如果不存在，则需要创建category，并交付给post
  }

  // tags及attachments类同于category
}

CartModalMetaInfoCtrl.$inject = [...CartModalBase.$inject];

export default CartModalMetaInfoCtrl;
