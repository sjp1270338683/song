(function($) {
	$("#nav-left").on("click",function (){
		$(window).attr("location","./resume.html");
	})
	 var token="807a43d67fb34f6b97e6d71da3c85cd7";
//	var token = localStorage.getItem('token');
	var user_name = localStorage.getItem('user_name');
	var attach_url = localStorage.getItem('attach_url');
	var confirm_flag = localStorage.getItem('confirm_flag');
	var project_progress;
	//定义Vue组件
	var vump = new Vue({
		el: "#rbaseinfo",
		beforeCreate: function() {
			getBaseData();
		},
		data: {
			member_id: '',
			name: '',
			gender: '',
			birthday: '',
			id_card: '',
			student_type: '',
			region: '',
			district_code: '',
			expect_grad_time: '',
			height: '',
			weight: '',
			nation: '',
			political_status: '',
			marital_status: '',
			is_health: '',
			dict_nation: [],
			dict_maritalStatus: [],
			dict_political_status: [],
			dict_district_code: []

		},
		methods: {
			showData: function() {
				getBaseData();
			},
			getSexDic: function() {
				//选择性别
				var sexDic = [{
					'id': '1',
					'value': '男'
				}, {
					'id': '2',
					'value': '女'
				}];
				getDicData("showSex", "gender", sexDic, this);
			},
			getshow_is_health: function() {
				//是否健康
				var sfDic = [{
					'id': 'X',
					'value': '是'
				}, {
					'id': '0',
					'value': '否'
				}];
				getDicData("show_is_health", "is_health", sfDic, this);

			},

			getshowStuType: function() {
				//毕业生类型
				var stuTypeDic = [{
					'id': '1',
					'value': '国内毕业生'
				}, {
					'id': '2',
					'value': '国（境）外留学生'
				}];
				//初始化毕业生类型
				getDicData("showStuType", "student_type", stuTypeDic, this);
			},

			getGradTime: function() {
				//初始化毕业时间
				getDateforPicker("selectGradTime", "show_expect_grad_time", "expect_grad_time", this);

			},

			getbirthday: function() {
				//     //初始化获取出生日期
				getDateforPicker("selectDate", "show_birthday", "birthday", this);
			},
			getDistrict_code: function() {

				getContactCityData("select_contact", "show_contact", "contact_province_code", "contact_city_code", "district_code", this);

			},
			getNation: function() {

				var dict_nation = this.dict_nation;
				if(dict_nation) {
					//动态加载名族字典
					var dic = JSON.stringify(dict_nation).replace(/k/g, 'id').replace(/v/g, 'value');
					getDicData("show_Nation", "nation", JSON.parse(dic), this);

				}
			},
			getMaritalStatus: function() {

				var dict_maritalStatus = this.dict_maritalStatus;
				if(dict_maritalStatus) {
					var dic = JSON.stringify(dict_maritalStatus).replace(/k/g, 'id').replace(/v/g, 'value');
					// 动态加载婚姻状况 字典  
					getDicData("show_marital_status", "marital_status", JSON.parse(dic), this);

				}

			},
			getPoliticalStatus: function() {
				var dict_political_status = this.dict_political_status;
				if(dict_political_status) {
					var dic = JSON.stringify(dict_political_status).replace(/k/g, 'id').replace(/v/g, 'value');
					//动态加载名族字典
					getDicData("show_political_status", "political_status", JSON.parse(dic), this);
				}

			}

		}
	});

	//加载数据
	function getBaseData() {
		var url = $api + 'resume/center/' + token + '?dict_codes=308011,308001,308002,308012,308003&' + new Date().getTime();
		console.log("url66666666666:" + url);
		var getresInfo = {
			url: url,
			type: 'GET',
			dataType: "json",
			success: function(data) {
				// console.log('这个是用于用户登录后默认简历中心信息查询接口------>success'+data);
				// data=JSON.parse(data);
				if(data.retcode == 200) {
					console.log(data)
					project_progress = data.retdata.project_progress
					var json = data.retdata;
					//console.log("getBaseDatagetBaseDatagetBaseDatagetBaseData111:" + JSON.stringify(json));
					var resume_base = json.resume_base;
					var dic_data = json.dict_data;
					// alert("dic_data2222222222:"+JSON.stringify(dic_data));
					if(resume_base) {
						var gender = resume_base.gender;
						var studentType = resume_base.student_type;
						var nation = resume_base.nation;
						var marital_status = resume_base.marital_status;
						var political_status = resume_base.political_status;
						var marital_status = resume_base.marital_status;
						var district_code = resume_base.district_code;
						var expect_grad_time = resume_base.expect_grad_time;
						if("undefined" == district_code || district_code == null || district_code == "null") {
							district_code = "";
						}

						if("undefined" == expect_grad_time || expect_grad_time == null || expect_grad_time == "null") {
							expect_grad_time = "";
						}

						//基本信息
						vump.member_id = resume_base.member_id;
						vump.name = resume_base.name;
						vump.gender = resume_base.gender;
						vump.birthday = resume_base.birthday;
						vump.id_card = resume_base.id_card;
						if(resume_base.region) {
							vump.region = resume_base.region;
						}
						if(resume_base.student_type) {
							vump.student_type = resume_base.student_type;
						}
						if(resume_base.district_code) {
							vump.district_code = district_code;
						}
						if(expect_grad_time != "") {
							vump.expect_grad_time = expect_grad_time;
						}
						if(resume_base.height) {
							vump.height = resume_base.height;
						}
						if(resume_base.weight) {
							vump.weight = resume_base.weight;
						}

						vump.nation = nation;
						vump.political_status = political_status;
						vump.marital_status = marital_status;
						vump.is_health = resume_base.is_health;

						var studentType_value = "";
						if(studentType) {
							if(studentType == "1") {
								studentType_value = "国内毕业生";
							} else if(studentType == "2") {
								studentType_value = "国（境）外留学生";
							}

						}

						var gender_value = "";

						if(gender == 1) {
							gender_value = "男";
						} else if(gender == 2) {
							gender_value = "女";
						}
						//是否健康
						var is_health = resume_base.is_health;
						var isHealth_value = "";
						if(is_health == "X") {
							isHealth_value = "是";
						} else {
							isHealth_value = "否";
						}
						document.getElementById("showSex").innerText = gender_value;
						document.getElementById("show_birthday").innerText = resume_base.birthday;
						if(studentType_value) {
							document.getElementById("showStuType").innerText = studentType_value;
						}
						document.getElementById("show_is_health").innerText = isHealth_value;
						if(expect_grad_time) {
							document.getElementById("show_expect_grad_time").innerText = expect_grad_time;
						}

					}

					//alert(dic_data);

					//  alert("dict_sex:"+JSON.stringify(dict_sex));
					// alert("1111:"+JSON.stringify(dict_st));
					//处理字典数据

					if(dic_data) {
						//动态加载民族字典
						var dict_nation = dic_data["308001"];
						var nation_value = "";
						if(dict_nation) {
							//给vue绑定元素赋值
							vump.dict_nation = dict_nation;
							//遍历字典，显示中文
							for(var s in dict_nation) {
								if(vump.nation) {
									if(dict_nation[s].k == vump.nation) {
										nation_value = dict_nation[s].v;
										break;
									}
								}
							}
							if(nation_value) {
								document.getElementById("show_Nation").innerText = nation_value;
							}
						}

						//  动态加载婚姻状况 字典  
						var dict_maritalStatus = dic_data["308002"];

						var maritalStatus_value = "";
						if(dict_maritalStatus) {
							vump.dict_maritalStatus = dict_maritalStatus;
							for(var s in dict_maritalStatus) {
								if(vump.marital_status) {
									if(dict_maritalStatus[s].k == vump.marital_status) {
										maritalStatus_value = dict_maritalStatus[s].v;
										break;
									}
								}

							}

							if(maritalStatus_value) {
								document.getElementById("show_marital_status").innerText = maritalStatus_value;
							}
						}
						//  动态加政治面貌   
						var dict_political_status = dic_data["308003"];
						var political_status_value = "";
						//遍历字典，显示中文
						if(dict_political_status) {

							vump.dict_political_status = dict_political_status;
							for(var s in dict_political_status) {
								if(vump.political_status) {
									if(dict_political_status[s].k == vump.political_status) {
										political_status_value = dict_political_status[s].v;
										break;
									}
								}
							}
							if(political_status_value) {
								document.getElementById("show_political_status").innerText = political_status_value;
							}

						}
						// alert("dict_political_statustatus66666666666:"+JSON.stringify(dict_political_status));

					}

					//var dict_district_code = dic_data["308008"];            
					var district_code_value = "";
					//if(dict_district_code) {
					// debugger;
					//vump.dict_district_code = dict_district_code;
					var d1 = vump.district_code;
					//console.log("d111111111111:" + d1);
					if(d1 && "undefined" != district_code) {
						var dcode = parseInt(d1);

						//加载出生地中文字典
						if(dcode) {
							var basecode = d1.substring(0, 3);
							var basecode2 = d1.substring(0, 4);
							console.log("basecodebasecode:" + basecode);
							var pb = parseInt(basecode + "000");
							var cb = parseInt(basecode2 + "00");
							//	console.log("pbpbpbpbpbpbpbpbpb:" + pb);
							// console.log("cbcbcbcbcbcbcbcbcbcbcb:" + cb);
							//	console.log("d111111111111:" + d1);
							var qc = CountyData(dcode);
							var cCode = CityData(cb);
							var pcode = ProvinceData(pb);
							//console.log("dcode:" + dcode);
							var selectContactDom = $('#select_contact');
							var showContactDom = $('#show_contact');
							var contactProvinceCodeDom = $('#contact_province_code');
							var contactCityCodeDom = $('#contact_city_code');
							var contactDistrictDom = $('#contact_district__code');
							district_code_value = pcode + ' ' + cCode + ' ' + qc;
							contactProvinceCodeDom.val(dcode - 1);
							contactProvinceCodeDom.attr('data-province-name', pcode);
							contactCityCodeDom.val(cb);
							contactDistrictDom.val(dcode);
							contactCityCodeDom.attr('data-city-name', cCode);
							showContactDom.attr('data-province-code', pb);
							showContactDom.attr('data-city-code', cb);
							showContactDom.attr('data-district-code', dcode);
							showContactDom.html(district_code_value);

							//console.log("district_code_valuedistrict_code_value:" + district_code_value);
							if(district_code_value) {
								document.getElementById("show_contact").innerText = district_code_value;
							}

						}

					}

					//  $("#showSex").text(gender_value);

			  }else if(data.retcode=='ERRCODE_00017'){
                        toast.setToast(data.retmsg, 'two');
                        Util.newLocation("two","personalInfo");
				}else {
					toast.setToast(data.retmsg, 'five');
					Util.newLocation("two","personalInfo");
				}

			},
			error: function(data) {
				toast.setToast(data.retmsg, 'five');
			}

		};

		$.ajax(getresInfo);

	}

	//绑定保存事件
	var savedata = new Vue({
		el: '#save',
		methods: {
			forSave: function() {
				save();
			}
		}
	});
	//保存方法 
	//保存方法 
	function save() {
		if(checkform()) {
             
			var name = vump.name;
			var gender = vump.gender;
			var birthday = vump.birthday;
			var id_card = vump.id_card;
			var student_type = vump.student_type;
			var region = vump.region;
			var district_code = vump.district_code;
			var expect_grad_time = vump.expect_grad_time;
			var height = vump.height;
			var weight = vump.weight;
			var nation = vump.nation;
			var political_status = vump.political_status;
			var marital_status = vump.marital_status;
			var is_health = vump.is_health;
			if(is_health == null || "" == is_health) {
				is_health = "X";
			}
			var member_id = vump.member_id;
			//特殊的参数的处理
			if(Util.checkValue([name, gender, birthday, id_card, region, nation, student_type, district_code, expect_grad_time, height, weight, political_status, marital_status])) {
				toast.setToast('信息内包含特殊字符，请重新输入', 'three');
				$("#save").attr("disabled", false);
				return;
			}

			$("#save").attr("disabled", true);
            $("#save").attr("disabled",false);
            $("#save").css("color","#cccccc");

			var dataPam = JSON.stringify({
				//user_key:UUID,
				member_id: member_id,
				name: name,
				birthday: birthday,
				id_card: id_card,
				gender: gender,
				student_type: student_type,
				region: region,
				district_code: district_code,
				expect_grad_time: expect_grad_time,
				height: height,
				weight: weight,
				nation: nation,
				political_status: political_status,
				marital_status: marital_status,
				is_health: is_health

			});
			console.log(dataPam)
			if(Util.hasToken()) {
				var saveUrl = $api + "resume/base/" + token + '?' + new Date().getTime();
				console.log("saveUrl:" + saveUrl);
				var setObj = {
					url: saveUrl,
					type: "POST",
					contentType: 'application/json;charset=utf-8',
					dataType: "json",
					data: dataPam,
					success: function(data) {
						console.log(data)
						if(data.retcode == 200) {
							//$("#load1").hide();
							var r=data.retdata.resume_base.resume_progress;
							if(r){
								localStorage.getItem("resume_progress", r);
							}
							toast.setToast(data.retmsg, 'two');
					    }else if(data.retcode=='ERRCODE_00017'){
		                        toast.setToast(data.retmsg, 'two');
	                            Util.newLocation("two","personalInfo");
	                     
						} else {
							toast.setToast(data.retmsg, 'five');

						}
					},
					error: function(e){
						toast.setToast("网络错误，请重试", 'five');

					}
				};

				$.ajax(setObj);

			}else {
				$("#load1").hide();
				toast.setToast('登录过期已过期，请重新登录！', 'three');
				Util.newLocation('three', 'personalInfo');

		   }

		} 
//		else {
//			$("#load1").hide();
//			toast.setToast('校验失败！', 'three');
//
//		}
	}
	$(".footer_btn").on("click",function (){
		if(project_progress == "00"){
			$(window).attr("location","./contactInfo.html");
		}
	})
	function checkform() {

		// 			    var name = vump.name;
		// 				var gender = vump.gender;
		// 				var birthday = vump.birthday;
		// 				var id_card = vump.id_card;

		var region = vump.region;
		if(region == null || region == "") {
			toast.setToast('籍贯不能为空！','three');
			return false;
	    }else if(region && !Util.AntiSqlValid(region)){
		 // uap.window.alert("提示",'请您不要输入特殊字符和SQL关键字!');
		  return false;
	    } else if(!(new RegExp("^[一-龥]+$")).test(region)) {
	    	toast.setToast('籍贯请输入汉字！','three');
	    }
		var nation = vump.nation;
		if(nation == null || nation == "") {
			toast.setToast('民族不能为空！','three');
			return false;
		}
		var district_code = vump.district_code;
		if(district_code == null || district_code == "") {
			toast.setToast('生源地不能为空！','three');
			return false;
		}
		var expect_grad_time = vump.expect_grad_time;
		if(expect_grad_time == null || expect_grad_time == "") {
			toast.setToast('预计毕业时间不能为空！','three');
			return false;
		} else {

			var birthday = vump.birthday;
			if(birthday && expect_grad_time) {
				if(!Util.compareDate(birthday, expect_grad_time, "毕业时间不能在出生日期之前！")) {

					return false;
				}

			}
		}
		var student_type = vump.student_type;
		if(student_type == null || student_type == "") {
			toast.setToast('毕业生类型不能为空！','three');
			return false;
		}

		var height = vump.height;
		if(height == null || height == "") {
			toast.setToast('身高不能为空！','three');
			return false;
		} else {
			var reg = new RegExp(/^[1-9]\d{0,2}$/);
			if(!reg.test(height) || height.length>3 || parseInt(height)<100 || parseInt(height)>250) {
				//toast.setToast('请输入正确的身高', 'three');
				toast.setToast('请输入正确的身高！','three');
				return false;
			}

		}
		var weight = vump.weight;
		if(weight == null || weight == "") {
			toast.setToast('体重不能为空！','three');
			return false;
		} else {
			var reg = new RegExp(/^[1-9]\d{0,2}$/);
			if(!reg.test(weight) || weight.length>3 || (parseInt(weight) <10  && parseInt(weight)>300)) {
				//toast.setToast('请输入正确的体重！', 'three');
				toast.setToast('请输入正确的体重！','three');
				return false;
			}

		}

		var marital_status = vump.marital_status;
		if(marital_status == null || marital_status == "") {
			toast.setToast('婚姻状况不能为空！','three');
			return false;
		}
		var political_status = vump.political_status;
		if(political_status == null || political_status == "") {
			toast.setToast('政治面貌不能为空！','three');
			return false;
		}
		var is_health = vump.is_health;
		if(is_health == null || is_health == "") {
			toast.setToast('是否健康不能为空！','three');
			return false;
		}

		return true;

	}
})($);
  