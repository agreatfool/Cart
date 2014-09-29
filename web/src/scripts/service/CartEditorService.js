'use strict';

/* global _, $, ace, marked, hljs */
module.exports = function() {
    // markd
    var renderer = new marked.Renderer();
    renderer.heading = function(text, level) { // add anchor link
        return '' +
            '<h' + level + '>' +
                '<a name="' + encodeURIComponent(text) + '"></a>' +
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

    var createEditor = function(editElementId, previewElementId) {
        // ACE
        if (typeof editElementId === 'undefined' || editElementId === null || editElementId === '') {
            editElementId = 'markdown-edit';
        }
        if (typeof previewElementId === 'undefined' || previewElementId === null || previewElementId === '') {
            previewElementId = 'markdown-preview';
        }

        var aceEditor = ace.edit(editElementId);

        aceEditor.setOption("showPrintMargin", false);
        aceEditor.setTheme('ace/theme/earthsong');
        aceEditor.setHighlightActiveLine(true);
        aceEditor.setBehavioursEnabled(true);

        aceEditor.getSession().setMode('ace/mode/markdown');

        aceEditor.session.setUseWrapMode(true);
        aceEditor.session.setNewLineMode("unix");
        aceEditor.renderer.setShowGutter(true);
        aceEditor.renderer.setPrintMarginColumn(true);
        aceEditor.renderer.setPadding(15);
        aceEditor.renderer.setScrollMargin(true ? 20 : 40, 40); // ENV.chrome_app ? 20 : 40, 40
        aceEditor.getSession().setUseWrapMode(true);
        aceEditor.session.setScrollTop(false);
        aceEditor.resize(true);
        aceEditor.getSession().on('change', function() {
            previewMd(aceEditor);
        });

        aceEditor.editElement = $('#' + editElementId);
        aceEditor.previewElement = $('#' + previewElementId);

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

        buildMdToc(converted);
    };

    var buildMdToc = function(html) { // TODO
        var tocArray = {1: [], 2: [], 3: [], 4: [], 5: [], 6: []};

        var prevLevel = null;
        var appendHeader = function(headerLevel, headerText, anchorName) {
            if (prevLevel == null) {
                tocArray.push([headerText, anchorName]);
            } else {

            }
        };

        if (typeof html !== 'undefined' && html !== null && html !== '') {
            var headers = $(html).filter(':header');
            _.forEach(headers, function(header) {
                var hElement = $(header);
                var headerLevel = parseInt(hElement.prop("tagName").substring(1));
                var headerText = hElement.text();
                var anchorName = hElement.find('a').attr('name');
            });
            $('<ol></ol>');
        }

        return toc;
    };

    return {
        'createEditor': createEditor,
        'previewMd': previewMd,
        'buildMdToc': buildMdToc
    };
};