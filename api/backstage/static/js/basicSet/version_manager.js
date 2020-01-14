$(document).ready(function(){
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
                url: "/mh/basicSet/version/searchVersion",
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
                data:"id",
                orderable:false,
            },
        	{
                class:"text-center",
                data:"version",
                orderable:false,
            },
            {
                class:"text-center",
                data:"type",
                orderable:false,
                render:function(data, type, row, meta){
                	var result = (data && data==1)?'IOS':'Android';
                	return result;
                }
            },
            {
                class:"text-center",
                data:"downloadUrl",
                orderable:false,
                render:function(data, type, row, meta){
                	return dfsfileaccessprefix+data;
                }
            },
            {
                class:"text-center",
                data:"channelNo",
                orderable:false
            },
            {
                class:"text-center",
                data:"channelName",
                orderable:false
            },
            {
                class:"text-center",
                data:"jumpBook",
                orderable:false
            },
            {
                class:"text-center",
                data:"jumpBookIndex",
                orderable:false
            },
        	{
                class:"text-center",
                data:"status",
                orderable:false,
                render:function(data, type, row, meta){
                	var result = (data && data==1)?'发布':'禁用';
                	return result;
                }
            },
            {
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
                	return '<button type="button" class="btn btn-outline-danger" onclick="edit(this,\''+row.id+'\',\''+row.channelId+'\')">修改</button>';
                }
            }
        ]
    })).api();
}

$("#btn-search").click(function(){
	if(menuTable!=null)menuTable.draw();
});

$("#btn_add-save-modal").click(function(){
	var btn = $(this);
	btn.attr("data-toggle","modal");
	btn.attr("data-target","#save-modal");
	cleanform();
	buildChannel(null);
	$("#save-modal #btn_submit").attr('onclick','save()');
});



var cleanform =  function(){
	var formid = "#save-modal";
	$(formid+" #id").val('');
	$(formid+" #version").val('');
	$(formid+" #desc").val('');
	var apkFile = $(formid+" #apkFile");
	apkFile.after(apkFile.clone().val(""));
	apkFile.remove();
	$(formid+" #type").select2("val", [1]);
	$(formid+" #status").select2("val", [1]);
	$(formid+" #jump_book").val('');
	$(formid+" #jump_book_index").val('');
}


var save = function(){
	var params = new FormData($("#save-modal #form")[0]);
	 $.ajax({
        type: "post",
        url: "/mh/basicSet/version/saveVersion",
        cache : false,  // 禁用缓存
        data: params,    // 传入已封装的参数
//        dataType: "json",
        processData: false,  // 不处理数据
  	    contentType: false,   // 不设置内容类型
        success: function(result) {
        	if(result.code!='0'){
        		return swaltemp("提示", result.msg);
        	}
        	$("#save-modal #btn_close").click();
        	if(menuTable!=null)menuTable.draw();
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            return swaltemp("操作失败", this. result ? result.msg : "未知异常");
        }
    });
}

var edit = function(elment,id,channelId){
	var btn = $(elment);
	btn.attr("data-toggle","modal");
	btn.attr("data-target","#save-modal");
	cleanform();
	buildVersionInfo(id);
	buildChannel(channelId);
	
	$("#save-modal #btn_submit").attr('onclick','save()');
}

var buildVersionInfo = function(id){
	$.ajax({
        type: "post",
        url: "/mh/basicSet/version/getVersion",
        cache : false,  // 禁用缓存
        data: {'id':id},    // 传入已封装的参数
        dataType: "json",
        success: function(result) {
        	if(result.code!='0'){
        		return swaltemp("提示", result.msg);
        	}
        	var data = result.data;
        	if(data){
        		var formid = "#save-modal #form ";
        		$(formid+" #id").val(data.id);
        		$(formid+" #version").val(data.version);
        		$(formid+" #desc").val(data.desc);
        		$(formid+" #type").select2("val", [data.type]);
        		$(formid+" #status").select2("val", [data.status]);
        		$(formid+" #jump_book").val(data.jumpBook);
        		$(formid+" #jump_book_index").val(data.jumpBookIndex);
        	}
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            return swaltemp("失败", this. result ? result.msg : "未知异常");
        }
    });
}

var buildChannel= function(id){
	$.ajax({
        type: "post",
        url: "/mh/basicSet/channel/getChannel",
        cache : false,  // 禁用缓存
        data: null,    // 传入已封装的参数
        dataType: "json",
        success: function(result) {
        	if(result.code!='0'){
        		return swaltemp("提示", result.msg);
        	}
        	var data = result.data;
        	var htm = "";
        	$.each(data.list,function(n,value) {
        		if(id == value.id){
        			htm += "<option value=\"" + value.id + "\" selected=\"selected\">" + value.channelName + "</option>"
        		}else{
        			htm += "<option value=\"" + value.id + "\">" + value.channelName + "</option>"
        		}
        		
        	})
        	$("#channel").html(htm);
        },error: function(XMLHttpRequest, textStatus, errorThrown) {
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