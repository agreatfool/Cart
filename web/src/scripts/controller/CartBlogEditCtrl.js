'use strict';

/* global $, _, angular, CartUtility, CartConst */
module.exports = function($scope, $location, $anchorScroll, $routeParams, $dataService, $editorService, FileUploader) {
    CartUtility.log('CartBlogEditCtrl');

    $scope.postCategory = '';
    $scope.postTags = [];

    var postId = $routeParams.postId;
    var editorOptions = {
        postId: postId,
        postBaseUrl: CartUtility.getPureAbsUrlFromLocation($location),
        editElement: $('#markdown-edit'),
        previewElement: $('#markdown-preview'),
        titleElement: $('#markdown-post-title'),
        categoryElement: $('#markdown-post-category'),
        tagsIdentify: '#markdown-post-tags > span',
        tocIconElement: $('.markdown-toc-icon'),
        tocContentElement: $('.markdown-toc-content'),
        tocFirstLinksIdentify: '.markdown-toc-content > ol > li > a',
        topBtnElement: $('.page-to-top'),
        spinnerElement: $('#markdown-loading'),
        spinnerNameElement: $('.spinner-markdown-name')
    };
    $scope.aceEditor = $editorService.createEditor(editorOptions);

    $scope.toggleToc = function() {
        CartUtility.toggleToc($('.markdown-toc-icon'), $('.markdown-toc-content'));
    };

    // category related
    $scope.categoryInput = '';
    $scope.inputCategory = function(event) {
        event.preventDefault();
        var inputName = $scope.categoryInput.replace(/[<]br[^>]*[>]/gi, '');
        if (_.isEmpty(inputName)) {
            return; // empty input, ignore it
        }

        var category = $dataService.categorySearch(inputName);
        if (!_.isEmpty(category)) {
            // category already exists
            $scope.postCategory = category.pop(); // [searchedCategory].pop()
        } else {
            // category not found, create it
            $dataService.categoryCreate(inputName).then(function(data) { // data is category json
                $scope.postCategory = data;
            }, function() {
                CartUtility.notify('Error!', 'Error in creating new category: ' + inputName, 'error');
                $scope.categoryInput = '';
            });
        }

        CartUtility.focusEditor($scope.aceEditor);
    };

    // tag related
    $scope.tagInput = '';
    $scope.addPostTag = function(event) {
        event.preventDefault();
        var inputName = $scope.tagInput;
        if (_.isEmpty(inputName)) {
            return; // empty input, ignore it
        }

        // search current post tags
        var currentPostTagsIndex = -1;
        if (!_.isEmpty($scope.postTags)) {
            _.forEach($scope.postTags, function(tag, index) {
                if (tag.title === inputName) {
                    currentPostTagsIndex = index;
                }
            });
        }
        if (currentPostTagsIndex !== -1) {
            CartUtility.notify('Warning!', 'Tag with name "' + inputName + '" already exists in this post!', 'notice');
            return; // same tag already exists in post
        }

        var tag = $dataService.tagSearch(inputName);
        if (!_.isEmpty(tag)) {
            // tag already exists
            $scope.postTags.push(tag.pop()); // [searchedTag].pop()
        } else {
            // tag not found, create it
            $dataService.tagCreate(inputName).then(function(data) { // data is tag json
                $scope.postTags.push(data);
            }, function() {
                CartUtility.notify('Error!', 'Error in creating new tag: ' + inputName, 'error');
            });
        }

        $scope.tagInput = '';
        CartUtility.focusEditor($scope.aceEditor);
    };
    $scope.removePostTag = function(tagName) {
        if ($scope.postTags.length <= 0) {
            return; // post has not tag yet
        }

        var tagIndex = -1;
        _.forEach($scope.postTags, function(tag, index) {
            if (tag.title === tagName) {
                tagIndex = index;
            }
        });
        if (tagIndex === -1) {
            return; // not found
        }

        $scope.postTags.splice(tagIndex, 1);
        CartUtility.focusEditor($scope.aceEditor);
    };

    $dataService.postGetTmp($routeParams.postId).then(function(data) {
        if (data === false) {
            return; // post data not found
        }
        $scope.aceEditor.setValue(data.md, -1);
        $scope.postCategory = data.category;
        $scope.postTags = data.tags;
    });

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

    // file upload related logics
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
        editorOptions.spinnerNameElement.text('Uploading "' + name + '": ' + progress + '% ...');
    };
    var uploaderHideSpinner = function() {
        if (uploader.queue.length === 0 && !uploader.isUploading) {
            editorOptions.spinnerElement.hide();
            editorOptions.spinnerNameElement.text('');
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
            editorOptions.spinnerElement.show();
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