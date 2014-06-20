Template.framebuffer.rendered = function() 
{
    Renderer.init(this.find('canvas'));
    Renderer.start();
};

Template.editor.rendered = function()
{
    Editor.init(this.find('textarea'));
}

Meteor.startup(function() 
{
    $(window).resize(function(evt) 
    {
        Renderer.onResize();
    });
});