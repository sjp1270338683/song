//标题提醒文字弹层
function dialog(title , msg , callback){
	var dialog1 , dialog2;
	dialog1 = '\
		<div class="weui_dialog_confirm" id="dialog1" style="display: none;">\
			<div class="weui_mask"></div>\
			<div class="weui_dialog">\
				<div class="weui_dialog_hd"><strong class="weui_dialog_title">'+ title +'</strong></div>\
				<div class="weui_dialog_bd">' + msg + '</div>\
				<div class="weui_dialog_ft">\
					<a href="javascript:;" class="weui_btn_dialog default">取消</a>\
					<a href="javascript:;" class="weui_btn_dialog primary">确定</a>\
				</div>\
			</div>\
		</div>\
	';
	dialog2 = '\
		<div class="weui_dialog_alert" id="dialog2" style="display: none;">\
			<div class="weui_mask"></div>\
			<div class="weui_dialog">\
				<div class="weui_dialog_hd"><strong class="weui_dialog_title">'+ title +'</strong></div>\
				<div class="weui_dialog_bd">' + msg + '</div>\
				<div class="weui_dialog_ft">\
					<a href="javascript:;" class="weui_btn_dialog primary">确定</a>\
				</div>\
			</div>\
		</div>\
	';
	if(arguments[2]){
		$('body').append(dialog1);
		$('#dialog1').fadeIn('fast');
		$('#dialog1 .primary').on('click',function(){
			callback();
		});
		$('#dialog1 .default').on('click',function(){
			$('#dialog1').fadeOut('fast',function(){
				$('#dialog1').remove();
				  $(".CoatingLayer").hide();
			});
		});
	}else{
		if(!$('#dialog2').length){
			$('body').append(dialog2);
		}else{
			$('#dialog2 .weui_dialog_title').html(title);
			$('#dialog2 .weui_dialog_bd').html(msg);
		}
		$('#dialog2').fadeIn('fast');
		$('#dialog2 .primary').on('click',function(){
			$('#dialog2').fadeOut('fast');
		});
	}
}
//完成提示弹层
function toast(){
	var msg;
	arguments[0] ? msg = arguments[0] : msg = '已完成' ;
	var toast;
	toast = '\
		<div id="toast" style="display: none;">\
			<div class="weui_mask_transparent"></div>\
			<div class="weui_toast">\
				<i class="weui_icon_toast"></i>\
				<p class="weui_toast_content">' + msg + '</p>\
			</div>\
		</div>\
	';
	if(!$('#toast').length){
		$('body').append(toast);
	}else{
		$('#toast .weui_toast_content').html(msg);
	}
	$('#toast').fadeIn('fast',function(){
		setTimeout(function(){$('#toast').fadeOut('fast');},800);	
	});
}
//加载提示弹层
function loadingToast(){
	var msg;
	arguments[0] ? msg = arguments[0] : msg = '数据加载中' ;
	var loadingToast;
	loadingToast = '\
		<div id="loadingToast" class="weui_loading_toast" style="display:none;">\
			<div class="weui_mask_transparent"></div>\
			<div class="weui_toast">\
				<div class="weui_loading">\
					<div class="weui_loading_leaf weui_loading_leaf_0"></div>\
					<div class="weui_loading_leaf weui_loading_leaf_1"></div>\
					<div class="weui_loading_leaf weui_loading_leaf_2"></div>\
					<div class="weui_loading_leaf weui_loading_leaf_3"></div>\
					<div class="weui_loading_leaf weui_loading_leaf_4"></div>\
					<div class="weui_loading_leaf weui_loading_leaf_5"></div>\
					<div class="weui_loading_leaf weui_loading_leaf_6"></div>\
					<div class="weui_loading_leaf weui_loading_leaf_7"></div>\
					<div class="weui_loading_leaf weui_loading_leaf_8"></div>\
					<div class="weui_loading_leaf weui_loading_leaf_9"></div>\
					<div class="weui_loading_leaf weui_loading_leaf_10"></div>\
					<div class="weui_loading_leaf weui_loading_leaf_11"></div>\
				</div>\
				<p class="weui_toast_content">' + msg + '</p>\
			</div>\
		</div>\
	';
	if(!$('#loadingToast').length){
		$('body').append(loadingToast);
	}else{
		$('#loadingToast .weui_toast_content').html(msg);
	}
	$('#loadingToast').fadeIn('fast');
}
//菜单项弹层
function actionSheetMenu(){
	if(!arguments.length){
		return;
	}
	var menuHtml = '';
	for(i=0;i<arguments.length;i++){
		if(typeof(arguments[i]) != 'object' || !arguments[i].id || !arguments[i].text){
			continue;
		}
		menuHtml += '<div class="weui_actionsheet_cell" id="' + arguments[i].id + '">' + arguments[i].text + '</div>';
	}
	if(!menuHtml){
		return;
	}
	var actionSheetMenu;
	actionSheetMenu = '\
		<div id="actionSheet_wrap">\
			<div class="weui_mask_transition" id="mask"></div>\
			<div class="weui_actionsheet" id="weui_actionsheet">\
				<div class="weui_actionsheet_menu">\
				</div>\
				<div class="weui_actionsheet_action">\
					<div class="weui_actionsheet_cell" id="actionsheet_cancel">取消</div>\
				</div>\
			</div>\
		</div>\
	';
	if(!$('#actionSheet_wrap').length){
		$('body').append(actionSheetMenu);
	}
	$('.weui_actionsheet_menu').html(menuHtml);
	$('#mask').show().addClass('weui_fade_toggle');
	$('#weui_actionsheet').addClass('weui_actionsheet_toggle');
	$('#mask').unbind('transitionend').unbind('webkitTransitionEnd');
	$('#mask , #actionsheet_cancel').on('click',function(){
		$('#mask').removeClass('weui_fade_toggle');
		$('#weui_actionsheet').removeClass('weui_actionsheet_toggle');
		$('#mask').on('transitionend webkitTransitionEnd',function(e){
			$('#mask').hide();
		});
	});
}
//吐司提示
function textToast(text){
	if(!$('#textToast').length){
		$('body').append('<div id="textToast" class="textToast"></div>')
	}
	$('#textToast').text(text).addClass('textToastShow').on('animationend webkitAnimationEnd',function(e){
		$(this).removeClass('textToastShow');
	});
}