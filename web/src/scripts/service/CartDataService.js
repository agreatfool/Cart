'use strict';

/* global CartUtility */
module.exports = function($http, $q) {
    var posts = {};
    var categories = {};
    var tags = {};

    var getInitData = function() {
        var deferred = $q.defer();
        $http({
            method: "GET",
            url: '/api/index',
            headers: {"Content-type": "application/x-www-form-urlencoded"}
        }).success(function(result) {
            if (CartUtility.handleResponse(result)) {
                posts = result.message.posts;
                categories = result.message.categories;
                tags = result.message.tags;
                deferred.resolve(result.message);
            } else {
                deferred.reject();
            }
        });
        return CartUtility.spinShow(deferred.promise);
    };

    return {
        'getInitData': getInitData
    };
};