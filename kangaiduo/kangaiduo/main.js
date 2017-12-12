require.config({
	paths:{
		
		"app":"./app",
		"controller":"./controller/controller"
	}
})

require(["app","controller"],function(app,controller){
	alert("")
})
