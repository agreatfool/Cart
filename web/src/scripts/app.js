'use strict';

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//- LIB & ANNOUNCEMENT
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
// jQuery family
var $ = require('jquery');
global.jQuery = $;
require('./../bower/letteringjs/jquery.lettering.js');
require('./../bower/textillate/jquery.textillate.js');
require('./../bower/Blur.js/blur.js');

// angular family
require('angular');
require('angular-route');
require('angular-animate');
require('angular-route-segment');

// others
var moment = require('moment');
var pouchdb = require('pouchdb');

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//- APP
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
var app = angular.module('Cart', [
    'ngAnimate', 'ngRoute',
    'route-segment', 'view-segment',
    'Cart.Controllers', 'Cart.Services'
]);

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//- ROUTE
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
app.config([
    '$routeProvider', '$routeSegmentProvider',
function($routeProvider, $routeSegmentProvider) {
    $routeSegmentProvider.options.autoLoadTemplates = true;
    $routeSegmentProvider.options.strictMode = true;
    $routeSegmentProvider.
        when('/',                    'blog').
        when('/new/:postId',         'blog.new').
        when('/update/:postId',      'blog.update').
        when('/:year/:month/:title', 'blog.view').
        when('/category/:category',  'blog.category').
        when('/tag/:tag',            'blog.tag').
        when('/oauth2',              'oauth2').
        when('/login',               'login').
        when('/profile',             'profile').
        // BLOG
        segment('blog', {
            'templateUrl': 'views/blog/home.html',
            'controller': 'CartBlogCtrl'
        }).
        within().
            segment('new', {
                'templateUrl': 'views/blog/edit.html',
                'controller': 'CartBlogNewCtrl',
                'dependencies': ['postId']
            }).
            segment('update', {
                'templateUrl': 'views/blog/edit.html',
                'controller': 'CartBlogUpdateCtrl',
                'dependencies': ['postId']
            }).
            segment('view', {
                'templateUrl': 'views/blog/view.html',
                'controller': 'CartBlogViewCtrl',
                'dependencies': ['year', 'month', 'title']
            }).
            segment('category', {
                'templateUrl': 'views/blog/list.html',
                'controller': 'CartBlogCategoryCtrl',
                'dependencies': ['category']
            }).
            segment('tag', {
                'templateUrl': 'views/blog/list.html',
                'controller': 'CartBlogTagCtrl',
                'dependencies': ['tag']
            }).
        up().
        // OAUTH2
        segment('oauth2', {
            'templateUrl': 'views/oauth2/home.html',
            'controller': 'CartOauthCtrl'
        }).
        // LOGIN
        segment('login', {
            'templateUrl': 'views/login/home.html',
            'controller': 'CartLoginCtrl'
        }).
        // PROFILE
        segment('profile', {
            'templateUrl': 'views/profile/home.html',
            'controller': 'CartProfileCtrl'
        });
    $routeProvider.otherwise({redirectTo: '/'});
}]);

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//- CONTROLLER
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
var controllers = angular.module('Cart.Controllers', []);

controllers.controller('CartBlogCtrl', ['$scope', function ($scope) {
    console.log('CartBlogCtrl');
}]);

controllers.controller('CartBlogNewCtrl', ['$scope', function ($scope) {
    console.log('CartBlogNewCtrl');
}]);

controllers.controller('CartBlogUpdateCtrl', ['$scope', function ($scope) {
    console.log('CartBlogUpdateCtrl');
}]);

controllers.controller('CartBlogViewCtrl', ['$scope', function ($scope) {
    console.log('CartBlogViewCtrl');
}]);

controllers.controller('CartBlogCategoryCtrl', ['$scope', function ($scope) {
    console.log('CartBlogCategoryCtrl');
}]);

controllers.controller('CartBlogTagCtrl', ['$scope', function ($scope) {
    console.log('CartBlogTagCtrl');
}]);

controllers.controller('CartOauthCtrl', ['$scope', function ($scope) {
    console.log('CartOauthCtrl');
}]);

controllers.controller('CartLoginCtrl', ['$scope', function ($scope) {
    console.log('CartLoginCtrl');
}]);

controllers.controller('CartProfileCtrl', ['$scope', function ($scope) {
    console.log('CartProfileCtrl');
}]);

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//- SERVICE
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
var services = angular.module('Cart.Services', []);

services.factory('CartService', ['$http', '$q', function($http, $q) {
    return {
    };
}]);

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//- BOOTSTRAP
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
var $html = angular.element(document.getElementsByTagName('html')[0]);
angular.element().ready(function() {
    angular.bootstrap($html, ['Cart']);
});