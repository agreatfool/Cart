'use strict';

/* global md5, CartUtility */
module.exports = function ($scope, $dataService) {
    CartUtility.log('CartProfileCtrl');

    $scope.avatar = '';
    $scope.profile = {};

    $dataService.profileGet().then(function(profileData) {
        $scope.avatar = 'http://www.gravatar.com/avatar/' + md5(profileData.email.toLowerCase()) + '?s=160';
        $scope.profile = profileData.profile;
    });
};