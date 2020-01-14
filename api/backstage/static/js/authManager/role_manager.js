$(document).ready(function(){
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
                url: "/auth/role/searchRoles",
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
                data:"roleName",
                orderable:false,
            },
        	{
                class:"text-center",
                orderable:false,
                render:function(data, type, row, meta){
                	var result = '<button type="button" class="btn btn-outline-danger" onclick="delRole(\''+row.id+'\')">删除</button>/<button type="button" class="btn btn-outline-info" onclick="buildRoleEdit(\''+row.id+'\',\''+row.roleName+'\',this)">修改</button>'
                	+'/<button type="button" class="btn btn-outline-success" onclick="getPerTreeData(this,\''+row.id+'\')">设置权限</button>';
                	return result;
                }
                
            }
        ]
    })).api();
}

$("#btn-search").click(function(){
	if(dataTable!=null)dataTable.draw();
});

$("#btn_save-role-modal").click(function(){
	var btn = $(this);
	btn.attr("data-toggle","modal");
	btn.attr("data-target","#save-role-modal");
	
	clearRoleSaveForm();
	$("#save-role-modal #btn_submit").attr('onclick','save()');
	
});

var clearRoleSaveForm = function(){
	$("#save-role-modal #roleName").val('');
	$("#save-role-modal #id").val('');
}

var buildRoleEdit = function(id,roleName,elment){
	var btn = $(elment);
	btn.attr("data-toggle","modal");
	btn.attr("data-target","#save-role-modal");
	
	clearRoleSaveForm();
	$("#save-role-modal #roleName").val(roleName);
	$("#save-role-modal #id").val(id);
	$("#save-role-modal #btn_submit").attr('onclick','save()');
	
	
}

var save = function(){
	 var params =$("#save_form").serialize();
	 $.ajax({
         type: "post",
         url: "/auth/role/saveRole",
         cache : false,  // 禁用缓存
         data: params,    // 传入已封装的参数
         dataType: "json",
         success: function(result) {
         	if(result.code!='0'){
         		return swaltemp("提示", result.msg);
         	}
         	$("#save-role-modal #btn_close").click();
         	if(dataTable!=null)dataTable.draw();
         },
         error: function(XMLHttpRequest, textStatus, errorThrown) {
             return swaltemp("提示", this. result ? result.msg : "未知异常");
         }
     });
}

var delRole = function(id){
	 $.ajax({
        type: "post",
        url: "/auth/role/delRole",
        cache : false,  // 禁用缓存
        data: {"roleId":id},    // 传入已封装的参数
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

function treeChecked(obj){
	//当选中一个权限时，也要选中所有的直接上级权限
	if(obj.checked){
   		$(obj).parents("li").parents("li").children('div.jqtree-element.jqtree_common').children("input").prop("checked",true);
		$(obj).parent("div").parent("li").find("input").prop("checked",true);
   	}else{
   		$(obj).parent("div").parent('li').find("input").prop("checked",false);
   	}
}

var setPermission = function(roleId){
	var nodeData = new Object();
	nodeData.roleId = roleId;
	 var dataArray = new Array();
	 $.each($('#per-tree-modal #per_tree_view input:checkbox:checked'),function(){
		 var node = $(this);
		 var type = node.attr('data-type');
		 var id = node.attr('data-id');
		 dataArray.push({"type":type,"id":id});
     });
	 nodeData.nodes = dataArray;
	 $.ajax({
	        type: "post",
	        url: "/auth/role/setPermission",
	        cache : false,  // 禁用缓存
	        contentType:'application/json;charset=utf-8',
	        data: JSON.stringify(nodeData),    // 传入已封装的参数
	        dataType: "json",
	        success: function(result) {
	        	if(result.code!='0'){
	        		return swaltemp("提示", result.msg);
	        	}
	        	$("#per-tree-modal #btn_close").click();
	        },
	        error: function(XMLHttpRequest, textStatus, errorThrown) {
	            return swaltemp("提示", this. result ? result.msg : "未知异常");
	        }
	    });
}

var getPerTreeData = function(treePanel,roleId){
	var btn = $(treePanel);
	btn.attr("data-toggle","modal");
	btn.attr("data-target","#per-tree-modal");
	$('#per-tree-modal #per_tree_view').html('');
	$("#per-tree-modal #btn_submit").attr('onclick','setPermission(\''+roleId+'\')');
	var preTree = $('#per-tree-modal #per_tree_view').tree({
	    autoOpen: true,
	    onCreateLi: function(node, $li) {
	    	var ischecked = "";
	    	if(node.checked==1){
	    		ischecked ='checked="checked"';
	    	}
	        $li.find('.jqtree-title').before('<input onclick="treeChecked(this)" '+ischecked+' type="checkbox" data-type="'+node.type+'" data-id="'+node.id+'" style="width: 15px;height: 15px;vertical-align: middle;" />');
	    }
	});
	$.ajax({
        type: "post",
        url: "/auth/role/getPerTreeData",
        cache : false,  // 禁用缓存
        data: {"roleId":roleId},
        dataType: "json",
        success: function(result) {
        	if(result.code!='0'){
        		return swaltemp("提示", result.msg);
        	}
        	preTree.tree('loadData', result.data);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            return swaltemp("提示", this. result ? result.msg : "未知异常");
        }
    });
}
//=============================================================================================


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