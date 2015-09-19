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

    this.dataInitialized = false;
  }

  static factory(...args) {
    return new CartApiService(...args);
  }

  dataInit() {
    return new Promise((resolve, reject) => {
      Promise.all([
        this.modelPost.find().$promise,
        this.modelCategory.find().$promise,
        this.modelTag.find().$promise,
        this.modelAttachment.find().$promise
      ]).then(
        (resultArr) => {
          let postResult        = resultArr[0];
          let categoryResult    = resultArr[1];
          let tagResult         = resultArr[2];
          let attachmentResult  = resultArr[3];

          for (let elem of postResult.values()) {
            this.postMap.set(elem.uuid, elem);
          }
          for (let elem of categoryResult.values()) {
            this.categoryMap.set(elem.uuid, elem);
          }
          for (let elem of tagResult.values()) {
            this.tagMap.set(elem.uuid, elem);
          }
          for (let elem of attachmentResult.values()) {
            this.attachmentMap.set(elem.uuid, elem);
          }

          this.dataInitialized = true;

          resolve(this.dataInitialized);
        },
        (error) => reject(error)
      );
    });
  }

  isDataInitialized() {
    return this.dataInitialized;
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
              this.modelCategory.create({
                uuid: uuid,
                title: conf['defaultCategory']['name']
              }).$promise.then(
                (category) => {
                  this.categoryMap.set(uuid, category);
                  resolve(category);
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
