'use strict';

/* global _, $, PNotify, angular, moment, pouchdb, md5, uuid, marked, CartConst, CartUtility */
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//- LIB & ANNOUNCEMENT
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
// underscore
global._ = require('underscore');

// jQuery family
global.$ = global.jQuery = require('jquery');
require('./../bower/jquery-ui/ui/jquery-ui.js');
require('./../bower/letteringjs/jquery.lettering.js');
require('./../bower/textillate/jquery.textillate.js');
require('./../bower/bootstrap/dist/js/bootstrap.js');
require('./../bower/fullcalendar/fullcalendar.js');
require('./../bower/pnotify/pnotify.core.js'); // PNotify core
require('./../bower/pnotify/pnotify.buttons.js'); // PNotify buttons

// angular family
require('angular');
require('angular-route');
require('angular-animate');
require('angular-route-segment');
require('angular-cookies');
require('angular-ui-calendar');
require('ng-file-upload');
require('./../bower/ng-file-upload/angular-file-upload-shim.js'); // also include it's shim

// others
global.moment = require('moment');
global.pouchdb = require('pouchdb');
global.md5 = require('blueimp-md5').md5;
global.uuid = require('./../bower/node-uuid/uuid.js');
global.marked = require('./../bower/marked/index.js');

// app sources
global.CartConst = require('./const/const.js');
var routerSource = require('./router/router.js');
var ctrlSources = require('./controller/controllers.js');
var serviceSources = require('./service/services.js');

// app utility
global.CartUtility = require('./utility.js');

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//- APP
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
var app = angular.module('Cart', [
    'ngRoute', 'ngAnimate', 'ngCookies',
    'route-segment', 'view-segment',
    'ui.calendar',
    'Cart.Controllers', 'Cart.Services'
]);

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//- ROUTE
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
app.config(['$routeProvider', '$locationProvider', '$routeSegmentProvider', routerSource]);

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//- CONTROLLER
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
var controllers = angular.module('Cart.Controllers', []);

controllers.controller('CartMainCtrl', ['$scope', '$location', '$cookies', '$window', '$routeSegment', 'CartFixFooterService', 'CartDataService', 'CartAccessCtrlService', ctrlSources.CartMainCtrl]);
controllers.controller('CartBlogListCtrl', ['$scope', ctrlSources.CartBlogListCtrl]);
controllers.controller('CartBlogNewCtrl', ['$scope', ctrlSources.CartBlogNewCtrl]);
controllers.controller('CartBlogUpdateCtrl', ['$scope', ctrlSources.CartBlogUpdateCtrl]);
controllers.controller('CartBlogViewCtrl', ['$scope', ctrlSources.CartBlogViewCtrl]);
controllers.controller('CartBlogCategoryCtrl', ['$scope', ctrlSources.CartBlogCategoryCtrl]);
controllers.controller('CartBlogTagCtrl', ['$scope', ctrlSources.CartBlogTagCtrl]);
controllers.controller('CartSearchCtrl', ['$scope', '$compile', ctrlSources.CartSearchCtrl]);
controllers.controller('CartOauthCtrl', ['$scope', '$location', 'CartAccessCtrlService', ctrlSources.CartOauthCtrl]);
controllers.controller('CartLoginCtrl', ['$scope', ctrlSources.CartLoginCtrl]);
controllers.controller('CartProfileCtrl', ['$scope', ctrlSources.CartProfileCtrl]);
controllers.controller('CartMasterCtrl', ['$scope', ctrlSources.CartMasterCtrl]);

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//- SERVICE
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
var services = angular.module('Cart.Services', []);

services.factory('CartAccessCtrlService', ['$http', '$q', '$cookies', serviceSources.CartAccessCtrlService]);
services.factory('CartDataService', ['$http', '$q', serviceSources.CartDataService]);
services.factory('CartFixFooterService', [function() {
    return { 'fixFooter': fixFooter };
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

    // window resize event
    $(window).resize(fixFooter);

    // scroll to top
    var toTopBtn = $('.page-to-top');
    $(window).scroll(function() {
        if ($(this).scrollTop() > 300) {
            toTopBtn.fadeIn(500);
        } else {
            toTopBtn.fadeOut(500);
        }
    });
    toTopBtn.click(function(event) {
        event.preventDefault();
        $('html, body').animate({ scrollTop: 0 }, 500);
        return false;
    });
});

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//- OTHERS
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
var fixFooter = function() {
    var pageContentTop = $('.page-content-top'); // page top element: page content excepts footer
    var pageTopCurHeight = pageContentTop.height(); // current page top height
    var pageTopMinHeight = $(document).height() - CartConst.PAGE_FOOTER_HEIGHT; // min page top height
    if (pageTopCurHeight < pageTopMinHeight) {
        // only fix the footer position when page is too 'short'
        pageContentTop.css('min-height', pageTopMinHeight);
    }
};