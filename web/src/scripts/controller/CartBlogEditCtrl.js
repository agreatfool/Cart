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
        $scope.categoryInput = $scope.categoryInput.replace(/[<]br[^>]*[>]/gi, '');
    };

    // tag related
    $scope.tagInput = '';
    $scope.addPostTag = function(event) {
        event.preventDefault();
        if (!_.isEmpty($scope.tagInput) && $scope.postTags.indexOf($scope.tagInput) === -1) {
            $scope.postTags.push($scope.tagInput);
        }
        $scope.tagInput = '';
    };
    $scope.removePostTag = function(tagName) {
        var tagIndex = $scope.postTags.indexOf(tagName);
        if (tagIndex === -1) {
            return;
        }
        $scope.postTags.splice(tagIndex, 1);
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