 
/*  	var currYear = (new Date()).getFullYear();	
	var opt={};
	opt.date = {preset : 'date'};
	opt.datetime = {preset : 'datetime'};
	opt.time = {preset : 'time'};
	opt.default = {
		theme: 'android-ics light', // 皮肤样式
        display: 'modal', // 显示方式
        mode: 'scroller', // 日期选择模式
		dateFormat: 'yyyy-mm-dd',
		lang: 'zh',
		showNow: true,
		nowText: "今天",
        startYear: currYear - 10, // 开始年份
        endYear: currYear + 10 // 结束年份
	};*/
var currYear = (new Date()).getFullYear();	
	var opt={};
	opt.date = {preset : 'date'};
    opt.date = {preset : 'date'};
    //opt.datetime = { preset : 'datetime', minDate: new Date(2012,3,10,9,22), maxDate: new Date(2014,7,30,15,44), stepMinute: 5  };
	opt.datetime = {preset : 'datetime'};
	opt.time = {preset : 'time'};
	opt.default = {
		theme: 'android-ics light', //皮肤样式
		display: 'modal', //显示方式 
		mode: 'scroller', //日期选择模式
		dateFormat: 'yyyy-mm-dd',
		lang: 'zh',
		showNow: true,
		nowText: "今天",
		startYear: currYear - 50, //开始年份
		endYear: currYear + 10 //结束年份
	};
 	var optDate = $.extend(opt['date'], opt['default']);
  	var optDateTime = $.extend(opt['datetime'], opt['default']);
  	var optTime = $.extend(opt['time'], opt['default']);
  	//日期
	var DatePicker_getDate=function(selectorId){
		alert("获取时间");
		$("#"+selectorId).mobiscroll(optDate);
	};
	//日期带 时间
   	var DatePicker_getDateTime=function(selectorId){
   		$("#"+selectorId).mobiscroll(optDateTime).datetime(optDateTime);
		
	};
	//只有时间
   	var DatePicker_getTime=function(selectorId){
   		$("#"+selectorId).mobiscroll(optTime).time(optTime);
		
	};
	
	 // 初始化时间
    var now = new Date();
    var nowYear = now.getFullYear();
    var nowMonth = now.getMonth() + 1;
    var nowDate = now.getDate();
    
    
    // 数据初始化
    function formatYear (nowYear) {
        var arr = [];
        for (var i = nowYear-100; i <=nowYear + 5; i++) {
            arr.push({
                id:i+'',
                value:i+''
            });
        }
        return arr;
    }
    function formatMonth () {
        var arr = [];
        for (var i = 1; i <= 12; i++) {
        	var v="";
        	if(i<10){
        		v='0'+i;
        	}else{
        		v=i+'';
        	}
            arr.push({
                id:i+'',
                value:v
            });
        }
        return arr;
    }
    function formatDate (count) {
        var arr = [];
        for (var i = 1; i <= count; i++) {
        	var v="";
        	if(i<10){
        		v='0'+i;
        	}else{
        		v=i+'';
        	}
            arr.push({
                id:i,
                value:v
            });
        }
        return arr;
    }
    var yearData = function(callback) {
        // settimeout只是模拟异步请求，真实情况可以去掉
        // setTimeout(function() {
            callback(formatYear(nowYear))
        // }, 2000)
    }
    var monthData = function (year, callback) {
        // settimeout只是模拟异步请求，真实情况可以去掉
        // setTimeout(function() {
            callback(formatMonth());
        // }, 2000);
    };
    
  var checkYearandM= function (year,month,callback) {
    	   if (/^(1|3|5|7|8|10|12)$/.test(month)) {
               callback(formatDate(31));
           }
           else if (/^(4|6|9|11)$/.test(month)) {
               callback(formatDate(30));
           }
           else if (/^2$/.test(month)) {
               if (year % 4 === 0 && year % 100 !==0 || year % 400 === 0) {
                   callback(formatDate(29));
               }
               else {
                   callback(formatDate(28));
               }
           }
           else {
               throw new Error('month is illegal');
           }
    };
    
    //获取字典数据
    function getDicData(divId,selectId,dicJson,obj){
//		   var divDom = document.querySelector("#"+divId);
//		var selectIdDom = document.querySelector("#"+selectId);
		   var divDom = document.getElementById(divId);
		var selectIdDom = document.getElementById(selectId);
		// divDom.addEventListener('click', function() {
			var id = divDom.dataset['id'];
			var value = divDom.dataset['value'];
	
			var bankSelect = new IosSelect(1, [ dicJson ], {
				container : '.container',
				title : '请选择',
				itemHeight : 80,
				itemShowCount : 2,
				oneLevelId : id,
				callback : function(selectOneObj) {
					//console.log("selectOneObj.id:"+selectOneObj.id+"--------selectOneObj.value:"+selectOneObj.value);
					selectIdDom.value = selectOneObj.id;
					divDom.innerHTML = selectOneObj.value;
					divDom.dataset['id'] = selectOneObj.id;
					divDom.dataset['value'] = selectOneObj.value;
					obj[selectId]=selectOneObj.id;
					console.log(selectId+":"+obj[selectId]);
				}
			});
	 //	});
	
	};
   
	
	 //获取字典数据2 k : v
	function getDicData2(divId,selectId,dicJson){
//		   var divDom = document.getElementById(divId);
//		var selectIdDom = document.getElementById(selectId);
		   var divDom = document.querySelector("#"+divId);
			var selectIdDom = document.querySelector("#"+selectId);
		//divDom.addEventListener('click', function() {
			var id = divDom.dataset['id'];
			var value = divDom.dataset['value'];
			console.log("getDicData2getDicData2:"+id+":"+value);
			console.log("dicJsondicJson:"+JSON.stringify(dicJson));
			
			var bankSelect = new IosSelect(1, [dicJson], {
				container : '.container',
				title : '请选择',
				itemHeight : 80,
				itemShowCount : 2,
				oneLevelId : id,
				callback : function(selectOneObj) {
					//console.log("selectOneObj:"+JSON.stringify(selectOneObj));
					//debugger; 
					console.log("selectOneObj.k"+selectOneObj.k+"selectOneObj.v:"+selectOneObj.v);
					selectIdDom.value = selectOneObj.k;
					divDom.innerHTML = selectOneObj.v;
					divDom.dataset['id'] = selectOneObj.k;
					divDom.dataset['value'] = selectOneObj.v;
				}
			});
	//	});
	
	};
    
	//获取日期的picker组件  2018-4-18
	 var getDateforPicker=function(divId,selectId,dateId,obj){
	    	var selectDateDom=$("#"+divId);
			var showDateDom=$("#"+selectId);
			//var dateId=$("#"+dateId);
			// 初始化时间
			showDateDom.attr('data-year', nowYear);
			showDateDom.attr('data-month', nowMonth);
			showDateDom.attr('data-date', nowDate);
	 
			//日期选择
			var dateData = function(year, month, callback) {
				checkYearandM(year, month, callback);
			};
		 //	selectDateDom.bind('click', function() {
				var oneLevelId = showDateDom.attr('data-year');
				var twoLevelId = showDateDom.attr('data-month');
				var threeLevelId = showDateDom.attr('data-date');
				var iosSelect = new IosSelect(3, [ yearData, monthData, dateData ], {
					title : '请选择',
					itemHeight : 80,
					oneLevelId : oneLevelId,
					twoLevelId : twoLevelId,
					threeLevelId : threeLevelId,
					showLoading : true,
					callback : function(selectOneObj, selectTwoObj, selectThreeObj) {
						showDateDom.attr('data-year', selectOneObj.id);
						showDateDom.attr('data-month', selectTwoObj.id);
						showDateDom.attr('data-date', selectThreeObj.id);
					
						var date=selectOneObj.value+'-'+selectTwoObj.value+'-'+selectThreeObj.value;
						//var d2=date.replace(/-/g,'')
						//dateId.attr("value",date);
						//alert("dateId:"+dateId.val());
						if(date){
							showDateDom.html(date);
							obj[dateId]=date;	
						}
					
					}
				});
	 	//});
 };
 
 var ProvinceData= function(id){//callback为回调函数
 
    var provinces="";
    
 
	  for (var i = 0; i < iosProvinces.length; i++) {
		   if (id==parseInt(iosProvinces[i].id)) {
			   provinces=iosProvinces[i].value;
		   }
		}
     console.log("provinces:"+provinces);
	 return provinces;
 }
 var CityData= function(id){// province为已经选中的省份ID
 
	    var city="";
	   for (var i = 0; i < iosCitys.length; i++) {
	   if (id==parseInt(iosCitys[i].id)) {
		   city=iosCitys[i].value;
	   }
	}
	 console.log("city:"+city);
	 return city;
 }
 var CountyData= function(id){// province为已经选中的省份ID,city为已经选中的城市ID
 
	 var county="";
     for (var i = 0; i < iosCountys.length; i++) {
       if (id==parseInt(iosCountys[i]['id'])) {
           //datas.push(iosCountys[i]);
    	   county=iosCountys[i]['value'];
    	   break;
       }
    }
	 console.log("county:"+county);
	 return county;
 }
 //获取地区级联选择数据
 var getContactCityData=function(selectContactDom,showContactDom,ProvinceCodeDom,CityCodeDom,district_code,obj){
     var selectContactDom = $("#"+selectContactDom);
		var showContactDom = $("#"+showContactDom);
		var contactProvinceCodeDom = $("#"+ProvinceCodeDom);
		var contactCityCodeDom = $("#"+CityCodeDom);
		//selectContactDom.bind('click', function() {
			var sccode = showContactDom.attr('data-city-code');
			var scname = showContactDom.attr('data-city-name');
	
			var oneLevelId = showContactDom.attr('data-province-code');
			var twoLevelId = showContactDom.attr('data-city-code');
			var threeLevelId = showContactDom.attr('data-district-code');
			var iosSelect = new IosSelect(3,
					[ iosProvinces, iosCitys, iosCountys ], {
						title : '请选择',
						itemHeight : 80,
						relation : [ 1, 1 ],
						oneLevelId : oneLevelId,
						twoLevelId : twoLevelId,
						threeLevelId : threeLevelId,
						callback : function(selectOneObj, selectTwoObj,selectThreeObj) {
							contactProvinceCodeDom.val(selectOneObj.id);
							contactProvinceCodeDom.attr('data-province-name',selectOneObj.value);
							contactCityCodeDom.val(selectTwoObj.id);
							contactCityCodeDom.attr('data-city-name',selectTwoObj.value);
	
							showContactDom.attr('data-province-code',selectOneObj.id);
							showContactDom.attr('data-city-code',selectTwoObj.id);
							showContactDom.attr('data-district-code',selectThreeObj.id);
							var region=selectOneObj.value.trim() +''+selectTwoObj.value.trim() +''+selectThreeObj.value.trim();
							//alert("region:"+region);
						
							
							if(region){
								showContactDom.html(region);
								obj[district_code]=selectThreeObj.id;	
							}
						
						}
					});
	//	});
};

    

 
  
   