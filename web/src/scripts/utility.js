'use strict';

/* global _, $, moment, PNotify */
var CartUtility = function() {
    this.spinTasksCount = 0;
    this.pnotifyStack = {'dir1': 'up', 'dir2': 'right', 'push': 'bottom', 'spacing1': 0, 'spacing2': 0};
};

CartUtility.prototype.spinShow = function(promise) {
    var self = this;
    self.spinTasksCount++;
    $('.spinner-mask').show();
    if (_.isObject(promise) && promise.hasOwnProperty('finally')) {
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
    // type: "notice", "info", "success", or "error"
    // duration: milliseconds
    if (_.isUndefined(title)) {
        title = 'title';
    }
    if (_.isUndefined(text)) {
        text = '';
    }
    if (_.isUndefined(type) || _.isEmpty(type) || _.isNull(type)) {
        type = 'info';
    }
    if (_.isUndefined(duration) || _.isEmpty(duration) || _.isNull(duration)) {
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
    if (!_.isBoolean(notifySuccess)) {
        notifySuccess = false; // default not display the succeed message
    }
    if (!_.isBoolean(notifyError)) {
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

CartUtility.prototype.buildToc = function(html, baseUrl) {
    if (_.isUndefined(baseUrl) || _.isNull(baseUrl)) {
        baseUrl = ''; // shall be 'http://...'
    }
    var rootNodeName = 'root';
    /**
     * [
     *     { // index of this node is 5
         *         "level": 3,
         *         "text": "headerTextForLv3",
         *         "anchor": "CartUtility.escapeAnchorName(headerTextForLv3)"
         *         "parent": 4, // index of node in this array, only root parent is string 'root'
         *         "html": $('<a href="#anchor">text</a>')
         *     },
     *     ...
     * ]
     */
    var headers = [];

    if (_.isUndefined(html) || _.isEmpty(html) || _.isNull(html)) {
        return '';
    }

    // find all headers, and collect basic info
    var headerInfos = $(html).filter(':header');
    if (headerInfos.length <= 0) {
        return ''; // no headers found
    }
    _.forEach(headerInfos, function(header) {
        // build basic headers info
        var hElement = $(header);
        var headerLevel = parseInt(hElement.prop("tagName").substring(1));
        var headerText = hElement.text();
        var anchorName = hElement.find('a').attr('name');
        headers.push({
            "level": headerLevel,
            "text": headerText,
            "anchor": anchorName,
            "parent": null,
            "html": null
        });
    });
    var headersCloned = _.clone(headers);
    // loop to build html code & find parent levels
    _.forEach(headers, function(header, index) {
        header.html = $('<li><a href="' + baseUrl + '#' + header.anchor + '">' + header.text + '</a></li>');
        if (index === 0) {
            header.parent = rootNodeName;
        } else {
            var reversedBeforeHeaders = headersCloned.slice(0, index).reverse();
            _.forEach(reversedBeforeHeaders, function(bfHeader, bfIndex) {
                if (header.parent !== null) {
                    // means parent already determined, skip this loop
                    return;
                }
                if (bfHeader.level === header.level) {
                    // same level, shall share the same parent node
                    header.parent = bfHeader.parent;
                } else if (bfHeader.level < header.level) {
                    // current level is bigger than target, parent is target
                    header.parent = (reversedBeforeHeaders.length - 1) - bfIndex; // since bfIndex is the index of reversed array
                } else if (bfHeader.level > header.level) {
                    // current level is lower than target, dismiss it
                }
            });
            if (header.parent === null) {
                // parent not found, root node
                header.parent = rootNodeName;
            }
        }
    });

    // build final html codes
    var root = $('<ol></ol>');
    // build non root nodes first, and have to reverse headers first
    // since we need to handle sub headers from the bottom to top
    _.forEach(headers, function(header) {
        if (header.parent === rootNodeName) {
            return; // dismiss root nodes, since the content in it has not been built yet
        }
        var parentNode = headers[header.parent].html;
        if (parentNode.find('ul').length <= 0) {
            // parent li element does not contain the ul element, add it
            parentNode.append('<ul></ul>');
        }
        $(parentNode.find('ul')[0]).append(header.html);
    });
    // build root nodes
    _.forEach(headers, function(header) {
        if (header.parent === rootNodeName) {
            root.append(header.html);
        }
    });

    return '<ol>' + root.html() + '</ol>'; // since html() only returned the innerHtml of the element
};

CartUtility.prototype.toggleToc = function() {
    var icon = $('.markdown-toc-icon');
    var toc = $('.markdown-toc-content');
    if (toc.html() !== '') {
        toc.slideToggle('fast', function() {
            icon.toggleClass('glyphicon-plus').toggleClass('glyphicon-minus');
        });
    }
};

CartUtility.prototype.escapeAnchorName = function(anchorName) {
    return encodeURIComponent(anchorName);
};

CartUtility.prototype.getPureRootUrlFromLocation = function($location) {
    return $location.protocol() + '://' + $location.host() + '/';
};

CartUtility.prototype.getPureAbsUrlFromLocation = function($location) {
    return $location.protocol() + '://' + $location.host() + '/' + $location.path();
};

CartUtility.prototype.log = function(msg, facility) {
    if (_.isUndefined(msg) || _.isEmpty(msg) || _.isNull(msg)) {
        return;
    }
    if (_.isObject(console)) {
        if (_.isObject(msg)) {
            msg = JSON.stringify(msg);
        }
        msg = '[' + moment().format('YYYY-MM-DD HH:mm:ss') + ']' + ((_.isString(facility)) ? (' ' + facility) : '') + ' ' + msg;
        console.log(msg);
    }
};

CartUtility.prototype.isDndSupported = function() {
    var div = document.createElement('div');
    return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
};

module.exports = new CartUtility();