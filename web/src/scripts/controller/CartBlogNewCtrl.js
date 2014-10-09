'use strict';

/* global CartUtility */
module.exports = function ($scope, $location, $anchorScroll, $dataService, $editorService) {
    console.log('CartBlogNewCtrl');

    $scope.aceEditor = $editorService.createEditor('markdown-edit', 'markdown-preview', CartUtility.getPureAbsUrlFromLocation($location));

    $scope.toggleToc = CartUtility.toggleToc;

    $scope.$on('$routeChangeStart', function() {
        // anchor link logic
        var prevHash = $location.hash();
        $location.hash(CartUtility.escapeAnchorName(prevHash));
        $anchorScroll();
        $location.hash(prevHash);
    });
};