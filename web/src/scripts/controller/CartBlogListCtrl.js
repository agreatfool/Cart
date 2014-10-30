'use strict';

/* global uuid, CartUtility */
module.exports = function ($scope, $location, $window, $modal, $accessService) {
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
};