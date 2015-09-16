class CartBase {
  constructor(CartApiService, $location, $window) {
    this.apiService = CartApiService;
    this.$location = $location;
    this.$window = $window;

    this.bottomButtons = [
      { name: 'Create',   icon: 'create',   path: '/create' },
      { name: 'Category', icon: 'layers',   path: '/category' },
      { name: 'Tag',      icon: 'bookmark', path: '/tag' },
      { name: 'Search',   icon: 'search',   path: '/search' },
    ];
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

CartBase.$inject = ['CartApiService', '$location', '$window'];

export default CartBase;
