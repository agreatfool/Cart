'use strict';

/* global _, CartUtility */
module.exports = function($scope, $location, $window, $modal, $dataService) {
    CartUtility.log('CartBlogCategoryCtrl');

    $scope.pageType = 'Category';
    $scope.pageOrder = 'title'; // title || updated

    $scope.createContent = '';
    $scope.searchContent = '';
    $scope.items = [];
    $scope.itemsOnPage = [];

    var sortItemsOnPage = function() {
        $scope.itemsOnPage = _.sortBy($scope.itemsOnPage, function(item) {
            return item[$scope.pageOrder];
        });
    };

    $scope.searchItem = function() {
        searchItem();
    };

    var searchItem = _.throttle(function() {
        var result = _.filter($scope.items, function(item) {
            return item.title.indexOf($scope.searchContent) === 0;
        });
        if (result.length > 0) {
            $scope.itemsOnPage = result;
        } else {
            $scope.itemsOnPage = $scope.items;
        }
        sortItemsOnPage();
    }, 100); // do searchItem every 100ms

    $scope.addItem = function(event) {
        event.preventDefault();

        var inputName = $scope.createContent;
        if (_.isEmpty(inputName)) {
            return; // empty input, ignore it
        }

        var category = $dataService.categorySearchLocal(inputName);
        if (!_.isEmpty(category)) {
            return; // category already exists
        }

        // category not found, create it
        $dataService.categoryCreate(inputName).then(function(data) { // data is category json
            $scope.items.push(data);
            $scope.itemsOnPage.push(data);
            sortItemsOnPage();
        });

        $scope.createContent = '';
    };

    $scope.selectItem = function(title, event) {
        var offset = event.offsetX;
        var edge = event.target.clientWidth * 0.6;
        console.log('offset: ', offset, 'edge: ', edge, 'pass: ', (offset >= edge));
        if (offset < edge) {
            // open category detailed page
            $window.open(CartUtility.getPureRootUrlFromLocation($location) + 'category/' + CartUtility.escapeAnchorName(title));
        } else {
            if (!$window.confirm('Are you really sure to delete the ' + $scope.pageType.toLowerCase() + ': ' + title + '?')) {
                return; // rejected
            }
            console.log('here');
        }
    };

    $scope.openModal = function(uuid) {
        var modal = $modal.open({
            templateUrl: 'CartBlogLabelModal.html',
            controller: 'CartBlogLabelModalCtrl',
            size: 'sm'
        });
        modal.result.then(function(name) {
            console.log(name);
            // FIXME update name with remote server
        });
    };

    $scope.changeOrder = function(order) {
        if (order !== 'title' && order !== 'updated') {
            return; // invalid value
        }
        $scope.pageOrder = order;
        sortItemsOnPage();
    };

    $dataService.categoryGetAll().then(function(data) {
        if (_.isObject(data)) {
            var categories = _.values(data);
            if (!_.isArray(categories) || categories.length === 0) {
                return; // empty list
            }
            $scope.items = $scope.itemsOnPage = categories;
            sortItemsOnPage();
        }
    });

};