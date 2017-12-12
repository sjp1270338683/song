Vue.component("v-header",{
			template:"#header",
			data(){
				return{
					xian:false,
					names:[]
				}
			},
			methods:{
				san(){
					this.xian = false
					$("html").css("overflow","initial")
				},
				wuge(){
					this.xian = true
					$("html").css("overflow","hidden")
				}
			},
			created(){
				this.$http.get("data.json").then(function(res){ 
					this.names = JSON.parse(res.data)
				})
				setTimeout(function(){
					new IScroll(".p",{
						scrollX:true
					})
				},0)
			}
			
		})
		Vue.component("v-wu",{
			template:"#wu",
			data(){
				return{
					xian:false
				}
			},
			methods:{
				dian(){
					this.xian = false
				}
			}
		})
		Vue.component("v-nav",{

			template:"#nav"
		})
		Vue.component("a-left",{
			template:"#aa",
			data(){
				return{
					names:[]
				}
			},
			created(){
				this.$http.get("data.json").then(function(res){
					this.names = JSON.parse(res.data).seller.lu
				})
			}
		})
		Vue.component("a-right",{
			template:"#bb"
		})
		var a = Vue.extend({
			template:"#a"
		})
		var b = Vue.extend({
			template:"<div>评价</div>"
		})
		var c = Vue.extend({
			template:"#c",
			data(){
				return{
					names:[]
				}
			},
			created(){
				this.$http.get("data.json").then(function(res){ 
					this.names = JSON.parse(res.data)
				})
			}
		})
		var bbb = Vue.extend({
			template:"#bbb",
			data(){
				return{
					names:"",
					yin:false,
					shu:false
				}
			},
			created(){
				this.$http.get("data.json").then(function(res){
					this.names = JSON.parse(res.data)
				})
			},
			methods:{
				add(id){
					var s
					for (var i in this.names.goods1[0].dan) {
						s = this.names.goods1[0].dan[i]
						if (this.names.goods1[0].dan[i].id == id) {
							this.names.goods1[0].dan[i].count++
							var s = s
							var a = s.count*s.price
							localStorage.setItem(id,a)
						}
					}
				},
				jian(id){
					var s
					for (var i in this.names.goods1[0].dan) {
						s = this.names.goods1[0].dan[i]
						if (this.names.goods1[0].dan[i].id == id) {
							this.names.goods1[0].dan[i].count--
							var s = s
							var a = s.count*s.price
							localStorage.setItem(id,a)
						}
					}
				}
			},
			computed:{
				
			}
		})
		var aaa = Vue.extend({
			template:"<div>热销榜</div>"
		})
		var ccc = Vue.extend({
			template:"<div>特色粥品</div>"
		})
		var ddd = Vue.extend({
			template:"<div>精选热菜</div>"
		})
		var footer = {
			template:"#footers"
		}
		var eee = Vue.extend({
			template:"<div>爽口凉菜</div>"
		})
		var router = new VueRouter({
			routes:[
				{
					path:"/footer",
					component:footer
				},
				{
					path:"/a",
					component:a,
					children:[
						{
							path:"/a/bb",
							component:bbb
						},
						{
							path:"/a/",
							component:bbb
						},
						{
							path:"/a/aa",
							component:aaa
						},
						{
							path:"/a/cc",
							component:ccc
						},
						{
							path:"/a/dd",
							component:ddd
						},
						{
							path:"/a/ee",
							component:eee
						}
					]
				},
				{
					path:"/",
					component:a,
					children:[
						{
							path:"//",
							component:bbb
						}
					]
				},
				{
					path:"/b",
					component:b
				},
				{
					path:"/c",
					component:c
				}
			]
		})
		var vue = new Vue({
			el:"#app",
			router:router,
			data:{
				xian:false,
				names:[],
				s:0
			},
			created(){
				this.$http.get("data.json").then(function(res){
					this.names = JSON.parse(res.data)
					console.log(this.names)
				})
				for (var i = 0; i<localStorage.length;i++) {
					var k = localStorage.key(i)
					var ss = localStorage.getItem(k)
					this.s = ss
				}
			},
			methods:{
			},
			computed:{
				
			}
		})