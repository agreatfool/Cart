'use strict';

/* global $, _, marked, uuid, CartUtility */
module.exports = function ($scope, $location, $window, $routeParams, $anchorScroll, $accessSerivce, $dataService) {
    CartUtility.log('CartBlogViewCtrl');

    var postId = $scope.postId = $routeParams.postId;
    var postBaseUrl = CartUtility.getPureAbsUrlFromLocation($location);

    $scope.isMaster = $accessSerivce.isMaster();

    $scope.rootUrl = CartUtility.getPureRootUrlFromLocation($location);

    $scope.createNewPost = function() {
        if (!$scope.isMaster) {
            return;
        }
        // redirect to create post page
        $window.location.href = CartUtility.getPureRootUrlFromLocation($location) + 'edit/' + uuid.v4();
    };

    $dataService.postMdFetch(postId).then(function(markdown) {
        if (_.isString(markdown) && _.isEmpty(markdown)) {
            // normal end of fetching api, and empty content returned, means user has no privilege to view this post, redirect to 404
            $location.url('/404');
        }

        markdown = CartUtility.parseMdPureContent(markdown);

        var converted = marked(markdown);
        var toc = CartUtility.buildToc(converted, postBaseUrl);

        $('.post-view').html('<h1>Index</h1>' + toc + converted);
    });

    $scope.$on('$routeChangeStart', function() {
        CartUtility.log('CartBlogViewCtrl $routeChangeStart entered!');
        // anchor link logic
        var prevHash = $location.hash();
        if (_.isString(prevHash) && !_.isEmpty(prevHash)) {
            $location.hash(CartUtility.escapeAnchorName(prevHash));
            $anchorScroll();
            $location.hash(prevHash);
        }
    });
};