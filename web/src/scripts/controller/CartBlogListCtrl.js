'use strict';

/* global uuid, CartUtility */
module.exports = function ($scope, $location, $window) {
    CartUtility.log('CartBlogListCtrl');

    $scope.createNew = function() {
        // redirect to create post page
        $window.location.href = CartUtility.getPureRootUrlFromLocation($location) + 'new/' + uuid.v4();
    };
};