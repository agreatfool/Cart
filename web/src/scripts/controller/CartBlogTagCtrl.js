'use strict';

/* global _, CartUtility */
module.exports = function ($scope, $location, $window, $accessService, $dataService) {
    CartUtility.log('CartBlogTagCtrl');

    $scope.pageType = 'Tag';

    $scope.createContent = '';
    $scope.searchContent = '';
    $scope.items = [];

    $dataService.tagGetAll().then(function(data) {
        if (_.isObject(data)) {
            $scope.items = _.values(data);
        }
    });


};