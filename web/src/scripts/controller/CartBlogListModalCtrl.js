'use strict';

/* global _, moment, CartUtility, CartConst */
module.exports = function($scope, $location, $modalInstance, $dataService) {
    CartUtility.log('CartBlogListModalCtrl');

    $scope.utility = CartUtility;
    $scope.encodeURIComponent = encodeURIComponent;
    $scope.rootUrl = CartUtility.getPureRootUrlFromLocation($location);

    var dataRows = [];

    // pagination
    $scope.dataOnPage = []; // data used to be displayed on page
    $scope.paginationTotalItems = 0;
    $scope.paginationCurrentPage = 1;
    $scope.itemsPerPage = CartConst.PAGINATION_ITEMS_PER_PAGE;
    $scope.paginationMaxSize = 5;
    $scope.loadPageData = function() {
        var startPos = ($scope.paginationCurrentPage - 1) * $scope.itemsPerPage;
        var endPos = startPos + $scope.itemsPerPage;
        $scope.dataOnPage = dataRows.slice(startPos, endPos);
    };

    $scope.uploadTmpPost = function(uuid) {
        $modalInstance.close();
        $dataService.postGetTmp(uuid).then(function(tmpPostData) {
            $dataService.postUpload(tmpPostData).then(function() {
                CartUtility.notify('Done!', 'Post ' + tmpPostData.uuid + ' uploaded!');
            });
        }, function(err) {
            if (err.status === 404) {
                // 404 not found error would not be notified in $dataService class
                CartUtility.notify('Error!', 'Target tmp post data not found, uuid: ' + uuid, 'error');
            }
        });
    };

    $scope.deleteTmpPost = function(uuid) {
        if (!window.confirm('Do you confirm the delete operation of the tmp data of post: ' + uuid + '?')) {
            return;
        }
        $modalInstance.close();
        $dataService.postRemoveTmp(uuid).then(function() {
            CartUtility.notify('Done!', 'Tmp post data deleted!', 'success');
        }, function() {
            CartUtility.notify('Error!', 'Error in deleting tmp post data!', 'error');
        });
    };

    $scope.deleteAllTmpPost = function() {
        if (!window.confirm('Do you confirm the delete operation of the tmp data of all posts?')) {
            return;
        }
        $modalInstance.close();
        $dataService.postRemoveAllTmp().then(function() {
            CartUtility.notify('Done!', 'All tmp post data deleted!', 'success');
        }, function() {
            CartUtility.notify('Error!', 'Error in deleting all tmp post data!', 'error');
        });
    };

    $dataService.postGetAllTmp().then(function(result) { // FIXME 需要检查本地的categories和tags中有没有暂存post所从属的信息，没有的话从服务器上查询
        if (!_.isArray(result) || result.length === 0) {
            return; // no local tmp post data saved, list is empty
        }

        var postUuids = [];
        var categoryUuids = [];

        _.forEach(result, function(post) {
            postUuids.push(post.uuid);
            categoryUuids.push(post.category);
        });

        $dataService.postPublishedCheck(postUuids).then(function(published) {
            _.forEach(result, function(post) {
                post.published = published.hasOwnProperty(post.uuid) ? published[post.uuid] : false;
            });
        });

        dataRows = _.sortBy(result, function(post) { return post.updated; }).reverse(); // orderBy "updated" DESC
        $scope.paginationTotalItems = result.length;
        $scope.paginationCurrentPage = 1;
        $scope.loadPageData();
    });

    $scope.close = function() {
        $modalInstance.close();
    };
};