	$(".register").on("click",function (){
		$(window).attr("location","./register.html");
	})
	var code = document.getElementById('code');
	var codeInp = document.getElementById('codeInput');
	var oName = document.getElementById("dr_name");
	var oNameId = document.getElementById("dr_nameId");
	var oPasswoer = document.getElementById("dr_password");
	var oLog = document.getElementById('login');
	var ert, oNam, oNI, oNIT, oPsw, oPswT, oEmi, oPn;
	oName.onblur = function() {
		var reg = /^[\u4e00-\u9fa5]{2,20}$/;
		if(reg.test(oName.value)) {
			oNam = true;
			return true;
		} else {
			oNam = false;
			if(oName.value) {
				toast.setToast('姓名或密码输入不正确', 'three');
			}
		}
	}
	oNameId.onblur = function() {
		var reg = /^[1-9][0-9]{5}(19[0-9]{2}|200[0-9])(0[1-9]|1[0-2])(0[1-9]|[1-2][0-9]|3[0-1])[0-9]{3}[0-9xX]$/;
		if(reg.test(oNameId.value)) {
			oNI = true;
		} else {
			if(oNameId.value) {
				toast.setToast('身份证号码输入错误', 'three');
			}
			oNI = false;
		}
	}
	oNameId.oncopy = function() {
		return false;
	};
	oNameId.onpaste = function() {
		return false;
	};
	$('#dr_password').on('blur', function(){
		var reg = /^[a-z]|[A-Z]|[0-9]|[-_]{6,}$/;
		console.log(oPasswoer.value)
		if(reg.test($('#dr_password').val())) {
			oPsw = true;
		} else {
			console.log(oPasswoer.value)
			if(oPasswoer.value) {
				toast.setToast('姓名或密码输入不正确', 'three');
			}
			oPsw = false;
		}
	});
	$('#dr_password').on('copy', function() {
		return false;
	});
	$('#dr_password').on('paste', function() {
		return false;
	});
	var UUID = Util.uuid(8, 2);
    if(UUID){
      document.getElementById('code').src = $api + "index/verify_code/" + UUID + '?' + new Date().getTime();
    }
	$(".huan_img").on("click", function() {
	    if(UUID){
         document.getElementById('code').src = $api + "index/verify_code/" + UUID + '?' + new Date().getTime();
        }
	}); 
	$("#login").on("click", function() {
		login();
	});
	function login() {
		if(oNam == true && oNI == true && oPsw == true && codeInp.value) {
			var codeInput = codeInp.value;
			var drNameId = oNameId.value;
			var drName = oName.value;
			if(Util.checkValue([codeInput, drNameId, drName])) {
				toast.setToast('信息内包含特殊字符，请重新输入', 'three');
				$("#dr-login").attr("disabled", false);
				return;
			}
		var drPassword = oPasswoer.value;
		if(Util.checkValuepwd([drPassword])) {
			toast.setToast('密码内包含非法字符，请重新输入', 'three');
			return;
		}
		
		var url = $api + "index/encode/" + UUID + "/" + codeInput + '?' + new Date().getTime();
//			// 这个是登录的接口
		$.ajax({
			url: url,
			type: "get",
			//offline : true,
			success: function(data) {
				console.log(data)
//				data = JSON.parse(data);
				if(data.retcode == 200) {
					// 不可点击
					$("#login").attr("disabled", true); // 不可点击
					$("#login").html("登录中...");
					var secretKeyN = "";
					var secretKeyE = "";
					if(data.retdata.p == undefined || data.retdata.s == undefined) {
						toast.setToast('请求错误，请重新获取验证码', 'five');
						return;
					} else {
						secretKeyN = data.retdata.p;
						secretKeyE = data.retdata.s;
					}
					var item = {
							user_key: UUID, // UUID
							verify_code: Util.encodeHtml(codeInput), // 验证码
							user_id: encryptbyrsa(secretKeyN, secretKeyE, Util.encodeHtml(drNameId)), // 用户的ID
							user_name: encryptbyrsa(secretKeyN, secretKeyE, drName), // 用户名字
							pwd: encryptbyrsa(secretKeyN, secretKeyE, Util.encodeHtml(drPassword)) // 用户的密码
					}
					console.log(item);
					// 封装JSON请求对象
					var setObj = {
						url: $api + "member/login/" + '?' + new Date().getTime(),
						type: "POST",
						data: JSON.stringify(item),
						contentType: 'application/json;charset=utf-8',
						success: function(data) {
							console.log(data);
							if(data.retcode == 200) {
								/*
								 * 如果用户登录成功存储的变量 token user_name attach_url
								 * confirm_flag setN setE
								 */
								if('undefined' != typeof(data.retdata.token)) {
									localStorage.setItem('token', data.retdata.token);
								}
								localStorage.setItem('user_name', oName.value);
								// 初始化的attach_url是用户的头像这个没有值是undefined
								localStorage.setItem('attach_url', data.retdata.attach_url);
								// confirm_flag标识用户的简历是否确认 1表示已经确认 ,0表示没有确认
								localStorage.setItem('confirm_flag', data.retdata.confirm_flag);
								if('undefined' != typeof(data.retdata.p)) {
									localStorage.setItem('setN', data.retdata.p);
								}
								if('undefined' != typeof(data.retdata.s)) {
									localStorage.setItem('setE', data.retdata.s);
								}
								var confirm_flag = localStorage.getItem('confirm_flag');
								$(window).attr("location","./resume.html");

								// 跳转页面之后将login页面的数据清空
								$("#dr_name").val("");
								$("#dr_nameId").val("");
								$("#dr_password").val("");
								$("#codeInput").val("");
								$("#login").attr("disabled", false);
								$("#login").html("登录");
							} else {
								console.log(data);
								toast.setToast(data.retmsg,'five');
								//alert('success222:' + data.retmsg);
//								setTimeout(function() {
//									uap.window.publish('close_toast', '数据加载完成');
//								}, 3000);
								$("#login").attr("disabled", false);
								$("#login").html("登录");
							}
						},
						error: function(data) {
							console.log('验证登录的接口是否成功------>error' + e);
							toast.setToast('网络错误，请重试','five');
							$("#login").attr("disabled", false);
							$("#login").html("登录");
						}
					};
					$.ajax(setObj);
				} else {
					console.log('验证登录的接口是否成功------>success  2');
					console.log(data);
					toast.setToast(data.retmsg,'five');
				}
			},
			error: function(data) {
				console.log('验证验证码的接口是否生效------>error' + e);
			    toast.setToast('网络错误','five');
				$('.loading').hide();
			}
		});

		} else {
			// 用户名
			if(!oNam) {
				toast.setToast('姓名或密码输入不正确', 'three');
			}
			// 身份证
			else if(!oNI) {
				toast.setToast('身份证号码输入错误', 'three');
			}
			// 密码
			else if(!oPsw) {
				toast.setToast('姓名或密码输入不正确', 'three');
			}
			// 验证码不能为空
			else if(codeInp.value == "") {
				toast.setToast('验证码不能为空', 'three');
			}
		}
	}
