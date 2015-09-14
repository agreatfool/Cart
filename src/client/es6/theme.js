function CartTheming($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('pink')
    .accentPalette('orange');
}

CartTheming.$inject = ['$mdThemingProvider'];

export default CartTheming;
