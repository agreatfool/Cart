'use strict';

/* global _, moment, CartUtility */
module.exports = function($scope, $location, $modalInstance, $dataService) {
    CartUtility.log('CartBlogListModalCtrl');

    $scope.moment = moment;

    $scope.dataRows = [];
    $scope.rootUrl = CartUtility.getPureRootUrlFromLocation($location);
    $scope.encodeURIComponent = encodeURIComponent;

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

    $scope.uploadTmpPost = function(uuid) {
        $modalInstance.close();
        $dataService.postGetTmp(uuid).then(function(tmpPostData) {
            $dataService.postUpload(tmpPostData);
        }, function(err) {
            if (err.status === 404) {
                // 404 not found error would not be notified in $dataService class
                CartUtility.notify('Error!', 'Target tmp post data not found, uuid: ' + uuid, 'error');
            }
        });
    };

    $scope.deleteTmpPost = function(uuid) {
        $modalInstance.close();
        $dataService.postRemoveTmp(uuid).then(function() {
            CartUtility.notify('Done!', 'Tmp post data deleted!', 'success');
        }, function() {
            CartUtility.notify('Error!', 'Error in deleting tmp post data!', 'error');
        });
    };

    $scope.deleteAllTmpPost = function() {
        $modalInstance.close();
        $dataService.postRemoveAllTmp().then(function() {
            CartUtility.notify('Done!', 'All tmp post data deleted!', 'success');
        }, function() {
            CartUtility.notify('Error!', 'Error in deleting all tmp post data!', 'error');
        });
    };

    $dataService.postGetAllTmp().then(function(result) {
        _.forEach(result, function(post) {
            post.published = _.isNull($dataService.postSearchById(post._id)) ? false : true;
        });
        $scope.dataRows = _.sortBy(result, function(post) { return post.updated; }).reverse();
        $scope.paginationTotalItems = result.length;
        $scope.paginationCurrentPage = 1;
        $scope.loadPageData();
    });

    $scope.close = function() {
        $modalInstance.close();
    };
};