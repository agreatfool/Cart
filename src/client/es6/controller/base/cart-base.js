class CartBase {
  constructor(CartMessageService, CartApiService, $location, $window, $mdBottomSheet) {
    this.msgService = CartMessageService;
    this.apiService = CartApiService;

    this.$location = $location;
    this.$window = $window;
    this.$mdBottomSheet = $mdBottomSheet;
  }

  showShortcuts($event) {
    this.$mdBottomSheet.show({
      templateUrl: 'shortcut.html',
      controller: 'CartModalShortcutCtrl as ctrl',
      targetEvent: $event
    });
  }

  goPath(path = '/') {
    this.$location.path(path);
  }

  goBack() {
    this.$window.history.back();
  }

  reloadPage() {
    this.$window.location.reload();
  }

  logInit(name) {
    if (!console) {
      return;
    }
    console.log(`Controller ${name} initialized`);
  }
}

CartBase.$inject = [
  'CartMessageService', 'CartApiService',
  '$location', '$window',
  '$mdBottomSheet'
];

export default CartBase;
