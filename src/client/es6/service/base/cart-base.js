import conf from '../../../../common/config.json';

class CartBase {
  constructor(CartPost, CartCategory, CartTag, CartAttachment, $injector) {
    this.modelPost = CartPost;
    this.modelCategory = CartCategory;
    this.modelTag = CartTag;
    this.modelAttachment = CartAttachment;

    this.$injector = $injector;

    this.conf = conf;
  }

  logInit(name) {
    if (!console) {
      return;
    }
    console.log(`Service ${name} initialized`);
  }
}

CartBase.$inject = ['CartPost', 'CartCategory', 'CartTag', 'CartAttachment', '$injector'];

export default CartBase;
