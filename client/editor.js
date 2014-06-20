Editor = {
    cm: null
};

Editor.init = function(textarea)
{
    Editor.cm = CodeMirror.fromTextArea(textarea, {
		lineNumbers: true,
		matchBrackets: true,
		indentUnit: 4,
		viewportMargin: Infinity,
		gutters: ["CodeMirror-linenumbers"],
		mode: "text/x-glsl",
		extraKeys: {
            Tab: function(cm) { 
                cm.replaceSelection("    ", "end"); 
            } 
        }
    });
    console.log("Editor initialized.");
};