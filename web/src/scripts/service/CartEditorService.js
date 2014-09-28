'use strict';

/* global $, ace, marked */
module.exports = function() {

    var createEditor = function(editElementId, previewElementId) {
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
        //aceEditor.setFontSize("13px");
        aceEditor.getSession().on('change', function() {
            var editElement = $('#' + editElementId);
            var previewElement = $('#' + previewElementId);
            previewElement.html(marked(aceEditor.getSession().getValue()));
            editElement.css('height', previewElement.css('height'));
        });

        marked.setOptions({
            highlight: function (code, lang) {
                console.log(lang);
                console.log(code);
                //return require('highlight.js').highlightAuto(code).value;
            }
        });

        //editor = ace.edit("editor"), window._editor = new Markdown.Editor({}), _editor.run(editor), core = {}, _editor.hooks.set("insertLinkDialog", function(a) {
        //    return core.insertLinkCallback = a, utils.resetModalInputs(), $(".modal-insert-link").modal(), !0
        //}), _editor.hooks.set("insertImageDialog", function(a) {
        //    return core.insertLinkCallback = a, core.catchModal ? !0 : (utils.resetModalInputs(), $(".modal-insert-image").modal(), !0)
        //}), _editor.hooks.set("onPreviewRefresh", function() {
        //    return previewMd(), !0
        //}), $(".action-insert-link").click(function(a) {
        //    var b = utils.getInputTextValue($("#input-insert-link"), a);
        //    void 0 !== b && (core.insertLinkCallback(b), core.insertLinkCallback = void 0)
        //}), $(".action-insert-image").click(function(a) {
        //    var b = utils.getInputTextValue($("#input-insert-image"), a);
        //    b && Vine.trigger("ACTION_INSERT_IMAGE", b.trim())
        //}), $(".modal-insert-link, .modal-insert-image").on("hidden.bs.modal", function() {
        //    void 0 !== core.insertLinkCallback && (core.insertLinkCallback(null), core.insertLinkCallback = void 0)
        //}), editor.on("focus", function() {
        //    Session.resume()
        //}), editor.on("blur", function() {
        //    Session.pause()
        //}), $(document).ready(function() {
        //    !function(a) {function b(b) {
        //        var c = a.lines[b];
        //        0 !== c.length && /heading.*multi/.test(c[0].type) && b && a.lines[b - 1].map(function(a) {
        //            a.type = c[0].type + ".prev"
        //        })
        //    }function c() {
        //        if (a.running) {
        //            for (var d = new Date, e = a.currentLine || 0, f = -1, g = a.doc; a.lines[e];) e++;
        //            var h = e,
        //                i = g.getLength(),
        //                j = 0;
        //            for (a.running = !1; i > e;) {
        //                a.$tokenizeRow(e), f = e;
        //                do b(e), e++;
        //                while (a.lines[e]);
        //                if (j++, j % 5 === 0 && new Date - d > 20) return a.running = setTimeout(c, 20), void(a.currentLine = e)
        //            }
        //            a.currentLine = e, f >= h && a.fireUpdateEvent(h, f)
        //        }
        //    }
        //        a.$worker = function() {
        //            a.lines.splice(0, a.lines.length), a.states.splice(0, a.states.length), a.currentLine = 0, c()
        //        }
        //    }(editor.session.bgTokenizer)
        //})

        return aceEditor;
    };

    return {
        'createEditor': createEditor
    };
};