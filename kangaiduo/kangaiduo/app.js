var app= angular.module('myApp',['ngRoute','me-lazyload'])
    .config(['$routeProvider', function($routeProvider){
        $routeProvider
            .when('/home',{
                templateUrl:'./views/home.html',
                controller:'homeCtrl'
            })
            .when('/classify',{
                templateUrl:'./views/classify.html',
                controller:'classifyCtrl'
            })
            .when('/car',{
                templateUrl:'./views/car.html',
                controller:'carCtrl'
            })
            .when('/buy',{
                templateUrl:'./views/buy.html',
                controller:'buyCtrl'
            })
            //。。。黄
            .when('/mine',{
                templateUrl:'./views/mine.html',
                controller:'mineCtrl'
            })
            .when('/interest',{
                templateUrl:'./views/interest.html',
                controller:'interestCtrl'
            })
            .when('/dianzan',{
                templateUrl:'./views/dianzan.html',
                controller:'dianzanCtrl'
            })
            .when('/ganmao',{
                templateUrl:'./views/ganmao.html',
                controller:'ganmaoCtrl'
            })
            //郑炎--
            .when('/Vip',{
                templateUrl:'./views/Vip.html',
                controller:'VipCtrl'
            })
            .when('/apparatus',{
                templateUrl:'./views/apparatus.html',
                controller:'apparatusCtrl'
            })
            .when('/Share',{
                templateUrl:'./views/Share.html',
                controller:'ShareCtrl'
            })
            .when('/login',{
                templateUrl:'./views/login.html',
                controller:'loginCtrl'
            })
            .when('/skill',{
                templateUrl:'./views/skill.html',
                controller:'skillCtrl'
                
            })
            .when('/paw',{
                templateUrl:'./views/paw.html',
                controller:'pawCtrl'
            })
            .when('/login',{
                templateUrl:'./views/login.html',
                controller:'loginCtrl'
            })
             .when('/search',{
                templateUrl:'./views/search.html',
                controller:'searchCtrl'
            })
            .when('/zhuce',{
                templateUrl:'./views/zhuce.html',
                controller:'zhuceCtrl'
            })
            
            .otherwise({redirectTo:'/home'});
    }]);
    
    //依赖注入
   app.factory("code",function(){
   			return{
   				num:0
   			}
   })	
	
   //rem 设置
	

