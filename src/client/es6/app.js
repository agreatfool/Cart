import 'angular-material/angular-material.min.css';

import '../styles/main.scss';

import angular from 'angular';

import uiRouter from 'angular-ui-router';
import ngMaterial from 'angular-material';
import ngResource from 'angular-resource';
import lbServices from './lb-services.js';

import CartRouters from './routers.js';
import CartTheming from './theme.js';

import CartBlogListCtrl from './controller/cart-blog-list.js';

import CartApiService from './service/cart-api.js';

// Angular application initialization
let app = angular.module('app', [
  uiRouter, ngMaterial, ngResource, lbServices
]);

// Angular UI router config
app.config(CartRouters.factory);

// Angular Material Theme config
app.config(CartTheming.factory);

// Define self controllers
app.controller('CartBlogListCtrl', CartBlogListCtrl);

// Define self services
app.factory('CartApiService', CartApiService.factory);
