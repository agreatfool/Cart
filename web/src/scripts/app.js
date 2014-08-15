'use strict';

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//- LIB & ANNOUNCEMENT
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
// jQuery family
var $ = require('jquery');
global.$ = global.jQuery = $;
require('./../bower/letteringjs/jquery.lettering.js');
require('./../bower/textillate/jquery.textillate.js');

// angular family
require('angular');
require('angular-route');
require('angular-animate');
require('angular-route-segment');

// others
var moment = require('moment');
var pouchdb = require('pouchdb');
var md5 = require('blueimp-md5').md5;

// const
var CartConst = function() {};
CartConst.ANIMATE_END_EVENT = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
CartConst.NAV_TRIGGER_HINT_X = 150;
CartConst.NAV_TRIGGER_HINT_Y = 150;

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//- APP
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
var app = angular.module('Cart', [
    'ngRoute', 'ngAnimate',
    'route-segment', 'view-segment',
    'Cart.Controllers', 'Cart.Services'
]);

// STATUS:
// 1. blog not inited
// 2. user not login
// 3. user login

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//- ROUTE
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
app.config([
    '$routeProvider', '$locationProvider', '$routeSegmentProvider',
function($routeProvider, $locationProvider, $routeSegmentProvider) {
    $locationProvider.html5Mode(true);
    $routeSegmentProvider.options.autoLoadTemplates = true;
    $routeSegmentProvider.options.strictMode = true;
    $routeSegmentProvider.
        when('/',                    'blog.list').
        when('/new/:postId',         'blog.new').
        when('/update/:postId',      'blog.update').
        when('/:year/:month/:title', 'blog.view').
        when('/category',            'blog.category').
        when('/category/:category',  'blog.list').
        when('/tag',                 'blog.tag').
        when('/tag/:tag',            'blog.list').
        when('/year/:datetime',      'blog.list').
        when('/month/:datetime',     'blog.list').
        when('/day/:datetime',       'blog.list').
        when('/oauth2',              'oauth2').
        when('/login',               'login').
        when('/profile',             'profile').
        when('/master',              'master').
        when('/404',                 '404').
        when('/error',               'error').
        when('/502',                 'error').
        // BLOG
        segment('blog', {
            'templateUrl': 'views/blog/home.html',
            'controller': 'CartBlogCtrl'
        }).
        within().
            segment('list', {
                'templateUrl': 'views/blog/list.html',
                'controller': 'CartBlogListCtrl'
            }).
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
                'templateUrl': 'views/blog/label.html',
                'controller': 'CartBlogCategoryCtrl'
            }).
            segment('tag', {
                'templateUrl': 'views/blog/label.html',
                'controller': 'CartBlogTagCtrl'
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
        }).
        // MASTER
        segment('master', {
            'templateUrl': 'views/master/home.html',
            'controller': 'CartMasterCtrl'
        }).
        // 404
        segment('404', {
            'templateUrl': 'views/404/home.html'
        }).
        // ERROR
        segment('error', {
            'templateUrl': 'views/error/home.html'
        });
    $routeProvider.otherwise({ redirectTo: '/404' });
}]);

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//- CONTROLLER
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
var controllers = angular.module('Cart.Controllers', []);

controllers.controller('CartMainCtrl', [
    '$scope', '$location', '$routeSegment',
function($scope, $location, $routeSegment) {
    console.log('CartMainCtrl');
    $scope.segment = $routeSegment;
    $scope.pageGoTo = function(page) {
        $location.url('/' + page);
    };
    $scope.navToggle = function() {
        // body
        $('body').toggleClass('nav-expanded');
        // trigger
        var navTriggerIcon = $('.nav-trigger span');
        navTriggerIcon.on(CartConst.ANIMATE_END_EVENT, function() {
            navTriggerIcon.removeClass('animated flip');
        });
        navTriggerIcon.addClass('animated flip');
    };
    $scope.loginToggle = function() {

    };
}]);

controllers.controller('CartBlogCtrl', ['$scope', function ($scope) {
    console.log('CartBlogCtrl');
}]);

controllers.controller('CartBlogListCtrl', ['$scope', function ($scope) {
    console.log('CartBlogListCtrl');
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

controllers.controller('CartMasterCtrl', ['$scope', function ($scope) {
    console.log('CartMasterCtrl');
}]);

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//- SERVICE
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
var services = angular.module('Cart.Services', []);

services.factory('CartRoleService', ['$http', '$q', function($http, $q) {
    return {
    };
}]);

services.factory('CartService', ['$http', '$q', function($http, $q) {
    return {
    };
}]);

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//- BOOTSTRAP
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
var $html = angular.element(document.getElementsByTagName('html')[0]);
angular.element().ready(function() {
    // boot angular
    angular.bootstrap($html, ['Cart']);
    // nav hover display effect
    $('.page-content').mousemove(function(e) {
        var elementOffset = $(this).offset();
        var posX = e.pageX - elementOffset.left;
        var posY = e.pageY - elementOffset.top;
        if (posX <= CartConst.NAV_TRIGGER_HINT_X && posY <= CartConst.NAV_TRIGGER_HINT_Y) {
            $('.nav-trigger').addClass('nav-trigger-active');
        } else {
            $('.nav-trigger').removeClass('nav-trigger-active');
        }
    });
});