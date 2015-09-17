import CartBase from './base/cart-base.js';

class CartPostTmpSaveService extends CartBase {
  constructor(...args) {
    super(...args);
    this.logInit('CartPostTmpSaveService');
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
    return new CartPostTmpSaveService(CartPost);
  }
}

CartPostTmpSaveService.factory.$inject = [...CartBase.$inject];

export default CartPostTmpSaveService;
