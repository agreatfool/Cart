'use strict';

/* global _, CartUtility, CartConst */
module.exports = function($http, $q, $cookies) {
    var masterUrls = ['master', 'new', 'update'];

    var isBlogAuthed = function() {
        return CartUtility.request(
            'POST', $http, $q, '/api/isauthed', {}, function(data) {
                return data.message;
            }
        );
    };

    var getOauthUrl = function() {
        return CartUtility.request(
            'POST', $http, $q, '/api/oauth2', {}, function(data) {
                return data.message;
            }
        );
    };

    var isMaster = function() {
        return ($cookies.hasOwnProperty(CartConst.TOKEN_NAME) && $cookies[CartConst.TOKEN_NAME] !== '');
    };

    var isUrlAccessibleForUser = function(url) {
        var accessible = true;
        var rootPath = null;
        var split = url.split('/');
        _.forEach(split, function(element) {
            if (_.isString(element) && !_.isEmpty(element) && !_.isNull(element) && _.isNull(rootPath)) {
                rootPath = element;
            }
        });

        if (!isMaster() && masterUrls.indexOf(rootPath) !== -1) {
            accessible = false;
        }

        return accessible;
    };

    var getLoginUrl = function() {
        return CartUtility.request(
            'POST', $http, $q, '/api/login', {}, function(data) {
                return data.message;
            }
        );
    };

    var logout = function() {
        return CartUtility.request(
            'POST', $http, $q, '/api/logout', {}, function(data) {
                return data.message;
            }
        );
    };

    return {
        'isBlogAuthed': isBlogAuthed,
        'getOauthUrl': getOauthUrl,
        'isMaster': isMaster,
        'isUrlAccessibleForUser': isUrlAccessibleForUser,
        'getLoginUrl': getLoginUrl,
        'logout': logout
    };
};