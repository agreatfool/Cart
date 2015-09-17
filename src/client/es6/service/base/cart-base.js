class CartBase {
  constructor(CartPost) {
    this.modelPost = CartPost;
  }

  logInit(name) {
    if (!console) {
      return;
    }
    console.log(`Service ${name} initialized`);
  }
}

CartBase.$inject = ['CartPost'];

export default CartBase;
