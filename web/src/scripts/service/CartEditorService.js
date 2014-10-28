'use strict';

/* global _, $, ace, marked, hljs, CartUtility, CartConst */
module.exports = function($http, $q, $cookies, FileUploader, $dataService) {
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
         *     editElement: jQuery.fn.init[1],
         *     postBaseUrl: "http://cart.com//new/84fd8b5f-087e-4d62-998d-10d4ca45b0d7",
         *     postId: "84fd8b5f-087e-4d62-998d-10d4ca45b0d7",
         *     previewElement: jQuery.fn.init[1],
         *     spinnerElement: jQuery.fn.init[1],
         *     spinnerNameElement: jQuery.fn.init[1],
         *     titleElement: jQuery.fn.init[1],
         *     tocContentElement: jQuery.fn.init[1],
         *     tocFirstLinksIdentify: '.markdown-toc-content > ol > li > a',
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
                $dataService.postSaveTmp(postId, editor.title, editor.getSession().getValue());
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

        // file upload related
        /**
         * File {
         *     FilelastModified: 1414117158000,
         *     lastModifiedDate: Fri Oct 24 2014 10:19:18 GMT+0800 (CST),
         *     name: "1697525.jpeg",
         *     size: 9303,
         *     type: "image/jpeg"
         * }
         * FileLikeObject {
         *     lastModifiedDate: Mon Oct 27 2014 12:50:24 GMT+0800 (CST),
         *     size: 269534,
         *     type: "image/png",
         *     name: "6f5ef307gw1elpmcbs6k1j20db0dwmz3.png"
         * }
         */
        var uploader = new FileUploader({
            url: '/api/upload',
            removeAfterUpload: true
        });
        uploader.filters.push({
            name: 'fileTypeFilter',
            fn: function(file) {
                return CartConst.UPLOAD_TYPES.indexOf(file.type) !== -1;
            }
        });
        var uploaderProcessNextUpload = function() {
            if (uploader.queue.length > 0) {
                var fileItem = uploader.queue[0];
                uploaderReportUploadProgress(fileItem.file.name, 0);
                fileItem.formData = [{ "postId": postId }];
                fileItem.upload();
            }
        };
        var uploaderReportUploadProgress = function(name, progress) {
            spinnerNameElement.text('Uploading "' + name + '": ' + progress + '% ...');
        };
        uploader.onWhenAddingFileFailed = function(file) {
            CartUtility.notify('Error', 'File type of "' + file.name + '" is not allowed: ' + file.type, 'error');
        };
        uploader.onProgressItem = function(fileItem, progress) {
            uploaderReportUploadProgress(fileItem.file.name, progress);
        };
        uploader.onErrorItem = function(fileItem) {
            CartUtility.notify('Upload Error!', 'Error encountered while uploading file "' + fileItem.file.name + '"!', 'error');
        };
        uploader.onCompleteItem = function(fileItem) {
            CartUtility.notify('Upload Done!', 'File "' + fileItem.file.name + '" uploaded!', 'success');
            uploaderProcessNextUpload();
        };
        uploader.onCompleteAll = function() {
            CartUtility.notify('Uploads Done!', 'All uploads done!', 'success');
            spinnerElement.hide();
            spinnerNameElement.text('');
        };
        if (CartUtility.isDndSupported()) {
            // intercept document body drag & drop event, prevent document drop page redirect
            $(document).on('dragenter', function(event) {
                event.stopPropagation();
                event.preventDefault();
            }).on('dragover', function(event) {
                event.stopPropagation();
                event.preventDefault();
            }).on('drop', function(event) {
                event.stopPropagation();
                event.preventDefault();
            });
            // bind real drop event
            var aceContent = $('.ace_content');
            aceContent.on('dragenter', function(event) {
                // display drag over view effect
                event.stopPropagation();
                event.preventDefault();
                aceContent.addClass('ace_drag_over');
            }).on('dragleave', function(event) {
                // hide drag over view effect
                event.stopPropagation();
                event.preventDefault();
                aceContent.removeClass('ace_drag_over');
            }).on('dragover', function(event) {
                // intercept the dragover event to enable drop event
                event.stopPropagation();
                event.preventDefault();
            }).on('drop', function(event) {
                // drop to upload
                event.stopPropagation();
                event.preventDefault();
                // styles
                aceContent.removeClass('ace_drag_over');
                spinnerElement.show();
                // upload
                var files = event.originalEvent.dataTransfer.files;
                uploader.addToQueue(files);
                uploaderProcessNextUpload();
            });
        } else {
            CartUtility.notify(
                'Warning',
                'Drag & Drop file upload functionality is not supported in this browser. \n' +
                'You cannot upload file with this browser! \n' +
                'Please use modern browsers like Chrome.',
                'notice',
                100000 // 10s
            );
        }

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