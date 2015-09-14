function CartRouters($stateProvider, $urlRouterProvider, $locationProvider) {
  $urlRouterProvider.otherwise('/list');
  $locationProvider.html5Mode(true);

  $stateProvider
    .state('list', {
      url: '/list',
      templateUrl: 'views/list.html',
      controller: 'CartBlogList'
    })
    .state('config', {
      url: '/config',
      templateUrl: 'views/config.html'
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

CartRouters.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];

export default CartRouters;
