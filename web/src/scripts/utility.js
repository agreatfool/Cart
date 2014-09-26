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
    return promise;
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
        duration = 3000; // 3s
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
        options.hide = false;
    }

    new PNotify(options);
};

CartUtility.prototype.handleResponse = function(result, notifySuccess, notifyError) {
    if (typeof notifySuccess !== 'boolean') {
        notifySuccess = false; // default not display the succeed message
    }
    if (typeof notifyError !== 'boolean') {
        notifyError = true; // default display the failure message
    }

    if (_.isObject(result) && result.hasOwnProperty('valid') && result.valid === false) {
        // request failed with normal framework exception
        if (notifyError) { // show failure msg box
            this.notify('REQ Failed', result.message.error, 'error');
        }
        return false;
    } else if (!_.isObject(result) || (_.isObject(result) && !result.hasOwnProperty('valid'))) {
        // request failed without normal framework exception
        if (notifyError) { // show failure msg box
            this.notify('REQ Failed');
        }
        return false;
    } else {
        // request done
        if (notifySuccess) { // show success msg box, and hide automatically
            this.notify('REQ Succeed!', JSON.stringify(result.message));
        }
        return true;
    }
};

module.exports = new CartUtility();