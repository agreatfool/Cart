'use strict';

/* global $, _, CartUtility */
module.exports = function($scope, $location, $anchorScroll, $routeParams, $dataService, $editorService) {
    CartUtility.log('CartBlogEditCtrl');

    $scope.postCategory = '';
    $scope.postTags = [];

    $scope.aceEditor = $editorService.createEditor({
        postId: $routeParams.postId,
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
    });

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
};