'use strict';

/* global $, _, moment, CartUtility */
module.exports = function ($scope, $compile, $location, $window, $dataService) {
    CartUtility.log('CartSearchCtrl');

    // DISPLAY CONTROL
    $scope.displayCondNames = ['Calendar', 'Categories', 'Tags'];
    $scope.displayCondName = 'Calendar';
    $scope.displayCond = function(cond) {
        $scope.displayCondName = cond;
    };

    $scope.selectedDate = null; // { "type": "day", "value": "2014-12-02" }
    $scope.selectedCategory = null; // category object: { ... }
    $scope.selectedTags = null; // Map of tag object: { uuid: object, ... }

    $scope.categories = null; // Map of tag object: { uuid: object, ... }
    $scope.tags = null; // Map of category object: { uuid: object, ... }

    $scope.selectCategory = function(uuid) {
        $scope.selectedCategory = $scope.categories[uuid];
    };

    $scope.selectTag = function(uuid) {
        if (_.isNull($scope.selectedTags)) {
            $scope.selectedTags = {};
        }
        $scope.selectedTags[uuid] = $scope.tags[uuid];
        delete $scope.tags[uuid];
    };

    $scope.removeSelectedTag = function(uuid) {
        $scope.tags[uuid] = $scope.selectedTags[uuid];
        delete $scope.selectedTags[uuid];
        if (_.keys($scope.selectedTags).length === 0) {
            $scope.selectedTags = null;
        }
    };

    $scope.startSearch = function() {
        var options = {};
        if (!_.isNull($scope.selectedDate)) {
            options[$scope.selectedDate.type] = $scope.selectedDate.value;
        }
        if (!_.isNull($scope.selectedCategory)) {
            options.category = $scope.selectedCategory.uuid;
            options.isUuidSearch = true;
        }
        if (!_.isNull($scope.selectedTags)) {
            options.tags = JSON.stringify(_.keys($scope.selectedTags)); // format to string
            options.isUuidSearch = true;
        }
        $window.open(CartUtility.getPureRootUrlFromLocation($location) + '?' + $.param(options));
    };

    // DATA SOURCE
    $dataService.categoryGetAll().then(function(data) {
        if (!_.isEmpty(data)) {
            $scope.categories = data;
        }
        return $dataService.tagGetAll();
    }).then(function(data) {
        if (!_.isEmpty(data)) {
            $scope.tags = data;
        }
    });

    // CALENDAR
    var date = new Date();
    var day = date.getDate();
    var month = date.getMonth();
    var year = date.getFullYear();

    $scope.events = [];

    $scope.addSearchCondDate = function(cond) {
        /**
         * {
         *     year: 2014
         *     month: 2014-08
         *     day: 2014-08-01
         * }
         */
        $scope.selectedDate = {
            "type": _.keys(cond).pop(),
            "value": _.values(cond).pop()
        };
    };

    /* config object */
    $scope.calendarOptions = {
        height: 450,
        editable: true,
        header:{
            left: 'title',
            center: '',
            right: 'today prevYear,prev,next,nextYear'
        },
        viewRender: function(view) {
            /**
             * view.visStart 日历上最早的一天
             * view.visEnd 日历上最晚的一天再之后一天的凌晨0点0分0秒
             * view.start 日历上本月最早的一天
             * view.end 日历上本月最后一天再之后一天的凌晨0点0分0秒
             * calendarJqElement 日历本体（不含日历头）的jquery对象
             */
            // reformat calendar date title, make it clickable
            var dateTitle = $('.search-calendar .fc-header-title h2');
            var dateDisplay = dateTitle.html().split(' ');
            var yearDisplay = dateDisplay[1];
            var monthDisplay = dateDisplay[0];
            var titleReformat =
                "<a ng-click=\"addSearchCondDate({'month': '" + moment(yearDisplay + ' ' + monthDisplay, 'YYYY MMMM').format('YYYY-MM') + "'})\">" + monthDisplay + "</a>" +
                '&nbsp;' +
                "<a ng-click=\"addSearchCondDate({'year': '" + yearDisplay + "'})\">" + yearDisplay + "</a>";
            dateTitle.html(titleReformat);
            $compile(dateTitle)($scope); // recompile the ng-click tag
        },
        events: function(start, end) { // display blogs on calendar
            start = moment(start).format('YYYY-MM-DD');
            end = moment(end).add(-1, 'day').format('YYYY-MM-DD');
            $dataService.postSearch({
                "pageNumber": -1,
                "start": start,
                "end": end
            }).then(function(data) {
                _.forEach(data.posts, function(post) {
                    $scope.events.push({
                        title: post.title,
                        start: CartUtility.parseUnixTime(post.created).toDate(),
                        allDay: false,
                        url: CartUtility.getPureRootUrlFromLocation($location) + 'view/' + post.uuid,
                        className: ['calEvent']
                    });
                });
            });
        },
        dayClick: function(date) {
            $scope.addSearchCondDate({'day': moment(date).format('YYYY-MM-DD')});
        },
        eventRender: function(event, element) {
            element.attr('target', '_blank'); // open link on a new page
        }
    };

    /* event sources array*/
    $scope.eventSources = [$scope.events];
};