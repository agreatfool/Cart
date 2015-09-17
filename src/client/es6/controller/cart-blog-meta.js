class CartBlogMetaInfoCtrl {
  constructor($mdBottomSheet) {
    this.$mdBottomSheet = $mdBottomSheet;

    console.log(arguments);
    console.log(this);
  }

  hideSheet() {
    this.$mdBottomSheet.hide();
  }
}

CartBlogMetaInfoCtrl.$inject = ['$mdBottomSheet'];

export default CartBlogMetaInfoCtrl;
