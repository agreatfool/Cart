'use strict';

/* global _, uuid, CartConst, CartUtility */
module.exports = function ($scope, $location, $window, $routeParams, $modal, $dataService, $accessService) {
    CartUtility.log('CartBlogListCtrl');

    $scope.subTitle1 = '';
    $scope.subTitle2 = '';

    $scope.utility = CartUtility;
    $scope.encodeURIComponent = encodeURIComponent;

    $scope.isMaster = $accessService.isMaster();

    $scope.rootUrl = CartUtility.getPureRootUrlFromLocation($location);

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
        var modal = $modal.open({
            templateUrl: 'CartBlogListModal.html',
            controller: 'CartBlogListModalCtrl',
            size: 'lg'
        });
        modal.result.then(function(action) {
            if (_.isString(action) && action === 'upload') { // upload action done, reload post list
                $scope.loadPageData();
            }
        });
    };

    $scope.fetchCategoryDisplayName = function(categoryUuid) {
        var name = '';
        var category = $dataService.categorySearchLocalById(categoryUuid);
        if (!_.isNull(category)) {
            name = category.title;
        }
        return name;
    };

    $scope.fetchTagDisplayName = function(tagUuid) {
        var name = '';
        var tag = $dataService.tagSearchLocalById(tagUuid);
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
            _.forEach($scope.postOnPage, function(row, index) {
                if (row.uuid === uuid) {
                    $scope.postOnPage.splice(index, 1);
                }
            });
            $scope.loadPageData();
            CartUtility.notify('Done!', 'Post ' + uuid + ' deleted!');
        });
    };

    // pagination
    $scope.postOnPage = []; // data used to be displayed on page
    $scope.paginationTotalItems = 0;
    $scope.paginationCurrentPage = 1;
    $scope.itemsPerPage = CartConst.PAGINATION_ITEMS_PER_PAGE;
    $scope.paginationMaxSize = 5;

    $scope.loadPageData = function() {
        var options = {};
        if ($routeParams.hasOwnProperty('category')) {
            options.category = $routeParams.category;
            $scope.subTitle1 = 'Category';
            $scope.subTitle2 = $routeParams.category;
        }
        if ($routeParams.hasOwnProperty('tag')) { // single tag page
            options.tags = [$routeParams.tag];
            $scope.subTitle1 = 'Tag';
            $scope.subTitle2 = $routeParams.tag;
        } else if ($routeParams.hasOwnProperty('tags')) { // multi tags search
            options.tags = JSON.parse($routeParams.tags);
            $scope.subTitle1 = 'Tag';
            $scope.subTitle2 = $routeParams.tags;
        }
        if ($location.url().indexOf('year') !== -1) {
            options.year = $routeParams.hasOwnProperty('datetime') ? $routeParams.datetime : $routeParams.year; // 2014
            $scope.subTitle1 = 'Year';
            $scope.subTitle2 = options.year;
        }
        if ($location.url().indexOf('month') !== -1) {
            options.month = $routeParams.hasOwnProperty('datetime') ? $routeParams.datetime : $routeParams.month; // 2014-11
            $scope.subTitle1 = 'Month';
            $scope.subTitle2 = options.month;
        }
        if ($location.url().indexOf('day') !== -1) {
            options.day = $routeParams.hasOwnProperty('datetime') ? $routeParams.datetime : $routeParams.day; // 2014-11-21
            $scope.subTitle1 = 'Day';
            $scope.subTitle2 = options.day;
        }
        if ($location.url().indexOf('isUuidSearch') !== -1) {
            options.isUuidSearch = $routeParams.isUuidSearch;
        } else {
            options.isUuidSearch = false;
        }
        options.pageNumber = $scope.paginationCurrentPage;
        $dataService.postSearch(options).then(function(data) {
            // FIXME 如果查找posts结果为空，需要在页面上展示一个友好的空白页效果
            var posts = data.posts;
            if (_.isObject(posts) && _.keys(posts).length > 0) {
                $scope.postOnPage = _.values(posts);
            }
            if (_.isNumber(data.total)) {
                $scope.paginationTotalItems = data.total;
            }
        });
    };

    $scope.loadPageData();

    // route change event, when location changed
    $scope.$on('$routeChangeSuccess', function() {
        CartUtility.log('CartBlogListCtrl $routeChangeSuccess entered!');
        $scope.subTitle1 = '';
        $scope.subTitle2 = '';
        var rootPath = CartUtility.getRootPathFromtLocation($location);
        if (['', 'category', 'tag', 'year', 'month', 'day'].indexOf(rootPath) !== -1) {
            $scope.loadPageData();
        }
    });

    // FIXME 页脚的分页标签的位置最好紧贴页面的footer，现在是在内容展示的div下面
};