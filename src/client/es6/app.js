import 'angular-material/angular-material.min.css';

import '../styles/main.scss';

import angular from 'angular';

import uiRouter from 'angular-ui-router';
import ngMaterial from 'angular-material';
import ngResource from 'angular-resource';
import lbServices from './lb-services.js';

import CartRouters from './routers.js';
import CartTheming from './theme.js';

import CartBlogCategoryCtrl from './controller/cart-blog-category.js';
import CartBlogCreateCtrl from './controller/cart-blog-create.js';
import CartBlogEditCtrl from './controller/cart-blog-edit.js';
import CartBlogListCtrl from './controller/cart-blog-list.js';
import CartBlogMetaInfoCtrl from './controller/cart-blog-meta.js';
import CartBlogSearchCtrl from './controller/cart-blog-search.js';
import CartBlogSettingCtrl from './controller/cart-blog-settings.js';
import CartBlogShortcutCtrl from './controller/cart-blog-shortcut.js';
import CartBlogTagCtrl from './controller/cart-blog-tag.js';

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
app.controller('CartBlogCategoryCtrl',  CartBlogCategoryCtrl);
app.controller('CartBlogCreateCtrl',    CartBlogCreateCtrl);
app.controller('CartBlogEditCtrl',      CartBlogEditCtrl);
app.controller('CartBlogListCtrl',      CartBlogListCtrl);
app.controller('CartBlogMetaInfoCtrl',  CartBlogMetaInfoCtrl);
app.controller('CartBlogSearchCtrl',    CartBlogSearchCtrl);
app.controller('CartBlogSettingCtrl',   CartBlogSettingCtrl);
app.controller('CartBlogShortcutCtrl',  CartBlogShortcutCtrl);
app.controller('CartBlogTagCtrl',       CartBlogTagCtrl);

// Define self services
app.factory('CartApiService', CartApiService.factory);
