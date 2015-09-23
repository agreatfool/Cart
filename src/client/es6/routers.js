import conf from '../../common/config.json';

class CartRouters {
  constructor($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise('/');

    if (conf['platform'] === 'desktop') {
      $locationProvider.html5Mode(true); // enable HTML5 mode only on "desktop" platform
    }

    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'views/list.html',
        controller: 'CartBlogListCtrl',
        controllerAs: 'ctrl'
      })
      .state('category', {
        url: '/category',
        templateUrl: 'views/category.html',
        controller: 'CartBlogCategoryCtrl',
        controllerAs: 'ctrl'
      })
      .state('create', {
        url: '/create',
        templateUrl: 'views/edit.html',
        controller: 'CartBlogCreateCtrl',
        controllerAs: 'ctrl'
      })
      .state('edit', {
        url: '/edit',
        templateUrl: 'views/edit.html',
        controller: 'CartBlogEditCtrl',
        controllerAs: 'ctrl'
      })
      .state('list', {
        url: '/list',
        templateUrl: 'views/list.html',
        controller: 'CartBlogListCtrl',
        controllerAs: 'ctrl'
      })
      .state('search', {
        url: '/search',
        templateUrl: 'views/search.html',
        controller: 'CartBlogSearchCtrl',
        controllerAs: 'ctrl'
      })
      .state('settings', {
        url: '/settings',
        templateUrl: 'views/settings.html',
        controller: 'CartBlogSettingCtrl',
        controllerAs: 'ctrl'
      })
      .state('tag', {
        url: '/tag',
        templateUrl: 'views/tag.html',
        controller: 'CartBlogTagCtrl',
        controllerAs: 'ctrl'
      });
  }

  static factory(...args) {
    return new CartRouters(...args);
  }
}

CartRouters.factory.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];

export default CartRouters;
