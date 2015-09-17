import CartBase from './base/cart-base.js';

import libUuid from 'node-uuid';

class CartApiService extends CartBase {
  constructor(...args) {
    super(...args);
    this.logInit('CartApiService');
  }

  postCreate(title, category = null, tags = [], attachments = [], isPublic = false) {
    let promise = this.modelPost.create({
      uuid: libUuid.v4(),
      title: title,
      driveId: null,
      category: libUuid.v4(),
      tags: tags,
      attachments: attachments,
      isPublic: isPublic
    });
    promise.$promise.then(
      (obj) => console.log('$promise success', obj),
      (obj) => console.log('$promise error', obj)
    );
  }

  static factory(CartPost) {
    return new CartApiService(CartPost);
  }
}

CartApiService.factory.$inject = [...CartBase.$inject];

export default CartApiService;
