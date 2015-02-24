Template.framebuffer.rendered = function() 
{
    Renderer.init(this.find('canvas'));
    Renderer.start();
};


Meteor.startup(function() 
{
    Session.set("currentCode", $("#fs_magic").text());
    $(window).resize(function(evt) 
    {
        Renderer.onResize();
    });
    
});