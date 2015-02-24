Template.framebuffer.rendered = function() 
{
    Renderer.init(this.find('canvas'));
    Renderer.start();
};



Meteor.startup(function() 
{
    $(window).resize(function(evt) 
    {
        Renderer.onResize();
    });
    
});