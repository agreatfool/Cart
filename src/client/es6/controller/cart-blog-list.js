class CartBlogListCtrl {
  constructor(CartApiService) {
    this.apiService = CartApiService;
    console.log(this.apiService);
  }
}

CartBlogListCtrl.$inject = ['CartApiService'];

export default CartBlogListCtrl;
