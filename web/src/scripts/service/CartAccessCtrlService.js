'use strict';

/* global CartUtility */
module.exports = function($http, $q, $cookies) {
    var token = '';

    var isBlogAuthed = function() {
        var deferred = $q.defer();
        $http({
            method: "GET",
            url: '/api/isauthed',
            headers: {"Content-type": "application/x-www-form-urlencoded"}
        }).success(function(result) {
            if (CartUtility.handleResponse(result)) {
                deferred.resolve(result.message);
            } else {
                deferred.reject();
            }
        });
        return CartUtility.spinShow(deferred.promise);
    };

    var getOauthUrl = function() {
        var deferred = $q.defer();
        $http({
            method: "GET",
            url: '/api/oauth2',
            headers: {"Content-type": "application/x-www-form-urlencoded"}
        }).success(function(result) {
            if (CartUtility.handleResponse(result)) {
                deferred.resolve(result.message);
            } else {
                deferred.reject();
            }
        });
        return CartUtility.spinShow(deferred.promise);
    };

    return {
        'isBlogAuthed': isBlogAuthed,
        'getOauthUrl': getOauthUrl
    };
};