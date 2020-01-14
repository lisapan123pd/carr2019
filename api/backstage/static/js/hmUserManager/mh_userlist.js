$(document).ready(function(){
	buildMenuList();
});

var menuTable = null;
var menuSelectOptionsHtml = '';
var buildMenuList = function(){
	menuTable = $('#data-table-list').dataTable( $.extend(true,{},{ // DataTables初始化选项
        language: {
            "sProcessing":   "处理中...",
            "sLengthMenu":   "每页_MENU_项",
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
                url: "/mh/user/searchUser",
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
                data:"username",
                orderable:false,
            },
        	{
                class:"text-center",
                data:"phone",
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
            ,{
                class:"text-center",
                data:"gold",
                orderable:false,
            }
            ,{
                class:"text-center",
                data:"isVip",
                orderable:false,
                render:function(data, type, row, meta){
                	var result = '否';
                	if(data && data==1 && row.startTime && row.endTime){
                		var df = (row.endTime-row.startTime)/1000;
                		
                		var y = df/60/60/24/30/12;
                		result = parseInt(y)>0? parseInt(y)+"年":'';
                		var m = (parseInt(y)>0?(y-parseInt(y)):y)*12;
                		result += parseInt(m)>0? parseInt(m)+"月":'';
                		var d = (parseInt(m)>0?(m-parseInt(m)):m)*30;
                		result += parseInt(d)>0? parseInt(d)+"日":'';
                		var h = (parseInt(d)>0?(d-parseInt(d)):d)*24;
                		result += parseInt(h)>0? parseInt(h)+"时":'';
                		var m = h*60;
                		result += parseInt(m)>0? parseInt(m)+"分":'';
                		var s = m*60;
                		result += s.toFixed(3)+"秒";
                	}
                	return result;
                }
            } ,{
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
                	var result = '<button type="button" class="btn btn-outline-danger" onclick="showAddOrSubtractGold(this,\''+row.id+'\')">充值扣减</button>/<button type="button" class="btn btn-outline-info" onclick="showSetVip(this,\''+row.id+'\')">VIP设置</button>';
                	return result;
                }
                
            }
        ]
    })).api();
}

$("#btn-search").click(function(){
	if(menuTable!=null)menuTable.draw();
});



var showAddOrSubtractGold = function(elment,id){
	var btn = $(elment);
	btn.attr("data-toggle","modal");
	btn.attr("data-target","#gold-modal");
	
	$("#gold-modal #type").select2("val", [1]);
	$("#gold-modal #gold").val('');
	$("#gold-modal #id").val(id);
	$("#gold-modal #btn_submit").attr('onclick','addOrSubtractGold()');
}

var showSetVip = function(elment,id){
	var btn = $(elment);
	btn.attr("data-toggle","modal");
	btn.attr("data-target","#setvip-modal");
	
	$("#setvip-modal #isVip").select2("val", [1]);
	$("#setvip-modal #beginTime").val('');
	$("#setvip-modal #endTime").val('');
	$("#setvip-modal #id").val(id);
	$("#setvip-modal #btn_submit").attr('onclick','setVip()');
}

var addOrSubtractGold = function(){
	 var params =$("#add_goldform").serialize();
	 $.ajax({
         type: "post",
         url: "/mh/user/addOrSubtractGold",
         cache : false,  // 禁用缓存
         data: params,    // 传入已封装的参数
         dataType: "json",
         success: function(result) {
         	if(result.code!='0'){
         		return swaltemp("提示", result.msg);
         	}
         	$("#gold-modal #btn_close").click();
         	if(menuTable!=null)menuTable.draw();
         },
         error: function(XMLHttpRequest, textStatus, errorThrown) {
             return swaltemp("操作失败", this. result ? result.msg : "未知异常");
         }
     });
}

var setVip = function(){
	 var params =$("#add_setvipform").serialize();
	 $.ajax({
        type: "post",
        url: "/mh/user/setVipTime",
        cache : false,  // 禁用缓存
        data: params,    // 传入已封装的参数
        dataType: "json",
        success: function(result) {
        	if(result.code!='0'){
        		return swaltemp("提示", result.msg);
        	}
        	$("#setvip-modal #btn_close").click();
        	if(menuTable!=null)menuTable.draw();
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            return swaltemp("操作失败", this. result ? result.msg : "未知异常");
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