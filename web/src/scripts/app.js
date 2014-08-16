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
var routerSrouce = require('./router/router.js');
var ctrlSources = require('./controller/controllers.js');
var serviceSources = require('./service/services.js');

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
app.config(['$routeProvider', '$locationProvider', '$routeSegmentProvider', routerSrouce]);

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

services.factory('CartAccessCtrlService', ['$http', '$q', serviceSources.CartAccessCtrlService]);

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