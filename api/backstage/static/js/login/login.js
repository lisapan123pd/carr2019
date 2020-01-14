$(document).ready(function(){
	if(undefined!=parent.reload){
		parent.reload();
	}
});
$("#login_btn").click(function(){
	doLogin();
});

var doLogin = function(){
	var fd = $("#loginForm").serialize();//new FormData($("#loginForm")[0]);
	$.ajax({
        type: "post",
        url: "/dologin",
        cache : false,  // 禁用缓存
        data:  fd,//{"username":fd.get("username"),"password":fd.get("password")},    // 传入已封装的参数
        dataType: "json",
        success: function(result) {
        	if(result.code!='0'){
        		return swaltemp('登陆失败',result.msg);
        	}
        	location.href="/home/index";
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            return swaltemp("登陆失败", this. result ? result.msg : "未知异常");
        }
    });
}

var swaltemp = function(title,text){
	swal({
        title: title,
        text: text,
        type: 'warning',
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-sm btn-light',
        background: 'rgba(0, 0, 0, 0.96)'
    })
}