import CartModalBase from '../base/cart-modal.js';

import angular from 'angular';

class CartModalMetaInfoCtrl extends CartModalBase {
  constructor(CartTmpSaveService, $mdBottomSheet, ...args) {
    super(...args);

    this.tmpSaveService = CartTmpSaveService;

    this.$mdBottomSheet = $mdBottomSheet;

    /**
     * Since mdBottomSheet has no official service provided to handle close event,
     * there is no way to send back edited data to parent controller from bottom sheet.
     * So I made a click event on background mask, when it's clicked, use the functionality of
     * CartTmpSaveService to save edited data, then fetched in the parent controller.
     */
    var timer = setInterval(() => {
      let background = document.getElementsByTagName('md-backdrop');
      if (background.length > 0) {
        clearInterval(timer);
        angular.element(background[0]).bind('click', () => {
          this.tmpSaveService.save({
            post: this.post,
            category: this.category,
            tags: this.tags,
            attachments: this.attachments
          });
        });
      }
    }, 100); // 100ms
  }

  categoryContentChanged() {
    this.msgService.debug('categoryContentChanged: ', this.category.title);
    // 根据名字读取cateogry信息，更新当前的category
    // 并更新post内的category uuid
    // 如果不存在，则需要创建category，并交付给post
  }

  // tags及attachments类同于category
}

CartModalMetaInfoCtrl.$inject = ['CartTmpSaveService', '$mdBottomSheet', ...CartModalBase.$inject];

export default CartModalMetaInfoCtrl;
