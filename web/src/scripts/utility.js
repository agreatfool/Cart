'use strict';

/* global _, $, PNotify */
var CartUtility = function() {
    this.spinTasksCount = 0;
    this.pnotifyStack = {'dir1': 'up', 'dir2': 'right', 'push': 'bottom', 'spacing1': 0, 'spacing2': 0};
};

CartUtility.prototype.spinShow = function(promise) {
    var self = this;
    self.spinTasksCount++;
    $('.spinner-mask').show();
    if (typeof promise === 'object' && promise.hasOwnProperty('finally')) {
        // this is a promise
        promise['finally'](function() {
            self.spinHide();
        });
    } else {
        setTimeout(function() {
            self.spinHide();
        }, 300);
    }
};

CartUtility.prototype.spinHide = function() {
    this.spinTasksCount--;
    if (this.spinTasksCount > 0) {
        return; // still spin tasks left
    }
    $('.spinner-mask').hide();
};

CartUtility.prototype.notify = function(title, text, type, duration) {
    if (typeof title === 'undefined') {
        title = 'title';
    }
    if (typeof text === 'undefined') {
        text = '';
    }
    if (typeof type === 'undefined' || type === '' || type === null) {
        type = 'info';
    }
    if (typeof duration === 'undefined' || duration === '' || duration === null) {
        duration = 5000; // 5s
    }

    var options = {
        title: title,
        text: text,
        type: type,
        delay: duration,
        addclass: 'stack-bar-bottom',
        width: '70%',
        stack: this.pnotifyStack
    };
    if (type === 'error') {
        options['hide'] = false;
    }

    new PNotify(options);
};
module.exports = new CartUtility();