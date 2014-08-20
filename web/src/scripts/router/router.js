'use strict';

module.exports = function($routeProvider, $locationProvider, $routeSegmentProvider) {
    $locationProvider.html5Mode(true);
    $routeSegmentProvider.options.autoLoadTemplates = true;
    $routeSegmentProvider.options.strictMode = true;
    $routeSegmentProvider.
        when('/',                    'blog_list').
        when('/new/:postId',         'blog_new').
        when('/update/:postId',      'blog_update').
        when('/:year/:month/:title', 'blog_view').
        when('/category',            'blog_category').
        when('/category/:category',  'blog_list').
        when('/tag',                 'blog_tag').
        when('/tag/:tag',            'blog_list').
        when('/year/:datetime',      'blog_list').
        when('/month/:datetime',     'blog_list').
        when('/day/:datetime',       'blog_list').
        when('/search',              'search').
        when('/oauth2',              'oauth2').
        when('/login',               'login').
        when('/profile',             'profile').
        when('/master',              'master').
        when('/404',                 '404').
        when('/error',               'error').
        when('/502',                 'error').
        // BLOG
        segment('blog_list', {
            'templateUrl': 'views/blog/list.html',
            'controller': 'CartBlogListCtrl'
        }).
        segment('blog_new', {
            'templateUrl': 'views/blog/edit.html',
            'controller': 'CartBlogNewCtrl',
            'dependencies': ['postId']
        }).
        segment('blog_update', {
            'templateUrl': 'views/blog/edit.html',
            'controller': 'CartBlogUpdateCtrl',
            'dependencies': ['postId']
        }).
        segment('blog_view', {
            'templateUrl': 'views/blog/view.html',
            'controller': 'CartBlogViewCtrl',
            'dependencies': ['year', 'month', 'title']
        }).
        segment('blog_category', {
            'templateUrl': 'views/blog/label.html',
            'controller': 'CartBlogCategoryCtrl'
        }).
        segment('blog_tag', {
            'templateUrl': 'views/blog/label.html',
            'controller': 'CartBlogTagCtrl'
        }).
        // SEARCH
        segment('search', {
            'templateUrl': 'views/search/search.html',
            'controller': 'CartSearchCtrl'
        }).
        // OAUTH2
        segment('oauth2', {
            'templateUrl': 'views/oauth2/oauth2.html',
            'controller': 'CartOauthCtrl'
        }).
        // LOGIN
        segment('login', {
            'templateUrl': 'views/login/login.html',
            'controller': 'CartLoginCtrl'
        }).
        // PROFILE
        segment('profile', {
            'templateUrl': 'views/profile/profile.html',
            'controller': 'CartProfileCtrl'
        }).
        // MASTER
        segment('master', {
            'templateUrl': 'views/master/master.html',
            'controller': 'CartMasterCtrl'
        }).
        // 404
        segment('404', {
            'templateUrl': 'views/404/404.html'
        }).
        // ERROR
        segment('error', {
            'templateUrl': 'views/error/error.html'
        });
    $routeProvider.otherwise({ redirectTo: '/404' });
};