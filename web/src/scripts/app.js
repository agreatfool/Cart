'use strict';

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//- LIB & ANNOUNCEMENT
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
// underscore
var _ = require('underscore');
global._ = _;

// jQuery family
var $ = require('jquery');
global.$ = global.jQuery = $;
require('./../bower/jquery-ui/ui/jquery-ui.js');
require('./../bower/letteringjs/jquery.lettering.js');
require('./../bower/textillate/jquery.textillate.js');
require('./../bower/bootstrap/dist/js/bootstrap.js');
require('./../bower/fullcalendar/fullcalendar.js');
require('./../bower/fullcalendar/gcal.js');

// angular family
require('angular');
require('angular-route');
require('angular-animate');
require('angular-route-segment');
require('angular-ui-calendar');

// others
var moment = require('moment');
var pouchdb = require('pouchdb');
var md5 = require('blueimp-md5').md5;

// app sources
var CartConst = require('./const/const.js');
var ctrlSources = require('./controller/controllers.js');

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//- APP
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
var app = angular.module('Cart', [
    'ngRoute', 'ngAnimate',
    'route-segment', 'view-segment',
    'ui.calendar',
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
        when('/search',              'search').
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
        // SEARCH
        segment('search', {
            'templateUrl': 'views/search/home.html',
            'controller': 'CartSearchCtrl'
        }).
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

controllers.controller('CartMainCtrl', ['$scope', '$location', '$routeSegment', ctrlSources.CartMainCtrl]);
controllers.controller('CartBlogCtrl', ['$scope', ctrlSources.CartBlogCtrl]);
controllers.controller('CartBlogListCtrl', ['$scope', ctrlSources.CartBlogListCtrl]);
controllers.controller('CartBlogNewCtrl', ['$scope', ctrlSources.CartBlogNewCtrl]);
controllers.controller('CartBlogUpdateCtrl', ['$scope', ctrlSources.CartBlogUpdateCtrl]);
controllers.controller('CartBlogViewCtrl', ['$scope', ctrlSources.CartBlogViewCtrl]);
controllers.controller('CartBlogCategoryCtrl', ['$scope', ctrlSources.CartBlogCategoryCtrl]);
controllers.controller('CartBlogTagCtrl', ['$scope', ctrlSources.CartBlogTagCtrl]);
controllers.controller('CartSearchCtrl', ['$scope', ctrlSources.CartSearchCtrl]);
controllers.controller('CartOauthCtrl', ['$scope', ctrlSources.CartOauthCtrl]);
controllers.controller('CartLoginCtrl', ['$scope', ctrlSources.CartLoginCtrl]);
controllers.controller('CartProfileCtrl', ['$scope', ctrlSources.CartProfileCtrl]);
controllers.controller('CartMasterCtrl', ['$scope', ctrlSources.CartMasterCtrl]);

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