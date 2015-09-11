import 'angular-material/angular-material.min.css';

import '../styles/main.scss';

import angular from 'angular';
import uiRouter from 'angular-ui-router';
import ngMaterial from 'angular-material';
import ngResource from 'angular-resource';
import lbServices from './lb-services.js';

angular.module('app', [uiRouter, ngMaterial, ngResource, lbServices]);
