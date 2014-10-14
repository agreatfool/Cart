'use strict';

/* global CartUtility */
module.exports = function ($scope, $location, $accessService) {
    CartUtility.log('CartOauthCtrl');

    $scope.hasBeenInited = false;

    $scope.startOauthProcess = function() {
        $accessService.getOauthUrl().then(function(result) {
            window.location.href = result.url;
        });
    };

    $accessService.isBlogAuthed().then(function(result) {
        var isMaster = $accessService.isMaster();
        if (result.isAuthed && isMaster) {
            $location.url('/master');
        } else if (result.isAuthed && !isMaster) {
            $location.url('/login');
        } else {
            $scope.hasBeenInited = true;
        }
    });
};