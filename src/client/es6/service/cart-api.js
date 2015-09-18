import CartBase from './base/cart-base.js';

import libUuid from 'node-uuid';

class CartApiService extends CartBase {
  constructor(...args) {
    super(...args);
    this.logInit('CartApiService');
  static factory(...args) {
    return new CartApiService(...args);
  }

  //noinspection ES6Validation
  async postCreate(title, category = null, tags = [], attachments = [], isPublic = false) {
    let modelPost = this.modelPost;
    function subCreate() {
      let promise = modelPost.create({
        uuid: libUuid.v4(),
        title: title,
        driveId: null,
        //category: libUuid.v4(),
        category: null,
        tags: tags,
        attachments: attachments,
        isPublic: isPublic
      });
      return promise.$promise
        //.then(
        //  (obj) => console.log('$promise success', obj),
        //  (obj) => console.log('$promise error', obj)
        //);
    }
    try {
      //noinspection ES6Validation
      let post = await subCreate();
      console.log('Post created: ', post);
    } catch (e) {
      console.log('Error when creating post: ', e);
    }
  }

  }
}

CartApiService.factory.$inject = [...CartBase.$inject];

export default CartApiService;
