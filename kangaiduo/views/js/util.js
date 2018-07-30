var Util= {
    //token 失效的操作
	newLocation : function(index,page){
		localStorage.clear('token');
		if(localStorage.getItem("attach_url")!='undefined'&&localStorage.getItem("attach_url")!=null){
			localStorage.clear('attach_url');
		};
		if(localStorage.getItem("confirm_flag")!='undefined'&&localStorage.getItem("confirm_flag")!=null){
			localStorage.clear('confirm_flag');
		};
		
		localStorage.clear('resume_progress');
		localStorage.clear('resume_order');
		localStorage.clear('isfromhome');
		localStorage.clear('setN');
		localStorage.clear('setE');
        localStorage.clear('onlineSkin');
        localStorage.clear('popWinHome');
        localStorage.clear('popWin');
    	localStorage.clear('previewSkin');
    	localStorage.clear('index_banner');
    	localStorage.clear('user_name');
    	localStorage.clear('website_skin0');
    	localStorage.clear('website_skin1');
    	localStorage.clear('indexwin_data');
        localStorage.clear('bulletin_order');
        localStorage.clear('unit_detail_background');
        localStorage.clear('login_background');
        localStorage.clear('obj_id');
        localStorage.clear("tag");
        localStorage.clear('bullTitle');
        localStorage.clear('titleAdjust');
        localStorage.clear('obj_type');
        localStorage.clear("dataError");
        localStorage.clear("dataFeed");
        localStorage.clear('company_bullet_id');
        localStorage.clear('bullet_type');
        localStorage.clear('search_index');
        localStorage.clear('search_key');
        localStorage.clear('companyBullet_id');
        localStorage.clear('onlineSkin');
        localStorage.clear('previewSkin');
        localStorage.clear('indexwin_data');
        localStorage.clear('bulletin_order');
        localStorage.clear('index_banner');
        localStorage.clear('unit_detail_background');
        localStorage.clear("dropDownRefresh");
        localStorage.clear('recruit_type');
        localStorage.clear('companyObj_id');
        localStorage.clear('level');
        localStorage.clear('announceObj_id');
        localStorage.clear('bulletinDetail_bullet_id');
        localStorage.clear('particulars');
        localStorage.clear('jumpPageLgo');
        if(index=='one'){
    	    setTimeout(function () {
    	    	$(window).attr("location","./login.html");
            },200);
        }
        if(index=='two'){
    	    setTimeout(function () {
       			$(window).attr("location","./login.html");
            },200);
        }
        if(index=='three'){
    	    setTimeout(function () {
       			$(window).attr("location","./login.html");
            },200);
        }
        if(index=='four'){
    	    setTimeout(function () {
 			    $(window).attr("location","./views/login.html");
            },200);
        }
	},
	//是否存在token
	hasToken:function(){
		var token = localStorage.getItem('token');
		if(token){
			return true;
		}else{
			return false;
		}
	},
	uuid:function(len, radix) {
	    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
	    var uuid = [], i;
	    radix = radix || chars.length;
	    if (len) {
	      for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
	    } else {
	      var r;
	      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
	      uuid[14] = '4';
	      for (i = 0; i < 36; i++) {
	        if (!uuid[i]) {
	          r = 0 | Math.random()*16;
	          uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
	        }
	      }
	    }
		return uuid.join(''); 
	},	
    //继承
    extend: function(target, source) {
        for (var p in source) {
            if (source.hasOwnProperty(p)) {
                target[p] = source[p];
            }
        }
        return target;
    },
    //格式化时间
    getNowFormatDate: function (_thisDate) {
        if(_thisDate==null||_thisDate=='1970-01-01'){
            return ''
        }else{
            var arr = _thisDate.split('');
            var currentdate = arr[0]+arr[1]+arr[2]+arr[3]+'-'+arr[4]+arr[5]+'-'+arr[6]+arr[7];
            return currentdate;
        }     
    },
    // xss 转义
    encodeHtml: function(arg){
    	//alert(arg);
        arg = arg.replace(/&/g,'&amp;')
                 .replace(/</g,'&lt;')
                 .replace(/>/g,'&gt;')
                 .replace(/""/g,'&quot;')
                 .replace(/''/g,'&#39;');
        arg = $.trim(arg);
        return arg;
    },
    // xss
    // 特殊字符检查  存在返回true
    checkValue:function(arg){
        var reg = /[~#^$%&<>""''*]/gi;
        if(arg instanceof Array == true){
            for(var i=0;i<arg.length;i++){
                if(reg.test(arg[i])){
                    return true;
                }
            }
        }else{
            if(reg.test(arg)){
                return true;
            }
        };
        return false;
    },
    //检查特殊的字符
    checkValuepwd:function(arg){
        var reg = /[<>""'']/gi;
        if(arg instanceof Array == true){
            for(var i=0;i<arg.length;i++){
                if(reg.test(arg[i])){
                    return true;
                }
            }
        }else{
            if(reg.test(arg)){
                return true;
            }
        };
        return false;
    },
	//获取页面名称（不带后缀）
    getPageName: function (){
        var a = location.href;
        var b = a.split("/");
        var c = b.slice(b.length-1, b.length).toString(String).split(".");
        return c.slice(0, 1)[0];
    },
    //storage操作
    isHasStorage: (function() {
        var mod = 'isStorage';
        try {
            sessionStorage.setItem(mod, mod);
            sessionStorage.removeItem(mod);
            return true;
        } catch (exception) {
            return false;
        }
    }()),
    //无痕模式
    storage: function() {
        if (!this.isHasStorage) {
            alert('您可能正处于无痕模式，为了更好的为您提供服务，请关闭该模式!');
        }
        return sessionStorage;
    },
    //生成随机字符串
    randomString: function(len) {
        var ret = '';
        for (; ret.length < len; ret += Math.random().toString(36).substr(2));
        return ret.substr(0, len);
    },
    //地址栏参数获取
    getQuery: function() {
   /*     var s = (location.search.length > 0 ? location.search.substring(1) : ''),
            res = {},
            items = s.length ? s.split('&') : [],
            item = null,
            name = null,
            value = null,
            i, len = items.length;

        for (i = 0; i < len; i++) {
            item = items[i].split('=');
            name = decodeURIComponent(item[0]);
            value = decodeURIComponent(item[1]);
            if (name.length) {
                res[name] = value;
            }
        }

        return res;*/
       	var params = {};
       	uap.ready(function() {
			var loc = String(document.location);
			if(loc.indexOf("?") > 0) loc = loc.substr(loc.indexOf('?') + 1);
			else loc = uexWindow.getUrlQuery();
			var pieces = loc.split('&');
			params.keys = [];
			for(var i = 0; i < pieces.length; i += 1) {
				var keyVal = pieces[i].split('=');
				params[keyVal[0]] = decodeURIComponent(keyVal[1]);
				params.keys.push(keyVal[0]);
			}
		});
		return params;
    },
    //地址栏参数获取2
    getQuery2: function() {
    	var params = {};
 		// uap.ready(function() {
			var loc = String(document.location);
			if(loc.indexOf("?") > 0) loc = loc.substr(loc.indexOf('?') + 1);
			else loc = uexWindow.getUrlQuery();
			var pieces = loc.split('&');
			params.keys = [];
			for(var i = 0; i < pieces.length; i += 1) {
				var keyVal = pieces[i].split('=');
				params[keyVal[0]] = decodeURIComponent(keyVal[1]);
				params.keys.push(keyVal[0]);
			}
	  //  });
    	  
		return params;
    	
    },
    //打开新的tab页面
    buildHref:function (url,path) {
    	console.log('url'  +path);
        console.log('path'  +path);
        return "uap.window.open(&quot;"+(url)+"&quot;,&quot;"+(path)+"&quot;)";
    },
    //得到字符串的字符的长度
    getBytesLength:function(str,length) {
			///获得字符串实际长度，中文2，英文1
			///要获得长度的字符串
			var realLength = 0, len = str.length, charCode = -1;
			for (var i = 0; i < len; i++) {
				charCode = str.charCodeAt(i);
				if (charCode >= 0 && charCode <= 128){
					realLength += 1;
				}else{
					realLength += 2;
				} 
				
				if(realLength>length){
					realLength = i;
					break;
				}
			}
			console.log(realLength);
			return str.substring(0,realLength);
		},
    //打印日志 
    log: function(info) {
	    console.log(info);
	    try{
	        if (typeof(uexLog)!="undefined") {
	            uexLog.sendLog(info);
	        }
	    }catch(e){
	        console.log(e.message);
	    }
    },
    //弹出的提示
    alertX: function(content){
        uap.window.alert("提示",content);
    },
     buttonX: function(selector,fn){
        uap.button(selector,"ani-act",fn);
    },
    //打开页面
    openWin:function(name,path) {
    	if(name&&path){
    		uap.window.open(name,path);
    	}else{
    		uap.window.alert("提示",'页面打开错误');
    	}
    },
    openWinWithUrl:function(name,path){
    	if(name&&path){
    		uap.openWinWithUrl(name,path);
    	}else{
    		uap.window.alert("提示",'页面打开错误');
    	}
    },
    //打开frame
    openWinFrame:function(name,frame,titHeight){
    	if(name && frame && titHeight){
    		return uap.frame.open(name, frame , 0, titHeight);
    	}
    	
    },
	//打开frame
	openNewFrame:function(name,frame){
		if(name && frame){
			return uap.frame.open(name, frame);
		}
		
	},
   //当屏幕转化时执行的函数
    onorientationChange :function(name) {
    	 window.onorientationchange = window.onresize = function() {
            uap.frame.resize(name, 0, titHeight);
         } 
    },
    //关闭页面 
     closeWin: function(winName) {
        evalScript(winName,"uexWindow.close(0)");
    },
   
    evalPopScript:function(name,popName,scriptContent){
	     uap.window.evaluatePopoverScript({
	        name:name,
	        popName:popName,
	        scriptContent:scriptContent
	    });
	},
    //加载页面
	 openLoading:function(info) {
	    var msg='正在加载...';
	    if (info) {
	        msg=info;
	    }
	    
	    if(typeof(uexLoadingView)!="undefined"){
	        var jsonstr = '{"x":'+screen.width*2/5+', "y":'+screen.height/2+', "w":'+screen.width/5+', "h":50, "style":{"styleId":1, "pointNum":4, "pointColor":["#99ccff"]}}';
	        uexLoadingView.open(jsonstr);
	        
	    }else{
	        uap.window.openToast({
	            msg : msg,
	            duration : -1,
	            position : 5,
	            type : 1
	       });
	    }
	},
	//关闭加载loading
	closeLoading:function() {
	    if(typeof(uexLoadingView)!="undefined"){
	        uexLoadingView.close();
	    }else{
	        uap.window.closeToast();
	    }
	},
	//Get请求
	ajaxGet:function(opt) {
	    var defaultOpt = {
	        url : "",
	        type:"GET",
	        data : {},
	        dataType : 'json',
	        timeout : 15000, //超时时间
	        loading:true,
	        cache:false,
	        error : function(xhr, type) {
	            console.log(xhr);
	            closeLoading();
	            alert('连接超时，请检查你的网络设置!');
	        }
	    };
	    opt.url=serverURL+opt.url;
	    opt=extend(defaultOpt, opt);
	    log("start request:"+opt.url);
	    log("request data:"+JSON.stringify(opt.data));
	    if(opt.loading!=false){
	        opt.beforeSend=function(xhr, settings){
	          openLoading();
	        };
	    }
	    if(opt.successx){
	        opt.success=function(data,status){
	            closeLoading();
	            if(status!="success"){
	                alert('Server error!');
	                return;
	            }
	            log(JSON.stringify(data));
	            opt.successx(data);
	        }
	    }
	    uap.request.ajax(opt);
	},
	//设置字符串类型的本地缓存
	 setStorage:function(objName, objValue){
	    var sto = localStorage;
	    if (sto) 
	        sto.setItem(objName, objValue);
	},
	 //读取字符串类型的本地缓存
	 getStorage:function(objName){
	    var ret = '';
	    var sto = localStorage;
	    if (sto) 
	        ret = sto.getItem(objName);
	    return ret;
	},
	//清除本地缓存，如没指定名称则为清空所有缓存
	clearStorage:function(objName){ 
	    var sto = localStorage;
	    if (sto) {
	        if (objName) 
	            sto.removeItem(objName);
	        else 
	            sto.clear();
	    }
	},
	//设置Json类型的本地缓存
	 setStorJson:function(objName, json){ 
	    if (json) 
	        setstorage(objName, JSON.stringify(json));
	},
	//读取Json类型的本地缓存
	 getStorJson:function(objName){ 
	    var ret = null;
	    var str = getstorage(objName);
	    if (str) 
	        ret = JSON.parse(str);
	    return ret;
	},
	//时间处理-时间轴=>年月日格式
	 timeStampString:function(time,id){
	    //y=年;ymd=年月日;ymdhm年月日时分;ymdhms年月日时分秒
	    var datetime = new Date();
	    datetime.setTime(time);
	    var year = datetime.getFullYear();
	    var month = datetime.getMonth() + 1 < 10 ? "0" + (datetime.getMonth() + 1) : datetime.getMonth() + 1;
	    var month2 = datetime.getMonth() + 1 < 10 ? datetime.getMonth() + 1 : datetime.getMonth() + 1;
	    var date = datetime.getDate() < 10 ? "0" + datetime.getDate() : datetime.getDate();
	    var date2 = datetime.getDate() < 10 ? datetime.getDate() : datetime.getDate();
	    var hour = datetime.getHours()< 10 ? "0" + datetime.getHours() : datetime.getHours();
	    var minute = datetime.getMinutes()< 10 ? "0" + datetime.getMinutes() : datetime.getMinutes();
	    var second = datetime.getSeconds()< 10 ? "0" + datetime.getSeconds() : datetime.getSeconds();
	    if( id == "y" ){
	        return year;
	    }else if( id == "ym" ){
	        return year + "/" + month;
	    }else if( id == "ymd" ){
	        return year + "/" + month + "/" + date;
	    }else if( id == "ymdhm" ){
	        return year + "/" + month + "/" + date + " " + hour + ":" + minute;
	    }else if( id == "ymdhms" ){
	        return year + "/" + month + "/" + date+" "+hour+":"+minute+":"+second;
	    }else if( id == "md" ){
	        return month + "/" + date;
	    }else if( id == "md2" ){
	        return month2 + "月" + date2 + "日";
	    }else if(!id){
	        return year + "/" + month + "/" + date;
	    }
	},
	//格式化日期
	formatDate:function(dom,year,month,date)   {  
		
	     var month=(month)>10?month:"0"+month;     
	     var date=(date)>10?date:"0"+date;    
	     $("#"+dom).text(year+"-"+month+"-"+date);
	     $("#"+dom).attr('value',year+"-"+month+"-"+date);
	     $("#"+dom).removeAttr('style');
	},
	// 判断是否为手机号  
	isPoneAvailable:function (str) {  
        var myreg=/^[1][3,4,5,7,8][0-9]{9}$/;  
        if(str){
            if (!myreg.test(str)) {  
        		uap.window.alert("提示",'请填写正确的手机号码！');
                return false;  
            } else {  
                return true;  
            }  
        	
        }
   
    },
    // 判断是否为电话号码  
    isTelAvailable: function (tel) {
    	  if(tel){
    	      var myreg = /^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/;  
    	      if (!myreg.test(tel)) {  
    	    	  uap.window.alert("提示",'请填写正确的座机！');
    	        return false;  
    	      } else {  
    	        return true;  
    	      }   
    	  }

    },  
    
    // 判断是否为电话号码  
    isEmailable: function (email) {  
    	var mailReg = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/; 
    	 if(email){
    	     if (!mailReg.test(email)){
    	    	  uap.window.alert("提示",'请填写正确的电子邮箱！');
    	    	  return false;  
    	      } else {  
    	        return true;  
    	      } 
    	 }
  
    },  
    // 判断是否为邮政编码
    isPostCodeable: function (postCode) { 
    	 if(postCode){
    		   	var reg = /^[0-9]{6}$/;
    		      if (!reg.test(postCode)) {
    		    	  uap.window.alert("提示",'请填写正确的E邮政编码！');
    		        return false;  
    		      } else {  
    		        return true;  
    		      } 
    	 }
  
    },
    //验证QQ
    isQQ:function (qq){  
    	 if(qq){
    	      if (qq.search(/^[1-9]{1}[0-9]{4,16}$/) !=-1){  
    		       return true;   
    	       }else{   
    	    	  uap.window.alert("提示",'请填写正确的qq号码！');
    	         return false;
    	       }
    	 }
 
  
    },
    isWe_chat:function(we_chat){
    	 if(we_chat){
    			var reg = /^[a-zA-Z]{1}[-_a-zA-Z0-9]{2,19}$/;
    		        if (!reg.test(we_chat)) {  
    		        	uap.window.alert("提示",'请填写正确的微信号码！');
    		          return false;  
    		        } else {  
    		          return true;  
    		        } 
    	 }
     
    },
    isNumber:function(n){
   	 if(n){
   			var reg = /^[0-9]*$/;
   		        if (!reg.test(n)) {  
   		        	//uap.window.alert("提示",'请填写正确的分数！');
   		          return false;  
   		        } else {  
   		          return true;  
   		        } 
   	 }
    
   },
    showLoadding:function(divId){
    	//动态加载 效果
    	var bclass = "spinner-container container";
		var htmlstr = [];
		var load1 = document.getElementById(divId);

		htmlstr.push("<center >保存中....<center>");
		htmlstr.push('<div class="spinner"  ">');
		for(var i = 0; i < 4; i++) {
			htmlstr.push('<div class="spinner-container container' + (i + 1) + '">');
			htmlstr.push('<div class="circle1"></div>');
			htmlstr.push('<div class="circle2"></div>');
			htmlstr.push('<div class="circle3"></div>');
			htmlstr.push('<div class="circle4"></div>');
			htmlstr.push('</div>');
		}
		htmlstr.push('</div>');
		load1.innerHTML = htmlstr.join('');
		
	},
	//比较日前大小  
	compareDate:function (checkStartDate, checkEndDate,msg) {      
	    var arys1= new Array();      
	    var arys2= new Array();      
		if(checkStartDate != null && checkEndDate != null) {      
		    arys1=checkStartDate.split('-');      
		      var sdate=new Date(arys1[0],parseInt(arys1[1]-1),arys1[2]);      
		    arys2=checkEndDate.split('-');      
		    var edate=new Date(arys2[0],parseInt(arys2[1]-1),arys2[2]);      
		if(sdate > edate) {      
		    //alert("日期开始时间大于结束时间");   
			toast.setToast(msg, 'three');
		    return false;         
		}  else {   
		    //alert("通过");   
		    return true;      
		    }   
		   }      
	},  
	CheckUrl:function(url){
   	 // var url=document.getElementById("url").value;
   	if(url){
   		 var reg=/^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/)(([A-Za-z0-9-~]+)\.)+([A-Za-z0-9-~\/])+$/;
       	 if(!reg.test(url)){
       		 uap.window.alert("这网址不是以http://https://开头，或者不是网址！");
       		  return false;  
       	 }
       	 else{
       		 return true; 
       	 }
   		
   	}
   	
   },
   getFileName:function (path){ 
	   //根据路径获取文件名
	   var pos1 = path.lastIndexOf('/'); 
	   var pos2 = path.lastIndexOf('\\'); 
	   var pos = Math.max(pos1, pos2) 
	   if( pos<0 ) 
	   return path; 
	   else 
	   return path.substring(pos+1); 
	   },
	  suffix:function (file_name) {
		   //根据文件名截取文件后缀
			var result = /\.[^\.]+/.exec(file_name);
			return result;
	 },
	//取得网页间传递参数 处理中文参数乱码
	GetRequest:function() {
		var url =window.location.search; //获取url中"?"符后的字串
		//debugger;
		console.log("GetRequest: "+url);
		var theRequest = new Object();
		if(url.indexOf("?") != -1) {
			var str = url.substr(1);
			strs = str.split("&");
			for(var i = 0; i < strs.length; i++) {
				var str2=decodeURI(strs[i].split("=")[0]);
				var str=decodeURI(strs[i].split("=")[1]);
				theRequest[str2] = unescape(str);
			}
		}
		return theRequest;
	 },
    dealImage:function (path, obj, callback){
    	
    	/**
         * 图片压缩，默认同比例压缩
         * @param {Object} path 
         *   pc端传入的路径可以为相对路径，但是在移动端上必须传入的路径是照相图片储存的绝对路径
         * @param {Object} obj
         *   obj 对象 有 width， height， quality(0-1)
         * @param {Object} callback
         *   回调函数有一个参数，base64的字符串数据
         */
     var img = new Image();
     img.src = path;
     img.onload = function(){
      var that = this;
      // 默认按比例压缩
      var w = that.width,
       h = that.height,
       scale = w / h;
       w = obj.width || w;
       h = obj.height || (w / scale);
      var quality = 0.7;  // 默认图片质量为0.7
      //生成canvas
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      // 创建属性节点
      var anw = document.createAttribute("width");
      anw.nodeValue = w;
      var anh = document.createAttribute("height");
      anh.nodeValue = h;
      canvas.setAttributeNode(anw);
      canvas.setAttributeNode(anh); 
      ctx.drawImage(that, 0, 0, w, h);
      // 图像质量
      if(obj.quality && obj.quality <= 1 && obj.quality > 0){
       quality = obj.quality;
      }
      // quality值越小，所绘制出的图像越模糊
      var base64 = canvas.toDataURL('image/jpeg', quality );
      // 回调函数返回base64的值
      callback(base64);
     }
    }, 
    AntiSqlValid: function (oFieldVal)
    {
    	 //防止SQL注入
       var  re= /select|update|insert|delete|exec|count|'|"|=|;|>|<|%/i;
       if(re.test(oFieldVal) ) {
    		 uap.window.alert("提示",'请您不要输入特殊字符和SQL关键字！！');
            return false;
      }
       
       return true;
    },
    indexOfArr:function (arr, str) {
		// 如果可以的话，调用原生方法
		if(arr && arr.indexOf) {
			return arr.indexOf(str.toLowerCase());
		}

		var len = arr.length;
		for(var i = 0; i < len; i++) {
			// 定位该元素位置
			if(arr[i] == str.toLowerCase()) {
				return i;
			}
		}

		// 数组中不存在该元素
		return -1;
	}




};
function evalScript(name,scriptContent){
    uap.window.evaluateScript({
       name:name,
       scriptContent:scriptContent
   });
}
















