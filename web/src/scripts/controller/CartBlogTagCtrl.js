'use strict';

/* global _, CartUtility */
module.exports = function($scope, $location, $window, $modal, $accessService, $dataService) {
    CartUtility.log('CartBlogTagCtrl');

    $scope.isMaster = $accessService.isMaster();

    $scope.pageType = 'Tag';
    $scope.pageOrder = 'title'; // title || updated

    $scope.createContent = '';
    $scope.searchContent = '';
    var items = [];
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
        var result = _.filter(items, function(item) {
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

        if (!$scope.isMaster) {
            return; // no privilege to do it
        }

        var inputName = $scope.createContent;
        if (_.isEmpty(inputName)) {
            return; // empty input, ignore it
        }

        var tag = $dataService.tagSearchLocal(inputName);
        if (!_.isEmpty(tag)) {
            return; // tag already exists
        }

        // tag not found, create it
        $dataService.tagCreate(inputName).then(function(data) { // data is tag json
            items.push(data);
            $scope.itemsOnPage.push(data);
            sortItemsOnPage();
            CartUtility.notify('Done!', 'Tag "' + inputName + '" created!');
        });

        $scope.createContent = '';
    };

    $scope.selectItem = function(title, event) {
        var tagUrl = CartUtility.getPureRootUrlFromLocation($location) + 'tag/' + CartUtility.escapeAnchorName(title);

        // non master logic
        if (!$scope.isMaster) {
            $window.open(tagUrl); // no privilege to delete item, thus, always open tag page
            return;
        }

        // master logic
        var offset = event.offsetX;
        var edge = event.target.clientWidth * 0.6;

        if (offset < edge) {
            // open tag detailed page
            $window.open(tagUrl);
        } else {
            if (!$window.confirm('Are you really sure to delete the tag "' + $scope.pageType.toLowerCase() + '": ' + title + '?')) {
                return; // rejected
            }
            var tag = $dataService.tagSearchLocal(title);
            if (tag.length === 0) {
                CartUtility.notify('Error!', 'Target tag to be deleted not found, name: ' + title, 'error');
                return;
            }
            tag = tag.pop();
            $dataService.tagDelete(tag.uuid).then(function() {
                _.forEach(items, function(item, index) {
                    if (item.uuid === tag.uuid) {
                        items.splice(index, 1);
                    }
                });
                _.forEach($scope.itemsOnPage, function(item, index) {
                    if (item.uuid === tag.uuid) {
                        $scope.itemsOnPage.splice(index, 1);
                    }
                });
                sortItemsOnPage();
                CartUtility.notify('Done!', 'Tag "' + title + '" deleted!');
            });
        }
    };

    $scope.openModal = function(uuid) {
        if (!$scope.isMaster) {
            return; // no privilege to rename item, no need to open modal window
        }
        var modal = $modal.open({
            templateUrl: 'CartBlogLabelModal.html',
            controller: 'CartBlogLabelModalCtrl',
            size: 'sm'
        });
        modal.result.then(function(name) {
            $dataService.tagUpdateName(uuid, name).then(function(tag) {
                _.forEach(items, function(item, index) {
                    // FIXME 页面上会短暂存在改名前和改名后的两个item，然后改名前的才消失，应该同时出现和消失
                    if (item.uuid === tag.uuid) {
                        items[index] = tag;
                    }
                });
                $scope.itemsOnPage = items;
                sortItemsOnPage();
                CartUtility.notify('Done!', $scope.pageType + ' renamed to ' + name);
            });
        });
    };

    $scope.changeOrder = function(order) {
        if (order !== 'title' && order !== 'updated') {
            return; // invalid value
        }
        $scope.pageOrder = order;
        sortItemsOnPage();
    };

    $dataService.tagGetAll().then(function(data) {
        if (_.isObject(data)) {
            var tags = _.values(data);
            if (!_.isArray(tags) || tags.length === 0) {
                return; // empty list
            }
            items = $scope.itemsOnPage = tags;
            sortItemsOnPage();
        }
    });

};