'use strict';

/* global $, CartConst */
module.exports = function($scope, $location, $routeSegment, footerService, dataService) {
    console.log('CartMainCtrl');

    $scope.segment = $routeSegment;
    $scope.location = $location;
    $scope.rootPath = $location.path().split('/')[1]; // for nav highlight
    $scope.indexPaths = ['', 'new', 'update', 'year', 'month', 'day'];

    $scope.pageGoTo = function(page) {
        $location.url('/' + page);
    };

    $scope.navToggle = function() {
        // body
        $('body').toggleClass('nav-expanded');
        // trigger
        var navTriggerIcon = $('.nav-trigger span');
        navTriggerIcon.bind(CartConst.ANIMATE_END_EVENT, function() {
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
        // reset the rootPath in url
        $scope.rootPath = $location.path().split('/')[1];
        // detect footer pos
        footerService.fixFooter();
        // footer fadeIn effect
        var footer = $('.page-footer');
        footer.bind(CartConst.ANIMATE_END_EVENT, function() {
            footer.removeClass('animated fadeIn');
        });
        footer.addClass('animated fadeIn');
    });
};