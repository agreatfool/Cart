'use strict';

/* global _, $, ace, marked, hljs, CartUtility */
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

    var createEditor = function(editElementId, previewElementId, baseUrl) {
        // ACE
        if (_.isUndefined(editElementId) || _.isNull(editElementId) || _.isEmpty(editElementId)) {
            editElementId = 'markdown-edit';
        }
        if (_.isUndefined(previewElementId) || _.isNull(previewElementId) || _.isEmpty(previewElementId)) {
            previewElementId = 'markdown-preview';
        }
        if (_.isUndefined(baseUrl) || _.isNull(baseUrl)) {
            baseUrl = '';
        }

        var aceEditor = ace.edit(editElementId);

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

        aceEditor.editElement = $('#' + editElementId);
        aceEditor.previewElement = $('#' + previewElementId);
        aceEditor.baseUrl = baseUrl;

        aceEditor.commands.addCommand({
            "name": "cmdSaveTmp",
            "bindKey": {"win": "Ctrl-S", "mac": "Command-S"},
            "exec": function(editor) {
                CartUtility.log('ACE Ctrl-S triggered: Save post tmp.');
                // SAVE TMP
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
                CartUtility.toggleToc();
            }
        });
        aceEditor.commands.addCommand({
            "name": "cmdGotoTop",
            "bindKey": {"win": "Ctrl-H", "mac": "Command-H"},
            "exec": function(editor) {
                CartUtility.log('ACE Ctrl-H triggered: Goto page top.');
                $('.page-to-top').click();
            }
        });

        // file upload related
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
                aceContent.removeClass('ace_drag_over');
                CartUtility.notify('Uploading', 'Start to upload file ', 'info');
                var files = event.originalEvent.dataTransfer.files;
                console.log(files);
                console.log('drop!');
                $dataService.fileUpload(files[0]);
                event.stopPropagation();
                event.preventDefault();
            });
        } else {
            CartUtility.notify(
                'Warning',
                'Drag & Drop file upload functionality is not supported in this browser. \n' +
                'You cannot upload file! \n' +
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
        $('.markdown-toc-content').html(toc);
    };

    return {
        'createEditor': createEditor,
        'previewMd': previewMd
    };
};