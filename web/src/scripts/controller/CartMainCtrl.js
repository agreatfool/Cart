'use strict';

/* global $, CartConst, CartUtility */
module.exports = function($scope, $location, $cookies, $window, $routeSegment, $footerService, $dataService, $accessService) {
    CartUtility.log('CartMainCtrl');

    $scope.segment = $routeSegment;
    $scope.location = $location;
    $scope.rootPath = $location.path().split('/')[1]; // for nav highlight
    $scope.indexPaths = ['', 'new', 'update', 'year', 'month', 'day']; // for index nav high light
    $scope.isMaster = $accessService.isMaster();

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
        if ($scope.isMaster) { // already login
            // logout
            $accessService.logout().then(function() {
                delete $cookies[CartConst.TOKEN_NAME];
                $window.location.href = CartUtility.getPureRootUrlFromLocation($location);
            });
        } else {
            // redirect to login page
            $location.url('/login');
        }
    };

    // route change event, when location changed
    $scope.$on('$routeChangeStart', function(event, next, current) {
        CartUtility.log('CartMainCtrl $routeChangeStart entered!');
        // reset the rootPath in url
        $scope.rootPath = $location.path().split('/')[1]; // $scope.rootPath: "http://host/post/postId" => "post"
        // validate accessible
        var validateUrl = $scope.rootPath;
        if (typeof next !== 'undefined' && next.hasOwnProperty('originalPath')) {
            validateUrl = next.originalPath;
        }
        if (!$accessService.isUrlAccessibleForUser(validateUrl)) {
            $location.url('/error');
        }
        // detect footer pos
        $footerService.fixFooter();
        // footer fadeIn effect
        var footer = $('.page-footer');
        footer.bind(CartConst.ANIMATE_END_EVENT, function() {
            footer.removeClass('animated fadeIn');
        });
        footer.addClass('animated fadeIn');
    });

    // get init index data
    $dataService.getInitData().then(function() {
        // succeeded, do nothing
    }, function() {
        // rejected, shall be some error
        $location.url('/error');
    });
};