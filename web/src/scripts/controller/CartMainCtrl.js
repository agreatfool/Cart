'use strict';

/* global $, _, CartConst, CartUtility */
module.exports = function($scope, $location, $cookies, $window, $routeSegment, $footerService, $dataService, $accessService) {
    CartUtility.log('CartMainCtrl');

    $scope.segment = $routeSegment;
    $scope.location = $location;
    $scope.rootPath = CartUtility.getRootPathFromtLocation($location); // for nav highlight
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
            var actionAfterLogout = function() {
                // delete cookie
                delete $cookies[CartConst.TOKEN_NAME];
                // remove all tmp saved post data & html
                $dataService.postRemoveAllTmp()
                .then(function() {
                    return $dataService.postRemoveAllHtml();
                })
                .then(function() {
                    // redirect page
                    $window.location.href = CartUtility.getPureRootUrlFromLocation($location);
                });
            };
            $accessService.logout().then(actionAfterLogout, actionAfterLogout);
        } else {
            // redirect to login page
            $location.url('/login');
        }
    };

    // route change event, when location changed
    $scope.$on('$routeChangeStart', function(event, next, current) {
        CartUtility.log('CartMainCtrl $routeChangeStart entered!');
        // reset the rootPath in url
        $scope.rootPath = CartUtility.getRootPathFromtLocation($location);
        // validate accessible
        var validateUrl = $scope.rootPath;
        if (!_.isUndefined(next) && next.hasOwnProperty('originalPath')) {
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

};