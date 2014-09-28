'use strict';

module.exports = function ($scope, $dataService, $aceService) {
    console.log('CartBlogNewCtrl');

    $scope.aceEditor = $aceService.createEditor();
};