$(document).ready(function(){
	buildMenuSelect();
	buildMenuList();
});

var menuTable = null;
var menuSelectOptionsHtml = '';
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
            var fd = new FormData($("#searchMenuForm")[0]);
            var params = $.extend({}, {"menuName":fd.get("menuName"),"uri":fd.get("uri"),"pid":fd.get("pid")}, pageparams);
            
            $.ajax({
                type: "post",
                url: "/auth/menu/getAllMenu",
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
                data:"uri",
                orderable:false,
            },
            {
                class:"text-center",
                data:"parentsMenuName",
                orderable:false,
            },
        	{
                class:"text-center",
                orderable:false,
                render:function(data, type, row, meta){
                	var result = '<button type="button" class="btn btn-outline-danger" onclick="delMenu(\''+row.id+'\')">删除</button>/<button type="button" class="btn btn-outline-info" onclick="buildMenuEdit(\''+row.id+'\',this)">修改</button>';
                	return result;
                }
                
            }
        ]
    })).api();
}

$("#btn-search").click(function(){
	if(menuTable!=null)menuTable.draw();
});

$("#btn_add-menu-modal").click(function(){
	var btn = $(this);
	btn.attr("data-toggle","modal");
	btn.attr("data-target","#add-menu-modal");
	
	$("#add-menu-modal #menuName").val('');
	$("#add-menu-modal #uri").val('');
	$("#add-menu-modal #sort").val('0');
	$("#add-menu-modal #id").val('');
	$("#add-menu-modal #pid").html(menuSelectOptionsHtml);
	$("#add-menu-modal #btn_submit").attr('onclick','addMenu()');
	
});

var buildMenuEdit = function(id,elment){
	var btn = $(elment);
	btn.attr("data-toggle","modal");
	btn.attr("data-target","#add-menu-modal");
	
	$("#add-menu-modal #menuName").val('');
	$("#add-menu-modal #uri").val('');
	$("#add-menu-modal #id").val('');
	$("#add-menu-modal #sort").val('0');
	$("#add-menu-modal #pid").html(menuSelectOptionsHtml);
	$("#add-menu-modal #btn_submit").attr('onclick','addMenu()');
	
	 $.ajax({
         type: "post",
         url: "/auth/menu/getMenuInfo",
         cache : false,  // 禁用缓存
         data: {"menuId":id},    // 传入已封装的参数
         dataType: "json",
         success: function(result) {
         	if(result.code!='0'){
         		return swaltemp("提示", result.msg);
         	}
         	var info = result.data;
         	$("#add-menu-modal #menuName").val(info.menuName);
        	$("#add-menu-modal #uri").val(info.uri);
        	$("#add-menu-modal #id").val(info.id);
        	$("#add-menu-modal #sort").val(info.sort);
        	$("#add-menu-modal #pid").select2("val", [info.pid]);
         },
         error: function(XMLHttpRequest, textStatus, errorThrown) {
             return swaltemp("获得菜单信息失败", this. result ? result.msg : "未知异常");
         }
     });
}

var addMenu = function(){
	 var params =$("#add_menu_form").serialize();
	 $.ajax({
         type: "post",
         url: "/auth/menu/saveMenu",
         cache : false,  // 禁用缓存
         data: params,    // 传入已封装的参数
         dataType: "json",
         success: function(result) {
         	if(result.code!='0'){
         		return swaltemp("提示", result.msg);
         	}
         	$("#add-menu-modal #btn_close").click();
         	if(menuTable!=null)menuTable.draw();
         },
         error: function(XMLHttpRequest, textStatus, errorThrown) {
             return swaltemp("新增失败", this. result ? result.msg : "未知异常");
         }
     });
}

var delMenu = function(id){
	 $.ajax({
        type: "post",
        url: "/auth/menu/delMenu",
        cache : false,  // 禁用缓存
        data: {"menuId":id},    // 传入已封装的参数
        dataType: "json",
        success: function(result) {
        	if(result.code!='0'){
        		return swaltemp("提示", result.msg);
        	}
        	if(menuTable!=null)menuTable.draw();
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