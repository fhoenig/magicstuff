/*
 * Renderer.js 
 *
 * Handles the WebGL context and framebuffer related things.
 *
 */

Renderer = {
    canvas: null,
    gl: null,
    width: 0,
    height: 0,
    fpsLimit: 60,
    running: false,
    stockQuadBuffer: null,
    stockQuadVertexPosition: null,
    magicShader: null,
    blitShader: null,
    renderTargetFront: null,
    renderTargetBack: null,
    recompileTimer: null,
    isInitialized: false
};

Renderer.init = function(canvasNode)
{
    if (this.canvas != null)
        return;
    
    this.canvas = canvasNode;
	try 
    {
		this.gl = this.canvas.getContext('experimental-webgl', { preserveDrawingBuffer: true });
	} 
    catch( error ) 
    { 
    }

	if (!this.gl) 
    {
		alert("WebGL not supported");
	}
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    Renderer.blitShader = ShaderManager.getShader("blitShader", $("#vs_passthrough").text(), $("#fs_blit").text());
    Renderer.magicShader = ShaderManager.getShader("magicShader", $("#vs_passthrough").text(), $("#fs_magic").text());
    
    if (!window.requestAnimationFrame) 
    {
		window.requestAnimationFrame = (function() {

			return window.webkitRequestAnimationFrame ||
				   window.mozRequestAnimationFrame ||
				   window.oRequestAnimationFrame ||
				   window.msRequestAnimationFrame ||
				   function (callback, element) 
                   {
				        window.setTimeout(callback, 1000 / Renderer.fpsLimit);
                   };
		})();
	}

    // create stock quad which we'll use to render EVERYTHING
    var gl = this.gl;
	this.stockQuadBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.stockQuadBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0]), gl.STATIC_DRAW);
	gl.vertexAttribPointer(this.stockQuadVertexPosition, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(this.stockQuadVertexPosition);
    gl.enable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    this.onResize();
    this.isInitialized = true;
    console.log("Renderer initialized.");
};

Renderer.replaceFragmentShader = function(programKey, code)
{
    clearTimeout(Renderer.recompileTimer);
    Renderer.recompileTimer = setTimeout(function() {
        console.log("recompile!");
        Renderer.magicShader = ShaderManager.replaceShader("magicShader", $("#vs_passthrough").text(), code);
    }, 500);
}


Renderer.onResize = function()
{
    if (this.canvas == null)
        return;
        
	this.width = this.canvas.width = window.innerWidth;
	this.height = this.canvas.height = window.innerHeight;

	this.canvas.style.width = window.innerWidth + 'px';
	this.canvas.style.height = window.innerHeight + 'px';
    
    this.gl.viewport(0, 0, this.width, this.height);
    
    if (Renderer.renderTargetBack !== null)
    {
        Renderer.renderTargetBack.destroy();
    }
    if (Renderer.renderTargetFront !== null)
    {
        Renderer.renderTargetFront.destroy();
    }
    
    Renderer.renderTargetBack = new RenderTexture(this.width, this.height);
    Renderer.renderTargetFront = new RenderTexture(this.width, this.height);
}

Renderer.start = function()
{
    this.running = true;
    this._animate();
}

Renderer.stop = function()
{
    this.running = false;
}

Renderer._animate = function()
{
    if (Renderer.running == true) 
    {
        requestAnimationFrame(Renderer._animate);
    }    
    Renderer.render();
}

Renderer.render = function()
{
    var gl = Renderer.gl;
    
    if (Renderer.magicShader == null || Renderer.blitShader == null)
        return;
    
    // 1: draw magic shader into front buffer with backbuffer bound
    gl.bindFramebuffer(gl.FRAMEBUFFER, Renderer.renderTargetFront.fbo);    
    gl.clear(this.gl.COLOR_BUFFER_BIT);
    
    Renderer.magicShader.use();
    gl.uniform2f(Renderer.magicShader.getUniformLocation("mouse"), 0.0, 0.0);
    gl.uniform2f(Renderer.magicShader.getUniformLocation("resolution"), Renderer.width, Renderer.height);
    gl.uniform1f(Renderer.magicShader.getUniformLocation("time"), 0.0);
    gl.uniform1i(Renderer.magicShader.getUniformLocation("backbuffer"), 0); 

    gl.bindTexture(gl.TEXTURE_2D, Renderer.renderTargetBack.texture);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    
    // 2: blit front buffer to context fbo
    Renderer.blitShader.use();
    gl.uniform2f(Renderer.blitShader.getUniformLocation("resolution"), Renderer.width, Renderer.height);
    gl.uniform1i(Renderer.blitShader.getUniformLocation("texture"), 0); 
    gl.bindTexture(gl.TEXTURE_2D, Renderer.renderTargetFront.texture);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
        
    // 3: swap render targets
    var swap = Renderer.renderTargetFront;
    Renderer.renderTargetFront = Renderer.renderTargetBack;
    Renderer.renderTargetBack = swap;    
}
