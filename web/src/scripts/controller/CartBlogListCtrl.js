'use strict';

/* global _, uuid, CartUtility */
module.exports = function ($scope, $location, $window, $routeParams, $modal, $dataService, $accessService) {
    CartUtility.log('CartBlogListCtrl');

    $scope.utility = CartUtility;
    $scope.encodeURIComponent = encodeURIComponent;

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

    $scope.fetchCategoryDisplayName = function(categoryUuid) {
        var name = '';
        var category = $dataService.categorySearchById(categoryUuid);
        if (!_.isNull(category)) {
            name = category.title;
        }
        return name;
    };

    $scope.fetchTagDisplayName = function(tagUuid) {
        var name = '';
        var tag = $dataService.tagSearchById(tagUuid);
        if (!_.isNull(tag)) {
            name = tag.title;
        }
        return name;
    };

    $scope.deletePost = function(uuid) {
        if (!window.confirm('Do you confirm the delete operation of the post: ' + uuid + '?\nThis action cannot be undo!')) {
            return;
        }
        var post = $dataService.postSearchById(uuid);
        if (_.isNull(post)) {
            CartUtility.notify('Error!', 'Target post to be deleted not found, uuid: ' + uuid, 'error');
            return;
        }
        $dataService.postRemove(uuid).then(function() {
            _.forEach(postRows, function(row, index) {
                if (row.uuid === uuid) {
                    postRows.splice(index, 1);
                }
            });
            $scope.loadPageData();
            CartUtility.notify('Done!', 'Post ' + uuid + ' deleted!');
        });
    };

    var postRows = [];

    // pagination
    $scope.postOnPage = []; // data used to be displayed on page
    $scope.paginationTotalItems = 0;
    $scope.paginationCurrentPage = 1;
    $scope.itemsPerPage = 10;
    $scope.paginationMaxSize = 5;

    $scope.loadPageData = function() {
        var startPos = ($scope.paginationCurrentPage - 1) * $scope.itemsPerPage;
        var endPos = startPos + $scope.itemsPerPage;
        $scope.postOnPage = postRows.slice(startPos, endPos);
    };

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
        postRows = $dataService.postSearch(options);
        postRows = _.sortBy(postRows, function(post) { return post.created; }).reverse(); // orderBy "created" DESC
        $scope.paginationTotalItems = postRows.length;
        $scope.paginationCurrentPage = 1;
        $scope.loadPageData();
    };
    displayPageItems();
};