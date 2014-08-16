'use strict';

module.exports = function($routeProvider, $locationProvider, $routeSegmentProvider) {
    $locationProvider.html5Mode(true);
    $routeSegmentProvider.options.autoLoadTemplates = true;
    $routeSegmentProvider.options.strictMode = true;
    $routeSegmentProvider.
        when('/',                    'blog.list').
        when('/new/:postId',         'blog.new').
        when('/update/:postId',      'blog.update').
        when('/:year/:month/:title', 'blog.view').
        when('/category',            'blog.category').
        when('/category/:category',  'blog.list').
        when('/tag',                 'blog.tag').
        when('/tag/:tag',            'blog.list').
        when('/year/:datetime',      'blog.list').
        when('/month/:datetime',     'blog.list').
        when('/day/:datetime',       'blog.list').
        when('/search',              'search').
        when('/oauth2',              'oauth2').
        when('/login',               'login').
        when('/profile',             'profile').
        when('/master',              'master').
        when('/404',                 '404').
        when('/error',               'error').
        when('/502',                 'error').
        // BLOG
        segment('blog', {
            'templateUrl': 'views/blog/home.html',
            'controller': 'CartBlogCtrl'
        }).
        within().
        segment('list', {
            'templateUrl': 'views/blog/list.html',
            'controller': 'CartBlogListCtrl'
        }).
        segment('new', {
            'templateUrl': 'views/blog/edit.html',
            'controller': 'CartBlogNewCtrl',
            'dependencies': ['postId']
        }).
        segment('update', {
            'templateUrl': 'views/blog/edit.html',
            'controller': 'CartBlogUpdateCtrl',
            'dependencies': ['postId']
        }).
        segment('view', {
            'templateUrl': 'views/blog/view.html',
            'controller': 'CartBlogViewCtrl',
            'dependencies': ['year', 'month', 'title']
        }).
        segment('category', {
            'templateUrl': 'views/blog/label.html',
            'controller': 'CartBlogCategoryCtrl'
        }).
        segment('tag', {
            'templateUrl': 'views/blog/label.html',
            'controller': 'CartBlogTagCtrl'
        }).
        up().
        // SEARCH
        segment('search', {
            'templateUrl': 'views/search/home.html',
            'controller': 'CartSearchCtrl'
        }).
        // OAUTH2
        segment('oauth2', {
            'templateUrl': 'views/oauth2/home.html',
            'controller': 'CartOauthCtrl'
        }).
        // LOGIN
        segment('login', {
            'templateUrl': 'views/login/home.html',
            'controller': 'CartLoginCtrl'
        }).
        // PROFILE
        segment('profile', {
            'templateUrl': 'views/profile/home.html',
            'controller': 'CartProfileCtrl'
        }).
        // MASTER
        segment('master', {
            'templateUrl': 'views/master/home.html',
            'controller': 'CartMasterCtrl'
        }).
        // 404
        segment('404', {
            'templateUrl': 'views/404/home.html'
        }).
        // ERROR
        segment('error', {
            'templateUrl': 'views/error/home.html'
        });
    $routeProvider.otherwise({ redirectTo: '/404' });
};