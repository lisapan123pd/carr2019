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
                url: "/mh/order/searchOrder",
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
                data:"userName",
                orderable:false,
            },
        	{
                class:"text-center",
                data:"orderNo",
                orderable:false,
            },
        	{
                class:"text-center",
                data:"payMoney",
                orderable:false,
            },
        	{
                class:"text-center",
                data:"status",
                orderable:false,
                render:function(data, type, row, meta){
                	//状态 1成功 0,待支付,2:支付失败,3:取消订单，4：删除
                	var result = "";
                	if(data){
                		if(data==1){
                			result = "成功";
                		}else if(data==2){
                			result = "支付失败";
                		}else if(data==3){
                			result = "取消订单";
                		}else if(data==4){
                			result = "删除";
                		}else if(data==0){
                			result = "待支付";
                		}
                	}else{
                		result = "待支付";
                	}
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
            ,
        	{
                class:"text-center",
                orderable:false,
                render:function(data, type, row, meta){
                	var html = buildPackageInfoHtml(row.packageGoodsDetail);
                	packageInfoData.set(row.orderNo,html);
                	return '<button type="button" class="btn btn-outline-danger" onclick="edit(this,\''+row.orderNo+'\')">详情</button>';
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
	$("#save-modal #btn_submit").attr('onclick','save()');
});

var packageInfoData = new Map();
var buildPackageInfoHtml = function(data){
	var html = '';
	
	if(data.title){
		html+=build("套餐名称",data.title);
	}
	if(data.type){
		var str = data.type==1?"vip套餐":"金币套餐";
		html+=build("套餐类型",str);
	}
	if(data.money){
		html+=build("金额",data.money);
	}
	if(data.gold){
		html+=build("金币",data.gold);
	}
	if(data.giftGold){
		html+=build("赠送金币",data.giftGold);
	}
	if(data.daycount){
		html+=build("VIP时长",data.daycount);
	}
	if(data.giftDaycount){
		html+=build("赠送时长",data.giftDaycount);
	}
	
return html;
}
var build = function(key,value){
	var html ='<div class="input-group">';
	html+='<span class="input-group-addon" style="border-right:1px solid rgba(255,255,255,.2);">'+key+'</span>';
	html+='<div class="form-group" >';
	html+='<label>'+value+'</label>';
	html+='</div>';
	html+='</div>';
	return html;
}


var cleanform =  function(){
	var formid = "#save-modal";
//	$(formid+" #id").val('');
//	$(formid+" #status").val('1');
//	$(formid+" #name").val('');
}


var save = function(){
	var params =$("#save-modal #form").serialize();
	$.ajax({
        type: "post",
        url: "/mh/basicSet/label/saveLabel",
        cache : false,  // 禁用缓存
        data: params,    // 传入已封装的参数
        dataType: "json",
        success: function(result) {
        	if(result.code!='0'){
        		return swaltemp("提示", result.msg);
        	}
        	if(menuTable!=null)menuTable.draw();
        	$("#save-modal #btn_close").click();
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            return swaltemp("失败", this. result ? result.msg : "未知异常");
        }
    });
}

var edit = function(elment,id){
	var btn = $(elment);
	btn.attr("data-toggle","modal");
	btn.attr("data-target","#save-modal");
	cleanform();
	var formid = "#save-modal";
	var html = packageInfoData.get(id);
	$(formid+" #shwodetail").html('');
	$(formid+" #shwodetail").html(html);
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