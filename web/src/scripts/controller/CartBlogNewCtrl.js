'use strict';

/* global $, _, CartUtility */
module.exports = function($scope, $location, $anchorScroll, $routeParams, $dataService, $editorService) {
    CartUtility.log('CartBlogNewCtrl');


    $scope.toggleToc = CartUtility.toggleToc;
    $scope.aceEditor = $editorService.createEditor({
        postId: $routeParams.postId,
        postBaseUrl: CartUtility.getPureAbsUrlFromLocation($location),
        editElement: $('#markdown-edit'),
        previewElement: $('#markdown-preview'),
        titleElement: $('#markdown-post-title'),
        tocIconElement: $('.markdown-toc-icon'),
        tocContentElement: $('.markdown-toc-content'),
        tocFirstLinksIdentify: '.markdown-toc-content > ol > li > a',
        topBtnElement: $('.page-to-top'),
        spinnerElement: $('#markdown-loading'),
        spinnerNameElement: $('.spinner-markdown-name')
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