
(function () {

    // store a reference to the application object that will be created
    // later on so that we can use it if need be
    var app;

    // create an object to store the models for each view
   

    // this function is called by Cordova when the application is loaded by the device
    document.addEventListener('deviceready', function () {  
      
      // hide the splash screen as soon as the app is ready. otherwise
      // Cordova will wait 5 very long seconds to do it for you.
      navigator.splashscreen.hide();

      app = new kendo.mobile.Application(document.body, {
        
        // comment out the following line to get a UI which matches the look
        // and feel of the operating system
        skin: 'flat',

        // the application needs to know which view to load first
       transition: 'zoom'
      });

    }, false);


}());

$(document).ready(function(){
  $("#owl-news").owlCarousel({autoPlay:true,responsive:true});
 

  
      window.setTimeout(function(){
      $("#owl-sports").owlCarousel({autoPlay:true,responsive:true});
    },500);
   
      window.setTimeout(function(){
           $("#owl-lifestyle").owlCarousel({autoPlay:true,responsive:true});
    },3500);

});