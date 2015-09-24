import conf from '../../../../common/config.json';

class CartBase {
  constructor(CartMessageService, CartApiService, $location, $window, $timeout, $injector) {
    this.msgService = CartMessageService;
    this.apiService = CartApiService;

    this.$location = $location;
    this.$window = $window;
    this.$timeout = $timeout;
    this.$injector = $injector;

    this.conf = conf;

    if (this.conf.platform === 'desktop') {
      this.$mdBottomSheet = this.$injector.get('$mdBottomSheet');
    }
  }

  showShortcuts($event) {
    if (this.conf.platform === 'desktop') {
      this.$mdBottomSheet.show({
        templateUrl: 'shortcut.html',
        controller: 'CartModalShortcutCtrl as ctrl',
        targetEvent: $event
      });
    }
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
  '$location', '$window', '$timeout', '$injector'
];

export default CartBase;
