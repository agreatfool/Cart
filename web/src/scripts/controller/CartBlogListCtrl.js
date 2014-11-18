'use strict';

/* global uuid, CartUtility */
module.exports = function ($scope, $location, $window, $routeParams, $modal, $dataService, $accessService) {
    CartUtility.log('CartBlogListCtrl');

    $scope.isMaster = $accessService.isMaster();

    $scope.createNewPost = function() {
        if (!$scope.isMaster) {
            return;
        }
        // redirect to create post page
        $window.location.href = CartUtility.getPureRootUrlFromLocation($location) + 'edit/' + uuid.v4();
    };

    $scope.openTmpPostList = function() {
        if (!$scope.isMaster) {
            return;
        }
        $modal.open({
            templateUrl: 'CartBlogListModal.html',
            controller: 'CartBlogListModalCtrl',
            size: 'lg'
        });
    };

    $scope.postsOnPage = [];

    var displayPageItems = function() {
        var options = {};
        if ($routeParams.hasOwnProperty('category')) {
            options.category = $routeParams.category;
        }
        if ($routeParams.hasOwnProperty('tag')) {
            options.tags = [$routeParams.tag];
        }
        if ($location.url().indexOf('year') !== -1) {
            options.year = $routeParams.datetime;
        }
        if ($location.url().indexOf('month') !== -1) {
            options.month = $routeParams.datetime;
        }
        if ($location.url().indexOf('day') !== -1) {
            options.day = $routeParams.datetime;
        }
        $scope.postsOnPage = $dataService.postSearch(options);
    };
    displayPageItems();
};