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
                url: "/mh/package/searchPackage",
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
                    return swaltemp("查询失败", this. result ? result.msg : "未知异常");
                }
            });

        },
        columns: [
        	{
                class:"text-center",
                data:"title",
                orderable:false,
            },
            {
                class:"text-center",
                data:"type",
                orderable:false,
                render:function(data, type, row, meta){
                	var result = (data && data==1)?'VIP套餐':'金币套餐';
                	return result;
                }
            },
        	{
                class:"text-center",
                data:"gold",
                orderable:false,
                render:function(data, type, row, meta){
                	var result = (data)?data:'0';
                	return result;
                }
            },
        	{
                class:"text-center",
                data:"giftGold",
                orderable:false,
                render:function(data, type, row, meta){
                	var result = (data)?data:'0';
                	return result;
                }
            },
        	{
                class:"text-center",
                data:"daycount",
                orderable:false,
                render:function(data, type, row, meta){
                	var result = (data)?data:'0';
                	return result;
                }
            },
        	{
                class:"text-center",
                data:"giftDaycount",
                orderable:false,
                render:function(data, type, row, meta){
                	var result = (data)?data:'0';
                	return result;
                }
            },
        	{
                class:"text-center",
                data:"isRecommend",
                orderable:false,
                render:function(data, type, row, meta){
                	var result = (data && data==1)?'是':'否';
                	return result;
                }
            },
        	{
                class:"text-center",
                data:"sort",
                orderable:false,
                render:function(data, type, row, meta){
                	var result = (data)?data:'0';
                	return result;
                }
            },
        	{
                class:"text-center",
                data:"money",
                orderable:false,
                render:function(data, type, row, meta){
                	var result = (data)?data:'0';
                	return result;
                }
            },
        	{
                class:"text-center",
                data:"status",
                orderable:false,
                render:function(data, type, row, meta){
                	var result = (data && data==1)?'正常':'删除';
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
                	return '<button type="button" class="btn btn-outline-danger" onclick="edit(this,\''+row.id+'\')">修改</button>';
                }
            }
        ]
    })).api();
}

$("#btn-search").click(function(){
	if(menuTable!=null)menuTable.draw();
});

$("#btn_add-package-modal").click(function(){
	var btn = $(this);
	btn.attr("data-toggle","modal");
	btn.attr("data-target","#save-modal");
	cleanform();
	$("#save-modal #btn_submit").attr('onclick','save()');
});

var typechoese = function(c){
	var formid = "#save-modal";
	var type = $(c).val();
	if(type==0){
		$(formid+" #typechoece_panel").html(goldPackageHtml);
	}else{
		$(formid+" #typechoece_panel").html(vipPackageHtml);
	}
	
}

var cleanform =  function(){
	var formid = "#save-modal";
	$(formid+" #id").val('');
	$(formid+" #title").val('');
	$(formid+" #type").select2("val", [0]);
	$(formid+" #status").select2("val", [1]);
	$(formid+" #desc").val('');
	$(formid+" #isRecommend").select2("val", [0]);
	$(formid+" #money").val('0');
	$(formid+" #typechoece_panel").html(goldPackageHtml);
}
var goldPackageHtml = '<span class="input-group-addon">金币数量</span>';
goldPackageHtml+='<div class="form-group">';
goldPackageHtml+='<input type="text" class="form-control" id="gold" name="gold" value="0" placeholder="金币数量"/>';
goldPackageHtml+='<i class="form-group__bar"></i>';
goldPackageHtml+='</div>';
goldPackageHtml+='<span class="input-group-addon">赠送金币</span>';
goldPackageHtml+='<div class="form-group">';
goldPackageHtml+='<input type="text" class="form-control" id="giftGold" name="giftGold" value="0"  placeholder="赠送金币"/>';
goldPackageHtml+='<i class="form-group__bar"></i>';
goldPackageHtml+='</div>';

var vipPackageHtml = '<span class="input-group-addon">VIP时长</span>';
vipPackageHtml+='<div class="form-group">';
vipPackageHtml+='<input type="text" class="form-control" id="daycount" name="daycount" value="0" placeholder="VIP时长"/>';
vipPackageHtml+='<i class="form-group__bar"></i>';
vipPackageHtml+='</div>';
vipPackageHtml+='<span class="input-group-addon">赠送时长</span>';
vipPackageHtml+='<div class="form-group">';
vipPackageHtml+='<input type="text" class="form-control" id="giftDaycount" name="giftDaycount"   value="0" placeholder="赠送时长"/>';
vipPackageHtml+='<i class="form-group__bar"></i>';
vipPackageHtml+='</div>';


var save = function(){
	var params =$("#save-modal #form").serialize();
	$.ajax({
        type: "post",
        url: "/mh/package/savePackage",
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
	getPackageInfo(id);
	$("#save-modal #btn_submit").attr('onclick','save()');
}

var getPackageInfo = function(id){
	$.ajax({
        type: "post",
        url: "/mh/package/getPackage",
        cache : false,  // 禁用缓存
        data: {id:id},    // 传入已封装的参数
        dataType: "json",
        success: function(result) {
        	if(result.code!='0'){
        		return swaltemp("提示", result.msg);
        	}
        	var data = result.data;
        	if(data){
        		var formid = "#save-modal";
        		$(formid+" #id").val(data.id);
        		$(formid+" #title").val(data.title);
        		$(formid+" #type").select2("val", [data.type]);
        		$(formid+" #status").select2("val", [data.status]);
        		$(formid+" #desc").val(data.desc);
        		$(formid+" #isRecommend").select2("val", [data.isRecommend]);
        		$(formid+" #money").val(data.money);
        		
        		if(data.type==0){
        			$(formid+" #typechoece_panel").html(goldPackageHtml);
        			$(formid+" #gold").val(data.gold);
            		$(formid+" #giftGold").val(data.giftGold);
        		}else{
        			$(formid+" #typechoece_panel").html(vipPackageHtml);
        			$(formid+" #daycount").val(data.daycount);
            		$(formid+" #giftDaycount").val(data.giftDaycount);
        		}
        	}
        	$("#save-modal #btn_close").click();
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            return swaltemp("失败", this. result ? result.msg : "未知异常");
        }
    });
}

$("#btn_choose_pay_modal").click(function(){
	var btn = $(this);
	btn.attr("data-toggle","modal");
	btn.attr("data-target","#pay_type_choose_modal");
	var formid = "#pay_type_choose_modal";
	$(formid+" #type").select2("val", [0]);
	getChoosePayType();
	$("#pay_type_choose_modal #btn_submit").attr('onclick','choosePayType()');
});



var getChoosePayType = function(){
	$.ajax({
        type: "post",
        url: "/mh/package/getChoosePayType",
        cache : false,  // 禁用缓存
        dataType: "json",
        success: function(result) {
        	if(result.code!='0'){
        		return swaltemp("提示", result.msg);
        	}
        	var formid = "#pay_type_choose_modal";
        	$(formid+" #type").select2("val", result.data);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            return swaltemp("失败", this. result ? result.msg : "未知异常");
        }
    });
}

var choosePayType = function(){
	var params =$("#pay_type_choose_modal #form").serialize();
	$.ajax({
        type: "post",
        url: "/mh/package/choosePayType",
        cache : false,  // 禁用缓存
        data: params,    // 传入已封装的参数
        dataType: "json",
        success: function(result) {
        	if(result.code!='0'){
        		return swaltemp("提示", result.msg);
        	}
        	$("#pay_type_choose_modal #btn_close").click();
        	swaltemp("提示", '成功');
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            return swaltemp("失败", this. result ? result.msg : "未知异常");
        }
    });
}
//=====================================================================================


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