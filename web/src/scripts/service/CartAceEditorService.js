'use strict';

/* global ace, marked */
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

        aceEditor.getSession().setMode('ace/mode/markdown');
        aceEditor.getSession().on('change', function() {
            $('#' + previewElementId).html(marked(aceEditor.getValue()));
        });

        return aceEditor;
    };

    return {
        'createEditor': createEditor
    };
};