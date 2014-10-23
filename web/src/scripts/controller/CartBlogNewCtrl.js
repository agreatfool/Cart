'use strict';

/* global _, CartUtility */
module.exports = function($scope, $location, $anchorScroll, $routeParams, $dataService, $editorService) {
    CartUtility.log('CartBlogNewCtrl');

    $scope.aceEditor = $editorService.createEditor('markdown-edit', 'markdown-preview', $routeParams.postId, CartUtility.getPureAbsUrlFromLocation($location));

    $scope.toggleToc = CartUtility.toggleToc;

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