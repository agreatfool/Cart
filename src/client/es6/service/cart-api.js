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

  postFetchViaUuid(uuid) {
    let promise = null;

    if (this.postMap.has(uuid)) {
      promise = new Promise((resolve) => resolve(this.postMap.get(uuid)));
    } else {
      promise = new Promise((resolve, reject) => {
        this.modelPost.find({ filter: { where: { uuid: uuid } } }).$promise.then(
          (result) => {
            if (result.length > 0) {
              let post = result.shift();
              this.postMap.set(uuid, post);
              resolve(post);
            } else {
              resolve(null);
            }
          },
          (error) => reject(error)
        );
      });
    }

    return promise;
  }

  postUpsert(post) {
    return this.modelPost.upsert(post).$promise;
  }

  postDefaultCategory() {
    let uuid = conf['defaultCategory']['uuid'];

    let promise = null;

    if (this.categoryMap.has(uuid)) {
      // found in cache
      promise = new Promise((resolve) => resolve(this.categoryMap.get(uuid)));
    } else {
      // not found, search
      promise = new Promise((resolve, reject) => {
        this.modelCategory.find({ filter: { where: { uuid: uuid } } }).$promise.then(
          (result) => {
            if (result.length > 0) {
              // search found
              let category = result.shift();
              this.categoryMap.set(uuid, category);
              resolve(category);
            } else {
              // search not found, create it
              new Promise(() => {
                this.modelCategory.create({
                  uuid: uuid,
                  title: conf['defaultCategory']['name']
                });
              }).then(
                (result) => {
                  if (result.length > 0) {
                    let category = result.shift();
                    this.categoryMap.set(uuid, category);
                    resolve(category);
                  } else {
                    reject(new Error('No category created'));
                  }
                },
                (error) => reject(error)
              );
            }
          },
          (error) => reject(error)
        );
      });
    }

    return promise;
  }

  postDefaultPrivacy() {
    return false;
  }
}

CartApiService.factory.$inject = ['CartMessageService', ...CartBase.$inject];

export default CartApiService;
