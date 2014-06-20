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
    
	Editor.cm.on("change", function(cm, change) {

        console.log("change");
        // clearTimeout(compileTimer);
        // compileTimer = setTimeout(compile, 500);

    });
    
    console.log("Editor initialized.");
};