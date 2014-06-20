Shader = Class.extend({
    
    init: function(prog) 
    {
        this.prog = prog;
        this.uniformCache = {};
    },
    
    use: function()
    {
        if (this.prog != null)
        {
            var gl = Renderer.gl;
            gl.useProgram(this.prog);            
        }
    },
    
    getUniformLocation: function(uniform)
    {
        if (typeof this.uniformCache[uniform] == "undefined")
        {
            var gl = Renderer.gl;
            var u = gl.getUniformLocation(this.prog, uniform);
            this.uniformCache[uniform] = u;
            return u;        
        }
        else return this.uniformCache[uniform];
    }
});

ShaderManager = {
    shaderPrograms: {},
    uniformCache: {},
    shadersPending: {}
};


ShaderManager.getShader = function(vsh, fsh, callback)
{
    var gl = Renderer.gl;
    var programKey = vsh+fsh;
    
    if (!(programKey in this.shaderPrograms))
    {
        var vshUrl = "/shaders/" + vsh + ".vsh?nocache=" + Date.now();
        var fshUrl = "/shaders/" + fsh + ".fsh?nocache=" + Date.now();
        
        // if shader was already requested, add callback to pending queue
        if (programKey in ShaderManager.shadersPending)
        {
            ShaderManager.shadersPending[programKey].push(callback);
            return;
        }
        
        // keep a list of callbacks of requesters for this very shader
        ShaderManager.shadersPending[programKey] = [callback];
        
        HTTP.get(vshUrl, null, function(err, res) {

            var vertexShader = ShaderManager.compileShader(res.content, gl.VERTEX_SHADER);
            if (vertexShader == null)
            {
                callback(null);
                return;
            }
            
            HTTP.get(fshUrl, null, function(err, res) {
                var fragmentShader = ShaderManager.compileShader(res.content, gl.FRAGMENT_SHADER);
                if (fragmentShader == null)
                {
                    callback(null);
                    return;
                }
                var shaderProg = ShaderManager.linkProgram(vertexShader, fragmentShader);
                if (shaderProg == null)
                {
                    callback(null);
                    return;
                }
                ShaderManager.shaderPrograms[programKey] = new Shader(shaderProg);
                for (var cb in ShaderManager.shadersPending[programKey])
                {
                    (ShaderManager.shadersPending[programKey][cb])(ShaderManager.shaderPrograms[programKey]);
                }
                delete ShaderManager.shadersPending[programKey];
            });
        });
    }
    else
    {
        callback(this.shaderPrograms[programKey]);
    }
};

ShaderManager.compileShader = function(src, type)
{
    var gl = Renderer.gl;
	var shader = gl.createShader(type);

	gl.shaderSource(shader, src);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS )) 
    {
		var error = gl.getShaderInfoLog(shader);
		while ((error.length > 1) && (error.charCodeAt(error.length - 1) < 32)) 
        {
			error = error.substring(0, error.length - 1);
		}
		console.warn(error);
		return null;
	}
	return shader;  
};

ShaderManager.linkProgram = function(vert, frag)
{
    var gl = Renderer.gl;    
    var program = gl.createProgram();

	if (vert == null || frag == null) 
        return null;

	gl.attachShader(program, vert);
	gl.attachShader(program, frag);

	gl.deleteShader(vert);
	gl.deleteShader(frag);
    
	gl.linkProgram(program);

	if (!gl.getProgramParameter( program, gl.LINK_STATUS)) 
    {
		var error = gl.getProgramInfoLog(program);
		console.warn(error);
		console.warn(gl.getProgramParameter(program, gl.VALIDATE_STATUS), 'ERROR: ' + gl.getError());
		return null;
	}
    return program;
}
