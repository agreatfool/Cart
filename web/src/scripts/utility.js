'use strict';

/* global _, $, moment, PNotify */
var CartUtility = function() {
    this.spinTasksCount = 0;
    this.pnotifyStack = {'dir1': 'up', 'dir2': 'right', 'push': 'bottom', 'spacing1': 0, 'spacing2': 0};
};

CartUtility.prototype.request = function(method, $http, $q, url, data, onSuccess, onError) {
    var self = this;
    var deferred = $q.defer();

    if (!_.isString(method) || (method.toLowerCase() !== 'get' && method.toLowerCase() !== 'post')) {
        method = 'GET';
    }

    var options = {
        method: method,
        url: url
    };
    if (_.isObject(data) && !_.isEmpty(data)) {
        if (method.toLowerCase() === 'post') {
            options.data = JSON.stringify(data);
        } else {
            options.url += '?' + $.param(data);
        }
    }

    $http(options)
    .success(function(data) {
        if (self.handleResponse(data)) {
            deferred.resolve(onSuccess(data));
        } else {
            deferred.reject();
        }
    })
    .error(function(data) {
        if (_.isFunction(onError)) {
            onError(data);
        }
        deferred.reject();
    });

    return self.spinShow(deferred.promise);
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
            this.notify('REQ Failed!', result.message.error, 'error');
        }
        return false;
    } else if (!_.isObject(result) || (_.isObject(result) && !result.hasOwnProperty('valid'))) {
        // request failed without normal framework exception
        if (notifyError) { // show failure msg box
            this.notify('REQ Failed!');
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

CartUtility.prototype.toggleToc = function(icon, toc) { /* all params are jquery elements: $('#id') */
    if (toc.html() !== '') {
        toc.slideToggle('fast', function() {
            icon.toggleClass('glyphicon-plus').toggleClass('glyphicon-minus');
        });
    }
};

CartUtility.prototype.escapeAnchorName = function(anchorName) {
    return encodeURIComponent(anchorName);
};

CartUtility.prototype.getRootPathFromtLocation = function($location) {
    return $location.path().split('/')[1]; // rootPath: "http://host/post/postId" => "post"
};

CartUtility.prototype.getPureRootUrlFromLocation = function($location) {
    return $location.protocol() + '://' + $location.host() + '/'; // "http://host/"
};

CartUtility.prototype.getPureAbsUrlFromLocation = function($location) {
    // "http://cart.com/edit/0dcec492-3f9b-442b-95b1-60b3e0c92f7b#firsttitle"
    // =>
    // "http://cart.com/edit/0dcec492-3f9b-442b-95b1-60b3e0c92f7b"
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
        msg = '[' + this.getTimeString() + ']' + ((_.isString(facility)) ? (' ' + facility) : '') + ' ' + msg;
        console.log(msg);
    }
};

CartUtility.prototype.isDndSupported = function() {
    var div = document.createElement('div');
    return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
};

CartUtility.prototype.generateMdHTMLHeader = function(post) {
    return '<div id="mdHeader" style="display:none;"><div class="mdHeaderData">' + JSON.stringify({
        "uuid": post.uuid,
        "title": post.title,
        "category": post.category,
        "tags": post.tags,
        "attachments": post.attachments,
        "created": post.created,
        "updated": post.updated
    }) + '</div></div>';
};

CartUtility.prototype.parseMdHTMLHeader = function(markdown) {
    var header = { // default structure
        "category": {},
        "tags": {},
        "attachments": {}
    };

    if (!_.isString(markdown) || _.isEmpty(markdown)) {
        return header;
    }
    var headerText = $(markdown).find('.mdHeaderData').text();
    if (!_.isString(headerText) || _.isEmpty(headerText)) {
        return header;
    }

    try {
        header = JSON.parse($(markdown).find('.mdHeaderData').text());
    } catch (e) {
        this.log('Error in parsing markdown file fetched: ' + markdown + ', e: ' + e.message + ', stack: ' + e.stack.toString());
    }

    return header;
};

CartUtility.prototype.parseMdPureContent = function(markdown) {
    return markdown.substr(markdown.indexOf('</div></div>') + '</div></div>'.length);
};

CartUtility.prototype.focusEditor = function(editor) {
    editor.focus(); // focus the ace editor
    editor.resize(true); // resize the window

    var editorValues = editor.getSession().getValue();
    if (_.isEmpty(editorValues)) {
        return; // no content, no need to redirect to end of page
    }

    editorValues = editorValues.split("\n");
    var lineNo = editorValues.length; // count total number of lines
    var columnNo = editorValues[lineNo - 1].split('').length;
    editor.gotoLine(lineNo, columnNo); // go to end of document
};

CartUtility.prototype.getTime = function() {
    return moment().unix(); // return current timestamp
};

CartUtility.prototype.getTimeString = function(timestamp) {
    var instance = _.isUndefined(timestamp) ? moment() : this.parseUnixTime(timestamp);
    return instance.format('YYYY-MM-DD HH:mm:ss');
};

CartUtility.prototype.parseTimeStringToUnix = function(time) { // timeString || new Date(timeString)
    return moment(time).unix();
};

CartUtility.prototype.parseUnixTime = function(timestamp) {
    return moment.unix(timestamp); // return moment instance
};

CartUtility.prototype.parseUnixYear = function(timestamp, needFull) {
    if (!_.isBoolean(needFull)) {
        needFull = false;
    }
    // return 'YYYY' or 'YYYY-01-01 00:00:00'
    return this.parseUnixTime(timestamp).format('YYYY') + (needFull ? '-01-01 00:00:00' : '');
};

CartUtility.prototype.parseUnixYearStartTimestamp = function(timestamp) {
    // return 'YYYY-01-01 00:00:00'.timestamp
    return moment(this.parseUnixYear(timestamp, true)).unix();
};

CartUtility.prototype.parseUnixYearEndTimestamp = function(timestamp) {
    // return 'NEXT_YYYY-01-01 00:00:00'.timestamp - 1
    return moment((parseInt(this.parseUnixYear(timestamp)) + 1) + '-01-01 00:00:00').unix() - 1;
};

CartUtility.prototype.parseUnixDate = function(timestamp, needFull) {
    if (!_.isBoolean(needFull)) {
        needFull = false;
    }
    // return 'YYYY-MM' or 'YYYY-MM-01 00:00:00'
    return this.parseUnixTime(timestamp).format('YYYY-MM') + (needFull ? '-01 00:00:00' : '');
};

CartUtility.prototype.parseUnixMonth = function(timestamp) {
    // return 'MM'
    return this.parseUnixTime(timestamp).format('MM');
};

CartUtility.prototype.parseUnixDateStartTimestamp = function(timestamp) {
    // return 'YYYY-MM-01 00:00:00'.timestamp
    return moment(this.parseUnixDate(timestamp, true)).unix();
};

CartUtility.prototype.parseUnixDateEndTimestamp = function(timestamp) {
    var year = parseInt(this.parseUnixYear(timestamp));
    var month = parseInt(this.parseUnixMonth(timestamp));
    if (month === 12) {
        year++;
        month = '01';
    } else {
        month++;
    }
    if ((month + '').length === 1) {
        month = '0' + month;
    }
    // month is 12 => return 'NEXT_YYYY-01-01 00:00:00'.timestamp - 1
    // month lower than 12 => return 'YYYY-NEXT_MM-01 00:00:00'.timestamp - 1
    return moment(year + '-' + month + '-01 00:00:00').unix() - 1;
};

CartUtility.prototype.parseUnixDateDay = function(timestamp, needFull) {
    if (!_.isBoolean(needFull)) {
        needFull = false;
    }
    // return 'YYYY-MM-DD' or 'YYYY-MM-DD 00:00:00'
    return this.parseUnixTime(timestamp).format('YYYY-MM-DD') + (needFull ? ' 00:00:00' : '');
};

CartUtility.prototype.parseUnixDay = function(timestamp) {
    return this.parseUnixTime(timestamp).format('DD');
};

CartUtility.prototype.parseUnixDayStartTimestamp = function(timestamp) {
    // return 'YYYY-MM-DD 00:00:00'.timestamp
    return moment(this.parseUnixDateDay(timestamp, true)).unix();
};

CartUtility.prototype.parseUnixDayEndTimestamp = function(timestamp) {
    // return 'YYYY-MM-NEXT_DD 00:00:00'.timestamp - 1
    return this.parseUnixDayStartTimestamp(timestamp) + 24 * 60 * 60 - 1;
};

CartUtility.prototype.parseUnixDetailTime = function(timestamp) {
    return this.parseUnixTime(timestamp).format('HH:mm:ss');
};

module.exports = new CartUtility();