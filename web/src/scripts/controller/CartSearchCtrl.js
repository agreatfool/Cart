'use strict';

/* global $, moment */
module.exports = function ($scope, $compile) {
    console.log('CartSearchCtrl');

    // calendar
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    /* event source that contains custom events on the scope */
    $scope.events = [
        {title: 'All Day Event',start: new Date(y, m, 1)},
        {title: 'Long Event',start: new Date(y, m, d - 5),end: new Date(y, m, d - 2)},
        {id: 999,title: 'Repeating Event',start: new Date(y, m, d - 3, 16, 0),allDay: false},
        {id: 999,title: 'Repeating Event',start: new Date(y, m, d + 4, 16, 0),allDay: false},
        {title: 'Birthday Party',start: new Date(y, m, d + 1, 19, 0),end: new Date(y, m, d + 1, 22, 30),allDay: false},
        {title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29),url: 'http://google.com/'}
    ];
    /* event source that calls a function on every view switch */
    $scope.eventsF = function (start, end, callback) {
        console.log('eventsF');
        var s = new Date(start).getTime() / 1000;
        var e = new Date(end).getTime() / 1000;
        var m = new Date(start).getMonth();
        var events = [{title: 'Feed Me ' + m,start: s + (50000),end: s + (100000),allDay: false, className: ['customFeed']}];
        callback(events);
    };

    /* add custom event*/
    $scope.addEvent = function() {
        $scope.events.push({
            title: 'Open Sesame',
            start: new Date(y, m, 28),
            end: new Date(y, m, 29),
            className: ['openSesame']
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