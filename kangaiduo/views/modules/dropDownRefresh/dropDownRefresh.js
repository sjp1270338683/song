	var myScroll,
		pullDownEl, 
		pullDownOffset,
		pullUpOffset,
		generatedCount = 0;
	function pullDownAction () {
		var dropDownRefresh = uap.locStorage.getVal("dropDownRefresh");
		var index = uap.locStorage.getVal('search_index');//搜索页面---招聘单位；
		var bullet_type =  uap.locStorage.getVal('bullet_type');//搜索页面---招聘单位；
		if(dropDownRefresh=="com_bulletin"){
			setTimeout(function () {	
				getComyAument(1);
				myScroll.refresh();
			}, 1000);
		}else if(dropDownRefresh=="recr_bulletin"){
			setTimeout(function () {	
				getRecrAument(2);
				myScroll.refresh();
			}, 1000);
		}else if(dropDownRefresh=="adjust_bulletin"){
			setTimeout(function () {	
				getJustAument(3);
				myScroll.refresh();
			}, 1000);
		}else if(dropDownRefresh=="recr_dynas"){
			setTimeout(function () {	
				getDynaAument(4);
				myScroll.refresh();
			}, 1000);
		}else if(dropDownRefresh=="searchList"){
			setTimeout(function () {	
				BullSearchList(1);
				myScroll.refresh();
			}, 1000);
		}else if(dropDownRefresh=="searchList_Unit_List"){
			setTimeout(function () {	
				myScroll.refresh();
				if(index){
				    unitListMethod.getListData0(1,true);
				}else{
				    if(!bullet_type){
				        unitListMethod.getListData1();
				    }else{
				        unitListMethod.getListData2();
				    }
				}
			}, 1000);
		}else if(dropDownRefresh=="adjustApplyFor"){//调剂申请
			setTimeout(function () {	
				jobSearchMethod.init();
				myScroll.refresh();
			}, 1000);
		}else if(dropDownRefresh=="jobApplicantion"){//工作申请
			setTimeout(function () {	
				jobPostMethod.init();
				myScroll.refresh();
			}, 1000);
		}else if(dropDownRefresh=="followsCompany"){//关注公司
			setTimeout(function () {	
				jobConcMethod.init();
				myScroll.refresh();
			}, 1000);
		}else if(dropDownRefresh=="searchJobs"){//搜索职位
			setTimeout(function () {	
				jobSearchMethod.init();
				myScroll.refresh();
			}, 1000);
		}
	}
	function loaded() {
		pullDownEl = document.getElementById('pullDown');
		thelist  = document.getElementById("thelist");
		pullDownOffset = pullDownEl.offsetHeight;
		pullUpOffset = 10;
		myScroll = new iScroll('wrapper', {
			useTransition: true,
			topOffset: pullDownOffset,
			onRefresh: function () {
				if (pullDownEl.className.match('loading')) {
					pullDownEl.className = '';
					pullDownEl.querySelector('.pullDownLabel').innerHTML = '下拉刷新...';}
			},
			onScrollMove: function () {
				$("#pullDown").css("display","block");
				if (this.y > 0) {
					pullDownEl.className = 'flip';
					pullDownEl.querySelector('.pullDownLabel').innerHTML = '松手更新...';
					this.minScrollY = 0;
				}
				if (this.y < 0) {
					this.minScrollY = this.y;
					thelistH = thelist.offsetHeight
					if(this.minScrollY < -(thelistH-1100)){
						this.minScrollY = 0;
						$("#pullDown").css("display","none");
					}
				}
				if (this.y < 0 && pullDownEl.className.match('flip')) {
					pullDownEl.className = '';
					pullDownEl.querySelector('.pullDownLabel').innerHTML = '下拉刷新...';
					this.minScrollY = -pullDownOffset;
				}
			},
			onScrollEnd: function () {
				if (pullDownEl.className.match('flip')) {
					pullDownEl.className = 'loading';
					pullDownEl.querySelector('.pullDownLabel').innerHTML = '加载中...';				
					pullDownAction();	// Execute custom function (ajax call?)
					setTimeout(function(){
						$("#pullDown").css("display","none");
					},1000)
				} 
			}
		});
	}
	document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
	document.addEventListener('DOMContentLoaded', function () { setTimeout(loaded, 200); }, false);
