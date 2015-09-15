class CartTheming {
  constructor($mdThemingProvider) {
    // Available palettes: red, pink, purple, deep-purple, indigo, blue, light-blue, cyan, teal, green, light-green, lime, yellow, amber, orange, deep-orange, brown, grey, blue-grey
    $mdThemingProvider.theme('default')
      .primaryPalette('blue-grey')
      .accentPalette('orange');
  }

  static factory($mdThemingProvider) {
    return new CartTheming($mdThemingProvider);
  }
}

CartTheming.factory.$inject = ['$mdThemingProvider'];

export default CartTheming;
