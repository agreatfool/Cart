'use strict';

/* global _, $, ace, marked, hljs, CartUtility */
module.exports = function() {
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
        if (typeof editElementId === 'undefined' || editElementId === null || editElementId === '') {
            editElementId = 'markdown-edit';
        }
        if (typeof previewElementId === 'undefined' || previewElementId === null || previewElementId === '') {
            previewElementId = 'markdown-preview';
        }
        if (typeof baseUrl === 'undefined' || baseUrl === null) {
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
        } else if (editHeight < previewHeight) {
            editor.editElement.css('height', previewHeight);
        }

        var toc = CartUtility.buildToc(converted, editor.baseUrl);
        $('.markdown-toc-content').html(toc);
    };

    return {
        'createEditor': createEditor,
        'previewMd': previewMd
    };
};