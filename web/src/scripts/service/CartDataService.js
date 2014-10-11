'use strict';

/* global PouchDB, moment, CartUtility, CartConst */
module.exports = function($http, $q) {
    var db = new PouchDB('CartDatabase');

    //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
    //-* MODELS
    //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
    var posts = {};
    var categories = {};
    var tags = {};

    //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
    //-* DATA RELATED
    //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
    var getInitData = function() {
        var deferred = $q.defer();
        $http({
            method: "POST",
            url: '/api/init',
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

    //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
    //-* DB RELATED
    //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
    var dbSave = function(uuid, markdown) {
        markdown = {
            "md": markdown
        };
        var deferred = $q.defer();
        db.get(uuid)
        .then(function(doc) {
            return db.put(markdown, uuid, doc._rev); // old doc found, update it
        }, function(err) {
            if (typeof err === 'object' && err.status === 404) { // old doc not found, just create new
                return db.put(markdown, uuid);
            } else if (typeof err === 'object') {
                CartUtility.notify('Error', err.toString(), 'error');
                var sub = $q.defer();
                sub.resolve(false); // error encountered, resolve with false
                return sub.promise;
            }
        })
        .then(function(response) {
            if (response !== false) {
                deferred.resolve(true); // previous done with no error, resolve with true
            } else {
                deferred.resolve(false); // previous done with error, resolve with false
            }
        }, function(err) {
            CartUtility.notify('Error', err.toString(), 'error');
            deferred.resolve(false); // error, popup notification, resolve with false
        });
        return deferred.promise;
    };

    var dbFlush = function() {
        var deferred = $q.defer();
        PouchDB.destroy(CartConst.DB_NAME).then(function() {
            db = new PouchDB(CartConst.DB_NAME);
            deferred.resolve(true);
        }, function(err) {
            CartUtility.notify('Error', err.toString(), 'error');
            deferred.resolve(false);
        });
        return deferred.promise;
    };

    //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
    //-* POST RELATED
    //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
    var postSaveTmp = function(uuid, markdown) {
        dbSave(uuid, markdown).then(function(result) {
            if (false === result) {
                CartUtility.notify('Save', 'Failed in saving!', 'error');
            } else {
                CartUtility.notify('Save', 'Post saved!');
            }
        });
    };

    var postGetTmp = function(uuid) {
        var deferred = $q.defer();
        db.get(uuid).then(function(doc) {
            if (doc !== null && typeof doc === 'object' && doc.hasOwnProperty('md')) {
                deferred.resolve(doc.md);
            } else {
                deferred.resolve('');
            }
        }, function(err) {
            if (typeof err === 'object' && err.status === 404) {
                deferred.resolve('');
            } else {
                CartUtility.notify('Error', err.toString(), 'error');
                deferred.resolve(false);
            }
        });
        return deferred.promise;
    };

    // FIXME remove later
    global.db = db;
    global.dbSave = dbSave;
    global.postSaveTmp = postSaveTmp;
    global.postGetTmp = postGetTmp;

    return {
        'getInitData': getInitData,
        // post APIs
        'postSaveTmp': postSaveTmp
    };
};