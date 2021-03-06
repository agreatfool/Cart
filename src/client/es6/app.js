import conf from '../../common/config.json';

import '../styles/main.scss';

import babelPolyfill from 'babel-core/lib/polyfill.js';

import angular from 'angular';

import uiRouter from 'angular-ui-router';
import ngResource from 'angular-resource';
import ngAnimate from 'angular-animate';
import ngSanitize from 'angular-sanitize';
import lbServices from './lb-services.js';

// import injection
// inject:import
// endinject:import

import CartRouters from './routers.js';
import CartLoopback from './loopback.js';

import CartModalMetaInfoCtrl from './controller/modal/cart-modal-meta.js';
import CartModalShortcutCtrl from './controller/modal/cart-modal-shortcut.js';
import CartModalToastCtrl from './controller/modal/cart-modal-toast.js';
import CartBlogCategoryCtrl from './controller/cart-blog-category.js';
import CartBlogCreateCtrl from './controller/cart-blog-create.js';
import CartBlogEditCtrl from './controller/cart-blog-edit.js';
import CartBlogListCtrl from './controller/cart-blog-list.js';
import CartBlogSearchCtrl from './controller/cart-blog-search.js';
import CartBlogSettingCtrl from './controller/cart-blog-settings.js';
import CartBlogTagCtrl from './controller/cart-blog-tag.js';

import CartApiService from './service/cart-api.js';
import CartMessageService from './service/cart-message.js';

// Angular application initialization
let angularDependencies = [
  uiRouter, ngResource, ngAnimate, ngSanitize, lbServices
];

// Angular Init code injection
// inject:angular
// endinject:angular

let app = angular.module('app', angularDependencies);

// Angular UI router config
app.config(CartRouters.factory);

// StrongLoop backend config
app.config(CartLoopback.factory);

// Define self controllers
app.controller('CartModalMetaInfoCtrl', CartModalMetaInfoCtrl);
app.controller('CartModalShortcutCtrl', CartModalShortcutCtrl);
app.controller('CartModalToastCtrl',    CartModalToastCtrl);
app.controller('CartBlogCategoryCtrl',  CartBlogCategoryCtrl);
app.controller('CartBlogCreateCtrl',    CartBlogCreateCtrl);
app.controller('CartBlogEditCtrl',      CartBlogEditCtrl);
app.controller('CartBlogListCtrl',      CartBlogListCtrl);
app.controller('CartBlogSearchCtrl',    CartBlogSearchCtrl);
app.controller('CartBlogSettingCtrl',   CartBlogSettingCtrl);
app.controller('CartBlogTagCtrl',       CartBlogTagCtrl);

// Define self services
app.factory('CartApiService',           CartApiService.factory);
app.factory('CartMessageService',       CartMessageService.factory);

// Logic code injection
// inject:logic
// endinject:logic

// Boot angular
let angularBoot = function(event) {
  console.log(`Start event received: ${event}, bootstrapping application setup.`);
  angular.bootstrap(document.getElementsByTagName('body')[0], ['app']);
};

// If cordova is present, wait for it to initialize, otherwise just try to bootstrap the application.
if (window.cordova !== undefined) {
  console.log('Cordova found, wating for device.');
  document.addEventListener('deviceready', function() {
    angularBoot('deviceready');
  }, false);
} else {
  console.log('Cordova not found, booting application');
  angularBoot('manual');
}
