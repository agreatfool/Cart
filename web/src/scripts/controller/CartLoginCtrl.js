'use strict';

/* global CartUtility */
module.exports = function ($scope, $window, $accessService) {
    CartUtility.log('CartLoginCtrl');

    $scope.startLoginProcess = function() {
        if ($accessService.isMaster()) {
            CartUtility.notify('REQ Failed', 'Already logged in!', 'error');
            return; // already login
        }
        $accessService.getLoginUrl().then(function(result) {
            $window.location.href = result.url;
        });
    };
};