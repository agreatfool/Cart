'use strict';

/* global _, $, ace, angular, marked, hljs, CartUtility, CartConst */
module.exports = function($http, $q, $cookies, $dataService) {
    // markd
    var renderer = new marked.Renderer();
    renderer.heading = function(text, level) { // add anchor link
        return '' +
            '<h' + level + '>' +
                '<a name="' + CartUtility.escapeAnchorName(text) + '"></a>' +
                text +
            '</h' + level + '>';
    };
    marked.setOptions({
        renderer: renderer,
        gfm: true,
        tables: true,
        breaks: true,
        pedantic: false,
        sanitize: true,
        smartLists: true,
        smartypants: false,
        highlight: function (code, lang) {
            // since the highlight class name added with highlight lib itself not working, have to wrap code tag by self
            return '<code class="hljs ' + lang + '">' + hljs.highlightAuto(code, [lang]).value + '</code>';
        }
    });

    var createEditor = function(options) {
        /**
         * options {
         *     categoryElement: jQuery.fn.init[1],
         *     editElement: jQuery.fn.init[1],
         *     postBaseUrl: "http://cart.com//new/84fd8b5f-087e-4d62-998d-10d4ca45b0d7",
         *     postId: "84fd8b5f-087e-4d62-998d-10d4ca45b0d7",
         *     previewElement: jQuery.fn.init[1],
         *     spinnerElement: jQuery.fn.init[1],
         *     spinnerNameElement: jQuery.fn.init[1],
         *     tagsIdentify: "#markdown-post-tags > span",
         *     titleElement: jQuery.fn.init[1],
         *     tocContentElement: jQuery.fn.init[1],
         *     tocFirstLinksIdentify: ".markdown-toc-content > ol > li > a",
         *     tocIconElement: jQuery.fn.init[1],
         *     topBtnElement: jQuery.fn.init[1]
         * }
         */
        // options check
        if (_.isUndefined(options) || _.isEmpty(options)) {
            return false; // invalid options
        }
        var postId = options.postId;
        if (!_.isString(postId) || _.isEmpty(postId)) {
            return null;
        }
        var baseUrl = options.postBaseUrl;
        if (!_.isString(baseUrl) || _.isEmpty(baseUrl)) {
            return null;
        }
        var editElement = options.editElement;
        if (!_.isObject(editElement) || editElement.length <= 0) {
            return false;
        }
        var previewElement = options.previewElement;
        if (!_.isObject(previewElement) || previewElement.length <= 0) {
            return false;
        }
        var titleElement = options.titleElement;
        if (!_.isObject(titleElement) || titleElement.length <= 0) {
            return false;
        }
        var categoryElement = options.categoryElement;
        if (!_.isObject(categoryElement) || categoryElement.length <= 0) {
            return false;
        }
        var tagsIdentify = options.tagsIdentify;
        var tocIconElement = options.tocIconElement;
        if (!_.isObject(tocIconElement) || tocIconElement.length <= 0) {
            return false;
        }
        var tocContentElement = options.tocContentElement;
        if (!_.isObject(tocContentElement) || tocContentElement.length <= 0) {
            return false;
        }
        var tocFirstLinksIdentify = options.tocFirstLinksIdentify;
        var topBtnElement = options.topBtnElement;
        if (!_.isObject(topBtnElement) || topBtnElement.length <= 0) {
            return false;
        }
        var spinnerElement = options.spinnerElement;
        if (!_.isObject(spinnerElement) || spinnerElement.length <= 0) {
            return false;
        }
        var spinnerNameElement = options.spinnerNameElement;
        if (!_.isObject(spinnerNameElement) || spinnerNameElement.length <= 0) {
            return false;
        }

        // editor
        var aceEditor = ace.edit(editElement.attr('id'));

        aceEditor.setOption("showPrintMargin", false);
        aceEditor.setTheme('ace/theme/earthsong');
        aceEditor.setHighlightActiveLine(true);
        aceEditor.setBehavioursEnabled(true);

        aceEditor.getSession().setMode('ace/mode/markdown');
        aceEditor.getSession().on('change', function() {
            previewMd(aceEditor);
        });

        aceEditor.session.setUseWrapMode(true);
        aceEditor.session.setNewLineMode("unix");
        aceEditor.session.setScrollTop(false);
        aceEditor.renderer.setShowGutter(true);
        aceEditor.renderer.setPrintMarginColumn(true);
        aceEditor.renderer.setPadding(15);
        aceEditor.renderer.setScrollMargin(20);
        aceEditor.resize(true);

        aceEditor.postId = postId;
        aceEditor.baseUrl = baseUrl;
        aceEditor.editElement = editElement;
        aceEditor.previewElement = previewElement;
        aceEditor.titleElement = titleElement;
        aceEditor.categoryElement = categoryElement;
        aceEditor.tagsIdentify = tagsIdentify;
        aceEditor.tocIconElement = tocIconElement;
        aceEditor.tocContentElement = tocContentElement;
        aceEditor.tocFirstLinksIdentify = tocFirstLinksIdentify;
        aceEditor.topBtnElement = topBtnElement;
        aceEditor.spinnerElement = spinnerElement;
        aceEditor.spinnerNameElement = spinnerNameElement;

        aceEditor.commands.addCommand({
            "name": "cmdSaveTmp",
            "bindKey": {"win": "Ctrl-S", "mac": "Command-S"},
            "exec": function(editor) {
                CartUtility.log('ACE Ctrl-S triggered: Save post tmp.');

                var title = editor.titleElement.text().trim();

                var category = $dataService.categorySearch(editor.categoryElement.text().trim());
                if (_.isEmpty(category)) {
                    category = {};
                } else {
                    category = category.pop(); // [searchedCategory].pop()
                }

                var tags = [];
                var tagNames = [];
                var tagElements = $(editor.tagsIdentify);
                if (tagElements.length > 0) {
                    _.forEach(tagElements, function(element) {
                        tagNames.push($(element).text().trim());
                    });
                }
                if (tagNames.length > 0) {
                    _.forEach(tagNames, function(tagName) {
                        var tag = $dataService.tagSearch(tagName);
                        if (!_.isEmpty(tag)) {
                            tags.push(tag.pop()); // [searchedTag].pop()
                        }
                    });
                }

                $dataService.postSaveTmp(
                    postId, title,
                    editor.getSession().getValue(),
                    category, tags
                ).then(function(result) {
                    if (true === result) {
                        CartUtility.notify('Done!', 'Tmp post saved!', 'success');
                    }
                });
            }
        });
        aceEditor.commands.addCommand({
            "name": "cmdUpload",
            "bindKey": {"win": "Ctrl-U", "mac": "Command-U"},
            "exec": function(editor) {
                CartUtility.log('ACE Ctrl-U triggered: Upload post.');
                // UPLOAD POST
            }
        });
        aceEditor.commands.addCommand({
            "name": "cmdDisplayIndex",
            "bindKey": {"win": "Ctrl-I", "mac": "Command-I"},
            "exec": function(editor) {
                CartUtility.log('ACE Ctrl-I triggered: Display post index.');
                CartUtility.toggleToc(editor.tocIconElement, editor.tocContentElement);
            }
        });
        aceEditor.commands.addCommand({
            "name": "cmdGotoTop",
            "bindKey": {"win": "Ctrl-H", "mac": "Command-H"},
            "exec": function(editor) {
                CartUtility.log('ACE Ctrl-H triggered: Goto page top.');
                editor.topBtnElement.click();
            }
        });

        return aceEditor;
    };

    var previewMd = function(editor) {
        var content = editor.getSession().getValue();
        var converted = marked(content);

        editor.previewElement.html(converted);

        var editHeight = parseInt(editor.editElement.css('height'));
        var previewHeight = parseInt(editor.previewElement.css('height'));
        if (editHeight > previewHeight) {
            editor.previewElement.css('height', editHeight);
            editor.resize();
        } else if (editHeight < previewHeight) {
            editor.editElement.css('height', previewHeight);
            editor.resize();
        }

        var toc = CartUtility.buildToc(converted, editor.baseUrl);
        if (toc !== '') { // find header links
            // apply toc html
            editor.tocContentElement.html(toc);
            // apply post title
            editor.titleElement.text($($(editor.tocFirstLinksIdentify)[0]).text());
        }
    };

    return {
        'createEditor': createEditor,
        'previewMd': previewMd
    };
};