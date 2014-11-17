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

    console.log($routeParams);

    $scope.postsOnPage = [];
    var posts = $dataService.postGetAll();

    var displayPageItems = function() {
        if ($routeParams.hasOwnProperty('category')) {
            // list all category posts
            var category = $dataService.categorySearch($routeParams['category']);
            if (category.length === 0) {
                return; // target category not found
            } else {
                category = category.pop(); // shall contains only one category
            }
            var categoryId = category.uuid;
            var found = _.filter(posts, function(post) {
                return post.category === categoryId;
            });
            if (_.isUndefined(found)) {
                found = [];
            }
            $scope.postsOnPage = found;
        }
    };
    displayPageItems();
};