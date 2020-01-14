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
                url: "/mh/books/section/searchSection",
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
                data:"section",
                orderable:false,
            },
        	{
                class:"text-center",
                data:"title",
                orderable:false,
            },
        	{
                class:"text-center",
                data:"isFree",
                orderable:false,
                render:function(data, type, row, meta){
                	var result = (data && data==1)?'免费':'付费';
                	return result;
                }
            },
            {
                class:"text-center",
                data:"needToPay",
                orderable:false,
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
                	var status =(row.status && row.status==1)?'删除':'启用';
                	var s = (row.status && row.status==1)?0:1;
                	return '<button type="button" class="btn btn-outline-danger" onclick="edit(this,\''+row.id+'\')">修改</button>/<button type="button" class="btn btn-outline-danger" onclick="showSetpayInfo(this,\''+row.id+'\',\''+row.isFree+'\',\''+row.needToPay+'\')">设置收费</button>/<button type="button" class="btn btn-outline-danger" onclick="changeStatus('+row.id+','+s+')">'+status+'</button>';
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
	btn.attr("data-target","#save-section-modal");
	cleanSectionSaveform();
	$("#save-section-modal #btn_submit").attr('onclick','saveSection()');
	buildUploadImgIndex  = 1;
});

var showSetpayInfo = function(elment,id,isFree,needToPay){
	var formid = "#setSectionPayInfo-modal";
	var btn = $(elment);
	btn.attr("data-toggle","modal");
	btn.attr("data-target",formid);
	
	$(formid+" #id").val(id);
	$(formid+" #isFree").select2("val", [isFree]);
	$(formid+" #money").val(needToPay);
}

var cleanSectionSaveform =  function(){
	var formid = "#save-section-modal";
	$(formid+" #id").val('');
	$(formid+" #imgList_panel").html('');
	$(formid+" #title").val('');
	$(formid+" #section").val('1');
	$(formid+" #status").select2("val", [1]);
	$(formid+" #isFree").select2("val", [1]);
	$(formid+" #needToPay").val('');
	$(formid+" #section").val('');
}

var buildUploadImgIndex  = 1;
var buildUploadImgHtml = function(prid){
	var index = buildUploadImgIndex++;
	var panelid = "uplaod_panel_"+index;
	var imgviewelmentid = "img_view_"+index;
	var olduriid = "old_img_"+index;
	var fileid = "img_file_"+index;
	var html = '<div class="input-group" id="'+panelid+'">';
	html+='<span class="input-group-addon"><input type="button" onclick="removeImghtml(\'#'+prid+' #'+panelid+'\')" value="删除"/></span>';
	html+='<div class="form-group" >';
	html+='<img  id="'+imgviewelmentid+'" alt="img" onclick="chooeseImg(\'#'+prid+' #'+fileid+'\')" src="http://pic13.nipic.com/20110409/7119492_114440620000_2.jpg" style="width: 100%;"/>';
	html+='<input type="file" id="'+fileid+'" name="'+fileid+'" onchange="viewImg(this,\'#'+prid+' #'+imgviewelmentid+'\')" style="display: none;"/>';
	html+=' <input type="hidden" id="'+olduriid+'" name="'+olduriid+'" value=""/>';
	html+='<i class="form-group__bar"></i>';
	html+='</div>';
	html+='</div>';
	$('#'+prid+' #imgList_panel').append(html);
}

var buildOldImgHtml = function(index,url,sourceUri,prid){
	var panelid = "uplaod_panel_"+index;
	var imgviewelmentid = "img_view_"+index;
	var fileid = "img_file_"+index;
	var olduriid = "old_img_"+index;
	var html = '<div class="input-group" id="'+panelid+'">';
	html+='<span class="input-group-addon"><input type="button" onclick="removeImghtml(\'#'+prid+' #'+panelid+'\')" value="删除"/></span>';
	html+='<div class="form-group" >';
	html+='<img  id="'+imgviewelmentid+'" alt="img" onclick="chooeseImg(\'#'+prid+' #'+fileid+'\')" src="'+url+'" style="width: 100%;"/>';
	html+='<input type="file" id="'+fileid+'" name="'+fileid+'" onchange="viewImg(this,\'#'+prid+' #'+imgviewelmentid+'\')" style="display: none;"/>';
	html+=' <input type="hidden" id="'+olduriid+'" name="'+olduriid+'" value="'+sourceUri+'"/>';
	html+='<i class="form-group__bar"></i>';
	html+='</div>';
	html+='</div>';
	$('#'+prid+' #imgList_panel').append(html);
}

var removeImghtml =  function(targetid){
	$(targetid).remove();
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



var saveSection = function(){
	var params = new FormData($("#save-section-modal #save_form")[0]);
	
	params.append("content",$(".note-editable").html());
	 $.ajax({
        type: "post",
        url: "/mh/books/section/saveSection",
        cache : false,  // 禁用缓存
        data: params,    // 传入已封装的参数
        processData: false,  // 不处理数据
  	    contentType: false,   // 不设置内容类型
        success: function(result) {
        	if(result.code!='0'){
        		return swaltemp("提示", result.msg);
        	}
        	$("#save-section-modal #btn_close").click();
        	if(menuTable!=null)menuTable.draw();
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            return swaltemp("操作失败", this. result ? result.msg : "未知异常");
        }
    });
}

var changeStatus = function(id,status){
	$.ajax({
        type: "post",
        url: "/mh/books/section/changeStatus",
        cache : false,  // 禁用缓存
        data: {id:id,status:status},    // 传入已封装的参数
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

var setSectionPayInfo = function(){
	var params =$("#setSectionPayInfo-modal #form").serialize();
	$.ajax({
        type: "post",
        url: "/mh/books/section/setSectionPayInfo",
        cache : false,  // 禁用缓存
        data: params,    // 传入已封装的参数
        dataType: "json",
        success: function(result) {
        	if(result.code!='0'){
        		return swaltemp("提示", result.msg);
        	}
        	if(menuTable!=null)menuTable.draw();
        	$("#setSectionPayInfo-modal #btn_close").click();
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            return swaltemp("失败", this. result ? result.msg : "未知异常");
        }
    });
}

var edit = function(elment,id){
	var btn = $(elment);
	btn.attr("data-toggle","modal");
	btn.attr("data-target","#save-section-modal");
	cleanSectionSaveform();
	$("#save-section-modal #btn_submit").attr('onclick','saveSection()');
	
	buildSectionInfo(id);
}

var buildSectionInfo =  function(id){
	$.ajax({
        type: "post",
        url: "/mh/books/section/getSectionInfo",
        cache : false,  // 禁用缓存
        data: {id:id},    // 传入已封装的参数
        dataType: "json",
        success: function(result) {
        	if(result.code!='0'){
        		return swaltemp("提示", result.msg);
        	}
        	var data = result.data;
        	if(data){
        		var formid = "#save-section-modal";
    			$(formid+" #id").val(id);
    			$(formid+" #title").val(data.title);
    			$(formid+" #section").val(data.section);
    			$(formid+" #status").select2("val", [data.status]);
    			$(formid+" #isFree").select2("val", [data.isFree]);
    			$(formid+" #needToPay").val(data.needToPay);
    			
    			var content = data.content;
    			$(".note-editable").html(content);
//    			var list = $.parseJSON( data.content );
//    			for(var i=0;i<list.length;i++){
//    				buildOldImgHtml(i,result.dfsfileaccessprefix+list[i],list[i],'save-section-modal');
//    			}
//    			buildUploadImgIndex  = list.length;
        	}
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