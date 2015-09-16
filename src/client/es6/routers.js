class CartRouters {
  constructor($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);

    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'views/list.html',
        controller: 'CartBlogListCtrl'
      })
      .state('list', {
        url: '/list',
        templateUrl: 'views/list.html',
        controller: 'CartBlogListCtrl'
      })
      .state('settings', {
        url: '/settings',
        templateUrl: 'views/settings.html'
      });

    //$stateProvider
    //  .state('init', {
    //    url: '/init',
    //    templateUrl: "route1.html"
    //  })
    //  .state('route1.list', {
    //    url: "/list",
    //    templateUrl: "route1.list.html",
    //    controller: function($scope){
    //      $scope.items = ["A", "List", "Of", "Items"];
    //    }
    //  })
    //
    //  .state('route2', {
    //    url: "/route2",
    //    templateUrl: "route2.html"
    //  })
    //  .state('route2.list', {
    //    url: "/list",
    //    templateUrl: "route2.list.html",
    //    controller: function($scope){
    //      $scope.things = ["A", "Set", "Of", "Things"];
    //    }
    //  })
  }

  static factory($stateProvider, $urlRouterProvider, $locationProvider) {
    return new CartRouters($stateProvider, $urlRouterProvider, $locationProvider);
  }
}

CartRouters.factory.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];

export default CartRouters;
