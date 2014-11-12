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

    $scope.deleteTmpPost = function(uuid) {
        $dataService.postRemoveTmp(uuid).then(function(result) {
            if (result === true) {
                CartUtility.notify('Done!', 'Tmp post data deleted!', 'success');
            } else {
                CartUtility.notify('Error!', 'Error in deleting tmp post data!', 'error');
            }
        });
    };

    $scope.deleteAllTmpPost = function() {
        $dataService.postRemoveAllTmp().then(function(result) {
            if (result === true) {
                CartUtility.notify('Done!', 'All tmp post data deleted!', 'success');
            } else {
                CartUtility.notify('Error!', 'Error in deleting all tmp post data!', 'error');
            }
        });
    };

    //FIXME category link on template is invalid
    $dataService.postGetAllTmp().then(function(result) {
        // FIXME loop all tmp posts, check if it exists in local posts database, if true means published, otherwise draft
        _.forEach(result, function(post) {
            post.published = true;
        });
        $scope.dataRows = _.sortBy(result, function(post) { return post.updated; }).reverse();
        $scope.paginationTotalItems = result.length;
        $scope.paginationCurrentPage = 1;
        $scope.loadPageData();
    }, function(err) {
        CartUtility.notify('Error!', err.toString(), 'error');
    });

    $scope.close = function() {
        $modalInstance.close();
    };
};