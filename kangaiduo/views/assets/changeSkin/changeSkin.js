(function(){

    
     var state='1';
     if(state=='1'){
    	 //changeSkin();
     }
    
    // 只有两种皮肤 一种默认绿色，一种下述蓝色；如皮肤种类增加，changeSkin中变量应相应增加种类
    function changeSkin(){
          //blue
          // 换肤操作
          var mainColor1 = '#2AAAE7'; //正常颜色效果
       
           /*上线*/
          var backgroundUrl   = 'static/iconsBlue.png';//精灵图url
          var backgroundLogo  = 'static/logoBlue.png';//logo图url

        
  
        var styles ='';
        styles  +='.bc-head{background-color:'+mainColor1+'!important}' //头部的背景
                +'.login_button{background:'+mainColor1+'!important}'  //登录注册按钮
                +'.listview_tip{color:'+mainColor1+'!important}'  //首页提示
                +'input[type="radio"]:checked + div>div.act-col{color:'+mainColor1+'!important}'  //首页提示
                +'.checkbox input[type=checkbox]:checked:before{color:'+mainColor1+'!important}'  //注册页的checkbox
                +'.tabBox .active{color:'+mainColor1+'!important}'//公司公告tab--li选中文字
                
                ;
                var styleSheet = $('<style>'+styles+'</style>');
                styleSheet.insertBefore('body');



    }
        
}());