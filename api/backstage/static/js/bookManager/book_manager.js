$(document).ready(function(){
	buildArea();
	buildLabelHtml();
	buildBookTypeOptionHtml();
	buildMenuList();
});

var menuTable = null;
var menuSelectOptionsHtml = '';
var dfsfileaccessprefix = '';
var buildMenuList = function(){
	menuTable = $('#data-table-list').dataTable( $.extend(true,{},{ // DataTables初始化选项
        language: {
            "sProcessing":   "处理中...",
            "sLengthMenu":   "每页 _MENU_ 项",
            "sZeroRecords":  "没有匹配结果",
            "sInfo":         "当前显示第 _START_ 至 _END_ 项，共 _TOTAL_ 项。",
            "sInfoEmpty":    "当前显示第 0 至 0 项，共 0 项",
            "sInfoFiltered": "(由 _MAX_ 项结果过滤)",
            "sInfoPostFix":  "",
            "sSearch":       "搜索:",
            "sUrl":          "",
            "sEmptyTable":     "表中数据为空",
            "sLoadingRecords": "载入中...",
            "sInfoThousands":  ",",
            "oPaginate": {
                "sFirst":    "首页",
                "sPrevious": "上页",
                "sNext":     "下页",
                "sLast":     "末页",
                "sJump":     "跳转"
            },
            "oAria": {
                "sSortAscending":  ": 以升序排列此列",
                "sSortDescending": ": 以降序排列此列"
            }
        },
        pageLength: 10,
        autoWidth: false,   // 禁用自动调整列宽
        stripeClasses: ["odd", "even"],
        processing: true,  // 隐藏加载提示,自行处理
        serverSide: true,   // 启用服务器端分页
        searching: false,    // 禁用原生搜索
        pagingType: "full_numbers",
        paging: true,
        dom: 'rtlip',
        bLengthChange: true,
        order: false,
        info: false,
        stateSave: false,
        select:'single',
        oTableTools: {
            aButtons: ["copy", "csv", "xls", "pdf"],
        }
    }, {
        ajax : function(data, callback, settings) {
            var pageparams = {"pageNumber":Math.ceil((settings._iDisplayStart + settings._iDisplayLength) / settings._iDisplayLength),"pageSize":settings._iDisplayLength};
            var fd = $("#searchForm").serializeObject();
            var params = $.extend({}, fd, pageparams);
            
            $.ajax({
                type: "post",
                url: "/mh/books/searchBooks",
                cache : false,  // 禁用缓存
                data: params,    // 传入已封装的参数
                dataType: "json",
                success: function(result) {
                	if(result.code!='0'){
                		return swaltemp("提示", result.msg);
                	}
                	currentItem ="";
                    var returnData = {};
                    returnData.draw = data.draw;// 这里直接自行返回了draw计数器,应该由后台返回
                    returnData.recordsTotal = result.data.total;
                    returnData.recordsFiltered = result.data.total;
                    returnData.data = result.data.list;
                    dfsfileaccessprefix = result.dfsfileaccessprefix;
                    callback(returnData);
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    return swaltemp("查询失败", this. result ? result.msg : "未知异常" );
                }
            });

        },
        columns: [
        	{
                class:"text-center",
                data:"titleImg",
                orderable:false,
	        	 render:function(data, type, row, meta){
	        		 var result = "";
	             	if(data){
	             		result = '<img style="width: 100px;" src="'+dfsfileaccessprefix+data+'"/>';
	             	}
	             	return result;
	             }
            },
            {
                class:"text-center",
                data:"sex",
                orderable:false,
                render:function(data, type, row, meta){
                	var result = (data && data==1)?'男频':'女频';
                	return result;
                }
            },
            {
                class:"text-center",
                data:"id",
                orderable:false,
            },
        	{
                class:"text-center",
                data:"title",
                orderable:false,
            },
        	{
                class:"text-center",
                data:"ending",
                orderable:false,
            },
        	{
                class:"text-center",
                data:"bookStatus",
                orderable:false,
                render:function(data, type, row, meta){
                	var result = (data && data==1)?'完结':'连载';
                	return result;
                }
            },
            {
                class:"text-center",
                data:"areaName",
                orderable:false,
            },
            {
                class:"text-center",
                data:"status",
                orderable:false,
                render:function(data, type, row, meta){
                	var result = (data && data==1)?'启用':'禁用';
                	return result;
                }
            }
            ,
            {
                class:"text-center",
                data:"isrecommendBanner",
                orderable:false,
                render:function(data, type, row, meta){
                	var result = (data && data==1)?'是':'否';
                	return result;
                }
            }
            ,{
                class:"text-center",
                data:"author",
                orderable:false,
            }
            ,{
                class:"text-center",
                data:"readNum",
                orderable:false,
            }
            
            ,{
                class:"text-center",
                data:"createTime",
                orderable:false,
                render:function(data, type, row, meta){
                	var result = (data)? new Date(data).Format('yyyy-MM-dd hh:mm:ss'):""; 
                	return result;
                }
            }
            ,{
                class:"text-center",
                data:"updateTime",
                orderable:false,
                render:function(data, type, row, meta){
                	var result = (data)? new Date(data).Format('yyyy-MM-dd hh:mm:ss'):""; 
                	return result;
                }
            },
        	{
                class:"text-center",
                orderable:false,
                render:function(data, type, row, meta){
                	var bookstatus =(row.bookStatus && row.bookStatus==1)?'连载':'完结';
                	var status =(row.status && row.status==1)?'删除':'启用';
                	var rstr =(row.isrecommendBanner && row.isrecommendBanner==1)?'取消推荐':'推荐Banner';
                	var bs = (row.bookStatus && row.bookStatus==1)?'0':'1';
                	var s = (row.status && row.status==1)?'0':'1';
                	var r = (row.isrecommendBanner && row.isrecommendBanner==1)?'0':'1';
                			
                	var btnhtml = '<div class="btn-group" role="group">';
                	    btnhtml +='<button type="button" class="btn btn-theme dropdown-toggle" data-toggle="dropdown" aria-expanded="false">操作</button>';
                	    btnhtml +='<div class="dropdown-menu" x-placement="bottom-start" style="position: absolute; will-change: transform; top: 0px; left: 0px; transform: translate3d(0px, 37px, 0px);">';
                	    btnhtml +='<a class="dropdown-item" href="/mh/books/section/listpage?bookId='+row.id+'">章节管理</a>';
                	    btnhtml +='<a class="dropdown-item" href="JavaScript:bookStatusChange(\''+row.id+'\',\''+bs+'\')">'+bookstatus+'</a>';
                	    btnhtml +='<a class="dropdown-item" href="JavaScript:statusChange(\''+row.id+'\',\''+s+'\')">'+status+'</a>';
                	    btnhtml +='<a class="dropdown-item" href="JavaScript:recommendBanner(\''+row.id+'\',\''+r+'\')">'+rstr+'</a>';
                	    btnhtml +='</div></div>';
                	return '<button type="button" class="btn btn-outline-danger" onclick="edit(this,\''+row.id+'\')">修改</button>'+btnhtml;
                }
                
            }
        ]
    })).api();
}

$("#btn-search").click(function(){
	if(menuTable!=null)menuTable.draw();
});

$("#btn_add-book-modal").click(function(){
	var btn = $(this);
	btn.attr("data-toggle","modal");
	btn.attr("data-target","#save-book-modal");
	$("#save-book-modal #area_id").html(areaHtml);
	cleanSaveBookform();
    $("#save-book-modal #label_panel").html(labelsHtml);
    $("#save-book-modal #bookType").html(buildBookTypeHtml);
	$("#save-book-modal #btn_submit").attr('onclick','saveBook()');
});

var cleanSaveBookform =  function(){
	var formid = "#save-book-modal";
	$(formid+" #id").val('');
	var bannerImg = $(formid+" #bannerImg");
	bannerImg.after(bannerImg.clone().val(""));
	bannerImg.remove();
	$(formid+' #banner_view').attr('src','http://pic13.nipic.com/20110409/7119492_114440620000_2.jpg');
	
	var titleImg = $(formid+" #titleImg");
	titleImg.after(titleImg.clone().val(""));
	titleImg.remove();
	$(formid+' #title_view').attr('src','http://pic13.nipic.com/20110409/7119492_114440620000_2.jpg');
	
	$("#save-book-modal #title").val('');
	$("#save-book-modal #bookStatus").select2("val", [1]);
	$("#save-book-modal #status").select2("val", [1]);
	$("#save-book-modal #author").val('');
	$("#save-book-modal #comment").val('');
	$("#save-book-modal #readNum").val('0');
}

var chooeseImg =  function(fileinput,viewPanel){
	$(fileinput).click();
}

var viewImg = function(file,prvid){
	if (window.FileReader) { // html5方案
        for (var i = 0, f; f = file.files[i]; i++) {
            var fr = new FileReader();
            fr.onload = function(e) {
                var src = e.target.result;
                showPrvImg(src);
            }
            fr.readAsDataURL(f);
        }
    } else { // 降级处理
    	showPrvImg(file.value);
    }
	
	function showPrvImg(src) {
        $(prvid).attr('src',src);
    }
}

var areaHtml = '<option selected="selected"  value="">请选择</option>';
var buildArea = function(){
	$.ajax({
        type: "post",
        url: "/mh/getAreaList",
        cache : false,  // 禁用缓存
//        data: params,    // 传入已封装的参数
        dataType: "json",
        success: function(result) {
        	if(result && result.data){
        		var data = result.data;
        		for(var i=0;i<data.length;i++){
        			var d = data[i];
        			areaHtml+='<option value="'+d.id+'">'+d.name+'</option>';
        		}
        	}
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            return swaltemp("失败", this. result ? result.msg : "未知异常");
        }
    });
}

var saveBook = function(){
	var params = new FormData($("#save-book-modal #save_form")[0]);
//	var params =$("#save-book-modal").serialize();
	 $.ajax({
        type: "post",
        url: "/mh/books/saveBook",
        cache : false,  // 禁用缓存
        data: params,    // 传入已封装的参数
        dataType: "json",
        processData: false,  // 不处理数据
  	    contentType: false,   // 不设置内容类型
        success: function(result) {
        	if(result.code!='0'){
        		return swaltemp("提示", result.msg);
        	}
        	$("#save-book-modal #btn_close").click();
        	if(menuTable!=null)menuTable.draw(false);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            return swaltemp("操作失败", this. result ? result.msg : "未知异常");
        }
    });
}

var edit = function(elment,id){
	var btn = $(elment);
	btn.attr("data-toggle","modal");
	btn.attr("data-target","#save-book-modal");
	$("#save-book-modal #area_id").html(areaHtml);
	cleanSaveBookform();
    $("#save-book-modal #label_panel").html(labelsHtml);
    $("#save-book-modal #bookType").html(buildBookTypeHtml);
	$("#save-book-modal #btn_submit").attr('onclick','saveBook()');
	buildBookInfo(id);
}

var buildBookInfo =  function(id){
	$.ajax({
        type: "post",
        url: "/mh/books/getBookInfo",
        cache : false,  // 禁用缓存
        data: {id:id},    // 传入已封装的参数
        dataType: "json",
        success: function(result) {
        	if(result.code!='0'){
        		return swaltemp("提示", result.msg);
        	}
        	var data = result.data.book;
        	if(data){
        		var formid = "#save-book-modal";
    			$(formid+" #id").val(id);
    			$(formid+" #title").val(data.title);
    			$(formid+" #author").val(data.author);
    			$(formid+" #status").select2("val", [data.status]);
    			$(formid+" #bookStatus").select2("val", [data.bookStatus]);
    			$(formid+" #comment").val(data.comment);
    			$(formid+" #area_id").select2("val", [data.areaId]);
    			$(formid+" #banner_view").attr('src',result.dfsfileaccessprefix+data.bannerImg);
    			$(formid+" #title_view").attr('src',result.dfsfileaccessprefix+data.titleImg);
    			$(formid+" #readNum").val(data.readNum);
    			
    			$(formid+" #bookType").select2("val", [result.data.bookType]);
    			
    			var labelarry = result.data.labelList;
    			for(var i = 0;i<labelarry.length;i++){
    				var lb = labelarry[i];
    				$(formid+" #label_"+lb).prop("checked",true);
    			}
        	}
        	
        	
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            return swaltemp("失败", this. result ? result.msg : "未知异常");

        }
    });
}

var labelsHtml = '';
var buildLabelHtml = function(){
	$.ajax({
        type: "post",
        url: "/mh/books/getAllLabel",
        cache : false,  // 禁用缓存
        dataType: "json",
        success: function(result) {
        	if(result.code!='0'){
        		return swaltemp("提示", result.msg);
        	}
        	var data = result.data;
        	if(data){
        		for(var i=0;i<data.length;i++){
        			var label = data[i];
        			labelsHtml+='<span class="badge badge-pill badge-primary" style="margin: 5px">';
        			labelsHtml+='<input type="checkbox" id="label_'+label.id+'" name="label_'+label.id+'" value="'+label.id+'" /><label>'+label.name+'</label>';
        			labelsHtml+='</span>';
        		}
        	}
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            return swaltemp("失败", this. result ? result.msg : "未知异常");

        }
    });
}

var buildBookTypeHtml ='<option selected="selected" value="">请选择</option>';
var buildBookTypeOptionHtml = function(){
	$.ajax({
        type: "post",
        url: "/mh/books/getAllBookType",
        cache : false,  // 禁用缓存
        dataType: "json",
        success: function(result) {
        	if(result.code!='0'){
        		return swaltemp("提示", result.msg);
        	}
        	var data = result.data;
        	if(data){
        		for(var i=0;i<data.length;i++){
        			var label = data[i];
        			buildBookTypeHtml += '<option value="'+label.id+'">'+label.name+'</option>';
        		}
        	}
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            return swaltemp("失败", this. result ? result.msg : "未知异常");

        }
    });
}

var statusChange = function(id,status){
	$.ajax({
        type: "post",
        url: "/mh/books/statusChange",
        cache : false,  // 禁用缓存
        data: {'id':id,'status':status},    // 传入已封装的参数
        dataType: "json",
        success: function(result) {
        	if(result.code!='0'){
        		return swaltemp("提示", result.msg);
        	}
        	if(menuTable!=null)menuTable.draw();
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            return swaltemp("失败", this. result ? result.msg : "未知异常");
        }
    });
}

var bookStatusChange = function(id,status){
	$.ajax({
        type: "post",
        url: "/mh/books/bookStatusChange",
        cache : false,  // 禁用缓存
        data: {'id':id,'status':status},    // 传入已封装的参数
        dataType: "json",
        success: function(result) {
        	if(result.code!='0'){
        		return swaltemp("提示", result.msg);
        	}
        	if(menuTable!=null)menuTable.draw();
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            return swaltemp("失败", this. result ? result.msg : "未知异常");
        }
    });
}

var recommendBanner = function(id,status){
	$.ajax({
        type: "post",
        url: "/mh/books/recommendBanner",
        cache : false,  // 禁用缓存
        data: {'id':id,'status':status},    // 传入已封装的参数
        dataType: "json",
        success: function(result) {
        	if(result.code!='0'){
        		return swaltemp("提示", result.msg);
        	}
        	if(menuTable!=null)menuTable.draw();
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            return swaltemp("失败", this. result ? result.msg : "未知异常");
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