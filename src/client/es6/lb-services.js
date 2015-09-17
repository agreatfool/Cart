(function(window, angular, undefined) {'use strict';

var urlBase = "/api";
var authHeader = 'authorization';

/**
 * @ngdoc overview
 * @name lbServices
 * @module
 * @description
 *
 * The `lbServices` module provides services for interacting with
 * the models exposed by the LoopBack server via the REST API.
 *
 */
var module = angular.module("lbServices", ['ngResource']);

/**
 * @ngdoc object
 * @name lbServices.CartPost
 * @header lbServices.CartPost
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `CartPost` model.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
module.factory(
  "CartPost",
  ['LoopBackResource', 'LoopBackAuth', '$injector', function(Resource, LoopBackAuth, $injector) {
    var R = Resource(
      urlBase + "/CartPosts/:id",
      { 'id': '@id' },
      {

        // INTERNAL. Use CartPost.cartTags.findById() instead.
        "prototype$__findById__cartTags": {
          params: {
          'fk': '@fk'
          },
          url: urlBase + "/CartPosts/:id/cartTags/:fk",
          method: "GET"
        },

        // INTERNAL. Use CartPost.cartTags.destroyById() instead.
        "prototype$__destroyById__cartTags": {
          params: {
          'fk': '@fk'
          },
          url: urlBase + "/CartPosts/:id/cartTags/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use CartPost.cartTags.updateById() instead.
        "prototype$__updateById__cartTags": {
          params: {
          'fk': '@fk'
          },
          url: urlBase + "/CartPosts/:id/cartTags/:fk",
          method: "PUT"
        },

        // INTERNAL. Use CartPost.cartCategory() instead.
        "prototype$__get__cartCategory": {
          url: urlBase + "/CartPosts/:id/cartCategory",
          method: "GET"
        },

        // INTERNAL. Use CartPost.cartAttachments.findById() instead.
        "prototype$__findById__cartAttachments": {
          params: {
          'fk': '@fk'
          },
          url: urlBase + "/CartPosts/:id/cartAttachments/:fk",
          method: "GET"
        },

        // INTERNAL. Use CartPost.cartAttachments.destroyById() instead.
        "prototype$__destroyById__cartAttachments": {
          params: {
          'fk': '@fk'
          },
          url: urlBase + "/CartPosts/:id/cartAttachments/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use CartPost.cartAttachments.updateById() instead.
        "prototype$__updateById__cartAttachments": {
          params: {
          'fk': '@fk'
          },
          url: urlBase + "/CartPosts/:id/cartAttachments/:fk",
          method: "PUT"
        },

        // INTERNAL. Use CartPost.cartTags() instead.
        "prototype$__get__cartTags": {
          isArray: true,
          url: urlBase + "/CartPosts/:id/cartTags",
          method: "GET"
        },

        // INTERNAL. Use CartPost.cartTags.create() instead.
        "prototype$__create__cartTags": {
          url: urlBase + "/CartPosts/:id/cartTags",
          method: "POST"
        },

        // INTERNAL. Use CartPost.cartTags.destroyAll() instead.
        "prototype$__delete__cartTags": {
          url: urlBase + "/CartPosts/:id/cartTags",
          method: "DELETE"
        },

        // INTERNAL. Use CartPost.cartTags.count() instead.
        "prototype$__count__cartTags": {
          url: urlBase + "/CartPosts/:id/cartTags/count",
          method: "GET"
        },

        // INTERNAL. Use CartPost.cartAttachments() instead.
        "prototype$__get__cartAttachments": {
          isArray: true,
          url: urlBase + "/CartPosts/:id/cartAttachments",
          method: "GET"
        },

        // INTERNAL. Use CartPost.cartAttachments.create() instead.
        "prototype$__create__cartAttachments": {
          url: urlBase + "/CartPosts/:id/cartAttachments",
          method: "POST"
        },

        // INTERNAL. Use CartPost.cartAttachments.destroyAll() instead.
        "prototype$__delete__cartAttachments": {
          url: urlBase + "/CartPosts/:id/cartAttachments",
          method: "DELETE"
        },

        // INTERNAL. Use CartPost.cartAttachments.count() instead.
        "prototype$__count__cartAttachments": {
          url: urlBase + "/CartPosts/:id/cartAttachments/count",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartPost#create
         * @methodOf lbServices.CartPost
         *
         * @description
         *
         * Create a new instance of the model and persist it into the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *   This method does not accept any parameters.
         *   Supply an empty object or omit this argument altogether.
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartPost` object.)
         * </em>
         */
        "create": {
          url: urlBase + "/CartPosts",
          method: "POST"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartPost#createMany
         * @methodOf lbServices.CartPost
         *
         * @description
         *
         * Create a new instance of the model and persist it into the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *   This method does not accept any parameters.
         *   Supply an empty object or omit this argument altogether.
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Array.<Object>,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Array.<Object>} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartPost` object.)
         * </em>
         */
        "createMany": {
          isArray: true,
          url: urlBase + "/CartPosts",
          method: "POST"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartPost#upsert
         * @methodOf lbServices.CartPost
         *
         * @description
         *
         * Update an existing model instance or insert a new one into the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *   This method does not accept any parameters.
         *   Supply an empty object or omit this argument altogether.
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartPost` object.)
         * </em>
         */
        "upsert": {
          url: urlBase + "/CartPosts",
          method: "PUT"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartPost#exists
         * @methodOf lbServices.CartPost
         *
         * @description
         *
         * Check whether a model instance exists in the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * Data properties:
         *
         *  - `exists` – `{boolean=}` - 
         */
        "exists": {
          url: urlBase + "/CartPosts/:id/exists",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartPost#findById
         * @methodOf lbServices.CartPost
         *
         * @description
         *
         * Find a model instance by id from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         *  - `filter` – `{object=}` - Filter defining fields and include
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartPost` object.)
         * </em>
         */
        "findById": {
          url: urlBase + "/CartPosts/:id",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartPost#find
         * @methodOf lbServices.CartPost
         *
         * @description
         *
         * Find all instances of the model matched by filter from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit
         *
         * @param {function(Array.<Object>,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Array.<Object>} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartPost` object.)
         * </em>
         */
        "find": {
          isArray: true,
          url: urlBase + "/CartPosts",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartPost#findOne
         * @methodOf lbServices.CartPost
         *
         * @description
         *
         * Find first instance of the model matched by filter from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartPost` object.)
         * </em>
         */
        "findOne": {
          url: urlBase + "/CartPosts/findOne",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartPost#updateAll
         * @methodOf lbServices.CartPost
         *
         * @description
         *
         * Update instances of the model matched by where from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `where` – `{object=}` - Criteria to match model instances
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        "updateAll": {
          url: urlBase + "/CartPosts/update",
          method: "POST"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartPost#deleteById
         * @methodOf lbServices.CartPost
         *
         * @description
         *
         * Delete a model instance by id from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        "deleteById": {
          url: urlBase + "/CartPosts/:id",
          method: "DELETE"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartPost#count
         * @methodOf lbServices.CartPost
         *
         * @description
         *
         * Count instances of the model matched by where from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `where` – `{object=}` - Criteria to match model instances
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * Data properties:
         *
         *  - `count` – `{number=}` - 
         */
        "count": {
          url: urlBase + "/CartPosts/count",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartPost#prototype$updateAttributes
         * @methodOf lbServices.CartPost
         *
         * @description
         *
         * Update attributes for a model instance and persist it into the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartPost` object.)
         * </em>
         */
        "prototype$updateAttributes": {
          url: urlBase + "/CartPosts/:id",
          method: "PUT"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartPost#createChangeStream
         * @methodOf lbServices.CartPost
         *
         * @description
         *
         * Create a change stream.
         *
         * @param {Object=} parameters Request parameters.
         *
         *   This method does not accept any parameters.
         *   Supply an empty object or omit this argument altogether.
         *
         * @param {Object} postData Request data.
         *
         *  - `options` – `{object=}` - 
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * Data properties:
         *
         *  - `changes` – `{ReadableStream=}` - 
         */
        "createChangeStream": {
          url: urlBase + "/CartPosts/change-stream",
          method: "POST"
        },

        // INTERNAL. Use CartTag.cartPosts.findById() instead.
        "::findById::CartTag::cartPosts": {
          params: {
          'fk': '@fk'
          },
          url: urlBase + "/CartTags/:id/cartPosts/:fk",
          method: "GET"
        },

        // INTERNAL. Use CartTag.cartPosts.destroyById() instead.
        "::destroyById::CartTag::cartPosts": {
          params: {
          'fk': '@fk'
          },
          url: urlBase + "/CartTags/:id/cartPosts/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use CartTag.cartPosts.updateById() instead.
        "::updateById::CartTag::cartPosts": {
          params: {
          'fk': '@fk'
          },
          url: urlBase + "/CartTags/:id/cartPosts/:fk",
          method: "PUT"
        },

        // INTERNAL. Use CartTag.cartPosts() instead.
        "::get::CartTag::cartPosts": {
          isArray: true,
          url: urlBase + "/CartTags/:id/cartPosts",
          method: "GET"
        },

        // INTERNAL. Use CartTag.cartPosts.create() instead.
        "::create::CartTag::cartPosts": {
          url: urlBase + "/CartTags/:id/cartPosts",
          method: "POST"
        },

        // INTERNAL. Use CartTag.cartPosts.createMany() instead.
        "::createMany::CartTag::cartPosts": {
          isArray: true,
          url: urlBase + "/CartTags/:id/cartPosts",
          method: "POST"
        },

        // INTERNAL. Use CartTag.cartPosts.destroyAll() instead.
        "::delete::CartTag::cartPosts": {
          url: urlBase + "/CartTags/:id/cartPosts",
          method: "DELETE"
        },

        // INTERNAL. Use CartTag.cartPosts.count() instead.
        "::count::CartTag::cartPosts": {
          url: urlBase + "/CartTags/:id/cartPosts/count",
          method: "GET"
        },

        // INTERNAL. Use CartCategory.cartPosts.findById() instead.
        "::findById::CartCategory::cartPosts": {
          params: {
          'fk': '@fk'
          },
          url: urlBase + "/CartCategories/:id/cartPosts/:fk",
          method: "GET"
        },

        // INTERNAL. Use CartCategory.cartPosts.destroyById() instead.
        "::destroyById::CartCategory::cartPosts": {
          params: {
          'fk': '@fk'
          },
          url: urlBase + "/CartCategories/:id/cartPosts/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use CartCategory.cartPosts.updateById() instead.
        "::updateById::CartCategory::cartPosts": {
          params: {
          'fk': '@fk'
          },
          url: urlBase + "/CartCategories/:id/cartPosts/:fk",
          method: "PUT"
        },

        // INTERNAL. Use CartCategory.cartPosts() instead.
        "::get::CartCategory::cartPosts": {
          isArray: true,
          url: urlBase + "/CartCategories/:id/cartPosts",
          method: "GET"
        },

        // INTERNAL. Use CartCategory.cartPosts.create() instead.
        "::create::CartCategory::cartPosts": {
          url: urlBase + "/CartCategories/:id/cartPosts",
          method: "POST"
        },

        // INTERNAL. Use CartCategory.cartPosts.createMany() instead.
        "::createMany::CartCategory::cartPosts": {
          isArray: true,
          url: urlBase + "/CartCategories/:id/cartPosts",
          method: "POST"
        },

        // INTERNAL. Use CartCategory.cartPosts.destroyAll() instead.
        "::delete::CartCategory::cartPosts": {
          url: urlBase + "/CartCategories/:id/cartPosts",
          method: "DELETE"
        },

        // INTERNAL. Use CartCategory.cartPosts.count() instead.
        "::count::CartCategory::cartPosts": {
          url: urlBase + "/CartCategories/:id/cartPosts/count",
          method: "GET"
        },

        // INTERNAL. Use CartAttachment.cartPosts.findById() instead.
        "::findById::CartAttachment::cartPosts": {
          params: {
          'fk': '@fk'
          },
          url: urlBase + "/CartAttachments/:id/cartPosts/:fk",
          method: "GET"
        },

        // INTERNAL. Use CartAttachment.cartPosts.destroyById() instead.
        "::destroyById::CartAttachment::cartPosts": {
          params: {
          'fk': '@fk'
          },
          url: urlBase + "/CartAttachments/:id/cartPosts/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use CartAttachment.cartPosts.updateById() instead.
        "::updateById::CartAttachment::cartPosts": {
          params: {
          'fk': '@fk'
          },
          url: urlBase + "/CartAttachments/:id/cartPosts/:fk",
          method: "PUT"
        },

        // INTERNAL. Use CartAttachment.cartPosts() instead.
        "::get::CartAttachment::cartPosts": {
          isArray: true,
          url: urlBase + "/CartAttachments/:id/cartPosts",
          method: "GET"
        },

        // INTERNAL. Use CartAttachment.cartPosts.create() instead.
        "::create::CartAttachment::cartPosts": {
          url: urlBase + "/CartAttachments/:id/cartPosts",
          method: "POST"
        },

        // INTERNAL. Use CartAttachment.cartPosts.createMany() instead.
        "::createMany::CartAttachment::cartPosts": {
          isArray: true,
          url: urlBase + "/CartAttachments/:id/cartPosts",
          method: "POST"
        },

        // INTERNAL. Use CartAttachment.cartPosts.destroyAll() instead.
        "::delete::CartAttachment::cartPosts": {
          url: urlBase + "/CartAttachments/:id/cartPosts",
          method: "DELETE"
        },

        // INTERNAL. Use CartAttachment.cartPosts.count() instead.
        "::count::CartAttachment::cartPosts": {
          url: urlBase + "/CartAttachments/:id/cartPosts/count",
          method: "GET"
        },
      }
    );



        /**
         * @ngdoc method
         * @name lbServices.CartPost#updateOrCreate
         * @methodOf lbServices.CartPost
         *
         * @description
         *
         * Update an existing model instance or insert a new one into the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *   This method does not accept any parameters.
         *   Supply an empty object or omit this argument altogether.
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartPost` object.)
         * </em>
         */
        R["updateOrCreate"] = R["upsert"];

        /**
         * @ngdoc method
         * @name lbServices.CartPost#update
         * @methodOf lbServices.CartPost
         *
         * @description
         *
         * Update instances of the model matched by where from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `where` – `{object=}` - Criteria to match model instances
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        R["update"] = R["updateAll"];

        /**
         * @ngdoc method
         * @name lbServices.CartPost#destroyById
         * @methodOf lbServices.CartPost
         *
         * @description
         *
         * Delete a model instance by id from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        R["destroyById"] = R["deleteById"];

        /**
         * @ngdoc method
         * @name lbServices.CartPost#removeById
         * @methodOf lbServices.CartPost
         *
         * @description
         *
         * Delete a model instance by id from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        R["removeById"] = R["deleteById"];


    /**
    * @ngdoc property
    * @name lbServices.CartPost#modelName
    * @propertyOf lbServices.CartPost
    * @description
    * The name of the model represented by this $resource,
    * i.e. `CartPost`.
    */
    R.modelName = "CartPost";

    /**
     * @ngdoc object
     * @name lbServices.CartPost.cartTags
     * @header lbServices.CartPost.cartTags
     * @object
     * @description
     *
     * The object `CartPost.cartTags` groups methods
     * manipulating `CartTag` instances related to `CartPost`.
     *
     * Call {@link lbServices.CartPost#cartTags CartPost.cartTags()}
     * to query all related instances.
     */


        /**
         * @ngdoc method
         * @name lbServices.CartPost#cartTags
         * @methodOf lbServices.CartPost
         *
         * @description
         *
         * Queries cartTags of CartPost.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `filter` – `{object=}` - 
         *
         * @param {function(Array.<Object>,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Array.<Object>} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartTag` object.)
         * </em>
         */
        R.cartTags = function() {
          var TargetResource = $injector.get("CartTag");
          var action = TargetResource["::get::CartPost::cartTags"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.CartPost.cartTags#count
         * @methodOf lbServices.CartPost.cartTags
         *
         * @description
         *
         * Counts cartTags of CartPost.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `where` – `{object=}` - Criteria to match model instances
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * Data properties:
         *
         *  - `count` – `{number=}` - 
         */
        R.cartTags.count = function() {
          var TargetResource = $injector.get("CartTag");
          var action = TargetResource["::count::CartPost::cartTags"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.CartPost.cartTags#create
         * @methodOf lbServices.CartPost.cartTags
         *
         * @description
         *
         * Creates a new instance in cartTags of this model.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartTag` object.)
         * </em>
         */
        R.cartTags.create = function() {
          var TargetResource = $injector.get("CartTag");
          var action = TargetResource["::create::CartPost::cartTags"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.CartPost.cartTags#createMany
         * @methodOf lbServices.CartPost.cartTags
         *
         * @description
         *
         * Creates a new instance in cartTags of this model.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Array.<Object>,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Array.<Object>} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartTag` object.)
         * </em>
         */
        R.cartTags.createMany = function() {
          var TargetResource = $injector.get("CartTag");
          var action = TargetResource["::createMany::CartPost::cartTags"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.CartPost.cartTags#destroyAll
         * @methodOf lbServices.CartPost.cartTags
         *
         * @description
         *
         * Deletes all cartTags of this model.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        R.cartTags.destroyAll = function() {
          var TargetResource = $injector.get("CartTag");
          var action = TargetResource["::delete::CartPost::cartTags"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.CartPost.cartTags#destroyById
         * @methodOf lbServices.CartPost.cartTags
         *
         * @description
         *
         * Delete a related item by id for cartTags.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `fk` – `{*}` - Foreign key for cartTags
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        R.cartTags.destroyById = function() {
          var TargetResource = $injector.get("CartTag");
          var action = TargetResource["::destroyById::CartPost::cartTags"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.CartPost.cartTags#findById
         * @methodOf lbServices.CartPost.cartTags
         *
         * @description
         *
         * Find a related item by id for cartTags.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `fk` – `{*}` - Foreign key for cartTags
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartTag` object.)
         * </em>
         */
        R.cartTags.findById = function() {
          var TargetResource = $injector.get("CartTag");
          var action = TargetResource["::findById::CartPost::cartTags"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.CartPost.cartTags#updateById
         * @methodOf lbServices.CartPost.cartTags
         *
         * @description
         *
         * Update a related item by id for cartTags.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `fk` – `{*}` - Foreign key for cartTags
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartTag` object.)
         * </em>
         */
        R.cartTags.updateById = function() {
          var TargetResource = $injector.get("CartTag");
          var action = TargetResource["::updateById::CartPost::cartTags"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.CartPost#cartCategory
         * @methodOf lbServices.CartPost
         *
         * @description
         *
         * Fetches belongsTo relation cartCategory.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `refresh` – `{boolean=}` - 
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartCategory` object.)
         * </em>
         */
        R.cartCategory = function() {
          var TargetResource = $injector.get("CartCategory");
          var action = TargetResource["::get::CartPost::cartCategory"];
          return action.apply(R, arguments);
        };
    /**
     * @ngdoc object
     * @name lbServices.CartPost.cartAttachments
     * @header lbServices.CartPost.cartAttachments
     * @object
     * @description
     *
     * The object `CartPost.cartAttachments` groups methods
     * manipulating `CartAttachment` instances related to `CartPost`.
     *
     * Call {@link lbServices.CartPost#cartAttachments CartPost.cartAttachments()}
     * to query all related instances.
     */


        /**
         * @ngdoc method
         * @name lbServices.CartPost#cartAttachments
         * @methodOf lbServices.CartPost
         *
         * @description
         *
         * Queries cartAttachments of CartPost.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `filter` – `{object=}` - 
         *
         * @param {function(Array.<Object>,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Array.<Object>} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartAttachment` object.)
         * </em>
         */
        R.cartAttachments = function() {
          var TargetResource = $injector.get("CartAttachment");
          var action = TargetResource["::get::CartPost::cartAttachments"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.CartPost.cartAttachments#count
         * @methodOf lbServices.CartPost.cartAttachments
         *
         * @description
         *
         * Counts cartAttachments of CartPost.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `where` – `{object=}` - Criteria to match model instances
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * Data properties:
         *
         *  - `count` – `{number=}` - 
         */
        R.cartAttachments.count = function() {
          var TargetResource = $injector.get("CartAttachment");
          var action = TargetResource["::count::CartPost::cartAttachments"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.CartPost.cartAttachments#create
         * @methodOf lbServices.CartPost.cartAttachments
         *
         * @description
         *
         * Creates a new instance in cartAttachments of this model.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartAttachment` object.)
         * </em>
         */
        R.cartAttachments.create = function() {
          var TargetResource = $injector.get("CartAttachment");
          var action = TargetResource["::create::CartPost::cartAttachments"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.CartPost.cartAttachments#createMany
         * @methodOf lbServices.CartPost.cartAttachments
         *
         * @description
         *
         * Creates a new instance in cartAttachments of this model.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Array.<Object>,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Array.<Object>} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartAttachment` object.)
         * </em>
         */
        R.cartAttachments.createMany = function() {
          var TargetResource = $injector.get("CartAttachment");
          var action = TargetResource["::createMany::CartPost::cartAttachments"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.CartPost.cartAttachments#destroyAll
         * @methodOf lbServices.CartPost.cartAttachments
         *
         * @description
         *
         * Deletes all cartAttachments of this model.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        R.cartAttachments.destroyAll = function() {
          var TargetResource = $injector.get("CartAttachment");
          var action = TargetResource["::delete::CartPost::cartAttachments"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.CartPost.cartAttachments#destroyById
         * @methodOf lbServices.CartPost.cartAttachments
         *
         * @description
         *
         * Delete a related item by id for cartAttachments.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `fk` – `{*}` - Foreign key for cartAttachments
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        R.cartAttachments.destroyById = function() {
          var TargetResource = $injector.get("CartAttachment");
          var action = TargetResource["::destroyById::CartPost::cartAttachments"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.CartPost.cartAttachments#findById
         * @methodOf lbServices.CartPost.cartAttachments
         *
         * @description
         *
         * Find a related item by id for cartAttachments.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `fk` – `{*}` - Foreign key for cartAttachments
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartAttachment` object.)
         * </em>
         */
        R.cartAttachments.findById = function() {
          var TargetResource = $injector.get("CartAttachment");
          var action = TargetResource["::findById::CartPost::cartAttachments"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.CartPost.cartAttachments#updateById
         * @methodOf lbServices.CartPost.cartAttachments
         *
         * @description
         *
         * Update a related item by id for cartAttachments.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `fk` – `{*}` - Foreign key for cartAttachments
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartAttachment` object.)
         * </em>
         */
        R.cartAttachments.updateById = function() {
          var TargetResource = $injector.get("CartAttachment");
          var action = TargetResource["::updateById::CartPost::cartAttachments"];
          return action.apply(R, arguments);
        };

    return R;
  }]);

/**
 * @ngdoc object
 * @name lbServices.CartTag
 * @header lbServices.CartTag
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `CartTag` model.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
module.factory(
  "CartTag",
  ['LoopBackResource', 'LoopBackAuth', '$injector', function(Resource, LoopBackAuth, $injector) {
    var R = Resource(
      urlBase + "/CartTags/:id",
      { 'id': '@id' },
      {

        // INTERNAL. Use CartTag.cartPosts.findById() instead.
        "prototype$__findById__cartPosts": {
          params: {
          'fk': '@fk'
          },
          url: urlBase + "/CartTags/:id/cartPosts/:fk",
          method: "GET"
        },

        // INTERNAL. Use CartTag.cartPosts.destroyById() instead.
        "prototype$__destroyById__cartPosts": {
          params: {
          'fk': '@fk'
          },
          url: urlBase + "/CartTags/:id/cartPosts/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use CartTag.cartPosts.updateById() instead.
        "prototype$__updateById__cartPosts": {
          params: {
          'fk': '@fk'
          },
          url: urlBase + "/CartTags/:id/cartPosts/:fk",
          method: "PUT"
        },

        // INTERNAL. Use CartTag.cartPosts() instead.
        "prototype$__get__cartPosts": {
          isArray: true,
          url: urlBase + "/CartTags/:id/cartPosts",
          method: "GET"
        },

        // INTERNAL. Use CartTag.cartPosts.create() instead.
        "prototype$__create__cartPosts": {
          url: urlBase + "/CartTags/:id/cartPosts",
          method: "POST"
        },

        // INTERNAL. Use CartTag.cartPosts.destroyAll() instead.
        "prototype$__delete__cartPosts": {
          url: urlBase + "/CartTags/:id/cartPosts",
          method: "DELETE"
        },

        // INTERNAL. Use CartTag.cartPosts.count() instead.
        "prototype$__count__cartPosts": {
          url: urlBase + "/CartTags/:id/cartPosts/count",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartTag#create
         * @methodOf lbServices.CartTag
         *
         * @description
         *
         * Create a new instance of the model and persist it into the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *   This method does not accept any parameters.
         *   Supply an empty object or omit this argument altogether.
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartTag` object.)
         * </em>
         */
        "create": {
          url: urlBase + "/CartTags",
          method: "POST"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartTag#createMany
         * @methodOf lbServices.CartTag
         *
         * @description
         *
         * Create a new instance of the model and persist it into the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *   This method does not accept any parameters.
         *   Supply an empty object or omit this argument altogether.
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Array.<Object>,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Array.<Object>} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartTag` object.)
         * </em>
         */
        "createMany": {
          isArray: true,
          url: urlBase + "/CartTags",
          method: "POST"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartTag#upsert
         * @methodOf lbServices.CartTag
         *
         * @description
         *
         * Update an existing model instance or insert a new one into the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *   This method does not accept any parameters.
         *   Supply an empty object or omit this argument altogether.
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartTag` object.)
         * </em>
         */
        "upsert": {
          url: urlBase + "/CartTags",
          method: "PUT"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartTag#exists
         * @methodOf lbServices.CartTag
         *
         * @description
         *
         * Check whether a model instance exists in the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * Data properties:
         *
         *  - `exists` – `{boolean=}` - 
         */
        "exists": {
          url: urlBase + "/CartTags/:id/exists",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartTag#findById
         * @methodOf lbServices.CartTag
         *
         * @description
         *
         * Find a model instance by id from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         *  - `filter` – `{object=}` - Filter defining fields and include
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartTag` object.)
         * </em>
         */
        "findById": {
          url: urlBase + "/CartTags/:id",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartTag#find
         * @methodOf lbServices.CartTag
         *
         * @description
         *
         * Find all instances of the model matched by filter from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit
         *
         * @param {function(Array.<Object>,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Array.<Object>} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartTag` object.)
         * </em>
         */
        "find": {
          isArray: true,
          url: urlBase + "/CartTags",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartTag#findOne
         * @methodOf lbServices.CartTag
         *
         * @description
         *
         * Find first instance of the model matched by filter from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartTag` object.)
         * </em>
         */
        "findOne": {
          url: urlBase + "/CartTags/findOne",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartTag#updateAll
         * @methodOf lbServices.CartTag
         *
         * @description
         *
         * Update instances of the model matched by where from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `where` – `{object=}` - Criteria to match model instances
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        "updateAll": {
          url: urlBase + "/CartTags/update",
          method: "POST"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartTag#deleteById
         * @methodOf lbServices.CartTag
         *
         * @description
         *
         * Delete a model instance by id from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        "deleteById": {
          url: urlBase + "/CartTags/:id",
          method: "DELETE"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartTag#count
         * @methodOf lbServices.CartTag
         *
         * @description
         *
         * Count instances of the model matched by where from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `where` – `{object=}` - Criteria to match model instances
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * Data properties:
         *
         *  - `count` – `{number=}` - 
         */
        "count": {
          url: urlBase + "/CartTags/count",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartTag#prototype$updateAttributes
         * @methodOf lbServices.CartTag
         *
         * @description
         *
         * Update attributes for a model instance and persist it into the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartTag` object.)
         * </em>
         */
        "prototype$updateAttributes": {
          url: urlBase + "/CartTags/:id",
          method: "PUT"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartTag#createChangeStream
         * @methodOf lbServices.CartTag
         *
         * @description
         *
         * Create a change stream.
         *
         * @param {Object=} parameters Request parameters.
         *
         *   This method does not accept any parameters.
         *   Supply an empty object or omit this argument altogether.
         *
         * @param {Object} postData Request data.
         *
         *  - `options` – `{object=}` - 
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * Data properties:
         *
         *  - `changes` – `{ReadableStream=}` - 
         */
        "createChangeStream": {
          url: urlBase + "/CartTags/change-stream",
          method: "POST"
        },

        // INTERNAL. Use CartPost.cartTags.findById() instead.
        "::findById::CartPost::cartTags": {
          params: {
          'fk': '@fk'
          },
          url: urlBase + "/CartPosts/:id/cartTags/:fk",
          method: "GET"
        },

        // INTERNAL. Use CartPost.cartTags.destroyById() instead.
        "::destroyById::CartPost::cartTags": {
          params: {
          'fk': '@fk'
          },
          url: urlBase + "/CartPosts/:id/cartTags/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use CartPost.cartTags.updateById() instead.
        "::updateById::CartPost::cartTags": {
          params: {
          'fk': '@fk'
          },
          url: urlBase + "/CartPosts/:id/cartTags/:fk",
          method: "PUT"
        },

        // INTERNAL. Use CartPost.cartTags() instead.
        "::get::CartPost::cartTags": {
          isArray: true,
          url: urlBase + "/CartPosts/:id/cartTags",
          method: "GET"
        },

        // INTERNAL. Use CartPost.cartTags.create() instead.
        "::create::CartPost::cartTags": {
          url: urlBase + "/CartPosts/:id/cartTags",
          method: "POST"
        },

        // INTERNAL. Use CartPost.cartTags.createMany() instead.
        "::createMany::CartPost::cartTags": {
          isArray: true,
          url: urlBase + "/CartPosts/:id/cartTags",
          method: "POST"
        },

        // INTERNAL. Use CartPost.cartTags.destroyAll() instead.
        "::delete::CartPost::cartTags": {
          url: urlBase + "/CartPosts/:id/cartTags",
          method: "DELETE"
        },

        // INTERNAL. Use CartPost.cartTags.count() instead.
        "::count::CartPost::cartTags": {
          url: urlBase + "/CartPosts/:id/cartTags/count",
          method: "GET"
        },
      }
    );



        /**
         * @ngdoc method
         * @name lbServices.CartTag#updateOrCreate
         * @methodOf lbServices.CartTag
         *
         * @description
         *
         * Update an existing model instance or insert a new one into the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *   This method does not accept any parameters.
         *   Supply an empty object or omit this argument altogether.
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartTag` object.)
         * </em>
         */
        R["updateOrCreate"] = R["upsert"];

        /**
         * @ngdoc method
         * @name lbServices.CartTag#update
         * @methodOf lbServices.CartTag
         *
         * @description
         *
         * Update instances of the model matched by where from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `where` – `{object=}` - Criteria to match model instances
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        R["update"] = R["updateAll"];

        /**
         * @ngdoc method
         * @name lbServices.CartTag#destroyById
         * @methodOf lbServices.CartTag
         *
         * @description
         *
         * Delete a model instance by id from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        R["destroyById"] = R["deleteById"];

        /**
         * @ngdoc method
         * @name lbServices.CartTag#removeById
         * @methodOf lbServices.CartTag
         *
         * @description
         *
         * Delete a model instance by id from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        R["removeById"] = R["deleteById"];


    /**
    * @ngdoc property
    * @name lbServices.CartTag#modelName
    * @propertyOf lbServices.CartTag
    * @description
    * The name of the model represented by this $resource,
    * i.e. `CartTag`.
    */
    R.modelName = "CartTag";

    /**
     * @ngdoc object
     * @name lbServices.CartTag.cartPosts
     * @header lbServices.CartTag.cartPosts
     * @object
     * @description
     *
     * The object `CartTag.cartPosts` groups methods
     * manipulating `CartPost` instances related to `CartTag`.
     *
     * Call {@link lbServices.CartTag#cartPosts CartTag.cartPosts()}
     * to query all related instances.
     */


        /**
         * @ngdoc method
         * @name lbServices.CartTag#cartPosts
         * @methodOf lbServices.CartTag
         *
         * @description
         *
         * Queries cartPosts of CartTag.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `filter` – `{object=}` - 
         *
         * @param {function(Array.<Object>,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Array.<Object>} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartPost` object.)
         * </em>
         */
        R.cartPosts = function() {
          var TargetResource = $injector.get("CartPost");
          var action = TargetResource["::get::CartTag::cartPosts"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.CartTag.cartPosts#count
         * @methodOf lbServices.CartTag.cartPosts
         *
         * @description
         *
         * Counts cartPosts of CartTag.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `where` – `{object=}` - Criteria to match model instances
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * Data properties:
         *
         *  - `count` – `{number=}` - 
         */
        R.cartPosts.count = function() {
          var TargetResource = $injector.get("CartPost");
          var action = TargetResource["::count::CartTag::cartPosts"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.CartTag.cartPosts#create
         * @methodOf lbServices.CartTag.cartPosts
         *
         * @description
         *
         * Creates a new instance in cartPosts of this model.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartPost` object.)
         * </em>
         */
        R.cartPosts.create = function() {
          var TargetResource = $injector.get("CartPost");
          var action = TargetResource["::create::CartTag::cartPosts"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.CartTag.cartPosts#createMany
         * @methodOf lbServices.CartTag.cartPosts
         *
         * @description
         *
         * Creates a new instance in cartPosts of this model.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Array.<Object>,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Array.<Object>} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartPost` object.)
         * </em>
         */
        R.cartPosts.createMany = function() {
          var TargetResource = $injector.get("CartPost");
          var action = TargetResource["::createMany::CartTag::cartPosts"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.CartTag.cartPosts#destroyAll
         * @methodOf lbServices.CartTag.cartPosts
         *
         * @description
         *
         * Deletes all cartPosts of this model.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        R.cartPosts.destroyAll = function() {
          var TargetResource = $injector.get("CartPost");
          var action = TargetResource["::delete::CartTag::cartPosts"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.CartTag.cartPosts#destroyById
         * @methodOf lbServices.CartTag.cartPosts
         *
         * @description
         *
         * Delete a related item by id for cartPosts.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `fk` – `{*}` - Foreign key for cartPosts
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        R.cartPosts.destroyById = function() {
          var TargetResource = $injector.get("CartPost");
          var action = TargetResource["::destroyById::CartTag::cartPosts"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.CartTag.cartPosts#findById
         * @methodOf lbServices.CartTag.cartPosts
         *
         * @description
         *
         * Find a related item by id for cartPosts.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `fk` – `{*}` - Foreign key for cartPosts
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartPost` object.)
         * </em>
         */
        R.cartPosts.findById = function() {
          var TargetResource = $injector.get("CartPost");
          var action = TargetResource["::findById::CartTag::cartPosts"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.CartTag.cartPosts#updateById
         * @methodOf lbServices.CartTag.cartPosts
         *
         * @description
         *
         * Update a related item by id for cartPosts.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `fk` – `{*}` - Foreign key for cartPosts
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartPost` object.)
         * </em>
         */
        R.cartPosts.updateById = function() {
          var TargetResource = $injector.get("CartPost");
          var action = TargetResource["::updateById::CartTag::cartPosts"];
          return action.apply(R, arguments);
        };

    return R;
  }]);

/**
 * @ngdoc object
 * @name lbServices.CartCategory
 * @header lbServices.CartCategory
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `CartCategory` model.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
module.factory(
  "CartCategory",
  ['LoopBackResource', 'LoopBackAuth', '$injector', function(Resource, LoopBackAuth, $injector) {
    var R = Resource(
      urlBase + "/CartCategories/:id",
      { 'id': '@id' },
      {

        // INTERNAL. Use CartCategory.cartPosts.findById() instead.
        "prototype$__findById__cartPosts": {
          params: {
          'fk': '@fk'
          },
          url: urlBase + "/CartCategories/:id/cartPosts/:fk",
          method: "GET"
        },

        // INTERNAL. Use CartCategory.cartPosts.destroyById() instead.
        "prototype$__destroyById__cartPosts": {
          params: {
          'fk': '@fk'
          },
          url: urlBase + "/CartCategories/:id/cartPosts/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use CartCategory.cartPosts.updateById() instead.
        "prototype$__updateById__cartPosts": {
          params: {
          'fk': '@fk'
          },
          url: urlBase + "/CartCategories/:id/cartPosts/:fk",
          method: "PUT"
        },

        // INTERNAL. Use CartCategory.cartPosts() instead.
        "prototype$__get__cartPosts": {
          isArray: true,
          url: urlBase + "/CartCategories/:id/cartPosts",
          method: "GET"
        },

        // INTERNAL. Use CartCategory.cartPosts.create() instead.
        "prototype$__create__cartPosts": {
          url: urlBase + "/CartCategories/:id/cartPosts",
          method: "POST"
        },

        // INTERNAL. Use CartCategory.cartPosts.destroyAll() instead.
        "prototype$__delete__cartPosts": {
          url: urlBase + "/CartCategories/:id/cartPosts",
          method: "DELETE"
        },

        // INTERNAL. Use CartCategory.cartPosts.count() instead.
        "prototype$__count__cartPosts": {
          url: urlBase + "/CartCategories/:id/cartPosts/count",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartCategory#create
         * @methodOf lbServices.CartCategory
         *
         * @description
         *
         * Create a new instance of the model and persist it into the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *   This method does not accept any parameters.
         *   Supply an empty object or omit this argument altogether.
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartCategory` object.)
         * </em>
         */
        "create": {
          url: urlBase + "/CartCategories",
          method: "POST"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartCategory#createMany
         * @methodOf lbServices.CartCategory
         *
         * @description
         *
         * Create a new instance of the model and persist it into the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *   This method does not accept any parameters.
         *   Supply an empty object or omit this argument altogether.
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Array.<Object>,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Array.<Object>} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartCategory` object.)
         * </em>
         */
        "createMany": {
          isArray: true,
          url: urlBase + "/CartCategories",
          method: "POST"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartCategory#upsert
         * @methodOf lbServices.CartCategory
         *
         * @description
         *
         * Update an existing model instance or insert a new one into the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *   This method does not accept any parameters.
         *   Supply an empty object or omit this argument altogether.
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartCategory` object.)
         * </em>
         */
        "upsert": {
          url: urlBase + "/CartCategories",
          method: "PUT"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartCategory#exists
         * @methodOf lbServices.CartCategory
         *
         * @description
         *
         * Check whether a model instance exists in the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * Data properties:
         *
         *  - `exists` – `{boolean=}` - 
         */
        "exists": {
          url: urlBase + "/CartCategories/:id/exists",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartCategory#findById
         * @methodOf lbServices.CartCategory
         *
         * @description
         *
         * Find a model instance by id from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         *  - `filter` – `{object=}` - Filter defining fields and include
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartCategory` object.)
         * </em>
         */
        "findById": {
          url: urlBase + "/CartCategories/:id",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartCategory#find
         * @methodOf lbServices.CartCategory
         *
         * @description
         *
         * Find all instances of the model matched by filter from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit
         *
         * @param {function(Array.<Object>,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Array.<Object>} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartCategory` object.)
         * </em>
         */
        "find": {
          isArray: true,
          url: urlBase + "/CartCategories",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartCategory#findOne
         * @methodOf lbServices.CartCategory
         *
         * @description
         *
         * Find first instance of the model matched by filter from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartCategory` object.)
         * </em>
         */
        "findOne": {
          url: urlBase + "/CartCategories/findOne",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartCategory#updateAll
         * @methodOf lbServices.CartCategory
         *
         * @description
         *
         * Update instances of the model matched by where from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `where` – `{object=}` - Criteria to match model instances
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        "updateAll": {
          url: urlBase + "/CartCategories/update",
          method: "POST"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartCategory#deleteById
         * @methodOf lbServices.CartCategory
         *
         * @description
         *
         * Delete a model instance by id from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        "deleteById": {
          url: urlBase + "/CartCategories/:id",
          method: "DELETE"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartCategory#count
         * @methodOf lbServices.CartCategory
         *
         * @description
         *
         * Count instances of the model matched by where from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `where` – `{object=}` - Criteria to match model instances
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * Data properties:
         *
         *  - `count` – `{number=}` - 
         */
        "count": {
          url: urlBase + "/CartCategories/count",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartCategory#prototype$updateAttributes
         * @methodOf lbServices.CartCategory
         *
         * @description
         *
         * Update attributes for a model instance and persist it into the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartCategory` object.)
         * </em>
         */
        "prototype$updateAttributes": {
          url: urlBase + "/CartCategories/:id",
          method: "PUT"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartCategory#createChangeStream
         * @methodOf lbServices.CartCategory
         *
         * @description
         *
         * Create a change stream.
         *
         * @param {Object=} parameters Request parameters.
         *
         *   This method does not accept any parameters.
         *   Supply an empty object or omit this argument altogether.
         *
         * @param {Object} postData Request data.
         *
         *  - `options` – `{object=}` - 
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * Data properties:
         *
         *  - `changes` – `{ReadableStream=}` - 
         */
        "createChangeStream": {
          url: urlBase + "/CartCategories/change-stream",
          method: "POST"
        },

        // INTERNAL. Use CartPost.cartCategory() instead.
        "::get::CartPost::cartCategory": {
          url: urlBase + "/CartPosts/:id/cartCategory",
          method: "GET"
        },
      }
    );



        /**
         * @ngdoc method
         * @name lbServices.CartCategory#updateOrCreate
         * @methodOf lbServices.CartCategory
         *
         * @description
         *
         * Update an existing model instance or insert a new one into the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *   This method does not accept any parameters.
         *   Supply an empty object or omit this argument altogether.
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartCategory` object.)
         * </em>
         */
        R["updateOrCreate"] = R["upsert"];

        /**
         * @ngdoc method
         * @name lbServices.CartCategory#update
         * @methodOf lbServices.CartCategory
         *
         * @description
         *
         * Update instances of the model matched by where from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `where` – `{object=}` - Criteria to match model instances
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        R["update"] = R["updateAll"];

        /**
         * @ngdoc method
         * @name lbServices.CartCategory#destroyById
         * @methodOf lbServices.CartCategory
         *
         * @description
         *
         * Delete a model instance by id from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        R["destroyById"] = R["deleteById"];

        /**
         * @ngdoc method
         * @name lbServices.CartCategory#removeById
         * @methodOf lbServices.CartCategory
         *
         * @description
         *
         * Delete a model instance by id from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        R["removeById"] = R["deleteById"];


    /**
    * @ngdoc property
    * @name lbServices.CartCategory#modelName
    * @propertyOf lbServices.CartCategory
    * @description
    * The name of the model represented by this $resource,
    * i.e. `CartCategory`.
    */
    R.modelName = "CartCategory";

    /**
     * @ngdoc object
     * @name lbServices.CartCategory.cartPosts
     * @header lbServices.CartCategory.cartPosts
     * @object
     * @description
     *
     * The object `CartCategory.cartPosts` groups methods
     * manipulating `CartPost` instances related to `CartCategory`.
     *
     * Call {@link lbServices.CartCategory#cartPosts CartCategory.cartPosts()}
     * to query all related instances.
     */


        /**
         * @ngdoc method
         * @name lbServices.CartCategory#cartPosts
         * @methodOf lbServices.CartCategory
         *
         * @description
         *
         * Queries cartPosts of CartCategory.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `filter` – `{object=}` - 
         *
         * @param {function(Array.<Object>,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Array.<Object>} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartPost` object.)
         * </em>
         */
        R.cartPosts = function() {
          var TargetResource = $injector.get("CartPost");
          var action = TargetResource["::get::CartCategory::cartPosts"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.CartCategory.cartPosts#count
         * @methodOf lbServices.CartCategory.cartPosts
         *
         * @description
         *
         * Counts cartPosts of CartCategory.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `where` – `{object=}` - Criteria to match model instances
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * Data properties:
         *
         *  - `count` – `{number=}` - 
         */
        R.cartPosts.count = function() {
          var TargetResource = $injector.get("CartPost");
          var action = TargetResource["::count::CartCategory::cartPosts"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.CartCategory.cartPosts#create
         * @methodOf lbServices.CartCategory.cartPosts
         *
         * @description
         *
         * Creates a new instance in cartPosts of this model.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartPost` object.)
         * </em>
         */
        R.cartPosts.create = function() {
          var TargetResource = $injector.get("CartPost");
          var action = TargetResource["::create::CartCategory::cartPosts"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.CartCategory.cartPosts#createMany
         * @methodOf lbServices.CartCategory.cartPosts
         *
         * @description
         *
         * Creates a new instance in cartPosts of this model.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Array.<Object>,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Array.<Object>} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartPost` object.)
         * </em>
         */
        R.cartPosts.createMany = function() {
          var TargetResource = $injector.get("CartPost");
          var action = TargetResource["::createMany::CartCategory::cartPosts"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.CartCategory.cartPosts#destroyAll
         * @methodOf lbServices.CartCategory.cartPosts
         *
         * @description
         *
         * Deletes all cartPosts of this model.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        R.cartPosts.destroyAll = function() {
          var TargetResource = $injector.get("CartPost");
          var action = TargetResource["::delete::CartCategory::cartPosts"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.CartCategory.cartPosts#destroyById
         * @methodOf lbServices.CartCategory.cartPosts
         *
         * @description
         *
         * Delete a related item by id for cartPosts.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `fk` – `{*}` - Foreign key for cartPosts
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        R.cartPosts.destroyById = function() {
          var TargetResource = $injector.get("CartPost");
          var action = TargetResource["::destroyById::CartCategory::cartPosts"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.CartCategory.cartPosts#findById
         * @methodOf lbServices.CartCategory.cartPosts
         *
         * @description
         *
         * Find a related item by id for cartPosts.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `fk` – `{*}` - Foreign key for cartPosts
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartPost` object.)
         * </em>
         */
        R.cartPosts.findById = function() {
          var TargetResource = $injector.get("CartPost");
          var action = TargetResource["::findById::CartCategory::cartPosts"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.CartCategory.cartPosts#updateById
         * @methodOf lbServices.CartCategory.cartPosts
         *
         * @description
         *
         * Update a related item by id for cartPosts.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `fk` – `{*}` - Foreign key for cartPosts
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartPost` object.)
         * </em>
         */
        R.cartPosts.updateById = function() {
          var TargetResource = $injector.get("CartPost");
          var action = TargetResource["::updateById::CartCategory::cartPosts"];
          return action.apply(R, arguments);
        };

    return R;
  }]);

/**
 * @ngdoc object
 * @name lbServices.CartAttachment
 * @header lbServices.CartAttachment
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `CartAttachment` model.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
module.factory(
  "CartAttachment",
  ['LoopBackResource', 'LoopBackAuth', '$injector', function(Resource, LoopBackAuth, $injector) {
    var R = Resource(
      urlBase + "/CartAttachments/:id",
      { 'id': '@id' },
      {

        // INTERNAL. Use CartAttachment.cartPosts.findById() instead.
        "prototype$__findById__cartPosts": {
          params: {
          'fk': '@fk'
          },
          url: urlBase + "/CartAttachments/:id/cartPosts/:fk",
          method: "GET"
        },

        // INTERNAL. Use CartAttachment.cartPosts.destroyById() instead.
        "prototype$__destroyById__cartPosts": {
          params: {
          'fk': '@fk'
          },
          url: urlBase + "/CartAttachments/:id/cartPosts/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use CartAttachment.cartPosts.updateById() instead.
        "prototype$__updateById__cartPosts": {
          params: {
          'fk': '@fk'
          },
          url: urlBase + "/CartAttachments/:id/cartPosts/:fk",
          method: "PUT"
        },

        // INTERNAL. Use CartAttachment.cartPosts() instead.
        "prototype$__get__cartPosts": {
          isArray: true,
          url: urlBase + "/CartAttachments/:id/cartPosts",
          method: "GET"
        },

        // INTERNAL. Use CartAttachment.cartPosts.create() instead.
        "prototype$__create__cartPosts": {
          url: urlBase + "/CartAttachments/:id/cartPosts",
          method: "POST"
        },

        // INTERNAL. Use CartAttachment.cartPosts.destroyAll() instead.
        "prototype$__delete__cartPosts": {
          url: urlBase + "/CartAttachments/:id/cartPosts",
          method: "DELETE"
        },

        // INTERNAL. Use CartAttachment.cartPosts.count() instead.
        "prototype$__count__cartPosts": {
          url: urlBase + "/CartAttachments/:id/cartPosts/count",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartAttachment#create
         * @methodOf lbServices.CartAttachment
         *
         * @description
         *
         * Create a new instance of the model and persist it into the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *   This method does not accept any parameters.
         *   Supply an empty object or omit this argument altogether.
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartAttachment` object.)
         * </em>
         */
        "create": {
          url: urlBase + "/CartAttachments",
          method: "POST"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartAttachment#createMany
         * @methodOf lbServices.CartAttachment
         *
         * @description
         *
         * Create a new instance of the model and persist it into the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *   This method does not accept any parameters.
         *   Supply an empty object or omit this argument altogether.
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Array.<Object>,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Array.<Object>} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartAttachment` object.)
         * </em>
         */
        "createMany": {
          isArray: true,
          url: urlBase + "/CartAttachments",
          method: "POST"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartAttachment#upsert
         * @methodOf lbServices.CartAttachment
         *
         * @description
         *
         * Update an existing model instance or insert a new one into the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *   This method does not accept any parameters.
         *   Supply an empty object or omit this argument altogether.
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartAttachment` object.)
         * </em>
         */
        "upsert": {
          url: urlBase + "/CartAttachments",
          method: "PUT"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartAttachment#exists
         * @methodOf lbServices.CartAttachment
         *
         * @description
         *
         * Check whether a model instance exists in the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * Data properties:
         *
         *  - `exists` – `{boolean=}` - 
         */
        "exists": {
          url: urlBase + "/CartAttachments/:id/exists",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartAttachment#findById
         * @methodOf lbServices.CartAttachment
         *
         * @description
         *
         * Find a model instance by id from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         *  - `filter` – `{object=}` - Filter defining fields and include
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartAttachment` object.)
         * </em>
         */
        "findById": {
          url: urlBase + "/CartAttachments/:id",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartAttachment#find
         * @methodOf lbServices.CartAttachment
         *
         * @description
         *
         * Find all instances of the model matched by filter from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit
         *
         * @param {function(Array.<Object>,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Array.<Object>} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartAttachment` object.)
         * </em>
         */
        "find": {
          isArray: true,
          url: urlBase + "/CartAttachments",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartAttachment#findOne
         * @methodOf lbServices.CartAttachment
         *
         * @description
         *
         * Find first instance of the model matched by filter from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartAttachment` object.)
         * </em>
         */
        "findOne": {
          url: urlBase + "/CartAttachments/findOne",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartAttachment#updateAll
         * @methodOf lbServices.CartAttachment
         *
         * @description
         *
         * Update instances of the model matched by where from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `where` – `{object=}` - Criteria to match model instances
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        "updateAll": {
          url: urlBase + "/CartAttachments/update",
          method: "POST"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartAttachment#deleteById
         * @methodOf lbServices.CartAttachment
         *
         * @description
         *
         * Delete a model instance by id from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        "deleteById": {
          url: urlBase + "/CartAttachments/:id",
          method: "DELETE"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartAttachment#count
         * @methodOf lbServices.CartAttachment
         *
         * @description
         *
         * Count instances of the model matched by where from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `where` – `{object=}` - Criteria to match model instances
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * Data properties:
         *
         *  - `count` – `{number=}` - 
         */
        "count": {
          url: urlBase + "/CartAttachments/count",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartAttachment#prototype$updateAttributes
         * @methodOf lbServices.CartAttachment
         *
         * @description
         *
         * Update attributes for a model instance and persist it into the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartAttachment` object.)
         * </em>
         */
        "prototype$updateAttributes": {
          url: urlBase + "/CartAttachments/:id",
          method: "PUT"
        },

        /**
         * @ngdoc method
         * @name lbServices.CartAttachment#createChangeStream
         * @methodOf lbServices.CartAttachment
         *
         * @description
         *
         * Create a change stream.
         *
         * @param {Object=} parameters Request parameters.
         *
         *   This method does not accept any parameters.
         *   Supply an empty object or omit this argument altogether.
         *
         * @param {Object} postData Request data.
         *
         *  - `options` – `{object=}` - 
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * Data properties:
         *
         *  - `changes` – `{ReadableStream=}` - 
         */
        "createChangeStream": {
          url: urlBase + "/CartAttachments/change-stream",
          method: "POST"
        },

        // INTERNAL. Use CartPost.cartAttachments.findById() instead.
        "::findById::CartPost::cartAttachments": {
          params: {
          'fk': '@fk'
          },
          url: urlBase + "/CartPosts/:id/cartAttachments/:fk",
          method: "GET"
        },

        // INTERNAL. Use CartPost.cartAttachments.destroyById() instead.
        "::destroyById::CartPost::cartAttachments": {
          params: {
          'fk': '@fk'
          },
          url: urlBase + "/CartPosts/:id/cartAttachments/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use CartPost.cartAttachments.updateById() instead.
        "::updateById::CartPost::cartAttachments": {
          params: {
          'fk': '@fk'
          },
          url: urlBase + "/CartPosts/:id/cartAttachments/:fk",
          method: "PUT"
        },

        // INTERNAL. Use CartPost.cartAttachments() instead.
        "::get::CartPost::cartAttachments": {
          isArray: true,
          url: urlBase + "/CartPosts/:id/cartAttachments",
          method: "GET"
        },

        // INTERNAL. Use CartPost.cartAttachments.create() instead.
        "::create::CartPost::cartAttachments": {
          url: urlBase + "/CartPosts/:id/cartAttachments",
          method: "POST"
        },

        // INTERNAL. Use CartPost.cartAttachments.createMany() instead.
        "::createMany::CartPost::cartAttachments": {
          isArray: true,
          url: urlBase + "/CartPosts/:id/cartAttachments",
          method: "POST"
        },

        // INTERNAL. Use CartPost.cartAttachments.destroyAll() instead.
        "::delete::CartPost::cartAttachments": {
          url: urlBase + "/CartPosts/:id/cartAttachments",
          method: "DELETE"
        },

        // INTERNAL. Use CartPost.cartAttachments.count() instead.
        "::count::CartPost::cartAttachments": {
          url: urlBase + "/CartPosts/:id/cartAttachments/count",
          method: "GET"
        },
      }
    );



        /**
         * @ngdoc method
         * @name lbServices.CartAttachment#updateOrCreate
         * @methodOf lbServices.CartAttachment
         *
         * @description
         *
         * Update an existing model instance or insert a new one into the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *   This method does not accept any parameters.
         *   Supply an empty object or omit this argument altogether.
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartAttachment` object.)
         * </em>
         */
        R["updateOrCreate"] = R["upsert"];

        /**
         * @ngdoc method
         * @name lbServices.CartAttachment#update
         * @methodOf lbServices.CartAttachment
         *
         * @description
         *
         * Update instances of the model matched by where from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `where` – `{object=}` - Criteria to match model instances
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        R["update"] = R["updateAll"];

        /**
         * @ngdoc method
         * @name lbServices.CartAttachment#destroyById
         * @methodOf lbServices.CartAttachment
         *
         * @description
         *
         * Delete a model instance by id from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        R["destroyById"] = R["deleteById"];

        /**
         * @ngdoc method
         * @name lbServices.CartAttachment#removeById
         * @methodOf lbServices.CartAttachment
         *
         * @description
         *
         * Delete a model instance by id from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        R["removeById"] = R["deleteById"];


    /**
    * @ngdoc property
    * @name lbServices.CartAttachment#modelName
    * @propertyOf lbServices.CartAttachment
    * @description
    * The name of the model represented by this $resource,
    * i.e. `CartAttachment`.
    */
    R.modelName = "CartAttachment";

    /**
     * @ngdoc object
     * @name lbServices.CartAttachment.cartPosts
     * @header lbServices.CartAttachment.cartPosts
     * @object
     * @description
     *
     * The object `CartAttachment.cartPosts` groups methods
     * manipulating `CartPost` instances related to `CartAttachment`.
     *
     * Call {@link lbServices.CartAttachment#cartPosts CartAttachment.cartPosts()}
     * to query all related instances.
     */


        /**
         * @ngdoc method
         * @name lbServices.CartAttachment#cartPosts
         * @methodOf lbServices.CartAttachment
         *
         * @description
         *
         * Queries cartPosts of CartAttachment.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `filter` – `{object=}` - 
         *
         * @param {function(Array.<Object>,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Array.<Object>} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartPost` object.)
         * </em>
         */
        R.cartPosts = function() {
          var TargetResource = $injector.get("CartPost");
          var action = TargetResource["::get::CartAttachment::cartPosts"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.CartAttachment.cartPosts#count
         * @methodOf lbServices.CartAttachment.cartPosts
         *
         * @description
         *
         * Counts cartPosts of CartAttachment.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `where` – `{object=}` - Criteria to match model instances
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * Data properties:
         *
         *  - `count` – `{number=}` - 
         */
        R.cartPosts.count = function() {
          var TargetResource = $injector.get("CartPost");
          var action = TargetResource["::count::CartAttachment::cartPosts"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.CartAttachment.cartPosts#create
         * @methodOf lbServices.CartAttachment.cartPosts
         *
         * @description
         *
         * Creates a new instance in cartPosts of this model.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartPost` object.)
         * </em>
         */
        R.cartPosts.create = function() {
          var TargetResource = $injector.get("CartPost");
          var action = TargetResource["::create::CartAttachment::cartPosts"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.CartAttachment.cartPosts#createMany
         * @methodOf lbServices.CartAttachment.cartPosts
         *
         * @description
         *
         * Creates a new instance in cartPosts of this model.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Array.<Object>,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Array.<Object>} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartPost` object.)
         * </em>
         */
        R.cartPosts.createMany = function() {
          var TargetResource = $injector.get("CartPost");
          var action = TargetResource["::createMany::CartAttachment::cartPosts"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.CartAttachment.cartPosts#destroyAll
         * @methodOf lbServices.CartAttachment.cartPosts
         *
         * @description
         *
         * Deletes all cartPosts of this model.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        R.cartPosts.destroyAll = function() {
          var TargetResource = $injector.get("CartPost");
          var action = TargetResource["::delete::CartAttachment::cartPosts"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.CartAttachment.cartPosts#destroyById
         * @methodOf lbServices.CartAttachment.cartPosts
         *
         * @description
         *
         * Delete a related item by id for cartPosts.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `fk` – `{*}` - Foreign key for cartPosts
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        R.cartPosts.destroyById = function() {
          var TargetResource = $injector.get("CartPost");
          var action = TargetResource["::destroyById::CartAttachment::cartPosts"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.CartAttachment.cartPosts#findById
         * @methodOf lbServices.CartAttachment.cartPosts
         *
         * @description
         *
         * Find a related item by id for cartPosts.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `fk` – `{*}` - Foreign key for cartPosts
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartPost` object.)
         * </em>
         */
        R.cartPosts.findById = function() {
          var TargetResource = $injector.get("CartPost");
          var action = TargetResource["::findById::CartAttachment::cartPosts"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.CartAttachment.cartPosts#updateById
         * @methodOf lbServices.CartAttachment.cartPosts
         *
         * @description
         *
         * Update a related item by id for cartPosts.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `fk` – `{*}` - Foreign key for cartPosts
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `CartPost` object.)
         * </em>
         */
        R.cartPosts.updateById = function() {
          var TargetResource = $injector.get("CartPost");
          var action = TargetResource["::updateById::CartAttachment::cartPosts"];
          return action.apply(R, arguments);
        };

    return R;
  }]);


module
  .factory('LoopBackAuth', function() {
    var props = ['accessTokenId', 'currentUserId'];
    var propsPrefix = '$LoopBack$';

    function LoopBackAuth() {
      var self = this;
      props.forEach(function(name) {
        self[name] = load(name);
      });
      this.rememberMe = undefined;
      this.currentUserData = null;
    }

    LoopBackAuth.prototype.save = function() {
      var self = this;
      var storage = this.rememberMe ? localStorage : sessionStorage;
      props.forEach(function(name) {
        save(storage, name, self[name]);
      });
    };

    LoopBackAuth.prototype.setUser = function(accessTokenId, userId, userData) {
      this.accessTokenId = accessTokenId;
      this.currentUserId = userId;
      this.currentUserData = userData;
    }

    LoopBackAuth.prototype.clearUser = function() {
      this.accessTokenId = null;
      this.currentUserId = null;
      this.currentUserData = null;
    }

    LoopBackAuth.prototype.clearStorage = function() {
      props.forEach(function(name) {
        save(sessionStorage, name, null);
        save(localStorage, name, null);
      });
    };

    return new LoopBackAuth();

    // Note: LocalStorage converts the value to string
    // We are using empty string as a marker for null/undefined values.
    function save(storage, name, value) {
      var key = propsPrefix + name;
      if (value == null) value = '';
      storage[key] = value;
    }

    function load(name) {
      var key = propsPrefix + name;
      return localStorage[key] || sessionStorage[key] || null;
    }
  })
  .config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('LoopBackAuthRequestInterceptor');
  }])
  .factory('LoopBackAuthRequestInterceptor', [ '$q', 'LoopBackAuth',
    function($q, LoopBackAuth) {
      return {
        'request': function(config) {

          // filter out non urlBase requests
          if (config.url.substr(0, urlBase.length) !== urlBase) {
            return config;
          }

          if (LoopBackAuth.accessTokenId) {
            config.headers[authHeader] = LoopBackAuth.accessTokenId;
          } else if (config.__isGetCurrentUser__) {
            // Return a stub 401 error for User.getCurrent() when
            // there is no user logged in
            var res = {
              body: { error: { status: 401 } },
              status: 401,
              config: config,
              headers: function() { return undefined; }
            };
            return $q.reject(res);
          }
          return config || $q.when(config);
        }
      }
    }])

  /**
   * @ngdoc object
   * @name lbServices.LoopBackResourceProvider
   * @header lbServices.LoopBackResourceProvider
   * @description
   * Use `LoopBackResourceProvider` to change the global configuration
   * settings used by all models. Note that the provider is available
   * to Configuration Blocks only, see
   * {@link https://docs.angularjs.org/guide/module#module-loading-dependencies Module Loading & Dependencies}
   * for more details.
   *
   * ## Example
   *
   * ```js
   * angular.module('app')
   *  .config(function(LoopBackResourceProvider) {
   *     LoopBackResourceProvider.setAuthHeader('X-Access-Token');
   *  });
   * ```
   */
  .provider('LoopBackResource', function LoopBackResourceProvider() {
    /**
     * @ngdoc method
     * @name lbServices.LoopBackResourceProvider#setAuthHeader
     * @methodOf lbServices.LoopBackResourceProvider
     * @param {string} header The header name to use, e.g. `X-Access-Token`
     * @description
     * Configure the REST transport to use a different header for sending
     * the authentication token. It is sent in the `Authorization` header
     * by default.
     */
    this.setAuthHeader = function(header) {
      authHeader = header;
    };

    /**
     * @ngdoc method
     * @name lbServices.LoopBackResourceProvider#setUrlBase
     * @methodOf lbServices.LoopBackResourceProvider
     * @param {string} url The URL to use, e.g. `/api` or `//example.com/api`.
     * @description
     * Change the URL of the REST API server. By default, the URL provided
     * to the code generator (`lb-ng` or `grunt-loopback-sdk-angular`) is used.
     */
    this.setUrlBase = function(url) {
      urlBase = url;
    };

    /**
     * @ngdoc method
     * @name lbServices.LoopBackResourceProvider#getUrlBase
     * @methodOf lbServices.LoopBackResourceProvider
     * @description
     * Get the URL of the REST API server. The URL provided
     * to the code generator (`lb-ng` or `grunt-loopback-sdk-angular`) is used.
     */
    this.getUrlBase = function() {
      return urlBase;
    };

    this.$get = ['$resource', function($resource) {
      return function(url, params, actions) {
        var resource = $resource(url, params, actions);

        // Angular always calls POST on $save()
        // This hack is based on
        // http://kirkbushell.me/angular-js-using-ng-resource-in-a-more-restful-manner/
        resource.prototype.$save = function(success, error) {
          // Fortunately, LoopBack provides a convenient `upsert` method
          // that exactly fits our needs.
          var result = resource.upsert.call(this, {}, this, success, error);
          return result.$promise || result;
        };
        return resource;
      };
    }];
  });

})(window, window.angular);
