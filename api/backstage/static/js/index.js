$(document).ready(function(){
});
var goPage = function(uri){
	if(uri != "undefined" &&  $.trim(uri)!=''){
		$("#contentPage").attr("src", uri);
	}
}

var reload = function(){
	location.reload();
}