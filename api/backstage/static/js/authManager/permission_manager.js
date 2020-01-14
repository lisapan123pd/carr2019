$(document).ready(function(){
	buildMenuSelect();
	buildDataList();
});

$.fn.serializeObject = function() {  
    var o = {};  
    var a = this.serializeArray();  
    $.each(a, function() {  
        if (o[this.name]) {  
            if (!o[this.name].push) {  
                o[this.name] = [ o[this.name] ];  
            }  
            o[this.name].push(this.value || '');  
        } else {  
            o[this.name] = this.value || '';  
        }  
    });  
    return o;  
}  

var dataTable = null;
var menuSelectOptionsHtml = '';
var buildDataList = function(){
	dataTable = $('#data-table-list').dataTable( $.extend(true,{},{ // DataTables初始化选项
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
                url: "/auth/permission/searchPermission",
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
                data:"menuName",
                orderable:false,
            },
            
            {
                class:"text-center",
                data:"name",
                orderable:false,
            },
            
            {
                class:"text-center",
                data:"permission",
                orderable:false,
            },
        	{
                class:"text-center",
                data:"uri",
                orderable:false,
            },
        	{
                class:"text-center",
                orderable:false,
                render:function(data, type, row, meta){
                	var result = '<button type="button" class="btn btn-outline-danger" onclick="delPermission(\''+row.id+'\')">删除</button>/<button type="button" class="btn btn-outline-info" onclick="buildPermissionEdit(\''+row.id+'\',this)">修改</button>';
                	return result;
                }
                
            }
        ]
    })).api();
}

$("#btn-search").click(function(){
	if(dataTable!=null)dataTable.draw();
});

$("#btn_save-permission-modal").click(function(){
	var btn = $(this);
	btn.attr("data-toggle","modal");
	btn.attr("data-target","#save-permission-modal");
	
	clearPermissionSaveForm();
	$("#save-permission-modal #btn_submit").attr('onclick','save()');
	
});

var clearPermissionSaveForm = function(){
	$("#save-permission-modal #permission").val('');
	$("#save-permission-modal #uri").val('');
	$("#save-permission-modal #name").val('');
	$("#save-permission-modal #id").val('');
	$("#save-permission-modal #menuId").html(menuSelectOptionsHtml);
}

var buildPermissionEdit = function(id,elment){
	var btn = $(elment);
	btn.attr("data-toggle","modal");
	btn.attr("data-target","#save-permission-modal");
	
	clearPermissionSaveForm();
	$("#save-permission-modal #btn_submit").attr('onclick','save()');
	
	 $.ajax({
         type: "post",
         url: "/auth/permission/getPermission",
         cache : false,  // 禁用缓存
         data: {"permissionId":id},    // 传入已封装的参数
         dataType: "json",
         success: function(result) {
         	if(result.code!='0'){
         		return swaltemp("提示", result.msg);
         	}
         	var info = result.data;
        	$("#save-permission-modal #permission").val(info.permission);
        	$("#save-permission-modal #uri").val(info.uri);
        	$("#save-permission-modal #name").val(info.name);
        	$("#save-permission-modal #id").val(info.id);
        	$("#save-permission-modal #menuId").select2("val", [info.menuId]);
         },
         error: function(XMLHttpRequest, textStatus, errorThrown) {
             return swaltemp("获得菜单信息失败", this. result ? result.msg : "未知异常");
         }
     });
}

var save = function(){
	 var params =$("#save_form").serialize();
	 $.ajax({
         type: "post",
         url: "/auth/permission/savePermission",
         cache : false,  // 禁用缓存
         data: params,    // 传入已封装的参数
         dataType: "json",
         success: function(result) {
         	if(result.code!='0'){
         		return swaltemp("提示", result.msg);
         	}
         	$("#save-permission-modal #btn_close").click();
         	if(dataTable!=null)dataTable.draw();
         },
         error: function(XMLHttpRequest, textStatus, errorThrown) {
             return swaltemp("提示", this. result ? result.msg : "未知异常");
         }
     });
}

var delPermission = function(id){
	 $.ajax({
        type: "post",
        url: "/auth/permission/delPermission",
        cache : false,  // 禁用缓存
        data: {"permissionId":id},    // 传入已封装的参数
        dataType: "json",
        success: function(result) {
        	if(result.code!='0'){
        		return swaltemp("提示", result.msg);
        	}
        	if(dataTable!=null)dataTable.draw();
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            return swaltemp("删除失败", this. result ? result.msg : "未知异常");
        }
    });
}

var buildMenuSelect = function(){
	 $.ajax({
         type: "post",
         url: "/auth/menu/getAllMenuList",
         cache : false,  // 禁用缓存
//         data: params,    // 传入已封装的参数
         dataType: "json",
         success: function(result) {
         	if(result.code!='0'){
         		return swaltemp("提示", result.msg);
         	}
         	var html = '<option value="0">根节点</option>';
         	var datalist = result.data;
         	for(var i in datalist){
         		var menuName = datalist[i].menuName;
         		var menuid = datalist[i].id;
         		html+='<option value="'+menuid+'">'+menuName+'</option>';
         	}
         	menuSelectOptionsHtml = html;
         	$("#searchMenuForm #search_pid").html('<option value=" ">请选择一项</option>'+menuSelectOptionsHtml);
         },
         error: function(XMLHttpRequest, textStatus, errorThrown) {
             return swaltemp("提示", this. result ? result.msg : "未知异常");
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