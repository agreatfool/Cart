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
        var alreadyLogin = false;
        if (alreadyLogin) { // already login
            // logout
        } else {
            // redirect to login page
            $location.url('/login');
        }
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

controllers.controller('CartSearchCtrl', ['$scope', function ($scope) {
    console.log('CartSearchCtrl');
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    $scope.changeTo = 'Hungarian';
    /* event source that contains custom events on the scope */
    $scope.events = [
        {title: 'All Day Event',start: new Date(y, m, 1)},
        {title: 'Long Event',start: new Date(y, m, d - 5),end: new Date(y, m, d - 2)},
        {id: 999,title: 'Repeating Event',start: new Date(y, m, d - 3, 16, 0),allDay: false},
        {id: 999,title: 'Repeating Event',start: new Date(y, m, d + 4, 16, 0),allDay: false},
        {title: 'Birthday Party',start: new Date(y, m, d + 1, 19, 0),end: new Date(y, m, d + 1, 22, 30),allDay: false},
        {title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29),url: 'http://google.com/'}
    ];
    /* event source that calls a function on every view switch */
    $scope.eventsF = function (start, end, callback) {
        var s = new Date(start).getTime() / 1000;
        var e = new Date(end).getTime() / 1000;
        var m = new Date(start).getMonth();
        var events = [{title: 'Feed Me ' + m,start: s + (50000),end: s + (100000),allDay: false, className: ['customFeed']}];
        callback(events);
    };

    $scope.calEventsExt = {
        color: '#f00',
        textColor: 'yellow',
        events: [
            {type:'party',title: 'Lunch',start: new Date(y, m, d, 12, 0),end: new Date(y, m, d, 14, 0),allDay: false},
            {type:'party',title: 'Lunch 2',start: new Date(y, m, d, 12, 0),end: new Date(y, m, d, 14, 0),allDay: false},
            {type:'party',title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29),url: 'http://google.com/'}
        ]
    };
    /* alert on eventClick */
    $scope.alertOnEventClick = function( event, allDay, jsEvent, view ){
        $scope.alertMessage = (event.title + ' was clicked ');
    };
    /* alert on Drop */
    $scope.alertOnDrop = function(event, dayDelta, minuteDelta, allDay, revertFunc, jsEvent, ui, view){
        $scope.alertMessage = ('Event Droped to make dayDelta ' + dayDelta);
    };
    /* alert on Resize */
    $scope.alertOnResize = function(event, dayDelta, minuteDelta, revertFunc, jsEvent, ui, view ){
        $scope.alertMessage = ('Event Resized to make dayDelta ' + minuteDelta);
    };
    /* add and removes an event source of choice */
    $scope.addRemoveEventSource = function(sources,source) {
        var canAdd = 0;
        angular.forEach(sources,function(value, key){
            if(sources[key] === source){
                sources.splice(key,1);
                canAdd = 1;
            }
        });
        if(canAdd === 0){
            sources.push(source);
        }
    };
    /* add custom event*/
    $scope.addEvent = function() {
        $scope.events.push({
            title: 'Open Sesame',
            start: new Date(y, m, 28),
            end: new Date(y, m, 29),
            className: ['openSesame']
        });
    };
    /* remove event */
    $scope.remove = function(index) {
        $scope.events.splice(index,1);
    };
    /* Change View */
    $scope.changeView = function(view,calendar) {
        calendar.fullCalendar('changeView',view);
    };
    /* Change View */
    $scope.renderCalender = function(calendar) {
        calendar.fullCalendar('render');
    };
    /* config object */
    $scope.uiConfig = {
        calendar:{
            height: 450,
            editable: true,
            header:{
                left: 'title',
                center: '',
                right: 'today prev,next'
            },
            eventClick: $scope.alertOnEventClick,
            eventDrop: $scope.alertOnDrop,
            eventResize: $scope.alertOnResize
        }
    };

    $scope.changeLang = function() {
        if($scope.changeTo === 'Hungarian'){
            $scope.uiConfig.calendar.dayNames = ["Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"];
            $scope.uiConfig.calendar.dayNamesShort = ["Vas", "Hét", "Kedd", "Sze", "Csüt", "Pén", "Szo"];
            $scope.changeTo= 'English';
        } else {
            $scope.uiConfig.calendar.dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            $scope.uiConfig.calendar.dayNamesShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            $scope.changeTo = 'Hungarian';
        }
    };
    /* event sources array*/
    $scope.eventSources = [$scope.events, $scope.eventsF];
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