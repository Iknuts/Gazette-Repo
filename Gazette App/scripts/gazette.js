var rootUrl='http://www.gazettebw.com/?json=';
function getWeebFeed(){
     $.ajax({
  url: rootUrl + "get_category_index" ,
  type: 'GET',
 data:'',
  success: function(data) {
      
	//called when successful
      var list=$('#home-list');
      list.empty();
      list.attr("data-role","listview");
      list.attr("data-type","group");
	 $.each(data.categories,function(idx,cat){
        if(cat.parent==0){
            
            var category = "<li data-role='list-divider' >" + cat.title  + 
                "</li>" +
                "<li><ul>" + 
                "<li>" + 
                "<div id='owl-sports' class='owl-carousel'>";
            
                $.ajax({
              url: rootUrl + "get_category_posts&category_id=" + cat.id ,
              type: 'GET',
             data:'',
              success: function(result) {
                  $.each(result,function(idx,article){
                   alert(article.title);
                      
                  });
                  
              },error:function(e){

              }
            
        });
         category+="</div>"+
                    "</li>"+
                     "</ul>"+
                        "</li>";
         
                        
     }
     });
  },
  error: function(e) {
	//called when there is an error
	//console.log(e.message);
  }
});
     
 }