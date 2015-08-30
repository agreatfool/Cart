'use strict';

/* global $, CartUtility */
module.exports = function($scope, $modalInstance) {
    CartUtility.log('CartBlogLabelModalCtrl');

    $scope.newName = '';

    $scope.enterData = function(event) {
        event.preventDefault();
        $modalInstance.close($scope.newName);
    };

};