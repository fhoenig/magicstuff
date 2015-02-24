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
    shaderPrograms: {}
};


ShaderManager.getShader = function(programKey, vsh, fsh)
{
    var gl = Renderer.gl;
    
    if (!(programKey in this.shaderPrograms))
    {
        var vertexShader = ShaderManager.compileShader(vsh, gl.VERTEX_SHADER);
        if (vertexShader == null)
        {
            return;
        }
            
        var fragmentShader = ShaderManager.compileShader(fsh, gl.FRAGMENT_SHADER);
        if (fragmentShader == null)
        {
            return;
        }
        var shaderProg = ShaderManager.linkProgram(vertexShader, fragmentShader);
        if (shaderProg == null)
        {
            return;
        }
        ShaderManager.shaderPrograms[programKey] = new Shader(shaderProg);
        return ShaderManager.shaderPrograms[programKey];
    }
    else
    {
        return this.shaderPrograms[programKey];
    }
};

ShaderManager.replaceShader = function(programKey, vsh, fsh)
{
    var gl = Renderer.gl;
    if (programKey in this.shaderPrograms)
    {
        var old = this.shaderPrograms[programKey];
        gl.deleteProgram(old.prog);
        delete this.shaderPrograms[programKey];
    }
    return ShaderManager.getShader(programKey, vsh, fsh);
}

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
