'use strict';

/* global _, CartUtility */
module.exports = function($scope, $location, $modalInstance, $dataService) {
    CartUtility.log('CartBlogListModalCtrl');

    $scope.dataRows = [];
    $scope.rootUrl = CartUtility.getPureRootUrlFromLocation($location);

    // pagination
    $scope.dataOnPage = []; // data used to be displayed on page
    $scope.paginationTotalItems = 0;
    $scope.paginationCurrentPage = 1;
    $scope.itemsPerPage = 10;
    $scope.paginationMaxSize = 5;
    $scope.loadPageData = function() {
        var startPos = ($scope.paginationCurrentPage - 1) * $scope.itemsPerPage;
        var endPos = startPos + $scope.itemsPerPage;
        $scope.dataOnPage = $scope.dataRows.slice(startPos, endPos);
    };

    //FIXME category link on template is invalid
    $dataService.postGetAllTmp().then(function(result) {
        $scope.dataRows = _.sortBy(result, function(post) { return post.created; }).reverse();
        $scope.paginationTotalItems = result.length;
        $scope.paginationCurrentPage = 1;
        $scope.loadPageData();
    }, function(err) {
        CartUtility.notify('Error', err.toString(), 'error');
    });

    $scope.close = function() {
        $modalInstance.close();
    };
};