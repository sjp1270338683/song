
app.controller('homeCtrl',function($scope,$http,code){
	//韩日新 --首页
    $http.get('./datas/home.json').success(function(res){
    	//获取轮播图数据
		$scope.lunbo = res['android.index.banner2'];
		//获取选择按钮数据
		$scope.choose = res['android.index.quick.bar'];
		//获取包邮专区数据
		$scope.pinkage = res['android.index.hot.zhuanti.tuijian']
		//获取科室信息
		$scope.dep = res['android.index.hot.keshi']
	});
	//传输数据
	 $scope.add=function(){
	 	$(".home_ .like .product a").on("touchstart",function(){
	 		$scope.co  = $(this).find("i").text();
	 		code.num=$scope.co;
	 	})
	 }
	//获取滑动广告数据
	$http.get('./datas/seckill.json').success(function(data){
		$scope.imgs = data.SeckillWares;
		TimeBucket = parseInt(data.EndTim-data.ServerTime);
		var str = data.EndTime;
		var str2 = data.ServerTime;
		var ServerTime = str2.substr(6,13)
		var EndTime = str.substr(6,13)
		var timeBucket = parseInt(EndTime-ServerTime)
//		设置倒计时
		sessionStorage.getItem("time")
		if(!sessionStorage.getItem("time")){
			setTime(timeBucket);
			sessionStorage.setItem("time",true);
		}
	});
	 $http.get('./datas/like.json').success(function(result){
    	//获取猜你喜欢数据
		$scope.data = result.Data;
	});
	//轮播图
	var mySwiper = new Swiper('.slidePic .swiper-container',{
		loop: true,
		observer:true,
		autoplay:4000,
		pagination: '.swiper-pagination',
		paginationClickable :true,
		autoplayDisableOnInteraction : false,
	})
	//滑动广告---超级秒杀
    var mySwiper = new Swiper('.seckill .swiper-container', {
        slidesPerView: 3,
        spaceBetween: 20,
        freeMode: true,
        observer:true,
    });
    //秒杀倒计时
	function setTime(timeBucket){
		var sec = parseInt(timeBucket/1000%60);
		var min = parseInt(timeBucket/60000%60);
		var hour = parseInt(timeBucket/60000/60);
		setInterval(function(){
			if (sec<0) {
				sec=59;
				min--;
				if (min<0) {
					min=59;
					hour--;
				}
			}
			if (sec>=10) {
				$(".seckill .second").text(sec)
			}else{
				$(".seckill .second").text("0"+sec)
			}
			if (min>=10) {
				$(".seckill .minute").text(min)
			}else{
				$(".seckill .minute").text("0"+min)
			}
			if (hour>=10) {
				$(".seckill .hour").text(hour)
			}else{
				$(".seckill .hour").text("0"+hour)
			}
			sec--
		},1000)
	}
})

.controller('classifyCtrl',function($scope,$http){
	//分类请求数据
    $http.get("./datas/classify-class.json").success(function(res){
    	
    	$scope.classFirstData = res.Data.Items[0].FirstChannel.WebChannelName;
    	$scope.classMainData = res.Data.Items[0].SecChannel
    	
    });
    //情趣请求数据
    $http.get("./datas/classify-sex.json").success(function(res){
    	console.log(res.Data.Items)
    	$scope.datahead = [];
    	$scope.datamain = [];
    	for(var i=0;i<res.Data.Items.length;i++){
    		$scope.datahead.push(res.Data.Items[i].FirstChannel);
    		$scope.datamain=$scope.datamain.concat(res.Data.Items[i].SecChannel);
    	};
    	console.log($scope.datamain)
    	
    });
    
    $http.get("./datas/classify-doc.json").success(function(res){
    	console.log(res.Data.Items[0].FirstChannel);
    	$scope.datadoc = [];
    	$scope.datadocMain = [];
    	for(var i=0;i<res.Data.Items.length;i++){
    		$scope.datadoc.push(res.Data.Items[i].FirstChannel);
    		$scope.datadocMain=$scope.datadocMain.concat(res.Data.Items[i].SecChannel);
    	};
    	console.log($scope.datadoc);
        console.log($scope.datadocMain)
    })
   // $scope.mysex=true;
    //添加添加显示/隐藏
  $scope.toggle=function(){
 	$scope.mysex=true;
 	$scope.mydoc=false;
  };
  $scope.doc=function(){
  	$scope.mydoc=true;
  	$scope.mysex=false;
  	
  }
  $scope.hidden=function(){
  	$scope.mysex=false;
  	$scope.mydoc=false;
  };
  
  //点击 背景变色
  $(".btn").on("touchstart",function(){
  	for(var i=0; i<$(".btn").length;i++){
  		$(".btn").eq(i).css("background","#f8f8f8")
  	}
  	$(this).css("background","#fff")
  })
    
    
})


.controller('carCtrl',function($scope){
	var show = true;
    $scope.changeImg = function(){
    	show?src="img/round.png":src="img/v.png";
    	$(".car .Settlement li a>span").find("img").attr("src",src);
    	$(".car .Settlement p").find("span").find("img").attr("src",src);
    	$(".car .submitIndent >span").find("img").attr("src",src);
    	if(show){
    		$(".car .submitIndent .money").text("0.0");
			$(".car .submitIndent a").css("background","#898989")
    		
    	}else{
    		var allPrice=null;
			for (var i = 0; i <$(".car .Settlement .price").length; i++) {
				var p1 =  $(".car .Settlement .price")[i];
				var p2 = parseFloat($(p1).text())
				allPrice+=p2;
			}
			$(".car .submitIndent .money").text(parseInt(allPrice));
			$(".car .submitIndent a").css("background","#ea4529")
    	}
    	show = !show;
    }
    //药品数量、价格增加
   	var price;
	$(".car .Settlement .add").on("click",function(){
    	var sum = $(this).parent().find(".num").text();
    	if (!price) {
			price = parseInt($(this).parent().parent().find(".price").text())
    	}
		sum++;
		$(this).parent().find(".num").text(sum)
		$(this).parent().parent().find(".price").text(sum*price);
		
		var allPrice=null;
		for (var i = 0; i <$(".car .Settlement .price").length; i++) {
			var p1 =  $(".car .Settlement .price")[i];
			var p2 = parseFloat($(p1).text())
			allPrice+=p2;
		}
		$(".car .submitIndent .money").text(parseInt(allPrice))
	})
    //药品数量、价格减少
	$(".car .Settlement .subtract").on("click",function(){
    	var sum = $(this).parent().find(".num").text();
    	if(sum==1){
    		sum==1;
    		return;
    	}
    	if (!price) {
			price = parseInt($(this).parent().parent().find(".price").text())
    	}
		sum--;
		$(this).parent().find(".num").text(sum)
		$(this).parent().parent().find(".price").text(sum*price);
		
		var allPrice=null;
		for (var i = 0; i <$(".car .Settlement .price").length; i++) {
			var p1 =  $(".car .Settlement .price")[i];
			var p2 = parseFloat($(p1).text())
			allPrice+=p2;
		}
		$(".car .submitIndent .money").text(parseInt(allPrice))
	})
	//点击head中的a标签
	var change = true;
	$(".car .head a").on("click",function(){
    	change?t="完成":t="编辑";
    	show?src="img/round.png":src="img/v.png";
		$(this).text(t);
		$(".car .Settlement li a>span").find("img").attr("src",src);
    	$(".car .Settlement p").find("span").find("img").attr("src",src);
    	$(".car .submitIndent >span").find("img").attr("src",src);
    	if(change){
    		$(".car .submitIndent .money").text("0.0");
			$(".car .submitIndent a").css("background","#898989");
			$(".car .submitIndent a").text("删除");
			$(".car .submitIndent div").css("display","none");
			$("#allChecked").css("display","block");
    	}else{
    		var allPrice=null;
			for (var i = 0; i <$(".car .Settlement .price").length; i++) {
				var p1 =  $(".car .Settlement .price")[i];
				var p2 = parseFloat($(p1).text())
				allPrice+=p2;
			}
			$(".car .submitIndent .money").text(parseInt(allPrice));
			$(".car .submitIndent a").css("background","#ea4529");
			$(".car .submitIndent div").css("display","block");
			$("#allChecked").css("display","none");
			$(".car .submitIndent a").text("立即结算");
    	}
    	show = !show;
		change = !change;
	})


})


.controller('buyCtrl',function($scope,$http,code){
	var url="http://app.360kad.com/Product/GetProductDetailByIdV2?productId="+code.num+"&kclientid=9927c929fc6721bad20ffd79300237d3&gtclientid=3a60303ea34f618cae17a9a4ae562a0c&utm_medium=Android&utm_source=yingyongbao&versionno=119&versionname=3.8.5&kzone=0"
	console.log(code.num)
	
	 //平台、设备和操作系统
    var system ={
        win : false,
        mac : false,
        xll : false
    };
    //检测平台
    var p = navigator.platform;
    console.log(p)
    system.win = p.indexOf("Win") == 0;
    system.mac = p.indexOf("Mac") == 0;
    system.x11 = (p == "X11") || (p.indexOf("Linux") == 0);
    //跳转语句
    if(system.win||system.mac||system.xll){//转向电脑json
        $http.get("datas/buyCar.json").success(function(data){
        	addJson(data)
        })
    }else{
        $http.get(url).success(function(data){
        	addJson(data)
        })
    }
    

	
	function  addJson(res){
		console.log(res.Data.PicList);
		$scope.navImg = res.Data.PicList;
		$scope.title = res.Data.TitleInfo.Title;
		$scope.adv=res.Data.TitleInfo.Adv;
		$scope.ProducerName=res.Data.TitleInfo.ProducerName;
		$scope.StockStatus=res.Data.TitleInfo.StockStatus;
		
		//价格json
		$scope.price=res.Data.PriceInfo.StyleInfo.Price;
		$scope.OriginalPrice=res.Data.PriceInfo.StyleInfo.OriginalPrice;
		$scope.SaveDesc=res.Data.PriceInfo.StyleInfo.SaveDesc
		//商品认证
		$scope.brand=res.Data.Promises;
		//套餐
		$scope.Packages=res.Data.Packages;
		$scope.mainItems=[];
		
		//tap切换
		$scope.btnLi=function(){
			
			$(".btnLi").on("touchstart",function(){
				console.log($(".main").eq($(this).index()+1).css("display"))
				if($(".main").eq($(this).index()+1).css("display")=="block"){
					return;
				}
				$(".btnLi").css({
					background:"#fff"
				})
				$(this).css({
					background:"#499ef5"
				})
				for(var i=1;i<$(".main").length;i++){
					$(".main").eq(i).hide(0)
				}
				$(this).index()
				$(".main").eq($(this).index()+1).show(0);
			})
		}
		console.log($scope.mainItems)
		
		
	};
	//广告轮播图
	var swiper = new Swiper('.nav .swiper-container', {
        pagination: '.swiper-pagination',
        paginationClickable: true,
        autoplay: 1000,//可选选项，自动滑动
        loop:true,
        observer:true,
        autoplayDisableOnInteraction : false
    });
    
    $scope.add=function(){
    	$scope.number++;
    	if($scope.number>1){
    		$scope.isbtn=false;
    		$scope.myColor={"color":"#6c6c6c"}
    	}
    };
    $scope.minus=function(){
    	$scope.number--;
    	if($scope.number==1){
    		$scope.isbtn=true;
    		$scope.myColor={"color":"#ccc"}
    	}
    	
    };
    
    //广告显示 切换
    
     var swiper = new Swiper('.footerNav .swiper-container', {
        pagination: '.swiper-pagination',
        slidesPerView: 5,
        paginationClickable: true,
        spaceBetween: 30,
         autoplay: 1000,//可选选项，自动滑动
        loop:true,
        observer:true,
        autoplayDisableOnInteraction : false
    });
   
    //
    $("#btnShow").on("touchstart",function(){
    	
    	$("#imgtext").animate({
    		"left":0
    	},200,"linear");
    });
     $("#btnHidden").on("touchstart",function(){
    	$("#imgtext").animate({
    		"left":"12rem"
    	},200,"linear")
    })
    
    $("body").scrollTop(0);
   
    

})

.controller('mineCtrl',function($scope){
//	$css.add('css/reset.css');
//	$css.add('css/iconfont.css');
//	$css.add('css/mine.css');
	
	window.onscroll=function(e){
		var scroll = $(document).scrollTop();
		$('.mine_shezhi span').css({display:"none"})
	if(scroll<100){
			$('.mine_shezhi span').hide();
		}else if(scroll >100){
			$('.mine_shezhi span').show();
		}
	}

	
	
})
//郑炎------
.controller('VipCtrl',function($scope){
    $scope.myVar2 = false;
   	 	$scope.dis = function() {
        $scope.myVar2 = !$scope.myVar2;
        console.log($)
       
    }
   	 	

})

	
.controller('apparatusCtrl',function($scope,$http){
    $http.get("./datas/1.json").success(function(res){
    	console.log(res.Data.list);
    	console.log(res.Data.navList);
    	console.log(res.Data.sata);
    	console.log(res.Data.lunbo);
    	$scope.data = res.Data.list;
    	$scope.data2 = res.Data.navList;
    	$scope.data3 = res.Data.sata;
    	$scope.data4 = res.Data.lunbo;
    })
    var swiper = new Swiper('.swiper-container2', {
        pagination: '.swiper-pagination',
        slidesPerView:4,
        paginationClickable: true,
        spaceBetween: 30,
        freeMode: true,
        observer:true,
    });
    //图片轮播
	var mySwiper = new Swiper ('.swiper-container1', {
    direction: 'horizontal',
    loop: true,
    autoplay:2000,
    // 如果需要分页器
    pagination: '.swiper-pagination',
    
    // 如果需要前进后退按钮
    nextButton: '.swiper-button-next',
    prevButton: '.swiper-button-prev',
    
    // 如果需要滚动条
    scrollbar: '.swiper-scrollbar',
  })        

		$scope.myVar2 = false;
   	 	$scope.dis = function() {
        $scope.myVar2 = !$scope.myVar2;
        console.log($)
       
    }
		//事件委托文字轮动添加下划线
	
//		$(".swiper-container").on("click",function(){
//			$(this).css("background","red")
//		})
})


.controller('ShareCtrl',function($scope){
	
		//: var tat=angular.element(document.getElementById("XXX"));
                    //tat.removeAttr("readonly");//移除掉readonly这个属性
 
		//活动说明点击事件

   		$scope.myVar = false;
   	 	$scope.toggle = function() {
        $scope.myVar = true;
        console.log($)
       
    }
   	 	
   	 	//myX点击事件
   	 	$scope.toggleX = function(){
   	 		$scope.myVar = false;
   	 	}
		
		//轮动文字点击事件
		
		$scope.myVar2 = false;
   	 	$scope.dis = function() {
        $scope.myVar2 = !$scope.myVar2;
        console.log($)
       
    }
		//文字滚动效果
		
		
		
})



//黄-------
.controller('interestCtrl',function($scope){
	

	
		$(".oli_1").on("touchstart",function(){
			
	  		
          if($(this).find("img").css("display")=="none"){
          	
             //$(".oli_1").css("border","1px solid transparent");
              $(this).find("img").css("display","block");
          }else{
               $(this).find("img").css("display","none");
          }
        
      })
	  	
	  	
	  	
	  	
})

.controller('dianzanCtrl',function($scope){
  
	//tab切换
	var btns = document.querySelectorAll('.dianzan_a a');
	var divs = document.querySelectorAll('#dianzan_wrap>div');
		show(0);
		
		function show(num){
			for (var i = 0; i < divs.length; i++) {
				if (i == num) {
					divs[i].style.display = 'block';
				}else{
					divs[i].style.display = 'none';
				}
			}
		}
		for (var i = 0; i < btns.length; i++) {
			(function(j){
				btns[j].onclick = function(){
					show(j);
				}
			})(i);
		}
 	
 	
})

.controller('ganmaoCtrl',function($scope,$http){
	
          $http.get('./datas/ganmaofashao.json').success(function(res){
             $scope.data = res.Data;
             console.log($scope.data);
         });
    
 
});
//----小龙
app.controller('skillCtrl',['$scope','$http',function($scope,$http){
    
    
   //轮播图
   var mySwiper = new Swiper('.swiper-container',{
			autoplay:1500,
			pagination :'.swiper-pagination',
			paginationClickable :true,
			observer:true
    });
    
    //点击事件
    $scope.a = 'white';
    $scope.b = '#06a6f8';
    var bg = true;
    $scope.bg=false;
    $scope.bg=function() {$scope.a='true';}
    $('#home_time_left').on("touchstart",function(e){
    	$(this).css({
    		background:'#06a6f8'	
    	})
    	$('#home_time_right').css({
    		background:'white'
    	});
    	$('.sanjiao').css({'left':-3+'rem'});

    		//列表解析
	    $http.get('datas/home_seckill.json').success(
	    	function(res){
	    		console.log(res.SeckillWares);
	    		$scope.arrAll = res.SeckillWares;
	    		$scope.imges = res.SeckillWares.Pic180
	  		 	$scope.Discount = res.SeckillWares.Discount
	    		$scope.SeckillPrice = res.SeckillWares.SeckillPrice
	    		$scope.WareCode = res.SeckillWares.WareCode
	    		$scope.Price = res.SeckillWares.Price
	    	}
	    )
    	
    });
     $('#home_time_right').on('touchstart',function(e){
    	$(this).css({
    		background:'#06a6f8'	
    	})
    	$('.sanjiao2').css({'dispaly':'block'});
    	$('#home_time_left').css({
    		background:'white'
    	});
    	$('.sanjiao').css({'left':3+'rem'});
		$http.get('datas/home_seckill-2.json').success(
	    	function(res2){
	    		$scope.arrAll = res2.data;
	    		$scope.imges = res2.data.Pic180
	  		 	$scope.Discount = res2.data.Discount
	    		$scope.SeckillPrice = res2.data.SeckillPrice
	    		$scope.WareCode = res2.data.WareCode
	    		$scope.Price = res2.data.Price
	    	}
	    )
    })
 
    //倒计时
    setInterval(function(){
    	var endTime = new Date(2016,9,27);
    	var mydata = new Date();
//  	console.log(endTime);
    	var t = endTime.getTime() - mydata.getTime();
    	var hour = parseInt(t/1000/60/60%24)
    	console.log(hour)
    	var fen = parseInt(t/1000/60%60)
    	var sec = parseInt(t/1000%60)
    	var h = document.getElementById("time_h");
    	var m = document.getElementById("time_m");
    	var s = document.getElementById("time_s");
    	h.innerHTML = toDoubleNum(hour);
    	m.innerHTML = toDoubleNum(fen);
    	s.innerHTML = toDoubleNum(sec);
    	function toDoubleNum(num){
	         return num<10?"0"+num:num;
        }

    	
    },1000)
    
	//列表解析
    $http.get('datas/home_seckill.json').success(
    	function(res){
    		console.log(res.SeckillWares);
    		$scope.arrAll = res.SeckillWares;
    		$scope.imges = res.SeckillWares.Pic180
  		 	$scope.Discount = res.SeckillWares.Discount
    		$scope.SeckillPrice = res.SeckillWares.SeckillPrice
    		$scope.WareCode = res.SeckillWares.WareCode
    		$scope.Price = res.SeckillWares.Price
    	}
    )
}]);


//==========================
app.controller('zhuceCtrl',['$scope',function($scope){
	 $scope.name = 'zhuce'
	 
}]);



//===============================
app.controller('loginzCtrl',['$scope',function($scope){
	
	 var reg = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
	 $scope.user = 'kad';
    
}])

app.controller('searchCtrl',['$scope',function($scope){
   
   
    var a,b,c,d,e,f,g,h= true
    $scope.toggle1 =function(){
    	$scope.a = !$scope.a
    }
    $scope.toggle2 =function(){
    	$scope.b = !$scope.b
    }
    $scope.toggle3 =function(){
    	$scope.c = !$scope.c
    }
    $scope.toggle4 =function(){
    	$scope.d = !$scope.d
    }
     $scope.toggle5 =function(){
    	$scope.e = !$scope.e
    }
    $scope.toggle6 =function(){
    	$scope.f = !$scope.f
    }
    $scope.toggle7 =function(){
    	$scope.g = !$scope.g
    }
    $scope.toggle8 =function(){
    	$scope.h = !$scope.h
    }
    
   
}])
//。。。。。。。。。。。