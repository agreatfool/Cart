'use strict';

/* global _, CartUtility, CartConst */
module.exports = function($http, $q, $cookies) {
    var masterUrls = ['master', 'new', 'update'];

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

    var isMaster = function() {
        return ($cookies.hasOwnProperty(CartConst.TOKEN_NAME) && $cookies[CartConst.TOKEN_NAME] !== '');
    };

    var isUrlAccessibleForUser = function(url) {
        var accessible = true;
        var rootPath = null;
        var split = url.split('/');
        _.forEach(split, function(element) {
            if (typeof element === 'string' && element !== '' && element !== null && rootPath === null) {
                rootPath = element;
            }
        });

        if (!isMaster() && masterUrls.indexOf(rootPath) !== -1) {
            accessible = false;
        }

        return accessible;
    };

    var logout = function() {
        var deferred = $q.defer();
        $http({
            method: "POST",
            url: '/api/logout',
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
        'getOauthUrl': getOauthUrl,
        'isMaster': isMaster,
        'isUrlAccessibleForUser': isUrlAccessibleForUser,
        'logout': logout
    };
};