'use strict';

/* global $, moment */
module.exports = function ($scope, $compile) {
    console.log('CartSearchCtrl');

    // CALENDAR
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    $scope.events = [{
        title: 'Blog Post 1',
        start: new Date(y, m, d, 9, 56, 43),
        allDay: false,
        url: "http://www.google.com",
        className: ["calEvent"]
    }, {
        title: 'This is a very very long long long Blog Post title',
        start: new Date(y, m, d - 1, 18, 56, 43),
        allDay: false,
        url: "http://www.google.com",
        className: ["calEvent"]
    }];

    $scope.addEvent = function(title, date, url) {
        $scope.events.push({
            title: title,
            start: date,
            allDay: false,
            url: url,
            className: ["calEvent"]
        });
    };

    $scope.addSearchCondDate = function(cond) {
        /**
         * {
         *     year: 2014
         *     month: 2014-08
         *     day: 2014-08-01
         * }
         */
        console.log(cond);
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
             * 之后应该需要做一个单独的worker，去查找日历上每个格子（天）上的博客记录，进行展示
             */
            // reformat calendar date title, make it clickable
            var dateTitle = $('.search-calendar .fc-header-title h2');
            var dateDisplay = dateTitle.html().split(' ');
            var yearDisplay = dateDisplay[1];
            var monthDisplay = dateDisplay[0];
            var titleReformat =
                "<a ng-click=\"addSearchCondDate({'month': '" + moment(yearDisplay + ' ' + monthDisplay, 'YYYY MMMM').format('YYYY-MM') + "'})\">" + monthDisplay + "</a>"
                + '&nbsp;'
                + "<a ng-click=\"addSearchCondDate({'year': '" + yearDisplay + "'})\">" + yearDisplay + "</a>";
            dateTitle.html(titleReformat);
            $compile(dateTitle)($scope); // recompile the ng-click tag
        },
        dayClick: function(date) {
            $scope.addSearchCondDate({'day': moment(date).format('YYYY-MM-DD')});
        }
    };

    /* event sources array*/
    $scope.eventSources = [$scope.events, $scope.eventsF];
};