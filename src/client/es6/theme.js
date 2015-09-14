class CartTheming {
  constructor($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('pink')
      .accentPalette('orange');
  }

  static factory($mdThemingProvider) {
    return new CartTheming($mdThemingProvider);
  }
}

CartTheming.factory.$inject = ['$mdThemingProvider'];

export default CartTheming;
