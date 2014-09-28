'use strict';

module.exports = function ($scope, $dataService, $editorService) {
    console.log('CartBlogNewCtrl');

    $scope.aceEditor = $editorService.createEditor();
};