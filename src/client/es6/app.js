import 'angular-material/angular-material.min.css';

import '../styles/main.scss';

import angular from 'angular';
import uiRouter from 'angular-ui-router';
import ngMaterial from 'angular-material';
import ngResource from 'angular-resource';
import lbServices from './lb-services.js';
import CartRouters from './routers.js';
import Theming from './theme.js';

// Angular application initialization
let app = angular.module('app', [
  uiRouter, ngMaterial, ngResource, lbServices
]);

// Angular UI router config
app.config(['$stateProvider', '$urlRouterProvider', CartRouters]);

// Angular Material Theme config
app.config(['$mdThemingProvider', Theming]);
