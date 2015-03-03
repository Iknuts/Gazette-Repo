
 var app;
var facebook_access_token="CAAWFiqsF8SsBABXalNYbPNCbN9L9RDPyAbtd2OxpJM5r1cplIEKgeUfwOLZBlu4JNZAkSTTLQZAJk3m6qfffhqkpR9ZCuHjL9JYz4HxZBEdBphBWcZCUU2R9tD4P9Cj69lRxm123VkDnqS5q1JSQgVsGg4dUTIbzclqmiyOZBORKAu7Wyd9rREdEBMjiSmFKf7c6lvaFNoZCgyJrWysQfilh";
   var step=0;
var db=null;
var version = 1.0;
var dbName = "gazetteDbz";
var dbDisplayName = "gazetteDbz";
var dbSize = 2 * 1024 * 1024;
var everlive_API_KEY="OLUBGHjEPn5OFr3O";
var el;
var user = null;

 
(function () {

    // store a reference to the application object that will be created
    // later on so that we can use it if need be

    // create an object to store the models for each view
   

    // this function is called by Cordova when the application is loaded by the device
    document.addEventListener('deviceready', function () {  
     
            if (navigator.connection.type === Connection.NONE||navigator.connection.type === Connection.UNKNOWN) {
                 localStorage.setItem("mode","offline");
                $('#lock-title').text('Device Secure');
                if(localStorage.getItem("first-use")==null){
                    alert("You need the internet if this is the first time you're using the app. Sorry");
                    return;
                }else{
                  
                }
                  
            }else{
                 $('#lock-title').text('Cloud Secure');
                localStorage.setItem("mode","online");
            }
        
        //check online status
        
        
      // hide the splash screen as soon as the app is ready. otherwise
      // Cordova will wait 5 very long seconds to do it for you.
      navigator.splashscreen.hide();
        

      app = new kendo.mobile.Application(document.body, {
        
        // comment out the following line to get a UI which matches the look
        // and feel of the operating system
        skin: 'flat'

        // the application needs to know which view to load first
      // transition: 'zoom'
      });
         el = new Everlive(everlive_API_KEY);
                try{
                      db = openDatabase(dbName, version, dbDisplayName, dbSize, function(database) 
                           {
                          
                           });
                    if(db){
                           db.transaction(function(tx) { 
                               
                            tx.executeSql("CREATE TABLE IF NOT EXISTS MyPapers (paperid TEXT PRIMARY KEY, title TEXT)",
				[],
				function(gg,tx){
                    console.log("NEWSPAPER STAND CREATED!!")
                },
				function(error){
                    console.log("error:" + error);
                }
			)             
                           });
                     
                           db.transaction(function(tx) {  tx.executeSql("CREATE TABLE IF NOT EXISTS Articles (id INTEGER UNIQUE, title TEXT, url TEXT,content TEXT,image TEXT, newspaper TEXT,date TEXT)");});
                          db.transaction(function(tx) {tx.executeSql("CREATE TABLE IF NOT EXISTS Category (id INTEGER PRIMARY KEY, title TEXT, description TEXT,parent INTEGER)");});
                          db.transaction(function(tx) {  tx.executeSql("CREATE TABLE IF NOT EXISTS Article_Categories (articleid INTEGER , categoryId INTEGER, PRIMARY KEY(articleid, categoryid))");});
                            db.transaction(function(tx) {  tx.executeSql("CREATE TABLE IF NOT EXISTS User (id INTEGER PRIMARY KEY, email TEXT, displayname TEXT,username TEXT, pin INTEGER, subscription_startDate DATETIME, subscription_endDate DATETIME)");});
                    
         saveCategory(33,"News","General News Updates",0);
     saveCategory(14,"Sports","All sports related news",0);
     saveCategory(10,"Lifestyle","No Description Available",0);
     saveCategory(15,"Tech","All Tech related news",0);
     saveCategory(31,"Money","No Description Available",0);
     saveCategory(35,"World","No Description Available",0);
                               
                               
            
      } 
                    

                    
                  } catch(e){
                        alert(e);
                }
    }, false);


}());
 
function RegisterUserDetails(username,email,displayname,password){
    //get nounce with ajax
   if(localStorage.getItem("user_id")!=null){
       alert("This device is already registered to different user");
       app.navigate("#Login","slide:left");
       return;
   }
     app.pane.loader.show();
   
var attrs = {
    Email: email,
    DisplayName: displayname
};
//save to cloud first (if successfull... save to webSQL storage)
el.Users.register(email,
    password,
    attrs,
    function(data) {
        if(db){

                            db.transaction(function(tx) {
                     tx.executeSql(  "INSERT OR REPLACE INTO User (email, displayname,username,pin) VALUES (?,?,?,?)", [email, displayname,email,password],
                                                    function(tx, res) {
                                                           clearRegistration();
                                                        app.navigate('#Login',"slide:right");
                                                         updateStorage();
                                                     localStorage.setItem("first-use",false);
                                                         app.pane.loader.hide();
                                                    },
                                                    function(tx, res) {
                                                        alert('error: ' + res.message);
                              });
                                            });
                                }
 
   localStorage.setItem("user_id",JSON.stringify(data.result.Id));
    },
    function(error) {
        alert(JSON.stringify(error));
       app.pane.loader.hide();
    });
    
}
function SaveArticle_toDevice(id,title,url,content,image,date,paper){
    try{
            if(db){
                db.transaction(function(tx) {
                     tx.executeSql(
                "INSERT OR REPLACE INTO Articles (id,title,url,content,image,newspaper,date)  VALUES (?,?,?,?,?,?,?)",
                [id,title,url,content,image,paper,date],
                function(tx, res) {
                    savePaper(paper,paper);
                 },
                function(tx, res) {
                    alert('error: ' + res.message);
                });
                });
            }
        else{
            alert("Db not open");
        }
        }
        catch(e){
            alert(e);
                  }
} 
function saveArticle_Category(articleid,categoryid){
    if(db){
        db.transaction(function(tx) {
             tx.executeSql(
        "INSERT OR REPLACE INTO Article_Categories (articleid,categoryid) VALUES (?,?)",
        [articleid, categoryid],
        function(tx, res) {
            console.log("insertId: " + res.insertId + ", rows affected: " + res.rowsAffected);
        },
        function(tx, res) {
            alert('error: ' + res.message);
        });
        });
    }
}

 function Login( ){
     app.pane.loader.show();
     var username=$('#txtLogin').val();
     var password=$('#txtPass').val();
    //check which storage to use
     var storage = localStorage.getItem("mode");
     switch(storage){
         case "offline":
                    if(db){

                                db.transaction(function(tx) {
                                            tx.executeSql('SELECT * FROM User WHERE email=? and pin = ?', [username,password], 
                                                          //success function
                                                          function(tx,results){
                                                             if (results.rows.length>0){
                                                                 //correct login
                                                                 user = JSON.stringify(results.rows[0]);
                                                                 alert(user);
                                                                 app.navigate("#GazetteHome","overlay");
                                                                 
                                                             }
                                                else{
                                                        //incorrect login
                                                    alert("Incorrect username/password");
                                                }
                                                            },
                                                          //error function
                                                         function(tx){
                                                            alert(tx);

                                                            });
                                    });


                        }
             break;
         case "online":
             
            el.Users.login(username, // username
            password, // password
            function (data) {
              localStorage.setItem("access-token",data.result.access_token);
              localStorage.setItem("user_email",username);
              
                //check account details- 
                //get account subscription
                 
                 
                var filter = new Everlive.Query();
                filter.where().eq('AccountEmail', username);

                var data = el.data('Subscription');
                data.get(filter)
                    .then(function(data){
                     app.pane.loader.hide();
                      if(data.count>0){
                            var td = new Date();
                            if(td>data.result.SubscriptionEndDate){
                              alert("Subscription Expired");

 }
                            else{
                                alert("Valid subscription");
                                app.navigate("#GazetteHome");
}
                      }
                    else{
                        alert("There are no subscriptions associated with this account.... if you want to continue using Gazette Mobile.. please subscribe");
                        app.navigate("#Subscriptions","fade");
                        
                    }
                    
                    },
                    function(error){
                      app.pane.loader.hide();
                        alert(JSON.stringify(error));
                    });
              
                
                //If account has no valid subscription, direct to subscription screen
                
                
            },
            function(error){
                alert(JSON.stringify(error));
            });
         
             break;
     }
     
      app.pane.loader.hide();    
        
         
     
    
 }
function savePaper(paperid,title){
    if(db){
        db.transaction(function(tx) {
             tx.executeSql(
        "INSERT OR REPLACE INTO MyPapers  VALUES (?,?)",
        [paperid, title],
        function(tx, res) {
            
        },
        function(tx, res) {
            alert('error: ' + res.message);
        });
        });
    }
}
//To Do - Save to Category Table FxN
function saveCategory(id,title,description,parent){
    if(db){
         db.transaction(function(tx) {
             tx.executeSql(
        "INSERT OR REPLACE INTO Category (id,title,description,parent) VALUES (?,?,?,?)",
        [id,title,description,parent],
        function(tx, res) {
            console.log("insertId: " + res.insertId + ", rows affected: " + res.rowsAffected);
        },
        function(tx, res) {
            alert('error: ' + res.message);
        });
        });
    }
}
function startHome_Page_Slideshow(){
      
    if(db){ //first get all news items from storage from the past week;
        var today = new Date();
        today = (today.setDate()-7);
  
        
             db.transaction(function(tx) {
                                                 //for the news
                                                       tx.executeSql('SELECT * FROM Article_Categories WHERE categoryId = 33', [], 
                                                          //success function
                                                          function(tx,result){
                                                          var content="";
                                                                for(var i=0;i<result.rows.length;i++){
                                                                    var p = result.rows.item(i);
                                                                            tx.executeSql("SELECT * FROM Articles WHERE id = ? AND date >= date('now','-7 days')", [p.articleid], 
                                                          
                                                                              function(tx,result1){
                                                                                var articles =[];
                                                                                
                                                                                       $('#owl-news').css("opacity",0);
                                                                                for(var i=0;i<result1.rows.length;i++){
                                                                                articles[i]=result1.rows.item(i);
                                                                                     content+="<div class='home_article' onclick='setArticle_details("+ articles[i].id+ ")' >" +
                                                                                    "<article class='caption'>" +
                                                                                     "<img class='caption__media' src=" + articles[i].image + " />" +
                                                                                     "<div class='caption__overlay'>"+
                                                                                     "<p class='caption__overlay__title'>" + articles[i].title + "</p>"+
                                                                                     "</div>"+
                                                                                     "</article>"+
                                                                                     "</div>";
                                                                                }
                                                                              
                                                                                    $('#owl-news').html('');
                                                                                 $('#owl-news').html(content);
                                                                                  window.setTimeout(function(){
                                                                                            $("#owl-news").owlCarousel({
                                                                                                                                                                autoPlay:true,
                                                                                                                                                                responsive:true
                                                                                                                                                            });
                                                                                    $('#owl-news').css("opacity",1);
                                                                                  },2000);
                                                                            

                                                                           },
                                                                              function(tx){
                                                                               alert("error no articles found");
                                                                           });
                                                                    
                                                                }
                                                       
                                                           
                                                          
                                                           
                                                       },
                                                          function(tx){
                                                           alert("error");
                                                       });
                                                  
                                                         //for the sports
                                                               tx.executeSql('SELECT * FROM Article_Categories WHERE categoryId = 14', [], 
                                                          //success function
                                                          function(tx,result){
                                                         var  content="";
                                                                for(var i=0;i<result.rows.length;i++){
                                                                    var p = result.rows.item(i);
                                                                            tx.executeSql("SELECT * FROM Articles WHERE id = ? AND date >= date('now','-7 days')", [p.articleid], 
                                                          
                                                                              function(tx,result1){
                                                                                var articles =[];
                                                                                  $('#owl-sports').css("opacity",0);
                                                                                     
                                                                                for(var i=0;i<result1.rows.length;i++){
                                                                                articles[i]=result1.rows.item(i);
                                                                                     content+="<div class='home_article' onclick='setArticle_details("+ articles[i].id+ ")' >" +
                                                                                    "<article class='caption'>" +
                                                                                     "<img class='caption__media' src=" + articles[i].image + " />" +
                                                                                     "<div class='caption__overlay'>"+
                                                                                     "<p class='caption__overlay__title'>" + articles[i].title + "</p>"+
                                                                                     "</div>"+
                                                                                     "</article>"+
                                                                                     "</div>";
                                                                                }
                                                                                 
                                                                                    $('#owl-sports').html('');
                                                                                 $('#owl-sports').html(content);
                                                                                  window.setTimeout(function(){
                                                                                            $("#owl-sports").owlCarousel({
                                                                                                                                                                autoPlay:true,
                                                                                                                                                                responsive:true
                                                                                                                                                            });
                                                                                        $('#owl-sports').css("opacity",1);
                                                                                  },2000);
                                                                            

                                                                           },
                                                                              function(tx){
                                                                               alert("error no articles found");
                                                                           });
                                                                    
                                                                }
                                                       
                                                           
                                                          
                                                           
                                                       },
                                                          function(tx){
                                                           alert("error");
                                                       });
                                                     
                                                     //for lifestyle
                                                           tx.executeSql('SELECT * FROM Article_Categories WHERE categoryId = 10', [], 
                                                          //success function
                                                          function(tx,result){
                                                          var content="";
                                                                for(var i=0;i<result.rows.length;i++){
                                                                    var p = result.rows.item(i);
                                                                            tx.executeSql("SELECT * FROM Articles WHERE id = ? AND date >= date('now','-7 days')", [p.articleid], 
                                                          
                                                                              function(tx,result1){
                                                                                var articles =[];
                                                                                
                                                                                      $('#owl-lifestyle').css("opacity",0); 
                                                                                for(var i=0;i<result1.rows.length;i++){
                                                                                articles[i]=result1.rows.item(i);
                                                                                     content+="<div class='home_article' onclick='setArticle_details("+ articles[i].id+ ")' >" +
                                                                                    "<article class='caption'>" +
                                                                                     "<img class='caption__media' src=" + articles[i].image + " />" +
                                                                                     "<div class='caption__overlay'>"+
                                                                                     "<p class='caption__overlay__title'>" + articles[i].title + "</p>"+
                                                                                     "</div>"+
                                                                                     "</article>"+
                                                                                     "</div>";
                                                                                }
                                                                              
                                                                                    $('#owl-lifestyle').html('');
                                                                                 $('#owl-lifestyle').html(content);
                                                                                  window.setTimeout(function(){
                                                                                            $("#owl-lifestyle").owlCarousel({
                                                                                                                                                                autoPlay:true,
                                                                                                                                                                responsive:true
                                                                                                                                                            });
                                                                                  
                                                                                    $('#owl-lifestyle').css("opacity",1);
                                                                                  },2000);
                                                                            

                                                                           },
                                                                              function(tx){
                                                                               alert("error no articles found");
                                                                           });
                                                                    
                                                                }
                                                       
                                                           
                                                          
                                                           
                                                       },
                                                          function(tx){
                                                           alert("error");
                                                       });
                 
                                                     //for the tech
                                                           tx.executeSql('SELECT * FROM Article_Categories WHERE categoryId = 15', [], 
                                                          //success function
                                                          function(tx,result){
                                                         var  content="";
                                                                for(var i=0;i<result.rows.length;i++){
                                                                    var p = result.rows.item(i);
                                                                            tx.executeSql("SELECT * FROM Articles WHERE id = ? AND date >= date('now','-14 days')", [p.articleid], 
                                                          
                                                                              function(tx,result1){
                                                                                var articles =[];
                                                                                  $('#owl-tech').css("opacity",0);
                                                                                     
                                                                                for(var i=0;i<result1.rows.length;i++){
                                                                                articles[i]=result1.rows.item(i);
                                                                                     content+="<div class='home_article' onclick='setArticle_details("+ articles[i].id+ ")' >" +
                                                                                    "<article class='caption'>" +
                                                                                     "<img class='caption__media' src=" + articles[i].image + " />" +
                                                                                     "<div class='caption__overlay'>"+
                                                                                     "<p class='caption__overlay__title'>" + articles[i].title + "</p>"+
                                                                                     "</div>"+
                                                                                     "</article>"+
                                                                                     "</div>";
                                                                                }
                                                                              
                                                                                    $('#owl-tech').html('');
                                                                                 $('#owl-tech').html(content);
                                                                                  window.setTimeout(function(){
                                                                                            $("#owl-tech").owlCarousel({
                                                                                                                                                                autoPlay:true,
                                                                                                                                                                responsive:true
                                                                                                                                                            });
                                                                                  
                                                                                    $('#owl-tech').css("opacity",1);
                                                                                  },2000);
                                                                            

                                                                           },
                                                                              function(tx){
                                                                               alert("error no articles found");
                                                                                 
                                                                           });
                                                                    
                                                                }
                                                       
                                                           
                                                          
                                                           
                                                       },
                                                          function(tx){
                                                           alert("error");
                                                       });
                 
                                                     //for the money
                                                             tx.executeSql('SELECT * FROM Article_Categories WHERE categoryId = 31', [], 
                                                          //success function
                                                          function(tx,result){
                                                         var  content="";
                                                                for(var i=0;i<result.rows.length;i++){
                                                                    var p = result.rows.item(i);
                                                                            tx.executeSql("SELECT * FROM Articles WHERE id = ? AND date >= date('now','-7 days')", [p.articleid], 
                                                          
                                                                              function(tx,result1){
                                                                                var articles =[];
                                                                                
                                                                                       $('#owl-money').css("opacity",0);
                                                                                for(var i=0;i<result1.rows.length;i++){
                                                                                articles[i]=result1.rows.item(i);
                                                                                     content+="<div class='home_article' onclick='setArticle_details("+ articles[i].id+ ")' >" +
                                                                                    "<article class='caption'>" +
                                                                                     "<img class='caption__media' src=" + articles[i].image + " />" +
                                                                                     "<div class='caption__overlay'>"+
                                                                                     "<p class='caption__overlay__title'>" + articles[i].title + "</p>"+
                                                                                     "</div>"+
                                                                                     "</article>"+
                                                                                     "</div>";
                                                                                }
                                                                                
                                                                                    $('#owl-money').html('');
                                                                                 $('#owl-money').html(content);
                                                                                  window.setTimeout(function(){
                                                                                            $("#owl-money").owlCarousel({
                                                                                                                                                                autoPlay:true,
                                                                                                                                                                responsive:true
                                                                                                                                                            });
                                                                                  $('#owl-money').css("opacity",1);
                                                                                  },2000);
                                                                            

                                                                           },
                                                                              function(tx){
                                                                               alert("error no articles found");
                                                                           });
                                                                    
                                                                }
                                                       
                                                           
                                                          
                                                           
                                                       },
                                                          function(tx){
                                                           alert("error");
                                                       });
                 
                                                     // for the world
                                                              tx.executeSql('SELECT * FROM Article_Categories WHERE categoryId = 35', [], 
                                                          //success function
                                                          function(tx,result){
                                                        var   content="";
                                                                for(var i=0;i<result.rows.length;i++){
                                                                    var p = result.rows.item(i);
                                                                            tx.executeSql("SELECT * FROM Articles WHERE id = ? AND date >= date('now','-14 days')", [p.articleid], 
                                                          
                                                                              function(tx,result1){
                                                                                var articles =[];
                                                                                
                                                                                      $('#owl-world').css("opacity",0); 
                                                                                for(var i=0;i<result1.rows.length;i++){
                                                                                articles[i]=result1.rows.item(i);
                                                                                     content+="<div class='home_article' onclick='setArticle_details("+ articles[i].id+ ")' >" +
                                                                                    "<article class='caption'>" +
                                                                                     "<img class='caption__media' src=" + articles[i].image + " />" +
                                                                                     "<div class='caption__overlay'>"+
                                                                                     "<p class='caption__overlay__title'>" + articles[i].title + "</p>"+
                                                                                     "</div>"+
                                                                                     "</article>"+
                                                                                     "</div>";
                                                                                }
                                                                         
                                                                                    $('#owl-world').html('');
                                                                                 $('#owl-world').html(content);
                                                                                  window.setTimeout(function(){
                                                                                            $("#owl-world").owlCarousel({
                                                                                                                                                                autoPlay:true,
                                                                                                                                                                responsive:true
                                                                                                                                                            });
                                                                                   $('#owl-world').css("opacity",1);
                                                                                  },2000);
                                                                            

                                                                           },
                                                                              function(tx){
                                                                               alert("error no articles found");
                                                                           });
                                                                    
                                                                }
                                                       
                                                           
                                                          
                                                           
                                                       },
                                                          function(tx){
                                                           alert("error");
                                                       });
             
             
             });
      
        
        
    }
  
}
 function onOpen(e) {
        this.element.find(".km-actionsheet-title").text(e.target.next().text());
     
    }

 function reply(e) {
     app.navigate('#Subscriptions');
    }

  
function openSheet(){
    $("#inboxActions").data("kendoMobileActionSheet").open();
}
  
$(document).ready(function(){
    
//save default categories

 
  
 $('#cardInr').css("left","-400px");
  
 
    
  $("#account-bar").kendoPanelBar();
    $("#recurring-switch").kendoMobileSwitch();
    
});
 function loadTx(){
     var today;
     var tomorrow;
     $('#lblCardCVC').text(localStorage.getItem("CardCVC"));
        $('#lblCardNumber').text(localStorage.getItem("CardNo"));
        $('#lblCardHolder').text(localStorage.getItem("CardHolderName"));
        $('#lblCardExp').text(localStorage.getItem("CardExpiry"));
        $('#lblTxAmount').text(localStorage.getItem("subscription-value"));
             var type= localStorage.getItem("subscription-type");
         var count= localStorage.getItem("subscription-count");
       
     
     //determine the start and end date of their subscription
               var username= localStorage.getItem("user_email");
       var tod = new Date();
                var filter = new Everlive.Query();
                filter.where().and().eq('AccountEmail', username).orderDesc('SubscriptionEndDate');

                var data = el.data('Subscription');
                data.get(filter)
                    .then(function(data){
                     
                     
                     app.pane.loader.hide();
                        
                      if(data.count>0){
                          var dat= new Date( data.result[0].SubscriptionEndDate);
                        
                            var td = new Date();
                            if(td>dat){
                            //new subscription
                              switch(type){
                                                case "bronze":
                                                $('#lblTxType').text("Bronze");
                                                 $('#lblTxDays').text("+(30)");

                                                             today = new Date();
                                                           tomorrow = new Date();
                                                            tomorrow.setDate(today.getDate()+30);


                                                break;
                                                case "silver":
                                                 $('#lblTxType').text("Silver");
                                                 $('#lblTxDays').text("+(90)");

                                                            today = new Date();
                                                          tomorrow = new Date();
                                                            tomorrow.setDate(today.getDate()+90);

                                                break;
                                                case "gold":
                                                 $('#lblTxType').text("Gold");
                                                 $('#lblTxDays').text("+(185)");

                                                           today = new Date();
                                                          tomorrow = new Date();
                                                            tomorrow.setDate(today.getDate()+185);

                                                break;
                                                case "platinum":
                                                 $('#lblTxType').text("Platinum");
                                                 $('#lblTxDays').text("+(365)");

                                                             today = new Date();
                                                             tomorrow = new Date();
                                                            tomorrow.setDate(today.getDate()+365);

                                                break;

                                        }
                        localStorage.setItem("subscription-start",today);
                         localStorage.setItem("subscription-end",tomorrow);
                         $('#lblTxStart').text(today);
                              $('#lblTxEnd').text(tomorrow);
                                 }
                            else{
                              //extension
                                   switch(type){
                                                case "bronze":
                                                $('#lblTxType').text("Bronze");
                                                 $('#lblTxDays').text("+(30)");

                                                             today = new Date();
                                                           tomorrow = new Date(dat);
                                                            tomorrow.setDate(dat.getDate()+30);


                                                break;
                                                case "silver":
                                                 $('#lblTxType').text("Silver");
                                                 $('#lblTxDays').text("+(90)");

                                                            today = new Date();
                                                          tomorrow = new Date(dat);
                                                            tomorrow.setDate(dat.getDate()+90);

                                                break;
                                                case "gold":
                                                 $('#lblTxType').text("Gold");
                                                 $('#lblTxDays').text("+(185)");

                                                           today = new Date();
                                                          tomorrow = new Date(dat);
                                                            tomorrow.setDate(dat.getDate()+185);

                                                break;
                                                case "platinum":
                                                 $('#lblTxType').text("Platinum");
                                                 $('#lblTxDays').text("+(365)");

                                                             today = new Date();
                                                            tomorrow = new Date(dat);
                                                            tomorrow.setDate(dat.getDate()+365);

                                                break;

                                        }
                                localStorage.setItem("subscription-start",today);
                                 localStorage.setItem("subscription-end",tomorrow);
                                 $('#lblTxStart').text(today);
                                      $('#lblTxEnd').text(tomorrow);
                                }
                      }
                    else{
                      switch(type){
                                                case "bronze":
                                                $('#lblTxType').text("Bronze");
                                                 $('#lblTxDays').text("+(30)");

                                                             today = new Date();
                                                           tomorrow = new Date();
                                                            tomorrow.setDate(today.getDate()+30);


                                                break;
                                                case "silver":
                                                 $('#lblTxType').text("Silver");
                                                 $('#lblTxDays').text("+(90)");

                                                            today = new Date();
                                                          tomorrow = new Date();
                                                            tomorrow.setDate(today.getDate()+90);

                                                break;
                                                case "gold":
                                                 $('#lblTxType').text("Gold");
                                                 $('#lblTxDays').text("+(185)");

                                                           today = new Date();
                                                          tomorrow = new Date();
                                                            tomorrow.setDate(today.getDate()+185);

                                                break;
                                                case "platinum":
                                                 $('#lblTxType').text("Platinum");
                                                 $('#lblTxDays').text("+(365)");

                                                             today = new Date();
                                                             tomorrow = new Date();
                                                            tomorrow.setDate(today.getDate()+365);

                                                break;

                                        }
                        localStorage.setItem("subscription-start",today);
                         localStorage.setItem("subscription-end",tomorrow);
                         $('#lblTxStart').text(today);
                              $('#lblTxEnd').text(tomorrow);
     
                    }
                    
                    
                    },
                    function(error){
                      app.pane.loader.hide();
                        alert(JSON.stringify(error));
                    });
     
     
    localStorage.setItem("subscription-start",today);
     localStorage.setItem("subscription-end",tomorrow);
     $('#lblTxStart').text(today);
          $('#lblTxEnd').text(tomorrow);
     
     
     
     //save data to cloud after successful subscription
 }
function changeStory(articleId){
    alert("Get Article (" +articleId +")");
}
function setArticle_details(articleId){
       app.pane.loader.show();
    
       if(db){

                                db.transaction(function(tx) {
                                                 
                                                       tx.executeSql('SELECT * FROM Articles WHERE Id = ?', [articleId], 
                                                          //success function
                                                          function(tx,result1){
                                                           //create slider content
                                                                
                                                       $("#story-scroller").css("height","0vh");
                                                           for(var u=0;u<result1.rows.length;u++){
                                                          var     p = result1.rows.item(u);
                                                             
                                                              $('#article-title').text(p.title);
                                                               $('#article-image').attr("src",p.image);
                                                               
                                                               $('#article-story').html(p.content);
                                                              $('#art-date').text(p.date);
                                                         initArticle_view(p.newspaper);
                                                           }
                                                            $("#story-scroller").css("height","70vh");
                                                       
                                                         
                                                           
                                                           
                                                          
                                                           
                                                       },
                                                          function(tx){
                                                           alert("error");
                                                       });
                                    });


                        } 
}
function initArticle_view(paper){
var dataSource = new kendo.data.DataSource({
   transport: {
      read: function(options) {

        db.transaction(function(tx) {

          tx.executeSql('SELECT * from Articles WHERE newspaper =?', [paper], function(tx, result) {

             var data = [];
             // copy the rows to a regular array
             for (var i = 0; i < result.rows.length; i++) {
                data[i] = result.rows.item(i);
             }

             options.success(data); // return the data back to the data source
          });
        });
      }
   }
});
  
    displayContent(dataSource);
}
function displayContent(data){
     
      $("#more-articles-list").kendoMobileListView({
                dataSource: data,
                template:$("#listviewHeadersTemplate").html()
            });
    
   $("#story-scroller").kendoMobileScroller();
     $("#more-scroller").kendoMobileScroller();
   
    app.navigate('#ArticleDetails');
 
    
}
 function updateStorage(){
     //for the news
     $.ajax({
                type:"GET", 
                 data:'',
                 dataType: "jsonp",
                url: "http://www.gazettebw.com/api/get_category_posts/?callback=show_posts_widget&category_id=33&count=20", 
                success: function(data) {
                    
                    customDataSuccess_news(data)
                    }, 
                error: function(jqXHR, textStatus, errorThrown) {
                        alert(jqXHR.status);
                    },
              
            });
       $.ajax({
                type:"GET", 
          
                url: "http://www.gazettebw.com/api/get_category_posts/?callback=show_posts_widget&category_id=14&count=20", 
                success: function(data) {
                    customDataSuccess_sports(data)
                    }, 
                error: function(jqXHR, textStatus, errorThrown) {
                        alert(jqXHR.status);
                    },
               dataType: "jsonp"
            });
     
       $.ajax({
                type:"GET", 
          
                url: "http://www.gazettebw.com/api/get_category_posts/?callback=show_posts_widget&category_id=10&count=20", 
                success: function(data) {
                    customDataSuccess_life(data)
                    }, 
                error: function(jqXHR, textStatus, errorThrown) {
                        alert(jqXHR.status);
                    },
               dataType: "jsonp"
            });
       $.ajax({
                type:"GET", 
          
                url: "http://www.gazettebw.com/api/get_category_posts/?callback=show_posts_widget&category_id=15&count=20", 
                success: function(data) {
                    customDataSuccess_sports(data)
                    }, 
                error: function(jqXHR, textStatus, errorThrown) {
                        alert(jqXHR.status);
                    },
               dataType: "jsonp"
            });
       $.ajax({
                type:"GET", 
          
                url: "http://www.gazettebw.com/api/get_category_posts/?callback=show_posts_widget&category_id=31&count=20", 
                success: function(data) {
                    customDataSuccess_money(data)
                    }, 
                error: function(jqXHR, textStatus, errorThrown) {
                        alert(jqXHR.status);
                    },
               dataType: "jsonp"
            });
       $.ajax({
                type:"GET", 
          
                url: "http://www.gazettebw.com/api/get_category_posts/?callback=show_posts_widget&category_id=35&count=20", 
                success: function(data) {
                    customDataSuccess_world(data)
                    }, 
                error: function(jqXHR, textStatus, errorThrown) {
                        alert(jqXHR.status);
                    },
               dataType: "jsonp"
            });
     
 }
 function customDataSuccess_news(data){
    
     try{
      
     for(var i=0;i<data.posts.length;i++){
     //ARTICLES MUST ALSO BE SAVE TO LOCAL STORAGE
          try{
                var convertedStartDate = data.posts[i].date;
        var month = convertedStartDate.split(" ");
        
        var shortDate = month[0];
   try{
          SaveArticle_toDevice(data.posts[i].id,data.posts[i].title,data.posts[i].url,data.posts[i].content,data.posts[i].thumbnail_images.full.url,data.posts[i].date,shortDate)
         for(var t = 0;t<data.posts[i].categories.length;t++){
            saveArticle_Category(data.posts[i].id,data.posts[i].categories[t].id);
        }
         }
         catch(e){
             console.log(e);
         }
       
        }
         catch(e){
             console.log(e);
         }
   
     }
      
     }
     catch(e){
         console.log(e);
     }
     
    
  }
 function customDataSuccess_sports(data){
  
 
     for(var i=0;i<data.posts.length;i++){
          var convertedStartDate = data.posts[i].date;
        var month = convertedStartDate.split(" ");
        var shortDate = month[0];
          SaveArticle_toDevice(data.posts[i].id,data.posts[i].title,data.posts[i].url,data.posts[i].content,data.posts[i].attachments[0].images.full.url,data.posts[i].date,shortDate)
      for(var t = 0;t<data.posts[i].categories.length;t++){
            saveArticle_Category(data.posts[i].id,data.posts[i].categories[t].id);
        }
     //ARTICLES MUST ALSO BE SAVE TO LOCAL STORAGE
      
     }
    
    
 
  }
 function customDataSuccess_life(data){
    
      if(data.posts.length>0){
     for(var i=0;i<data.posts.length;i++){
     //ARTICLES MUST ALSO BE SAVE TO LOCAL STORAGE
            var convertedStartDate = data.posts[i].date;
      var month = convertedStartDate.split(" ");
        
        var shortDate = month[0];
         try{
          SaveArticle_toDevice(data.posts[i].id,data.posts[i].title,data.posts[i].url,data.posts[i].content,data.posts[i].attachments[0].images.full.url,data.posts[i].date,shortDate)
         for(var t = 0;t<data.posts[i].categories.length;t++){
            saveArticle_Category(data.posts[i].id,data.posts[i].categories[t].id);
        }
         }
         catch(e){
             console.log(e);
         }
       
     }
      }
     
  }
 function customDataSuccess_tech(data){
   
      if(data.posts.length>0){
     for(var i=0;i<data.posts.length;i++){
     //ARTICLES MUST ALSO BE SAVE TO LOCAL STORAGE
          var convertedStartDate =  data.posts[i].date;
         var month = convertedStartDate.split(" ");
        
        var shortDate = month[0];
          SaveArticle_toDevice(data.posts[i].id,data.posts[i].title,data.posts[i].url,data.posts[i].content,data.posts[i].thumbnail_images.full.url,shortDate)
           for(var t = 0;t<data.posts[i].categories.length;t++){
            saveArticle_Category(data.posts[i].id,data.posts[i].categories[t].id);
        }
        
     }
      }
    
   
  }
 function customDataSuccess_money(data){
   
      if(data.posts.length>0){
     for(var i=0;i<data.posts.length;i++){
     //ARTICLES MUST ALSO BE SAVE TO LOCAL STORAGE
            var convertedStartDate =  data.posts[i].date;
           var month = convertedStartDate.split(" ");

                var shortDate = month[0];
          SaveArticle_toDevice(data.posts[i].id,data.posts[i].title,data.posts[i].url,data.posts[i].content,data.posts[i].thumbnail_images.full.url,data.posts[i].date,shortDate)
          for(var t = 0;t<data.posts[i].categories.length;t++){
            saveArticle_Category(data.posts[i].id,data.posts[i].categories[t].id);
        }
         
        
     }
      }
    
 
  }
 function customDataSuccess_world(data){
 
      if(data.posts.length>0){
             for(var i=0;i<data.posts.length;i++){
             //ARTICLES MUST ALSO BE SAVE TO LOCAL STORAGE
                    var convertedStartDate =  data.posts[i].date;
       var month = convertedStartDate.split(" ");
        
        var shortDate = month[0];
          SaveArticle_toDevice(data.posts[i].id,data.posts[i].title,data.posts[i].url,data.posts[i].content,data.posts[i].thumbnail_images.full.url,data.posts[i].date,shortDate)
         for(var t = 0;t<data.posts[i].categories.length;t++){
            saveArticle_Category(data.posts[i].id,data.posts[i].categories[t].id);
        }
                 
                 
                 
             }
      }
    
 
  }
function cardEntry() {
    var no = $("#txtcardno").val();
    
     
 //   if (no.length == 16) {
        switch (step) {
            case 0:
                 $('#cardInr').css("left","-400px");
                $('#txtcardno').css("width", "0px");
                $('#txtcardno').css("opacity", "0");
                localStorage.setItem("CardHolderName", $("#txtcardno").val());
                  $('.CardLoad').css("opacity","0");
                
                window.setTimeout(function () {
                      $('.CardLoad').css("background-image", 'url("images/card-number.jpg")');
                                     $('#cardInr').text("Enter Card Number");
                                    $('#cardInr').css("left","0px");

                      $('.CardLoad').css("opacity","1");
                    $('#txtcardno').css("opacity", "1");
                    clearTextBox("txtcardno");
                    //$("#txtcardno").kendoMaskedTextBox({
                    //    mask: "000"
                    //});
                    $('#txtcardno').attr("placeholder", "Bank Card #");
                    $('#txtcardno').attr("maxlength", 16);
          
                    $('#txtcardno').css("width", "78%");
                    
                }, 2000);
 
                break;
            case 1:
                //card number
               $('#cardInr').css("left","-400px");
                $('#txtcardno').css("width", "0px");
                $('#txtcardno').css("opacity", "0");
                localStorage.setItem("CardNo", $("#txtcardno").val());
                  $('.CardLoad').css("opacity","0");
                
                window.setTimeout(function () {
                      $('.CardLoad').css("background-image", 'url("images/security-code.jpg")');
                                     $('#cardInr').text("Enter CVC Number");
                                    $('#cardInr').css("left","0px");

                      $('.CardLoad').css("opacity","1");
                    $('#txtcardno').css("opacity", "1");
                    clearTextBox("txtcardno");
                    //$("#txtcardno").kendoMaskedTextBox({
                    //    mask: "000"
                    //});
                    $('#txtcardno').attr("placeholder", "CVC #");
                    $('#txtcardno').attr("maxlength", 3);
          
                    $('#txtcardno').css("width", "78%");
                    
                }, 2000);


                break;
            case 2:
                //cvc
                   
                                    $('#cardInr').css("left","-400px");
                $('#txtcardno').css("width", "0px");
                localStorage.setItem("CardCVC", $("#txtcardno").val());
                  $('.CardLoad').css("opacity","0");
                                     

                window.setTimeout(function () {
                    clearTextBox("txtcardno");
                    $('#cardInr').text("Card Expiry Date");
                 
                                    $('#cardInr').css("left","0px");
                     $('.CardLoad').css("background-image", 'url("images/start-end-date.jpg")');
                    $('#txtcardno').css("display", "none");
                       $('.CardLoad').css("opacity","1")
                }, 2000);
                window.setTimeout(function () {
                    $('#txtexpdate').css("width", "0%");
                    $('#txtexpdate').css("display", "inline-block");
                }, 2500);
                window.setTimeout(function () {

                    $('#txtexpdate').css("width", "83%");

                }, 3000);
                break;
            case 3:
                localStorage.setItem("CardExpiry", $("#txtmonth").val());
                app.navigate("#PaymentConfirmation");
                step= -1
           //TOAST required
                //exp date
                break;
           

        }
        step += 1;
    
}
function clearTextBox(txBox) {
    var temp = $("#" + txBox).val();
    temp = temp.slice(0, temp.length - temp.length);
    $("#" + txBox).val(temp);
}
function FB_Login(){
     $.ajax({

                      type: "GET",
                      dataType: "json",
                      url: "http://www.gazettebw.com/api/user/fb_connect/?access_token=" + facebook_access_token,
                      data: '',
                      success: function( response ) 
                      { 
                             
                      },
                      error: function( error )
                      {

                         alert( error.message );

                      }

                   });
}
function confirmPayment(){
    var user = localStorage.getItem("user_email");
    var dt = localStorage.getItem("CardExpiry");
    var type= localStorage.getItem("subscription-type");
    var start= localStorage.getItem("subscription-start");
    var end = localStorage.getItem("subscription-end");
    var amount = localStorage.getItem("subscription-value");
   
   
    
    
    
    var data = el.data('Subscription');
        data.create({ 'AccountEmail':user, 'SubscriptionType':type,'SubscriptionEndDate':end,'TransactionDate':start,'AmountPaid':amount },
    function(data){
        alert(JSON.stringify(data));
    app.navigate('#GazetteHome');
    },
    function(error){
        alert(JSON.stringify(error));
    });
    
}
//DATABASE FUNCTIONS

 function Subscribe(){
     try{
     var email = $('#regEmail').val();
     
     var displayname = $('#regDisplayName').val();
     if($('#regPIN').val()!=$('#regCPIN').val()){
         alert("PINs Don't Match");
         return;
         
     }
     else{
         var pin = $('#regCPIN').val();
       RegisterUserDetails(email,email,displayname,pin);
     }
     }
     catch(e)
         {
            console.log(e)
         }
 }
 function selectSubscription(type){
     switch(type){
         case 'bronze':
             localStorage.setItem("subscription-type",type);
             localStorage.setItem("subscription-value",50.00);
             break;
             case 'silver':
                localStorage.setItem("subscription-type",type);
             localStorage.setItem("subscription-value",104.99);
             break;
             case 'gold':
                localStorage.setItem("subscription-type",type);
             localStorage.setItem("subscription-value",200.00);
             break;
             case 'platinum':
                localStorage.setItem("subscription-type",type);
             localStorage.setItem("subscription-value",400.00);
             break;
     }
     app.navigate('#AddCard',"slide:left");
 }
function clearRegistration(){
    $('#regEmail').val('');
    $('#regUsername').val('');
    $('#regDisplayName').val('');
    $('#regPIN').val('');
    $('#regCPIN').val('');
}
function setupAccountDetails(){
    
}


 