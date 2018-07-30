(function($) {
//		var token = localStorage.getItem('token');
 var token="807a43d67fb34f6b97e6d71da3c85cd7";
		var imgurl = localStorage.getItem('attach_url');
		var user_name = localStorage.getItem('user_name');
		var resume_base,resume_progress;
		if("undefined" == user_name || user_name == null || user_name == "null") {
			user_name = '名字获取失败';
		}else{
			$("#user_name").html(user_name);
		}
		if("undefined" == imgurl || imgurl == null || imgurl == "null") {
			imgurl = 'assets/images/photo.png';
			$("#head_img").attr("src", '../img/photo2.png');
		}else{
			$("#head_img").attr("src",imgurl);
		}
	if (token){
		var dataList = [];
		var url = $api + 'resume/center/' + token + '?dict_codes=308011,308001,308002,308012' + new Date().getTime();
		var getresInfo = {
			url: url,
			type: 'GET',
			dataType: "json",
			success: function(data) {
				if(data.retcode == "200") {
					var json = data.retdata;
					var resume_order = json.resume_order;
					localStorage.setItem('resume_order', resume_order);
					resume_progress = json.resume_base.resume_progress;
					resume_base = json.resume_base;
					var s = resume_progress.substring(0, 4);
					var award_progress = json.award_progress;
					var project_progress = json.project_progress;
					var s_all = [];
					var rp_A = resume_progress.split('');
					var s1 = (resume_progress.substring(0, 1) + resume_progress.substring(0, 3)).split('');
					var s2 = award_progress.split('');
					var s3 = (resume_progress.substring(4)).split('');
//					var s4 = "base,lx,edu,lau," + resume_order;
					var s4 = "base,lx,edu,lau,fam";
					var p1 = s4.split(',');
					var rA = resume_order.split(',');
					var PA = project_progress.split('');
		 
					var cert = indexOfArr(p1, "cert");
					var prize = indexOfArr(p1, "prize");
					var computer = indexOfArr(p1, "computer");
					var file = indexOfArr(p1, "file");
					var fam = indexOfArr(p1, "fam");
					var sociPrac = indexOfArr(p1, "sociPrac");
					
					var achiev = indexOfArr(p1, "achiev");
					var achiev1 = indexOfArr(p1, "achiev1");
					var explain = indexOfArr(p1, "explain");
					if(file > cert || file > prize || file > computer) {
						file = file - 1;
					} else if(file > fam) {
						file = file - 1;
					} else if(file > sociPrac) {
						file = file - 1;
					} else if(file > achiev || file > achiev1) {
						file = file - 1;
					} else if(file > explain) {
						file = file - 1;
					}

					if(fam > cert || fam > prize || fam > computer) {
						fam = fam - 1;
					} else if(fam > file) {
						fam = fam - 1;
					} else if(fam > sociPrac) {
						fam = fam - 1;
					} else if(fam > achiev || fam > achiev1) {
						fam = fam - 1;
					} else if(fam > explain) {
						fam = fam - 1;
					}

					if(sociPrac > cert || sociPrac > prize || sociPrac > computer) {
						sociPrac = sociPrac - 1;
					} else if(sociPrac > file) {
						sociPrac = sociPrac - 1;
					} else if(sociPrac > fam) {
						sociPrac = sociPrac - 1;
					} else if(sociPrac > achiev || sociPrac > achiev1) {
						sociPrac = sociPrac - 1;
					} else if(sociPrac > explain) {
						sociPrac = fam - 1;
					}

					file = file - 2; //索引和基本信息各-1,从0开始计算在9个状态位中的实际位置
					fam = fam - 2;
					sociPrac = sociPrac - 2;
					//						  alert("rp_A:"+rp_A);
					//						  alert("file:"+file);

					var len = p1.length;
					// alert("len:"+len);
					var p_all = [];
					for(var j = 0; j < len; j++) {
						var p = p1[j];

						//							    if(j<=3){
						//							       s_all.push(s1[j]);
						//							    }else{
						if(p == "base") {
							s_all[j] = s1[0];
						} else if(p == "lx") {
							s_all[j] = s1[1];
						} else if(p == "edu") {
							s_all[j] = s1[2];
						} else if(p == "lau") {
							s_all[j] = s1[3];

						} 
//						else if(p == "cert") {
//							s_all[j] = s2[1];
//
//						} else if(p == "prize") {
//							s_all[j] = s2[2];
//
//						} else if(p == "file") {
//							s_all[j] = rp_A[7];
//
//						} else if(p == "computer") {
//							s_all[j] = s2[0];
//
//						} 
						else if(p == "fam") {
							s_all[j] = rp_A[3];

						} 
//						else if(p == "sociPrac") {
//							s_all[j] = rp_A[4];
//
//						} else if(p == "achiev") {
//							s_all[j] = PA[0];
//
//						} else if(p == "achiev1") {
//							s_all[j] = PA[1];
//
//						} else if(p == "explain") {
//							s_all[j] = rp_A[8];
//						}
						p_all.push(p1[j]);

					}
					var stext = "完整";
					// var sa=document.querySelectorAll(".list_state");
					for(var i = 0; i < s_all.length; i++) {

						if(parseInt(s_all[i]) == 0) {

							stext = "待完善";
						} else {
							stext = "完整";
						}
						var name = p_all[i];
						// console.log("name "+name);
						var label = "";
						// base,lx,edu,lau,cert,prize,file,computer,fam,sociPrac,achiev,achiev1,explain
						if(name == "base") {
							label = "个人信息";

						} else if(name == "lx") {
							label = "联系方式";

						} else if(name == "edu") {
							label = "学习经历";

						} else if(name == "lau") {
							label = "语言能力";

						} 
//						else if(name == "cert") {
//							label = "资格证书";

//						} else if(name == "prize") {
//							label = "获奖情况";
//
//						} else if(name == "file") {
//							label = "上传电子附件";
//
//						} else if(name == "computer") {
//							label = "计算机能力";
//
//						} 
						else if(name == "fam") {
							label = "家庭成员";

						}
//						else if(name == "sociPrac") {
//							label = "主要社会实践经历/工作经历";
//
//						} else if(name == "achiev") {
//							label = "学术成果-论文";
//
//						} else if(name == "achiev1") {
//							label = "学术成果-科研";
//
//						} else if(name == "explain") {
//							label = "其他";
//
//						}
						var required = "";
						if(i > 3) {
							required = "";
						}
						var list = {
							"id": i,
							"sort": label,
							"state": stext,
							"required": required,
						};
						dataList.push(list);
						var html = '<ul class="sec_same">'
									+'<li class="sec_left">'+dataList[i].sort+'</li>'
									+'<li class="sec_right">'
										+'<span class="sec_same_bi">'+dataList[i].required+'</span>'
										+'<span class="sec_same_dai">'+dataList[i].state+'</span>'
										+'<span class="lis-sw ub-img arrow fa fa-angle-right angle-right"></span>'
									+'</li>'
								+'</ul>'
						$("#login_section").append(html)

					}
				}else{
					toast.setToast(data.retmsg, 'three');
					setTimeout(function (){
						$(window).attr("location","./login.html");
					},5000)
				}

			},
			error: function(data) {
				toast.setToast(data.retmsg, 'five');
			}

		};

		$.ajax(getresInfo);

		function indexOfArr(arr, str) {
			// 如果可以的话，调用原生方法
			if(arr && arr.indexOf) {
				return arr.indexOf(str);
			}
	
			var len = arr.length;
			for(var i = 0; i < len; i++) {
				// 定位该元素位置
				if(arr[i] == str) {
					return i;
				}
			}
			// 数组中不存在该元素
			return -1;
		}
	}else {
		toast.setToast('登录失效请重新登录', 'three');
		setTimeout(function (){
			$(window).attr("location","./login.html");
		},5000)
	}
	
	function ckBaseReq() {
		var s = "";
//		resume_base
		console.log(resume_base)
		if(resume_base) {
			console.log(resume_base)
			if(!resume_base.region || !resume_base.nation || !resume_base.political_status || !resume_base.student_type || !resume_base.district_code || !resume_base.expect_grad_time || !resume_base.height || !resume_base.weight ||
				!resume_base.marital_status || !resume_base.is_health) {
				toast.setToast('请先填写个人信息！', 'three');
				return false;
			}
	
		}
		return true;
	}
	
	function ckBase2() {
		var s = "";
		if(resume_progress) {
			s = resume_progress.substring(0, 1);
			s2 = resume_progress.substring(1, 2);
			s3 = resume_progress.substring(2, 3);
			if(s != "1") {
				toast.setToast('请先填写个人信息！', 'three');
				return false;
			} else if(!resume_base.region || !resume_base.nation || !resume_base.political_status || !resume_base.student_type || !resume_base.district_code || !resume_base.expect_grad_time || !resume_base.height || !resume_base.weight ||
				!resume_base.marital_status || !resume_base.is_health) {
				toast.setToast('请先填写个人信息！', 'three');
				return false;
			}
			return true;
	
		}
	}
	function ckEdu() {
		var s = "";
		if(resume_progress) {
			s2 = resume_progress.substring(1, 2);
			if(s2 != "1") {
				toast.setToast('请先填写教育经历信息！', 'three');
				return false;
			}
		}
		return true;
	}
	$(document).on("click", "#login_section ul", function() {
		//定义变量
		var index = $("#login_section ul").index(this);
		var list_liname = this.getElementsByClassName("sec_left")[0].innerText;
		list_liname = list_liname.split("(")[0];
		if(list_liname.indexOf("个人信息") != -1) {
			$(window).attr("location","./personalInfo.html");
		} else if(list_liname.indexOf("联系方式") != -1) {
			if(ckBaseReq()) {
				$(window).attr("location","./contactInfo.html");
			}
	
		} else if(list_liname.indexOf("学习经历") != -1) {
			if(ckBase2()) {
				$(window).attr("location","./education.html");
			}
	
		} else if(list_liname.indexOf("语言能力") != -1) {
			if(ckBase2()  && ckEdu() ) {
				$(window).attr("location","./language.html");
			}
	
		}
		else if(list_liname.indexOf("家庭成员") != -1) {
	
			if(ckBase()) {
				alert('你点击了   家庭成员');
			}
	
		} 
	});
	
	$("#exit_login").on("click", function() {
		$(".tan").css("display","flex");
		$("#yes").on("click",function (){
			var setObj = {
				url: $api + "member/logout/" + localStorage.getItem('token') + '?' + new Date().getTime(),
				type: "POST",
				contentType: 'application/json;charset=utf-8',
				success: function(data) {
					console.log(data);
					if(data.retcode == 200) {
						localStorage.removeItem('token');
						if(localStorage.getItem("attach_url") != 'undefined' && localStorage.getItem("attach_url") != null) {
							localStorage.removeItem('attach_url');
						};
						if(localStorage.getItem("confirm_flag") != 'undefined' && localStorage.getItem("confirm_flag") != null) {
							localStorage.removeItem('confirm_flag');
						};
						localStorage.removeItem('resume_progress');
						localStorage.removeItem('resume_order');
						localStorage.removeItem('isfromhome');
						localStorage.removeItem('confirm_flag');
						localStorage.removeItem('attach_url');
						localStorage.removeItem('setN');
						localStorage.removeItem('setE');
						localStorage.removeItem('popWinHome');
						localStorage.removeItem('popWin');
						localStorage.removeItem('user_name');
						localStorage.removeItem('goResume');
						localStorage.removeItem("attach_url");
						localStorage.removeItem("fromLogin");
						$(window).attr("location","./login.html");
					} else {
						console.log('验证退出登录的接口是否成功------>success   2');
						console.log(data)
					}
				},
				error: function(data) {
					console.log('验证退出登录的接口是否成功------>error' + data);
					toast.setToast('网络错误，请重试','five');
				}
			};
			$.ajax(setObj);
		})
		$("#fou").on("click",function (){
			$(".tan").css("display","none");
		})
		
	});
})($);