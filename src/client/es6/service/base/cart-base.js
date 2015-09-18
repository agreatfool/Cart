class CartBase {
  constructor(CartPost, CartCategory, CartTag, CartAttachment) {
    this.modelPost = CartPost;
    this.modelCategory = CartCategory;
    this.modelTag = CartTag;
    this.modelAttachment = CartAttachment;
  }

  logInit(name) {
    if (!console) {
      return;
    }
    console.log(`Service ${name} initialized`);
  }
}

CartBase.$inject = ['CartPost', 'CartCategory', 'CartTag', 'CartAttachment'];

export default CartBase;
