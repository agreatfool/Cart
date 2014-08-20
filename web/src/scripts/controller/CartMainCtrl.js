'use strict';

/* global $ */
var CartConst = require('../const/const.js');

module.exports = function($scope, $location, $routeSegment, footerService) {
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
    // route change event, when location changed
    $scope.$on('$routeChangeStart', function() {
        footerService.fixFooter();
        // footer fadeIn effect
        var footer = $('.page-footer');
        footer.bind(CartConst.ANIMATE_END_EVENT, function() {
            footer.removeClass('animated fadeIn');
        });
        footer.addClass('animated fadeIn');
    });
};