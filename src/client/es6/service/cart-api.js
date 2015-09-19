import CartBase from './base/cart-base.js';

import libUuid from 'node-uuid';

import conf from '../../../common/config.json';

class CartApiService extends CartBase {
  constructor(CartMessageService, ...args) {
    super(...args);
    this.logInit('CartApiService');

    this.msgService = CartMessageService;

    this.postMap        = new Map(); // uuid => post
    this.categoryMap    = new Map(); // uuid => category
    this.tagMap         = new Map(); // uuid => tag
    this.attachmentMap  = new Map(); // uuid => attachment
  }

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

CartApiService.factory.$inject = ['CartMessageService', ...CartBase.$inject];

export default CartApiService;
