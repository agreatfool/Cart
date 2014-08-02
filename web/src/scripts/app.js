'use strict';

var $ = require('jquery');
var moment = require('moment');
require('angular');
require('angular-route');
require('angular-animate');
require('angular-pouchdb');

var app = angular.module('Cart', [
    'ngAnimate', 'ngRoute', 'pouchdb',
    'Cart.Controllers', 'Cart.Services'
]);

var controllers = angular.module('Cart.Controllers', []);

controllers.controller('CartIndexCtrl', ['$scope', function ($scope) {
}]);

var services = angular.module('Cart.Services', []);

services.factory('CartIndexService', ['$http', '$q', 'pouchdb', function($http, $q, pouchdb) {
    return {
    };
}]);

var $html = angular.element(document.getElementsByTagName('html')[0]);
angular.element().ready(function() {
    angular.bootstrap($html, ['Cart']);
});