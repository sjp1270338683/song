	$("#nav-left").on("click",function (){
		$(window).attr("location","login.html");
	})
	var openWin = function (index){
		if(index =='goodFaithCommitment'){
		   	localStorage.setItem('popWin','goodFaithCommitment') ;
	    }
	    if(index =='registrationPolicy'){
		   	localStorage.setItem('popWin','registrationPolicy') ;
	    }
	    if(index =='noticeOfApplication'){
		   	localStorage.setItem('popWin','noticeOfApplication') ;
	    }
	    $(window).attr("location","../modules/popwindow/register_popwindow.html");
	}
	document.title ='注册';
  	//验证码
	var code=document.getElementById('code');
	var codeInp=document.getElementById('codeInput');
	// 姓名
	var oName=document.getElementById("dr-name");
	var oNameTX=document.getElementById("dr-nameTX");
	// 身份证
	var oNameId=document.getElementById("dr-nameId");
	var oNameIdTX=document.getElementById("dr-nameIdTX");
	// 身份证确认
	var oNameIdT=document.getElementById("dr-nameIdT");
	var oNameIdTTX=document.getElementById("dr-nameIdTTX");
	// 密码
	var oPasswoer=document.getElementById("dr-password");
	var oPasswoerTX=document.getElementById("dr-passwordTX");
	// 密码确认
	var oPasswoerT=document.getElementById("dr-passwordT");
	var oPasswoerTTX=document.getElementById("dr-passwordTTX");
	// 邮箱
	var oEmail=document.getElementById("dr-email");
	var oEmailTX=document.getElementById("dr-emailTX");
	// 手机号 
	var oPhone=document.getElementById('dr-phone');
	var oPhoneTX=document.getElementById('dr-phoneTX');
	//复选框
	var oChebox=document.getElementById("dr_cbx");
	// 注册
	var oRit=document.getElementById('dr-register');
	
	var ert=false,oNam=false,oNI=false,oNIT=false,oPsw=false,oPswT=false,oEmi=false,oPn=false,oQq=false,oWx=false;
	var phones = "";
	//验证身份证号码1，邮箱2，手机号3，qq4，微信5
	function onBlurs(num,nodes,val,txt){
		$.ajax({
    		url:$api+"register/unique/"+num+"/"+val,
    		type:"GET",
            cache:false,
    		dataType:"json",
	        success:function(data){
	        	
	        	if(data.retcode!='200'){
	        		toast.setToast(txt,'five');
	        		val = "";
	        		nodes.val("");
	        		console.log(val);
	        		phones = 0;
	        	}else if(data.retmsg == "成功"){
	        		phones = 1;
	        	}
	        }
    	});
	}
	// 表单验证
	// 姓名
	oName.onblur=function(){
		var reg=/^[\u4e00-\u9fa5]{2,20}$/;
	  	if(reg.test(oName.value)){
	        oNam=true;
	  	}else{
	        oNam=false;
	        toast.setToast('请采用身份证姓名','three');
	  	}
	}
	//身份证
	oNameId.onblur=function(){
		// if(!oName.value){
  //           toast.setToast('请先填写用户名',5000);
  //           $('#dr-nameId').val('');
  //           $('#dr-nameIdT').val('');
  //           return;
  //   	}
	    var reg=/^[1-9][0-9]{5}(19[0-9]{2}|200[0-9])(0[1-9]|1[0-2])(0[1-9]|[1-2][0-9]|3[0-1])[0-9]{3}[0-9X]$/;
	    if(reg.test(oNameId.value)){
	        oNI=true;
	        onBlurs(1,$("#dr-nameId"),oNameId.value,'身份证信息已注册');
	    }else{
	  		toast.setToast('身份证号必须是18位数字或17位数字和大写的X组成','three');
	        oNI=false;
            return;
	    }
	}
//	身份证禁止复制
	oNameId.oncopy=function(){
	    return false;
	}
	oNameId.onpaste=function(){
		return false;
	}
	// 身份证确认
	oNameIdT.onblur=function(){
		if(oNameId.value===oNameIdT.value){
        	oNIT=true;
	  	}else{
	        oNIT=false;
	        toast.setToast('身份证号码输入不一致','three');
	  	}
	}
//	身份证确认禁止复制
	oNameIdT.oncopy=function(){
	    return false;
	}
	oNameIdT.onpaste=function(){
		return false;
	}
	// 密码
	$('.firstPassword input[type="password"]').on('blur',function(){
		var reg=/^(?=.*\d+.*)(?=.*[a-zA-Z]+.*)(?=.*[_|-|\~|\!|\@|\#|\$|\%|\^|\&|\*]+.*)[\da-zA-Z_|-|\~|\!|\@|\#|\$|\%|\^|\&|\*]{6,16}$/;
		if(reg.test($('.firstPassword input[type="password"]').val())){
		    oPsw=true;
		}else{
		    oPsw=false;
		    toast.setToast('密码格式不正确','three');
		}
	})
//	密码禁止复制
	$('.firstPassword input[type="password"]').on('copy',function(){
	    return false;
	})
	$('.firstPassword input[type="password"]').on('paste',function(){
		return false;
	})
	// 密码确认
	$('.rePassword input[type="password"]').on('blur',function(){
		if($('.firstPassword input[type="password"]').val()===$('.rePassword input[type="password"]').val()){
        	oPswT=true;
		}else{
		    oPswt=false;
		    toast.setToast('密码输入不一致','three');
		}
	})
//	密码确认禁止复制
	$('.rePassword input[type="password"]').on('copy',function(){
        return false;
    })
    $('.rePassword input[type="password"]').on('paste',function(){
        return false;
    })
	// 邮箱
	oEmail.onblur=function(){
        var reg=/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
	    if(reg.test(oEmail.value)){
	        oEmi=true;
	        onBlurs(2,$("#dr-email"),oEmail.value,'邮箱已注册')
	    }else{
	        oEmi=false;
	        toast.setToast('请输入正确的电子邮箱','three');
	    }
	}
	 document.getElementById("dr-qq").onblur = function() {
		 var reg = /^[1-9]\d{4,9}$/;
         if(reg.test(document.getElementById("dr-qq").value)){
             oQq=true;
             onBlurs(4,$("#dr-qq"),document.getElementById("dr-qq").value,'QQ账号已注册')
         }else{
             oQq=false;
             toast.setToast('请输入正确的qq号码','three');
         }
     };
      document.getElementById("dr-wx").onblur = function() {
          var reg = /^[a-zA-Z]([-_a-zA-Z0-9]{5,19})+$/;
          if(reg.test(document.getElementById("dr-wx").value)){
              oWx=true;
              onBlurs(5,$("#dr-wx"),document.getElementById("dr-wx").value,'微信账号已注册')
          }else{
              oWx=false;
              toast.setToast('请输入正确的微信号码','three');
          }
       };
	// 手机号
	oPhone.onblur=function(){
		var reg=/^1[3|4|5|7|8][0-9]{9}$/;
	    if(reg.test(oPhone.value)){
            oPn=true;
            onBlurs(3,$("#dr-phone"),document.getElementById("dr-phone").value,'手机号码已注册')
	    }else{
            oPn=false;
            toast.setToast('请输入正确的手机号码','three');
	    }
	}
	//	UUID
	function uuid(len, radix) {
	    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
	    var uuid = [], i;
	    radix = radix || chars.length;
	 
	    if (len) {
	      // Compact form
	      for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
	    } else {
	      // rfc4122, version 4 form
	      var r;
	 
	      // rfc4122 requires these characters
	      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
	      uuid[14] = '4';
	 
	      // Fill in random data.  At i==19 set the high bits of clock sequence as
	      // per rfc4122, sec. 4.1.5
	      for (i = 0; i < 36; i++) {
	        if (!uuid[i]) {
	          r = 0 | Math.random()*16;
	          uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
	        }
	      }
	    }
		return uuid.join(''); 
	}	
	var UUID=uuid(8,2);
	//点击获取短信验证码
	$("#r-picture").click(function (){
        var e = /^1[3|4|5|7|8][0-9]{9}$/;
        if(e.test(document.getElementById("dr-phone").value) && phones == "1"){
            var item = JSON.stringify({
			    	user_key:UUID,
					mobile:$("#dr-phone").val(),
		    	})
			console.log(item);
			$.ajax({
	    		url:$api+"register/snsmessage",
	    		type:"post",
	    		contentType:'application/json;charset=utf-8',
	    		dataType:"json",
	    		data:item,
	            cache:false,
	    		success:function(data){
	    			if(data.retcode==200){
	    				console.log(data);
	    				localStorage.setItem('setN',data.retdata.p);
	    				localStorage.setItem('setE',data.retdata.s);
	    				invokeSettime($("#changeOne1"));
			     
	    			}else{
	    				toast.setToast(data.retmsg,5000);
	    			}
	    		}
	    	});
        }else{
            toast.setToast("请输入正确的手机号码", "three");
        }
    });
    function invokeSettime(obj){
        var countdown=60;
        settime(obj);
        function settime(obj) {
            if (countdown == 0) {
                $(obj).attr("disabled",false);
                $(obj).val("获取验证码");
                countdown = 60;
                return;
            } else {
                $(obj).attr("disabled",true);
                if(countdown < 10){
                    $(obj).val("(0" + countdown + ") s重新发送");
                }else{
                    $(obj).val("(" + countdown + ") s重新发送");
                }
                countdown--;
            }
            setTimeout(function() {
                settime(obj)
            },1000)
        }
    };
//	验证码
//	$("#r-picture img").attr("src",$api+"index/verify_code/"+UUID);
//	$("#r-picture").on('click','img',function(){
//		$("#r-picture img").attr("src",$api+"index/verify_code/"+UUID+'?'+new Date().getTime());
//	});
    // 注册
    oRit.onclick=registerFun;
    $(document).keyup(function(e){
        var e = window.event || e;
        if(e.keyCode == 13){
            registerFun()
        }
    })
    function registerFun(){
        if(oNam==true&&oNI==true&&oNIT==true&&oPsw==true&&oPswT==true&&oEmi==true&&oPn==true&&oQq==true&&oWx==true&&oChebox.checked&&codeInp.value!==""){
            if(Util.checkValue([$("#codeInput").val(),$("#dr-nameId").val(),$("#dr-wx").val(),$("#dr-qq").val(),$("#dr-name").val(),$("#dr-phone").val(),$("#dr-email").val()])){
                toast.setToast('信息内包含特殊字符，请重新输入！','three');
                $("#dr-register").attr("disabled",false);
                return;
            }
            if(Util.checkValuepwd([$('.firstPassword input[type="password"]').val()])){
				toast.setToast('密码内包含非法字符，请重新输入！','three');
                return;
			}
			$("#dr-register").attr("disabled",true);
        	$("#dr-register").attr("value","注册中");
        	var secretKeyN = localStorage.getItem('setN');
        	var secretKeyE = localStorage.getItem('setE');
            $.ajax({
        		url:$api+"register/member/",
        		type:"POST",
        		contentType:'application/json;charset=utf-8',
        		dataType:"json",
		        data:JSON.stringify({
			    	user_key:UUID,
					verify_code:Util.encodeHtml($("#codeInput").val()),
					id_card:encryptbyrsa(secretKeyN,secretKeyE,Util.encodeHtml($("#dr-nameId").val())),
					user_name:encryptbyrsa(secretKeyN,secretKeyE,$("#dr-name").val()),
					mobile:encryptbyrsa(secretKeyN,secretKeyE,Util.encodeHtml($("#dr-phone").val())),
					email:encryptbyrsa(secretKeyN,secretKeyE,Util.encodeHtml($("#dr-email").val())),
					pwd:encryptbyrsa(secretKeyN,secretKeyE,$('.firstPassword input[type="password"]').val()),
					we_chat:encryptbyrsa(secretKeyN,secretKeyE,Util.encodeHtml($("#dr-wx").val())),
					qq_no:encryptbyrsa(secretKeyN,secretKeyE,Util.encodeHtml($("#dr-qq").val()))
		    	}),
		        success:function(data){
		        	if(data.retcode==200){
		        		console.log(data);
		        		sessionStorage.setItem('token',data.retdata.token);
		        		localStorage.setItem('setN',data.retdata.p);
                        localStorage.setItem('setE',data.retdata.s);
		        		$(window).attr("location","./resume.html");
		        	}else{
		        		toast.setToast(data.retmsg,'five');
		        	}
		        	$("#dr-register").attr("disabled",false);
        			$("#dr-register").attr("value","注册");
		        },
		        error:function(){
		        	toast.setToast("网络错误，请重试！",'five');
		        	$("#dr-register").attr("disabled",false);
        			$("#dr-register").attr("value","注册");
		        }
    		});	
        }else{
//      		用户名
        		if(oNam==false){
        			toast.setToast('姓名格式不正确','three');
        		}
//      		身份证
        		else if(oNI==false){
        			toast.setToast('身份证号码不正确','three');
        			oNameId.value = '';
        		}
//      		密码
        		else if(oPsw==false){
        			toast.setToast('密码格式不正确','three');
        		}
//      		电子邮箱
        		else if(oEmi==false){
        			toast.setToast('电子邮箱格式不正确','three');
        		}
        		// qq
				else if(oQq==false){
					toast.setToast('QQ号码格式不正确','three');
				}
				// 微信
				else if(oWx==false){
					toast.setToast('微信号码格式不正确','three');
				}
//      		手机号码
        		else if(oPn==false){
        			toast.setToast('手机号码格式不正确','three');
        		}
//      		复选框
        		else if(oChebox.checked==false){
        			toast.setToast('请点击阅读并接受','three');
        		}
			}
    	}
