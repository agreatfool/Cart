class CartApiService {
  constructor(CartPost) {
    console.log(CartPost);
  }

  static factory(CartPost) {
    return new CartApiService(CartPost);
  }
}

CartApiService.factory.$inject = ['CartPost'];

export default CartApiService;
