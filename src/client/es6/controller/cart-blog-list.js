import CartBase from './base/cart-base.js';

class CartBlogListCtrl extends CartBase {
  constructor($scope, ...args) {
    super(...args);
    this.logInit('CartBlogListCtrl');

    this.$scope = $scope;

    this.postList = [];

    this.init();
  }

  init() {

    if (!this.apiService.isDataInitialized()) {
      // loading animation

      this.apiService.dataInit().then(
        () => {
          // end loading animation??
          this.convertPostDataToViewArr(this.apiService.postMap);
        },
        (error) => {
          // end loading animation??
          this.msgService.error(error);
        }
      );
    } else {
      this.convertPostDataToViewArr(this.apiService.postMap);
    }

  }

  categoryGetTitleViaUuid(uuid) {
    let name = 'N/A';

    if (this.apiService.categoryMap.has(uuid)) {
      name = this.apiService.categoryMap.get(uuid).title;
    }

    return name;
  }

  convertPostDataToViewArr(postMap) { // pagination??
    this.$timeout(() => { // fix the issue: $digest already in progress
      this.$scope.$apply(() => { // fix the issue: postList updated but data binding not triggered
        for (let [, post] of postMap) {
          //noinspection JSUnusedAssignment
          this.postList.push(post);
        }
      });
    });
  }
}

CartBlogListCtrl.$inject = ['$scope', ...CartBase.$inject];

export default CartBlogListCtrl;
