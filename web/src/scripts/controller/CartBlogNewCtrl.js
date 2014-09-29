'use strict';

module.exports = function ($scope, $location, $dataService, $editorService) {
    console.log('CartBlogNewCtrl');

    $scope.aceEditor = $editorService.createEditor('markdown-edit', 'markdown-preview', $location.absUrl());
};