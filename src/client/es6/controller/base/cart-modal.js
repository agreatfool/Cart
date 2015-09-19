class CartModalBase {
  constructor(CartMessageService) {
    this.msgService = CartMessageService;
  }
}

CartModalBase.$inject = ['CartMessageService'];

export default CartModalBase;
