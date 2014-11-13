'use strict';

/* global $, _, angular, uuid, moment, marked, ace, hljs, CartUtility, CartConst */
module.exports = function($scope, $location, $anchorScroll, $routeParams, $dataService, FileUploader) {
    CartUtility.log('CartBlogEditCtrl');

    var postId = $routeParams.postId;

    $scope.postCategories = $dataService.categoryGetAll();

    $scope.postCategory = null;
    $scope.postTags = [];
    $scope.postAttachments = [];

    var postBaseUrl = CartUtility.getPureAbsUrlFromLocation($location);
    var editElement = $('#markdown-edit');
    var previewElement = $('#markdown-preview');
    var titleElement = $('#markdown-post-title');
    var categoryElement = $('#markdown-post-category');
    var tagsIdentify = '#markdown-post-tags > span';
    var tocIconElement = $('.markdown-toc-icon');
    var tocContentElement = $('.markdown-toc-content');
    var tocFirstLinksIdentify = '.markdown-toc-content > ol > li > a';
    var topBtnElement = $('.page-to-top');
    var spinnerElement = $('#markdown-loading');
    var spinnerNameElement = $('.spinner-markdown-name');

    //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
    //-* LOGIC
    //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
    $scope.toggleToc = function() {
        CartUtility.toggleToc(tocIconElement, tocContentElement);
    };

    // category related
    $scope.categoryInput = '';
    $scope.selectPostCategory = function(categoryUuid) {
        var category = $dataService.categorySearchById(categoryUuid);

        if (!_.isNull(category)) {
            $scope.postCategory = category;
            $scope.categoryInput = category.title;
        }

        CartUtility.focusEditor(aceEditor);
    };

    // tag related
    // FIXME tag input auto complete
    $scope.tagInput = '';
    $scope.addPostTag = function(event) {
        event.preventDefault();
        var inputName = $scope.tagInput;
        if (_.isEmpty(inputName)) {
            return; // empty input, ignore it
        }

        // search current post tags
        var currentPostTagsFound = false;
        if (!_.isEmpty($scope.postTags)) {
            _.forEach($scope.postTags, function(tag) {
                if (tag.title === inputName) {
                    currentPostTagsFound = true;
                }
            });
        }
        if (currentPostTagsFound !== false) {
            CartUtility.notify('Warning!', 'Tag with name "' + inputName + '" already exists in this post!', 'notice');
            return; // same tag already exists in post
        }

        var tag = $dataService.tagSearch(inputName);
        if (!_.isEmpty(tag)) {
            // tag already exists
            tag = tag.pop(); // [searchedTag].pop()
            $scope.postTags[tag.uuid] = tag;
        } else {
            // tag not found, create it
            $dataService.tagCreate(inputName).then(function(data) { // data is tag json
                $scope.postTags[data.uuid] = data;
            });
        }

        $scope.tagInput = '';
        CartUtility.focusEditor(aceEditor);
    };
    $scope.removePostTag = function(tagUuid) {
        if ($scope.postTags.hasOwnProperty(tagUuid)) {
            delete $scope.postTags[tagUuid];
        }

        CartUtility.focusEditor(aceEditor);
    };

    $scope.$on('$routeChangeStart', function() {
        CartUtility.log('CartBlogNewCtrl $routeChangeStart entered!');
        // anchor link logic
        var prevHash = $location.hash();
        if (_.isString(prevHash) && !_.isEmpty(prevHash)) {
            $location.hash(CartUtility.escapeAnchorName(prevHash));
            $anchorScroll();
            $location.hash(prevHash);
        }
    });

    // post data search logic
    $dataService.postGetTmp($routeParams.postId).then(function(tmpPostData) {
        // tmp post data found
        aceEditor.setValue(tmpPostData.md, -1);
        $scope.postCategory = tmpPostData.category;
        $scope.categoryInput = tmpPostData.category.title;
        $scope.postTags = tmpPostData.tags;
        $scope.postAttachments = tmpPostData.attachments;
    }, function(err) {
        if (err.status !== 404) {
            // error encountered, and is not post not found error, just return, since error message shall have already been notified
            return;
        }
        // tmp post data not found
        // FIXME
        // search local post data, found, fetch post data from server, display it
        // not found, redirect to error page
    });

    //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
    //-* EDITOR
    //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
    // markd
    var renderer = new marked.Renderer();
    renderer.heading = function(text, level) { // add anchor link
        return '' +
            '<h' + level + '>' +
                '<a name="' + CartUtility.escapeAnchorName(text) + '"></a>' +
                text +
            '</h' + level + '>';
    };
    marked.setOptions({
        renderer: renderer,
        gfm: true,
        tables: true,
        breaks: true,
        pedantic: false,
        sanitize: true,
        smartLists: true,
        smartypants: false,
        highlight: function (code, lang) {
            // since the highlight class name added with highlight lib itself not working, have to wrap code tag by self
            return '<code class="hljs ' + lang + '">' + hljs.highlightAuto(code, [lang]).value + '</code>';
        }
    });

    var aceEditor = ace.edit(editElement.attr('id'));

    aceEditor.setOption("showPrintMargin", false);
    aceEditor.setTheme('ace/theme/earthsong');
    aceEditor.setHighlightActiveLine(true);
    aceEditor.setBehavioursEnabled(true);

    aceEditor.getSession().setMode('ace/mode/markdown');
    aceEditor.getSession().on('change', function() {
        previewMd();
    });

    aceEditor.session.setUseWrapMode(true);
    aceEditor.session.setNewLineMode("unix");
    aceEditor.session.setScrollTop(false);
    aceEditor.renderer.setShowGutter(true);
    aceEditor.renderer.setPrintMarginColumn(true);
    aceEditor.renderer.setPadding(15);
    aceEditor.renderer.setScrollMargin(20);
    aceEditor.resize(true);

    var collectPostData = function() {
        var title = titleElement.text().trim();

        var category = $dataService.categorySearch(categoryElement.text().trim());
        if (_.isEmpty(category)) {
            category = {};
        } else {
            category = category.pop(); // [searchedCategory].pop()
            category = $dataService.categoryUpdateTime(category);
        }

        var tags = {};
        var tagNames = [];
        var tagElements = $(tagsIdentify);
        if (tagElements.length > 0) {
            _.forEach(tagElements, function(element) {
                tagNames.push($(element).text().trim());
            });
        }
        if (tagNames.length > 0) {
            _.forEach(tagNames, function(tagName) {
                var tag = $dataService.tagSearch(tagName);
                if (!_.isEmpty(tag)) {
                    tag = tag.pop(); // [searchedTag].pop()
                    tag = $dataService.tagUpdateTime(tag);
                    tags[tag.uuid] = tag;
                }
            });
        }

        return {
            "title": title,
            "category": category,
            "tags": tags,
            "attachments": $scope.postAttachments
        };
    };

    var previewMd = function() {
        var content = aceEditor.getSession().getValue();
        var converted = marked(content);

        previewElement.html(converted);

        var editHeight = parseInt(editElement.css('height'));
        var previewHeight = parseInt(previewElement.css('height'));
        if (editHeight > previewHeight) {
            previewElement.css('height', editHeight);
            aceEditor.resize();
        } else if (editHeight < previewHeight) {
            editElement.css('height', previewHeight);
            aceEditor.resize();
        }

        var toc = CartUtility.buildToc(converted, postBaseUrl);
        if (toc !== '') { // find header links
            // apply toc html
            tocContentElement.html(toc);
            // apply post title
            titleElement.text($($(tocFirstLinksIdentify)[0]).text());
        }
    };

    //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
    //-* EDITOR COMMANDS
    //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
    aceEditor.commands.addCommand({
        "name": "cmdSaveTmp",
        "bindKey": {"win": "Ctrl-S", "mac": "Command-S"},
        "exec": function(editor) {
            CartUtility.log('ACE Ctrl-S triggered: Save post tmp.');

            var postData = collectPostData(editor);

            $dataService.postSaveTmp(
                postId, postData.title,
                editor.getSession().getValue(),
                postData.category, postData.tags, postData.attachments
            ).then(function() {
                CartUtility.notify('Done!', 'Tmp post saved!', 'success');
            });
        }
    });
    aceEditor.commands.addCommand({
        "name": "cmdUpload",
        "bindKey": {"win": "Ctrl-U", "mac": "Command-U"},
        "exec": function(editor) {
            CartUtility.log('ACE Ctrl-U triggered: Upload post.');

            var postData = collectPostData(editor);
        }
    });
    aceEditor.commands.addCommand({
        "name": "cmdDisplayIndex",
        "bindKey": {"win": "Ctrl-I", "mac": "Command-I"},
        "exec": function() {
            CartUtility.log('ACE Ctrl-I triggered: Display post index.');
            CartUtility.toggleToc(tocIconElement, tocContentElement);
        }
    });
    aceEditor.commands.addCommand({
        "name": "cmdGotoTop",
        "bindKey": {"win": "Ctrl-H", "mac": "Command-H"},
        "exec": function() {
            CartUtility.log('ACE Ctrl-H triggered: Goto page top.');
            topBtnElement.click();
        }
    });

    //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
    //-* EDITOR FILE UPLOAD
    //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
    /* HOT FIX for FileUploader.isUploading status */
    FileUploader.prototype._onCompleteItem = function(item, response, status, headers) {
        var nextItem = this.getReadyItems()[0];
        this.isUploading = !!nextItem;

        item._onComplete(response, status, headers);
        this.onCompleteItem(item, response, status, headers);

        if (angular.isDefined(nextItem)) {
            nextItem.upload();
            return;
        }

        this.onCompleteAll();
        this.progress = this._getTotalProgress();
        this._render();
    };
    /**
     * File {
     *     FilelastModified: 1414117158000,
     *     lastModifiedDate: Fri Oct 24 2014 10:19:18 GMT+0800 (CST),
     *     name: "1697525.jpeg",
     *     size: 9303,
     *     type: "image/jpeg"
     * }
     * FileLikeObject {
     *     lastModifiedDate: Mon Oct 27 2014 12:50:24 GMT+0800 (CST),
     *     size: 269534,
     *     type: "image/png",
     *     name: "6f5ef307gw1elpmcbs6k1j20db0dwmz3.png"
     * }
     */
    var uploader = new FileUploader({
        url: '/api/upload',
        removeAfterUpload: true
    });
    uploader.filters.push({
        name: 'fileTypeFilter',
        fn: function(file) {
            return CartConst.UPLOAD_TYPES.indexOf(file.type) !== -1;
        }
    });
    var uploaderProcessNextUpload = function() {
        if (uploader.queue.length > 0 && !uploader.isUploading) {
            var fileItem = uploader.queue[0];
            uploaderReportUploadProgress(fileItem.file.name, 0);
            fileItem.formData = [{ "postId": postId }];
            fileItem.upload();
        } else if (uploader.queue.length === 0) {
            // no any files to be uploaded, try to hide spinner
            uploaderHideSpinner();
        }
    };
    var uploaderReportUploadProgress = function(name, progress) {
        spinnerNameElement.text('Uploading "' + name + '": ' + progress + '% ...');
    };
    var uploaderHideSpinner = function() {
        if (uploader.queue.length === 0 && !uploader.isUploading) {
            spinnerElement.hide();
            spinnerNameElement.text('');
        }
    };
    uploader.onWhenAddingFileFailed = function(file) {
        CartUtility.notify('Error!', 'File type of "' + file.name + '" is not allowed: ' + file.type, 'error');
        uploaderHideSpinner();
    };
    uploader.onProgressItem = function(fileItem, progress) {
        uploaderReportUploadProgress(fileItem.file.name, progress);
    };
    uploader.onErrorItem = function(fileItem) {
        CartUtility.notify('Upload Error!', 'Error encountered while uploading file "' + fileItem.file.name + '"!', 'error');
        uploaderHideSpinner();
    };
    uploader.onCompleteItem = function(fileItem, response) {
        if (CartUtility.handleResponse(response)) {
            CartUtility.notify('Upload Done!', 'File "' + fileItem.file.name + '" uploaded!', 'success');
        }
        $scope.postAttachments.push({
            created: moment().unix(),
            driveId: null,
            title: fileItem.file.name,
            updated: moment().unix(),
            uuid: uuid.v4()
        });
        uploaderProcessNextUpload();
    };
    if (CartUtility.isDndSupported()) {
        // intercept document body drag & drop event, prevent document drop page redirect
        $(document).on('dragenter', function(event) {
            event.stopPropagation();
            event.preventDefault();
        }).on('dragover', function(event) {
            event.stopPropagation();
            event.preventDefault();
        }).on('drop', function(event) {
            event.stopPropagation();
            event.preventDefault();
        });
        // bind real drop event
        var aceContent = $('.ace_content');
        aceContent.on('dragenter', function(event) {
            // display drag over view effect
            event.stopPropagation();
            event.preventDefault();
            aceContent.addClass('ace_drag_over');
        }).on('dragleave', function(event) {
            // hide drag over view effect
            event.stopPropagation();
            event.preventDefault();
            aceContent.removeClass('ace_drag_over');
        }).on('dragover', function(event) {
            // intercept the dragover event to enable drop event
            event.stopPropagation();
            event.preventDefault();
        }).on('drop', function(event) {
            // drop to upload
            event.stopPropagation();
            event.preventDefault();
            // styles
            aceContent.removeClass('ace_drag_over');
            spinnerElement.show();
            // upload
            var files = event.originalEvent.dataTransfer.files;
            uploader.addToQueue(files);
            uploaderProcessNextUpload();
        });
    } else {
        CartUtility.notify(
            'Warning!',
            'Drag & Drop file upload functionality is not supported in this browser. \n' +
            'You cannot upload file with this browser! \n' +
            'Please use modern browsers like Chrome.',
            'notice',
            100000 // 10s
        );
    }
};