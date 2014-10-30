'use strict';

/* global $, _, uuid, PouchDB, moment, CartUtility, CartConst */
module.exports = function($http, $q) {
    var db = new PouchDB(CartConst.DB_NAME);

    //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
    //-* MODELS
    //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
    var posts = {};
    var categories = {};
    var tags = {};
    /**
     * Structure of temporarily saved post:
     * {
     *     "title": title string,
     *     "md": markdown string,
     *     "category": string,
     *     "tags": [string, ...],
     *     "created": timestamp,
     *     "updated": timestamp
     * }
     */

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
    //-* LOCAL POST RELATED
    //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
    var postSaveTmp = function(uuid, title, markdown, category, tags) {
        if (_.isUndefined(tags)) {
            tags = [];
        }

        var deferred = $q.defer();

        if (_.isUndefined(uuid) || _.isEmpty(uuid)) {
            CartUtility.notify('Error', 'Post uuid invalid!', 'error');
            deferred.resolve(false);
        } else if (_.isUndefined(title) || _.isEmpty(title)) {
            CartUtility.notify('Error', 'Post title invalid!', 'error');
            deferred.resolve(false);
        } else if (_.isUndefined(markdown) || _.isEmpty(markdown)) {
            CartUtility.notify('Error', 'Post markdown invalid!', 'error');
            deferred.resolve(false);
        } else if (_.isUndefined(category) || _.isEmpty(category)) {
            CartUtility.notify('Error', 'Post category invalid!', 'error');
            deferred.resolve(false);
        } else {
            db.get(uuid)
            .then(function(doc) {
                doc.title = title;
                doc.md = markdown;
                doc.category = category;
                doc.tags = tags;
                doc.updated = moment().unix();
                return db.put(doc, uuid, doc._rev); // old doc found, update it
            }, function(err) {
                if (typeof err === 'object' && err.status === 404) { // old doc not found, just create new
                    var doc = {
                        "title": title,
                        "md": markdown,
                        "category": category,
                        "tags": tags,
                        "created": moment().unix(),
                        "updated": moment().unix()
                    };
                    return db.put(doc, uuid);
                } else if (_.isObject(err)) {
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
        }

        return deferred.promise;
    };

    var postGetTmp = function(uuid) {
        var deferred = $q.defer();
        db.get(uuid).then(function(doc) {
            if (_.isNull(doc) || !_.isObject(doc) || !doc.hasOwnProperty('md')) {
                doc = false;
            }
            deferred.resolve(doc);
        }, function(err) {
            if (_.isObject(err) && err.status !== 404) {
                CartUtility.notify('Error', err.toString(), 'error');
            }
            deferred.resolve(false);
        });
        return deferred.promise;
    };

    var postRemoveTmp = function(uuid) {
        var deferred = $q.defer();
        db.get(uuid).then(function(doc) {
            if (!_.isNull(doc) && _.isObject(doc) && doc.hasOwnProperty('md')) {
                db.remove(doc._id, doc._rev).then(function() {
                    deferred.resolve(true);
                }, function(err) {
                    CartUtility.notify('Error', err.toString(), 'error');
                    deferred.resolve(false);
                });
            } else {
                deferred.resolve(false);
            }
        }, function(err) {
            if (_.isObject(err) && err.status !== 404) {
                CartUtility.notify('Error', err.toString(), 'error');
            }
            deferred.resolve(false);
        });
        return deferred.promise;
    };

    var postGetAllTmp = function() {
        var deferred = $q.defer();
        db.allDocs({ include_docs: true }).then(function(response) {
            if (response.total_rows <= 0) {
                deferred.resolve([]);
            } else {
                var docs = [];
                _.forEach(response.rows, function(row) {
                    docs.push(row.doc);
                });
                deferred.resolve(docs.reverse());
            }
        }, function(err) {
            CartUtility.notify('Error', err.toString(), 'error');
            deferred.resolve(false);
        });
        return deferred.promise;
    };

    var postRemoveAllTmp = function() {
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
    //-* CATEGORY RELATED
    //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
    var categoryCreate = function(categoryName) {
        var deferred = $q.defer();
        $http({
            method: "POST",
            url: '/api/category/create',
            data: $.param({
                "uuid": uuid.v4(),
                "name": categoryName
            }),
            headers: {"Content-type": "application/x-www-form-urlencoded"}
        }).success(function(result) {
            if (CartUtility.handleResponse(result)) {
                // TODO
                console.log(result);
                deferred.resolve(result.message);
            } else {
                deferred.reject();
            }
        });
        return CartUtility.spinShow(deferred.promise);
    };
    var categorySearch = function(categoryName) {

    };

    //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
    //-* TAG RELATED
    //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
    var tagCreate = function(tagName) {
        var deferred = $q.defer();
        $http({
            method: "POST",
            url: '/api/tag/create',
            data: $.param({
                "uuid": uuid.v4(),
                "name": tagName
            }),
            headers: {"Content-type": "application/x-www-form-urlencoded"}
        }).success(function(result) {
            if (CartUtility.handleResponse(result)) {
                // TODO
                console.log(result);
                deferred.resolve(result.message);
            } else {
                deferred.reject();
            }
        });
        return CartUtility.spinShow(deferred.promise);
    };
    var tagSearch = function(tagName) {

    };

    // FIXME reformat later
    var apis = {
        'getInitData': getInitData,
        // post APIs
        'postSaveTmp': postSaveTmp,
        'postGetTmp': postGetTmp,
        'postRemoveTmp': postRemoveTmp,
        'postGetAllTmp': postGetAllTmp,
        'postRemoveAllTmp': postRemoveAllTmp,
        // category APIs
        'categoryCreate': categoryCreate,
        'categorySearch': categorySearch,
        // tag APIs
        'tagCreate': tagCreate,
        'tagSearch': tagSearch
    };

    global.apis = apis;

    return apis;
};