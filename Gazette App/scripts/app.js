
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
        window.setInterval(function(){
                var d = new Date();
        $('#paper-date').text(d);
        },1000);
 
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
                        db = window.sqlitePlugin.openDatabase(dbName, version, dbDisplayName, dbSize, function(database) 
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
                            db.transaction(function(tx) {  tx.executeSql("CREATE TABLE IF NOT EXISTS Subscriptions (id TEXT UNIQUE, accountemail TEXT, subscriptionenddate DATETIME,transactiondate DATETIME,amountpaid INTEGER, referenceno TEXT,type TEXT)");});
                         
                           db.transaction(function(tx) {  tx.executeSql("CREATE TABLE IF NOT EXISTS Articles (id INTEGER UNIQUE, title TEXT, url TEXT,content TEXT,image TEXT, newspaper TEXT,date TEXT, category INTEGER)");});
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
                    var t=localStorage.getItem("isRemembered");
                    if(t!=null){
    switch(t){
        case 'true':
           
          
                         $.when(updateStorage()).then(function(){
                      
                                       startHome_Page_Slideshow();
                                             setupshelf();
                                          
                                     
                               
                             app.navigate("#GazetteHome");
                                    
                         });
                 
            break;
        case 'false':
           
            break;
        default:
     
            break;
    }
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
function SaveArticle_toDevice(id,title,url,content,image,date,paper,category){
    try{
       
        
      //if the date of the paper is valid for the subscription
            var time = new Date();
     var today = new Date(date);
        var set = new Date();
    
        set.setDate(time.getDate() -7);
       
        if(today>set){

                if(db){
                    db.transaction(function(tx) {
                         tx.executeSql(
                    "INSERT OR REPLACE INTO Articles (id,title,url,content,image,newspaper,date,category)  VALUES (?,?,?,?,?,?,?,?)",
                    [id,title,url,content,image,paper,date,category],
                    function(tx, res) {
                        savePaper(paper,paper);
                        console.log("DB updated [" + title + "]");
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
        else{
            console.log("Old record found");
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
         },
        function(tx, res) {
            alert('error: ' + res.message);
        });
        });
    }
}
function saveSubscription_toDevice(id,email,enddate,txdate,amount,refno,type){
       // (id TEXT UNIQUE, accountemail TEXT, subscriptionenddate DATETIME,transactiondate DATETIME,amountpaid INTEGER, referenceno TEXT)");});
               if(db){
        db.transaction(function(tx) {
             tx.executeSql(
        "INSERT OR REPLACE INTO Subscriptions (id,accountemail,subscriptionenddate,transactiondate,amountpaid,referenceno,type) VALUES (?,?,?,?,?,?,?)",
        [id,email,enddate,txdate,amount,refno,type],
        function(tx, res) {
            console.log(" SUBSCRIPTIONS UPDATED!");
         },
        function(tx, res) {
            alert('error: ' + res.message);
        });
        });
    }            
}
function syncSubscriptions(){
         app.pane.loader.show();
            var username = localStorage.getItem("user_email"); 
                var filter = new Everlive.Query();
                filter.where().eq('AccountEmail', username);

                var data = el.data('Subscription');
                data.get(filter)
                    .then(function(data){
                  
                    
                      if(data.count>0){
                         for(var i=0;i<data.count;i++){
                             saveSubscription_toDevice(data.result[i].Id,data.result[i].AccountEmail,data.result[i].SubscriptionEndDate,data.result[i].TransactionDate,data.result[i].AmountPaid,data.result[i].ReferenceNo,data.result[i].SubscriptionType);
                         }
                          getSubscriptions();
                          app.pane.loader.hide();
                          //update subscription table
                          
                      }
                    else{
                        
                           app.pane.loader.hide();
                    }
                    
                    },
                    function(error){
                      app.pane.loader.hide();
                        alert(JSON.stringify(error));
                    });
}
function getSubscriptions(){
    var user = localStorage.getItem("user_email");
    var dataSource = new kendo.data.DataSource({
   transport: {
      read: function(options) {

        db.transaction(function(tx) {

          tx.executeSql('SELECT * from Subscriptions WHERE accountemail=?', [user], function(tx, result) {

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
    setSubscriptions(dataSource);
}
function setSubscriptions(data){
     $("#other-subscriptions").kendoMobileListView({
                dataSource: data,
                template:$("#SubscriptionTemplate").html(),
                 click: function(e){
                     showSubscription(e);
                 }
            });
}
function logout(){
    localStorage.setItem("isRemembered",'false');
    app.navigate("#Login");
}
function showSubscription(e){
   
    if(db){
          db.transaction(function(tx) {

          tx.executeSql('SELECT * from Subscriptions WHERE id =?', [e.dataItem.id], function(tx, result) {

             var data = [];
             // copy the rows to a regular array
             for (var i = 0; i < result.rows.length; i++) {
                data[i] = result.rows.item(i);
                  var date1 = new Date();
                            var date2 = new Date(data[i].subscriptionenddate);
                            var timeDiff = Math.abs(date2.getTime() - date1.getTime());
                            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
                          if(diffDays<10){
                                $("#lblSubDays").css("color","red");
                              alert("You have " + diffDays + " left on your subscription");
                          }
                          if(diffDays>=0){
                         $("#lblSubDays").text(diffDays + " Days Left")
                         $('#status-color').attr("class","status_green");
                             }
                          else{
                                 $("#lblSubDays").text("None");
                                $('#status-color').attr("class","status_red");
                          }
                          $('#lblSubType').text(JSON.stringify(data[i].type).toUpperCase());
                             $('#lblSubAmount').text("P"+ data[i].amountpaid + ".00");
                             $('#lblSubStart').text(data[i].transactiondate);
                             $('#lblSubEnd').text(data.result[data.count-1].subscriptionenddate);
             }
            
             // Set into elements
          });
        });
    }
}
function showMainSubscription(){
    var id= localStorage.getItem("subscription-id");
    if(db){
          db.transaction(function(tx) {

          tx.executeSql('SELECT * from Subscriptions WHERE id =?', [id], function(tx, result) {

             var data = [];
             // copy the rows to a regular array
             for (var i = 0; i < result.rows.length; i++) {
                data[i] = result.rows.item(i);
                  var date1 = new Date();
                            var date2 = new Date(data[i].subscriptionenddate);
                            var timeDiff = Math.abs(date2.getTime() - date1.getTime());
                            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
                          if(diffDays<10){
                                $("#lblSubDays").css("color","red");
                              alert("You have " + diffDays + " left on your subscription");
                          }
                          if(diffDays>=0){
                         $("#lblSubDays").text(diffDays + " Days Left")
                         $('#status-color').attr("class","status_green");
                             }
                          else{
                                 $("#lblSubDays").text("None");
                                $('#status-color').attr("class","status_red");
                          }
                          $('#lblSubType').text(JSON.stringify(data[i].type).toUpperCase());
                             $('#lblSubAmount').text("P"+ data[i].amountpaid + ".00");
                             $('#lblSubStart').text(data[i].transactiondate);
                             $('#lblSubEnd').text(data.result[data.count-1].subscriptionenddate);
             }
            
             // Set into elements
          });
        });
    }
}
function View_Paper(paperid){
    $('#paper-id').text(paperid);
    init_MyNews(paperid);
      init_Sports(paperid);
      init_Money(paperid);
    init_Tech(paperid);
   init_Lifestyle(paperid);
    init_World(paperid);
    app.navigate("#Stand");
}
function View_Category(categoryId,title){
      $("#category-title").text(title);
    var dataSource = new kendo.data.DataSource({
   pageSize: 10,
    serverFiltering: true,
    group:"newspaper",
   serverPaging: true,
   transport: {
      read: function(options) {

        db.transaction(function(tx) {

          tx.executeSql('SELECT * from Articles where category =?', [categoryId], function(tx, result) {

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
    Set_Articles(dataSource);
  
}
function Set_Articles(data){
    
      $("#category-articles").kendoMobileListView({
                dataSource: data,
                  dataBound: function(e) {
                if(this.dataSource.data().length == 0){
                    //custom logic
                    $("#category-articles").append("<h1 class='empty-template'>Nothing to display</h1>");
                }
            },
                     
                 
                template:$("#listviewHeadersTemplate").html(),
                  headerTemplate: "<p class='listD'>Published: ${value}</p>"
            }); 
    app.navigate("#CategoryArticles","fade");
}
function loadAllArticles(){
   var dataSource = new kendo.data.DataSource({
    
       transport: {
      read: function(options) {

        db.transaction(function(tx) {

          tx.executeSql('SELECT * from Articles', [], function(tx, result) {

             var data = [];
             // copy the rows to a regular array
             for (var i = 0; i < result.rows.length; i++) {
                data[i] = result.rows.item(i);
             }

             options.success(data); // return the data back to the data source
          });
        });
      }
   },
         virtualViewSize: 100,
         schema: {
                model: {
                    fields: {
                        title: { type: "string" },
                        content: { type: "string" },
                        id: { type: "number" },
                        newspaper: { type: "string" },
                         date: { type: "date" },
                         image: { type: "string" },
                         url: { type: "string" },
                         category: { type: "number" },
                        
                    }
                }
            },
       group:"newspaper"
            });
        viewSearch(dataSource);
}
function viewSearch(data){
    $("#all-articles").kendoMobileListView({
                dataSource: data,
                filterable: {
                field: "title",
                operator: "contains"
                }, 
                template:$("#listviewHeadersTemplate").html(),
                headerTemplate: "<p class='listD'>Published: ${value}</p>"
            });
    
}
function init_MyNews(paperid){
      var dataSource = new kendo.data.DataSource({
   transport: {
      read: function(options) {

        db.transaction(function(tx) {

          tx.executeSql('SELECT * FROM Articles WHERE newspaper=? AND category=33', [paperid], function(tx, result) {

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
    setNews(dataSource);
   
    
} 
function init_Sports(paperid){
       var dataSource = new kendo.data.DataSource({
   transport: {
      read: function(options) {

        db.transaction(function(tx) {

          tx.executeSql('SELECT * FROM Articles WHERE newspaper=? AND category=14', [paperid], function(tx, result) {

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
    setSports(dataSource);
}
function init_Lifestyle(paperid){
      var dataSource = new kendo.data.DataSource({
   transport: {
      read: function(options) {

        db.transaction(function(tx) {

          tx.executeSql('SELECT * FROM Articles WHERE newspaper=? AND category=10', [paperid], function(tx, result) {

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
    setLifestyle(dataSource);
}
function init_Tech(paperid){
   var dataSource = new kendo.data.DataSource({
   transport: {
      read: function(options) {

        db.transaction(function(tx) {

          tx.executeSql('SELECT * FROM Articles WHERE newspaper=? AND category=15', [paperid], function(tx, result) {

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
    setTech(dataSource);
}
function init_Money(paperid){
     var dataSource = new kendo.data.DataSource({
   transport: {
      read: function(options) {

        db.transaction(function(tx) {

          tx.executeSql('SELECT * FROM Articles WHERE newspaper=? AND category=31', [paperid], function(tx, result) {

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
    setMoney(dataSource);
}
function init_World(paperid){
     var dataSource = new kendo.data.DataSource({
   transport: {
      read: function(options) {

        db.transaction(function(tx) {

          tx.executeSql('SELECT * FROM Articles WHERE newspaper=? AND category=35', [paperid], function(tx, result) {

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
    setWorld(dataSource);
}
function setNews(data){
      $("#my-news").kendoMobileListView({
                dataSource: data,
                  dataBound: function(e) {
                if(this.dataSource.data().length == 0){
                    //custom logic
                    $("#my-news").append("<h1 class='empty-template'>Nothing to display</h1>");
                }
            },
                template:$("#listviewHeadersTemplate").html()
            });
}
function setSports(data){
      $("#my-sports").kendoMobileListView({
                dataSource: data,
                dataBound: function(e) {
                if(this.dataSource.data().length == 0){
                    //custom logic
                    $("#my-sports").append("<h1 class='empty-template'>Nothing to display</h1>");
                }
            },
                template:$("#listviewHeadersTemplate").html()
            });
}
function setLifestyle(data){
      $("#my-lifestyle").kendoMobileListView({
                dataSource: data,
                 dataBound: function(e) {
                if(this.dataSource.data().length == 0){
                    //custom logic
                    $("#my-lifestyle").append("<h1 class='empty-template'>Nothing to display</h1>");
                }
            },
                template:$("#listviewHeadersTemplate").html()
            });
}
function setTech(data){
      $("#my-tech").kendoMobileListView({
                dataSource: data,
                dataBound: function(e) {
                if(this.dataSource.data().length == 0){
                    //custom logic
                    $("#my-tech").append("<h1 class='empty-template'>Nothing to display</h1>");
                }
            },
                template:$("#listviewHeadersTemplate").html()
            });
}
function setMoney(data){
      $("#my-money").kendoMobileListView({
                dataSource: data,
                dataBound: function(e) {
                if(this.dataSource.data().length == 0){
                    //custom logic
                    $("#my-money").append("<h1 class='empty-template'>Nothing to display</h1>");
                }
            },
                template:$("#listviewHeadersTemplate").html()
            });
}
function setWorld(data){
      $("#my-world").kendoMobileListView({
                dataSource: data,
            dataBound: function(e) {
                if(this.dataSource.data().length == 0){
                    //custom logic
                    $("#my-world").append("<h1 class='empty-template'>Nothing to display</h1>");
                }
            },
                template:$("#listviewHeadersTemplate").html()
            });
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
                  app.pane.loader.hide();
             break;
         case "online":
             
            el.Users.login(username, // username
            password, // password
            function (data) {
              localStorage.setItem("access-token",data.result.access_token);
              localStorage.setItem("user_email",username);
                 var lfckv = document.getElementById("chkRem").checked;
                if(lfckv==true){
                      localStorage.setItem("isRemembered",'true');
                    
                }else{
                    localStorage.setItem("isRemembered",'false');
                }
              syncSubscriptions();
                //check account details- 
                //get account subscription
                var f= new Date();
                 
                var filter = new Everlive.Query();
                filter.where().eq('AccountEmail', username);

                var data = el.data('Subscription');
                data.get(filter)
                    .then(function(data){
                  
                    
                      if(data.count>0){
                            var td = new Date();
                          localStorage.setItem("subscription-valid-till",JSON.stringify(data.result[data.count-1].SubscriptionEndDate));
                            //Set subscription details for 'my account
                          localStorage.setItem("subscription-id",data.result[data.count-1].Id);
                          var date1 = new Date();
                            var date2 = new Date(data.result[data.count-1].SubscriptionEndDate);
                            var timeDiff = Math.abs(date2.getTime() - date1.getTime());
                            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
                          if(diffDays<10){
                                $("#lblSubDays").css("color","red");
                              alert("You have " + diffDays + " left on your subscription");
                          }
                          if(diffDays>=0){
                         $("#lblSubDays").text(diffDays + " Days Left")
                             }
                          else{
                                 $("#lblSubDays").text("None");
                          }
                          $('#lblSubType').text(JSON.stringify(data.result[data.count-1].SubscriptionType).toUpperCase());
                             $('#lblSubAmount').text("P"+ data.result[data.count-1].AmountPaid + ".00");
                             $('#lblSubStart').text(data.result[data.count-1].TransactionDate);
                             $('#lblSubEnd').text(data.result[data.count-1].SubscriptionEndDate);
                         
                          
                          //update subscription table
                          
                          
                            if(td>data.result[data.count-1].SubscriptionEndDate){
                              alert("Subscription Expired");
                               app.pane.loader.hide();
                                app.navigate('#Subscriptions');
                                 }
                            else{
                               
                             $.when(updateStorage()).then(function(){
                            
                                
                                  
                                             setupshelf();
                                          //set up bookshelf
                                     
                               
                               
                             });
                                   $.when(startHome_Page_Slideshow()).then(function(){
                            
                                
                                 //set up home screen
                                       
                                    
                                          //set up bookshelf
                                     
                                  app.pane.loader.hide();
                                   app.navigate('#GazetteHome');
                               
                             });
                                  
                              
                                }
                      }
                    else{
                        alert("There are no subscriptions associated with this account.... if you want to continue using Gazette Mobile.. please subscribe");
                        app.navigate("#Subscriptions","fade");
                           app.pane.loader.hide();
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
                 app.pane.loader.hide();
                $('#txtLogin').val('');
                $('#txtPass').val('');
            });
         
             break;
     }
     
      
       $('#txtLogin').val('');
         $('#txtPass').val('');
         
     
    
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
  
        var content="";
             db.transaction(function(tx) {
                                                 //for the news
                                                                             tx.executeSql("SELECT * FROM Articles WHERE category = 33 AND date >= date('now','-7 days') ORDER BY date DESC LIMIT 5", [], 
                                                          
                                                                              function(tx,result1){
                                                                                var articles =[];
                                                                                 content="";
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
                                                  
                                                         //for the sports
                                                        tx.executeSql("SELECT * FROM Articles WHERE category = 14 AND date >= date('now','-7 days') ORDER BY date DESC LIMIT 5", [], 
                                                          
                                                                              function(tx,result1){
                                                                                var articles =[];
                                                                                  $('#owl-sports').css("opacity",0);
                                                                                      content="";
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
                                                     
                                                     //for lifestyle
                                                                      tx.executeSql("SELECT * FROM Articles WHERE category = 10 AND date >= date('now','-7 days') ORDER BY date DESC LIMIT 5", [], 
                                                        
                                                                              function(tx,result1){
                                                                                var articles =[];
                                                                                 content="";
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
                 
                                                     //for the tech
                                                         tx.executeSql("SELECT * FROM Articles WHERE category = 15 ORDER BY date DESC LIMIT 5", [], 
                                                        
                                                                              function(tx,result1){
                                                              content="";
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
                                                                    
                 
                                                     //for the money
                                                            tx.executeSql("SELECT * FROM Articles WHERE category = 31 AND date >= date('now','-7 days') ORDER BY date DESC LIMIT 5", [], 
                                                        
                                                                              function(tx,result1){
                                                                                var articles =[];
                                                                                content="";
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
                 
                                                     // for the world
                                                            tx.executeSql("SELECT * FROM Articles WHERE category = 35 ORDER BY date DESC LIMIT 5", [], 
                                                        
                                                                              function(tx,result1){
                                                                                var articles =[];
                                                                                 content="";
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
             
             
             });
      
        
        
    }
  
}
function setupshelf(){
    
    if(db){
          db.transaction(function(tx) {
                                                 //for the news
                                                       tx.executeSql('SELECT * FROM MyPapers', [], 
                                                          //success function
                                                          function(tx,result){
                                                          var content="";
                                                                for(var i=0;i<result.rows.length;i++){
                                                                    var p = result.rows.item(i);
                                                                  var item=  JSON.stringify( p.title);
                                                                       content+="<div data-role='page'>" +
                                                                           "<ul data-role='listview' data-style='inset'>"+
                                                                           "<li><img src='images/gazette.png' style='width:100%' /></li>"+  
                                                                            "<li class='paper_bottom'><a onclick='View_Paper("+item+ ")' data-role='button'><img src='images/Paperbg.jpg' /><p>" + p.title + "</p></a></li>"+
                                                                           "</ul>"+
                                                                           "</div>";
                                                                }
                                                       
                                                          $('#news-stand').html('');
                                                           $('#news-stand').html(content);
                                                           
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
               var user= localStorage.getItem("user_email");
       var tod = new Date();
                var filter = new Everlive.Query();
                
                 filter.where().eq('AccountEmail',user);

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

                                                             today = new Date(dat);
                                                           tomorrow = new Date(dat);
                                                            tomorrow.setDate(dat.getDate()+30);


                                                break;
                                                case "silver":
                                                 $('#lblTxType').text("Silver");
                                                 $('#lblTxDays').text("+(90)");

                                                            today = new Date(dat);
                                                          tomorrow = new Date(dat);
                                                            tomorrow.setDate(dat.getDate()+90);

                                                break;
                                                case "gold":
                                                 $('#lblTxType').text("Gold");
                                                 $('#lblTxDays').text("+(185)");

                                                           today = new Date(dat);
                                                          tomorrow = new Date(dat);
                                                            tomorrow.setDate(dat.getDate()+185);

                                                break;
                                                case "platinum":
                                                 $('#lblTxType').text("Platinum");
                                                 $('#lblTxDays').text("+(365)");

                                                             today = new Date(dat);
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
   
    app.navigate('#ArticleDetails',"slide:right");
  
     $("#story-scroller").data("kendoMobileScroller").scrollTo(0, 0);
    
}
function js_page_side(e) {
    e.view.scroller.reset(); //reset the scroller
}
 function updateStorage(){
     //for the news
 
     $.ajax({
                type:"GET", 
                 data:'',
                 dataType: "jsonp",
                url: "http://www.gazettebw.com/api/get_category_posts/?callback=show_posts_widget&category_id=33&count=20", 
                success: function(data) {
                   
                         customDataSuccess_news(data);
                       
                 
             
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
      var cat ="";
     for(var i=0;i<data.posts.length;i++){
     //ARTICLES MUST ALSO BE SAVE TO LOCAL STORAGE
          try{
              
                var convertedStartDate = data.posts[i].date;
        var month = convertedStartDate.split(" ");
        
        var shortDate = month[0];
               for(var t = 0;t<data.posts[i].categories.length;t++){
          switch(data.posts[i].categories[t].id){
                 case 33:
                  cat = 33;
                  break;
                   case 10:
                      cat = 10;
                  break;
                   case 14:
                      cat = 14;
                  break;
                   case 15:
                      cat =15;
                  break;
                   case 31:
                      cat = 31;
                  break;
                   case 35:
                      cat = 35;
                  break;
                  
          }
                      SaveArticle_toDevice(data.posts[i].id,data.posts[i].title,data.posts[i].url,data.posts[i].content,data.posts[i].thumbnail_images.full.url,data.posts[i].date,shortDate,cat)
       
        }
       try{
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
    
     try{
      var cat ="";
     for(var i=0;i<data.posts.length;i++){
     //ARTICLES MUST ALSO BE SAVE TO LOCAL STORAGE
          try{
              
                var convertedStartDate = data.posts[i].date;
        var month = convertedStartDate.split(" ");
        
        var shortDate = month[0];
               for(var t = 0;t<data.posts[i].categories.length;t++){
          switch(data.posts[i].categories[t].id){
                 case 33:
                  cat = 33;
                  break;
                   case 10:
                      cat = 10;
                  break;
                   case 14:
                      cat = 14;
                  break;
                   case 15:
                      cat =15;
                  break;
                   case 31:
                      cat = 31;
                  break;
                   case 35:
                      cat = 35;
                  break;
                  
          }
                      SaveArticle_toDevice(data.posts[i].id,data.posts[i].title,data.posts[i].url,data.posts[i].content,data.posts[i].thumbnail_images.full.url,data.posts[i].date,shortDate,cat)
       
        }
       try{
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
 function customDataSuccess_life(data){
    
     try{
      var cat ="";
     for(var i=0;i<data.posts.length;i++){
     //ARTICLES MUST ALSO BE SAVE TO LOCAL STORAGE
          try{
              
                var convertedStartDate = data.posts[i].date;
        var month = convertedStartDate.split(" ");
        
        var shortDate = month[0];
               for(var t = 0;t<data.posts[i].categories.length;t++){
          switch(data.posts[i].categories[t].id){
                 case 33:
                  cat = 33;
                  break;
                   case 10:
                      cat = 10;
                  break;
                   case 14:
                      cat = 14;
                  break;
                   case 15:
                      cat =15;
                  break;
                   case 31:
                      cat = 31;
                  break;
                   case 35:
                      cat = 35;
                  break;
                  
          }
                      SaveArticle_toDevice(data.posts[i].id,data.posts[i].title,data.posts[i].url,data.posts[i].content,data.posts[i].thumbnail_images.full.url,data.posts[i].date,shortDate,cat)
       
        }
       try{
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
 function customDataSuccess_tech(data){
    
     try{
      var cat ="";
     for(var i=0;i<data.posts.length;i++){
     //ARTICLES MUST ALSO BE SAVE TO LOCAL STORAGE
          try{
              
                var convertedStartDate = data.posts[i].date;
        var month = convertedStartDate.split(" ");
        
        var shortDate = month[0];
               for(var t = 0;t<data.posts[i].categories.length;t++){
          switch(data.posts[i].categories[t].id){
                 case 33:
                  cat = 33;
                  break;
                   case 10:
                      cat = 10;
                  break;
                   case 14:
                      cat = 14;
                  break;
                   case 15:
                      cat =15;
                  break;
                   case 31:
                      cat = 31;
                  break;
                   case 35:
                      cat = 35;
                  break;
                  
          }
                      SaveArticle_toDevice(data.posts[i].id,data.posts[i].title,data.posts[i].url,data.posts[i].content,data.posts[i].thumbnail_images.full.url,data.posts[i].date,shortDate,cat)
       
        }
       try{
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
function customDataSuccess_money(data){
    
     try{
      var cat ="";
     for(var i=0;i<data.posts.length;i++){
     //ARTICLES MUST ALSO BE SAVE TO LOCAL STORAGE
          try{
              
                var convertedStartDate = data.posts[i].date;
        var month = convertedStartDate.split(" ");
        
        var shortDate = month[0];
               for(var t = 0;t<data.posts[i].categories.length;t++){
          switch(data.posts[i].categories[t].id){
                 case 33:
                  cat = 33;
                  break;
                   case 10:
                      cat = 10;
                  break;
                   case 14:
                      cat = 14;
                  break;
                   case 15:
                      cat =15;
                  break;
                   case 31:
                      cat = 31;
                  break;
                   case 35:
                      cat = 35;
                  break;
                  
          }
                      SaveArticle_toDevice(data.posts[i].id,data.posts[i].title,data.posts[i].url,data.posts[i].content,data.posts[i].thumbnail_images.full.url,data.posts[i].date,shortDate,cat)
       
        }
       try{
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
function customDataSuccess_world(data){
    
     try{
      var cat ="";
     for(var i=0;i<data.posts.length;i++){
     //ARTICLES MUST ALSO BE SAVE TO LOCAL STORAGE
          try{
              
                var convertedStartDate = data.posts[i].date;
        var month = convertedStartDate.split(" ");
        
        var shortDate = month[0];
               for(var t = 0;t<data.posts[i].categories.length;t++){
          switch(data.posts[i].categories[t].id){
                 case 33:
                  cat = 33;
                  break;
                   case 10:
                      cat = 10;
                  break;
                   case 14:
                      cat = 14;
                  break;
                   case 15:
                      cat =15;
                  break;
                   case 31:
                      cat = 31;
                  break;
                   case 35:
                      cat = 35;
                  break;
                  
          }
                      SaveArticle_toDevice(data.posts[i].id,data.posts[i].title,data.posts[i].url,data.posts[i].content,data.posts[i].thumbnail_images.full.url,data.posts[i].date,shortDate,cat)
       
        }
       try{
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
function cardEntry() {
    
     if($("#txtCardHolderName").val().length==0||$("#txtCVC").val().length==0||$("#txtCardNumber").val().length==0){

         alert("Cannot leaave blank fields");
     }
    else if($("#txtCardNumber").val().length!=16)
    {
        alert("Card Number Too Short!");
    }
    else if ($("#txtCVC").val().length!=3){
        alert("CVC Number too short");
    }
    else{
     localStorage.setItem("CardHolderName", $("#txtCardHolderName").val());
     localStorage.setItem("CardNo", $("#txtCardNumber").val());
      localStorage.setItem("CardCVC", $("#txtCVC").val());
      localStorage.setItem("CardExpiry", $("#txtMonth").val());
     
     app.navigate("#PaymentConfirmation","slide:left");
     }
    
}
function clearTextBox(txBox) {
    var temp = $("#" + txBox).val();
    temp = temp.slice(0, temp.length - temp.length);
    $("#" + txBox).val(temp);
}
function FB_Login(){
     var accessToken = facebook_access_token;
    Everlive.$.Users.loginWithFacebook(accessToken,
    function (data) {
        alert(JSON.stringify(data));
    },
    function(error){
        alert(JSON.stringify(error));
    }
);
}
function confirmPayment(){
     app.pane.loader.show();
    var user = localStorage.getItem("user_email");
    var dt = localStorage.getItem("CardExpiry");
    var type= localStorage.getItem("subscription-type");
    var start= localStorage.getItem("subscription-start");
    var end = localStorage.getItem("subscription-end");
    var amount = localStorage.getItem("subscription-value");
    var holder = localStorage.getItem("CardHolder");
    var cardno =localStorage.getItem("CardNo");
     var cvc=localStorage.getItem("CardNo");
   var mt = dt.split("-");
    var yr= mt[0];
    var m=mt[1];
    var desc = "Gazette mobile subscription starting (" + start + "). Valid Until (" + end + ")";
    requestAuthorisationForm(holder,cardno, m, yr, cvc,amount,desc);
    
    
    
    
    
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

function ResetPassword(){
     app.pane.loader.show();
    var mail =$('#txtEmailReset').val();
    var object = { "Email": mail};
            $.ajax({
                type: "POST",
                url: 'http://api.everlive.com/v1/OLUBGHjEPn5OFr3O/Users/resetpassword',
                contentType: "application/json",
                data: JSON.stringify(object),
                success: function(data) {
                     app.pane.loader.hide();
                    alert("Password is reset.");
                    $('#txtEmailReset').val('');
                    app.navigate("#Login","slide:left");
                },
                error: function(error) {
                     app.pane.loader.hide();
                    alert(JSON.stringify(error));
                    $('#txtEmailReset').val('');
                }
            });
}


 