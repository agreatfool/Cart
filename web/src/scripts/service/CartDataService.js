'use strict';

/* global $, _, uuid, PouchDB, moment, CartUtility, CartConst */
module.exports = function($http, $q) {
    var db = new PouchDB(CartConst.DB_NAME);
    var htmlDb = new PouchDB(CartConst.HTML_DB_NAME);

    //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
    //-* MODELS
    //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
    /**
     * posts: {
     *     bbc3440b-6e9a-4e17-8c31-534f8f58784f: {
     *         "attachments": {
     *             027455b6-5ef3-4332-adfd-4b527ef589f2: {
     *                 "created": 1416373253,
     *                 "driveId": "0ByO96ydBQtM2SVBrbHhrb1VJcHM",
     *                 "title": "6f5ef307gw1emfk4cll1yj20fk4ua4lm.png",
     *                 "updated": 1416373253,
     *                 "uuid": "027455b6-5ef3-4332-adfd-4b527ef589f2"
     *             },
     *             ...
     *         },
     *         "category": "7207c5b5-c757-4013-9811-ff644fd0f8ed"
     *         "created": 1416374416886
     *         "driveId": "0ByO96ydBQtM2Q0ctdFVINEVPUkE"
     *         "tags": [bbc3440b-6e9a-4e17-8c31-534f8f58784f, ...]
     *         "title": "images"
     *         "updated": 1416374416886
     *         "uuid": "d16335ab-9ccb-4e9c-bb21-da28f5ee22e4"
     *     },
     *     ...
     * }
     */
    var posts = {};
    /**
     * categories: {
     *     bbc3440b-6e9a-4e17-8c31-534f8f58784f: {
     *         "created": 1414724441574,
     *         "driveId": "0ByO96ydBQtM2RkwtZFBGb1ZFb2M",
     *         "title": "first category",
     *         "updated": 1414724441574,
     *         "uuid": "bbc3440b-6e9a-4e17-8c31-534f8f58784f"
     *     },
     *     ...
     * }
     */
    var categories = {};
    /**
     * tags: {
     *     bbc3440b-6e9a-4e17-8c31-534f8f58784f: {
     *         "created": 1414724441574,
     *         "driveId": null,
     *         "title": "first tag",
     *         "updated": 1414724441574,
     *         "uuid": "bbc3440b-6e9a-4e17-8c31-534f8f58784f"
     *     },
     *     ...
     * }
     */
    var tags = {};
    /**
     * attachments are all attached in post structure:
     * attachment: {
     *     "created": 1414724441574,
     *     "driveId": null,
     *     "title": "6afb84b0gw1em6cfs353ij20cw2nydnv.png",
     *     "updated": 1414724441574,
     *     "uuid": "bbc3440b-6e9a-4e17-8c31-534f8f58784f"
     * }
     * Structure of temporarily saved post:
     * {
     *     "attachments": {attachment uuid: attachment structure described above},
     *     "title": "title string",
     *     "md": "markdown string",
     *     "category": category structure described above,
     *     "tags": {tag uuid: tag structure described above, ...},
     *     "created": 1414724441574,
     *     "updated": 1414724441574,
     *     "uuid": "bbc3440b-6e9a-4e17-8c31-534f8f58784f"
     * }
     */

    //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
    //-* LOCAL POST RELATED
    //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
    var postSaveTmp = function(uuid, title, markdown, category, tags, attachments) {
        if (_.isUndefined(tags)) {
            tags = {};
        }
        if (_.isUndefined(attachments)) {
            attachments = {};
        }

        var deferred = $q.defer();

        if (_.isUndefined(uuid) || _.isEmpty(uuid)) {
            CartUtility.notify('Error!', 'Post uuid empty or invalid!', 'error');
            deferred.reject();
        } else if (_.isUndefined(title) || _.isEmpty(title)) {
            CartUtility.notify('Error!', 'Post title empty or invalid!', 'error');
            deferred.reject();
        } else if (_.isUndefined(markdown) || _.isEmpty(markdown)) {
            CartUtility.notify('Error!', 'Post markdown empty or invalid!', 'error');
            deferred.reject();
        } else if (_.isUndefined(category) || _.isEmpty(category)) {
            CartUtility.notify('Error!', 'Post category empty or invalid!', 'error');
            deferred.reject();
        } else {
            db.get(uuid)
            .then(function(doc) {
                doc.title = title;
                doc.md = markdown;
                doc.category = category;
                doc.tags = tags;
                doc.attachments = attachments;
                doc.updated = CartUtility.getTime();
                return db.put(doc, uuid, doc._rev); // old doc found, update it
            }, function(err) {
                if (typeof err === 'object' && err.status === 404) { // old doc not found, just create new
                    var doc = {
                        "uuid": uuid,
                        "title": title,
                        "md": markdown,
                        "category": category,
                        "tags": tags,
                        "attachments": attachments,
                        "created": CartUtility.getTime(),
                        "updated": CartUtility.getTime()
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
                    deferred.resolve(); // previous done with no error, resolve with true
                } else {
                    deferred.reject(); // previous done with error, resolve with false
                }
            }, function(err) {
                CartUtility.notify('Error!', err.toString(), 'error');
                deferred.reject(err); // error, popup notification, resolve with false
            });
        }

        return deferred.promise;
    };

    var postGetTmp = function(uuid) {
        var deferred = $q.defer();
        db.get(uuid).then(function(doc) {
            if (_.isNull(doc) || !_.isObject(doc) || !doc.hasOwnProperty('md')) {
                deferred.reject();
            } else {
                deferred.resolve(doc);
            }
        }, function(err) {
            if (_.isObject(err) && err.status !== 404) {
                CartUtility.notify('Error!', err.toString(), 'error');
            }
            deferred.reject(err);
        });
        return deferred.promise;
    };

    var postRemoveTmp = function(uuid) {
        var deferred = $q.defer();
        db.get(uuid).then(function(doc) {
            if (!_.isNull(doc) && _.isObject(doc) && doc.hasOwnProperty('md')) {
                db.remove(doc._id, doc._rev).then(function() {
                    deferred.resolve();
                }, function(err) {
                    CartUtility.notify('Error!', err.toString(), 'error');
                    deferred.reject();
                });
            } else {
                deferred.reject();
            }
        }, function(err) {
            if (_.isObject(err) && err.status !== 404) {
                CartUtility.notify('Error!', err.toString(), 'error');
            }
            deferred.reject(err);
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
            deferred.reject(err);
        });
        return deferred.promise;
    };

    var postRemoveAllTmp = function() {
        var deferred = $q.defer();
        PouchDB.destroy(CartConst.DB_NAME).then(function() {
            db = new PouchDB(CartConst.DB_NAME);
            deferred.resolve();
        }, function(err) {
            CartUtility.notify('Error!', err.toString(), 'error');
            deferred.reject(err);
        });
        return deferred.promise;
    };

    //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
    //-* HTML RELATED
    //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
    var postSaveHtml = function(uuid, html, updated) {
        var deferred = $q.defer();

        if (_.isUndefined(uuid) || _.isEmpty(uuid)) {
            CartUtility.notify('Error!', 'Html uuid empty or invalid!', 'error');
            deferred.reject();
        } else if (_.isUndefined(html) || _.isEmpty(html)) {
            CartUtility.notify('Error!', 'Html html empty or invalid!', 'error');
            deferred.reject();
        } else if (_.isUndefined(updated) || _.isEmpty(updated)) {
            CartUtility.notify('Error!', 'Html updated empty or invalid!', 'error');
            deferred.reject();
        } else {
            htmlDb.get(uuid)
                .then(function(doc) {
                    doc.html = html;
                    doc.updated = updated;
                    return htmlDb.put(doc, uuid, doc._rev); // old doc found, update it
                }, function(err) {
                    if (typeof err === 'object' && err.status === 404) { // old doc not found, just create new
                        var doc = {
                            "uuid": uuid,
                            "html": html,
                            "updated": updated
                        };
                        return htmlDb.put(doc, uuid);
                    } else if (_.isObject(err)) {
                        CartUtility.notify('Error!', err.toString(), 'error');
                        var sub = $q.defer();
                        sub.resolve(false); // error encountered, resolve with false
                        return sub.promise;
                    }
                })
                .then(function(response) {
                    if (response !== false) {
                        deferred.resolve(); // previous done with no error, resolve with true
                    } else {
                        deferred.reject(); // previous done with error, resolve with false
                    }
                }, function(err) {
                    CartUtility.notify('Error!', err.toString(), 'error');
                    deferred.reject(err); // error, popup notification, resolve with false
                });
        }

        return deferred.promise;
    };

    var postGetHtml = function(uuid) {
        var deferred = $q.defer();
        htmlDb.get(uuid).then(function(doc) {
            if (_.isNull(doc) || !_.isObject(doc)) {
                deferred.reject();
            } else {
                deferred.resolve(doc);
            }
        }, function(err) {
            if (_.isObject(err) && err.status !== 404) {
                CartUtility.notify('Error!', err.toString(), 'error');
            }
            deferred.reject(err);
        });
        return deferred.promise;
    };

    var postRemoveHtml = function(uuid) {
        var deferred = $q.defer();
        htmlDb.get(uuid).then(function(doc) {
            if (!_.isNull(doc) && _.isObject(doc)) {
                db.remove(doc._id, doc._rev).then(function() {
                    deferred.resolve();
                }, function(err) {
                    CartUtility.notify('Error!', err.toString(), 'error');
                    deferred.reject();
                });
            } else {
                deferred.reject();
            }
        }, function(err) {
            if (_.isObject(err) && err.status !== 404) {
                CartUtility.notify('Error!', err.toString(), 'error');
            }
            deferred.reject(err);
        });
        return deferred.promise;
    };

    var postRemoveAllHtml = function() {
        var deferred = $q.defer();
        PouchDB.destroy(CartConst.HTML_DB_NAME).then(function() {
            db = new PouchDB(CartConst.HTML_DB_NAME);
            deferred.resolve();
        }, function(err) {
            CartUtility.notify('Error!', err.toString(), 'error');
            deferred.reject(err);
        });
        return deferred.promise;
    };

    //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
    //-* POST RELATED
    //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
    var postSearchLocalById = function(uuid) {
        var post = null;

        if (posts.hasOwnProperty(uuid)) {
            post = posts[uuid];
        }

        return post;
    };
    var postSearch = function(options) { // serach by page
        /**
         * {
         *     "category": categoryName|uuid,
         *     "tags": [tagName|uuid, tagName|uuid, ...],
         *     "year": timestamp,
         *     "month": timestamp,
         *     "day": timestamp,
         *     "isUuidSearch": boolean,
         *     "pageNumber": int
         * }
         */
        if (!_.isObject(options)) {
            options = {};
        }
        if (!_.isBoolean(options.isUuidSearch)) {
            options.isUuidSearch = false;
        }
        if (!_.isNumber(options.pageNumber)) {
            options.pageNumber = 1;
        } else {
            options.pageNumber = parseInt(options.pageNumber);
        }

        var start = [];
        var end = [];

        if (options.hasOwnProperty('year')) {
            start.push(CartUtility.parseUnixYearStartTimestamp(options.year));
            end.push(CartUtility.parseUnixYearEndTimestamp(options.year));
        }
        if (options.hasOwnProperty('month')) {
            start.push(CartUtility.parseUnixDateStartTimestamp(options.month));
            end.push(CartUtility.parseUnixDateEndTimestamp(options.month));
        }
        if (options.hasOwnProperty('day')) {
            start.push(CartUtility.parseUnixDayStartTimestamp(options.day));
            end.push(CartUtility.parseUnixDayEndTimestamp(options.day));
        }
        if (start.length > 0) {
            start = _.max(start, function(item) { return item; });
            if (!_.isNumber(start)) {
                CartUtility.notify('Error!', 'Start time parsed is invalid: ' + start, 'error');
            }
        } else {
            start = 0;
        }
        if (end.length > 0) {
            end = _.min(end, function(item) { return item; });
            if (!_.isNumber(end)) {
                CartUtility.notify('Error!', 'End time parsed is invalid: ' + end, 'error');
            }
        } else {
            end = 2147483647;
        }
        delete options.year; delete options.month; delete options.day;
        options.start = start;
        options.end = end;

        return CartUtility.post(
            $http, $q, '/api/post/page', options, function(data) {
                _.forEach(data.message.posts, function(post, uuid) {
                    posts[uuid] = post;
                });
                _.forEach(data.message.categories, function(category, uuid) {
                    categories[uuid] = category;
                });
                _.forEach(data.message.tags, function(tag, uuid) {
                    tags[uuid] = tag;
                });
                return data.message;
            }
        );
    };
    var postUpload = function(post) { // post structure is "Structure of temporarily saved post"
        return CartUtility.post(
            $http, $q, '/api/post/save', {
                "postId": post.uuid,
                "markdown": CartUtility.generateMdHTMLHeader(post) + post.md
            }, function(data) {
                postRemoveTmp(post.uuid);
                posts[post.uuid] = data.message.post;
                return data.message;
            }
        );
    };
    var postRemove = function(uuid) {
        return CartUtility.post(
            $http, $q, '/api/post/remove', {
                "postId": uuid
            }, function(data) {
                postRemoveTmp(uuid);
                delete posts[uuid];
                return data.message;
            }
        );
    };

    //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
    //-* CATEGORY RELATED
    //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
    var categoryGetAll = function() {
        return CartUtility.post(
            $http, $q, '/api/category/all', {}, function(data) {
                categories = data.message.categories.list;
                return categories;
            }
        );
    };
    var categoryCreate = function(categoryName) {
        return CartUtility.post(
            $http, $q, '/api/category/create', {
                "uuid": uuid.v4(),
                "name": categoryName
            }, function(data) {
                var category = data.message.category;
                categories[category.uuid] = category;
                return category;
            }
        );
    };
    var categoryUpdate = function(category) {
        var deferred = $q.defer();

        var target = categorySearchLocalById(category.uuid);
        if (_.isNull(target)) {
            CartUtility.log('Target local category data not found with input category: ' + JSON.stringify(category), 'DataService::categoryUpdate');
            deferred.reject();
        }

        var foundWithSameName = _.filter(categories, function(localCategory) {
            return localCategory.title === category.title;
        });
        if (_.isArray(foundWithSameName) && foundWithSameName.length > 0) {
            CartUtility.notify('Error!', 'Target category name has already been occupied: ' + category.title, 'error');
            deferred.reject();
        }

        category.updated = CartUtility.getTime();
        categories[category.uuid] = category;

        // FIXME update category with remote server
        deferred.resolve(category);

        return deferred.future;
    };
    var categoryUpdateTime = function(category) {
        var target = categorySearchLocalById(category.uuid);
        if (_.isNull(target)) {
            CartUtility.log('Target local category data not found with input category: ' + JSON.stringify(category), 'DataService::categoryUpdateTime');
            return false;
        }

        category.updated = CartUtility.getTime();
        target.updated = CartUtility.getTime();
        categories[target.uuid] = target;

        return category;
    };
    var categorySearchLocalById = function(uuid) {
        var found = _.filter(categories, function(category) {
            return category.uuid === uuid;
        });
        if (_.isUndefined(found)) {
            found = null;
        } else {
            found = found.pop();
        }
        return found;
    };
    var categorySearchLocal = function(categoryName, strict) {
        strict = _.isBoolean(strict) ? strict : true; // whether search with "strict mode" (all match), otherwise it will be "start with mode"

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
    var tagGetAll = function() {
        return CartUtility.post(
            $http, $q, '/api/tag/all', {}, function(data) {
                tags = data.message.tags.list;
                return tags;
            }
        );
    };
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
    var tagUpdate = function(tag) {
        var deferred = $q.defer();

        var target = tagSearchLocalById(tag.uuid);
        if (_.isNull(target)) {
            CartUtility.log('Target local tag data not found with input category: ' + JSON.stringify(tag), 'DataService::tagUpdate');
            deferred.reject();
        }

        var foundWithSameName = _.filter(tags, function(localTag) {
            return localTag.title === tag.title;
        });
        if (_.isArray(foundWithSameName) && foundWithSameName.length > 0) {
            CartUtility.notify('Error!', 'Target tag name has already been occupied: ' + tag.title, 'error');
            deferred.reject();
        }

        tag.updated = CartUtility.getTime();
        tags[tag.uuid] = tag;

        // FIXME update tag with remote server
        deferred.resolve(tag);

        return deferred.future;
    };
    var tagUpdateTime = function(tag) {
        var target = tagSearchLocalById(tag.uuid);
        if (_.isNull(target)) {
            CartUtility.log('Target local tag data not found with input tag: ' + JSON.stringify(tag), 'DataService::tagUpdateTime');
            return false;
        }

        tag.updated = CartUtility.getTime();
        target.updated = CartUtility.getTime();
        tags[target.uuid] = target;

        return tag;
    };
    var tagSearchLocalById = function(uuid) {
        var found = _.filter(tags, function(tag) {
            return tag.uuid === uuid;
        });
        if (_.isUndefined(found)) {
            found = null;
        } else {
            found = found.pop();
        }
        return found;
    };
    var tagSearchLocal = function(tagName, strict) {
        strict = _.isBoolean(strict) ? strict : true; // whether search with "strict mode" (all match), otherwise it will be "start with mode"

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
    // FIXME 添加接口根据categories和tags id来查询本地信息，有的话返回，没的话则从服务器查询

    // FIXME reformat later
    var apis = {
        // local post APIs
        'postSaveTmp': postSaveTmp,
        'postGetTmp': postGetTmp,
        'postRemoveTmp': postRemoveTmp,
        'postGetAllTmp': postGetAllTmp,
        'postRemoveAllTmp': postRemoveAllTmp,
        // html APIs
        'postSaveHtml': postSaveHtml,
        'postGetHtml': postGetHtml,
        'postRemoveHtml': postRemoveHtml,
        'postRemoveAllHtml': postRemoveAllHtml,
        // post APIs
        'postSearchLocalById': postSearchLocalById,
        'postSearch': postSearch,
        'postUpload': postUpload,
        'postRemove': postRemove,
        // category APIs
        'categoryGetAll': categoryGetAll,
        'categoryCreate': categoryCreate,
        'categoryUpdate': categoryUpdate,
        'categoryUpdateTime': categoryUpdateTime,
        "categorySearchLocalById": categorySearchLocalById,
        "categorySearchLocal": categorySearchLocal,
        // tag APIs
        'tagGetAll': tagGetAll,
        'tagCreate': tagCreate,
        'tagUpdate': tagUpdate,
        'tagUpdateTime': tagUpdateTime,
        "tagSearchLocalById": tagSearchLocalById,
        "tagSearchLocal": tagSearchLocal
    };

    global.apis = apis;

    return apis;
};