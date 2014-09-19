'use strict';

module.exports = function ($scope, $location, $service) {
    console.log('CartOauthCtrl');

    $scope.hasBeenInited = false;

    $service.isBlogAuthed().then(function(result) {
        if (result.isAuthed) {
            $location.url('/master');
        } else {
            $scope.hasBeenInited = true;
        }
    });
};