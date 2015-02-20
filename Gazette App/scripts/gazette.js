 function checkItem(){
     $.ajax({
  url: 'http://gazettebw.com/wp-json/posts',
  type: 'GET',
 data:'',
  success: function(data) {
	//called when successful
	 
  },
  error: function(e) {
	//called when there is an error
	//console.log(e.message);
  }
});
     
 }