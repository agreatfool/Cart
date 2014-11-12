'use strict';

/* global $, _, uuid, PouchDB, moment, CartUtility, CartConst */
module.exports = function($http, $q) {
    var db = new PouchDB(CartConst.DB_NAME);

    //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
    //-* MODELS
    //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
    var posts = {};
    /**
     * categories: {
     *     bbc3440b-6e9a-4e17-8c31-534f8f58784f: {
     *         created: 1414724441574,
     *         driveId: "0ByO96ydBQtM2RkwtZFBGb1ZFb2M",
     *         title: "first category",
     *         updated: 1414724441574,
     *         uuid: "bbc3440b-6e9a-4e17-8c31-534f8f58784f"
     *     },
     *     ...
     * }
     */
    var categories = {};
    /**
     * tags: {
     *     bbc3440b-6e9a-4e17-8c31-534f8f58784f: {
     *         created: 1414724441574,
     *         driveId: null,
     *         title: "first tag",
     *         updated: 1414724441574,
     *         uuid: "bbc3440b-6e9a-4e17-8c31-534f8f58784f"
     *     },
     *     ...
     * }
     */
    var tags = {};
    /**
     * Structure of temporarily saved post:
     * {
     *     "title": title string,
     *     "md": markdown string,
     *     "category": category structure described above,
     *     "tags": [tag structure described above, ...],
     *     "created": timestamp,
     *     "updated": timestamp
     * }
     */

    //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
    //-* DATA RELATED
    //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
    var getInitData = function() {
        return CartUtility.post(
            $http, $q, '/api/init', {}, function(data) {
                posts = data.message.posts;
                categories = data.message.categories;
                tags = data.message.tags;
                return data.message;
            }
        );
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
            CartUtility.notify('Error!', 'Post uuid empty or invalid!', 'error');
            deferred.resolve(false);
        } else if (_.isUndefined(title) || _.isEmpty(title)) {
            CartUtility.notify('Error!', 'Post title empty or invalid!', 'error');
            deferred.resolve(false);
        } else if (_.isUndefined(markdown) || _.isEmpty(markdown)) {
            CartUtility.notify('Error!', 'Post markdown empty or invalid!', 'error');
            deferred.resolve(false);
        } else if (_.isUndefined(category) || _.isEmpty(category)) {
            CartUtility.notify('Error!', 'Post category empty or invalid!', 'error');
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
                    CartUtility.notify('Error!', err.toString(), 'error');
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
                CartUtility.notify('Error!', err.toString(), 'error');
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
                CartUtility.notify('Error!', err.toString(), 'error');
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
                    CartUtility.notify('Error!', err.toString(), 'error');
                    deferred.resolve(false);
                });
            } else {
                deferred.resolve(false);
            }
        }, function(err) {
            if (_.isObject(err) && err.status !== 404) {
                CartUtility.notify('Error!', err.toString(), 'error');
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
            CartUtility.notify('Error!', err.toString(), 'error');
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
            CartUtility.notify('Error!', err.toString(), 'error');
            deferred.resolve(false);
        });
        return deferred.promise;
    };

    //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
    //-* CATEGORY RELATED
    //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
    var categoryCreate = function(categoryName) {
        return CartUtility.post(
            $http, $q, '/api/category/create', {
                "uuid": uuid.v4(),
                "name": categoryName
            }, function(data) {
                return data.message.category;
            }
        );
    };
    var categorySearch = function(categoryName, strict) {
        if (_.isUndefined(strict) || !_.isBoolean(strict)) {
            strict = true; // whether search with "strict mode" (all match), otherwise it will be "start with mode"
        }

        var found = _.filter(categories, function(category) {
            if (strict === true) {
                return category.title === categoryName;
            } else {
                return category.title.indexOf(categoryName) === 0;
            }
        });
        if (_.isUndefined(found)) {
            found = [];
        }

        return found;
    };

    //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
    //-* TAG RELATED
    //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
    var tagCreate = function(tagName) {
        return CartUtility.post(
            $http, $q, '/api/tag/create', {
                "uuid": uuid.v4(),
                "name": tagName
            }, function(data) {
                return data.message.tag;
            }
        );
    };
    var tagSearch = function(tagName, strict) {
        if (_.isUndefined(strict) || !_.isBoolean(strict)) {
            strict = true; // whether search with "strict mode" (all match), otherwise it will be "start with mode"
        }

        var found = _.filter(tags, function(tag) {
            if (strict === true) {
                return tag.title === tagName;
            } else {
                return tag.title.indexOf(tagName) === 0;
            }
        });
        if (_.isUndefined(found)) {
            found = [];
        }

        return found;
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