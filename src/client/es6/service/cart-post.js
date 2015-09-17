import CartBase from './cart-base.js';

class CartPostService extends CartBase {
  constructor(...args) {
    super(...args);
    this.logInit('CartPostService');
  }

  savePost(post) {
    this.post = post;
  }

  fetchPost() {
    let data = this.post;
    this.post = null;
    return data;
  }

  static factory(CartPost) {
    return new CartPostService(CartPost);
  }
}

CartPostService.factory.$inject = [...CartBase.$inject];

export default CartPostService;
