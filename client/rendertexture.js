
RenderTexture = Class.extend({
    
    init: function(width, height)
    {
        var gl = Renderer.gl;
        this.width = width;
        this.height = height;
		this.fbo = gl.createFramebuffer();
		this.texture = gl.createTexture();
        
		// set up framebuffer
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, 5121, null);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

		gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
        
        // check
        var stat = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (stat != gl.FRAMEBUFFER_COMPLETE)
            console.error("Framebuffer incomplete");
        
		// clean up
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    },
    
    destroy: function()
    {
        var gl = Renderer.gl;
        gl.deleteFramebuffer(this.fbo);
        gl.deleteTexture(this.texture);
    } 
});