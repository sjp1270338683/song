var myscroll_unitList;
//由unitList.js调用
function scrollWrapperInit() {
	myscroll_unitList.destroy();
	loaded_unitList();
	myscroll_unitList.scrollTo(0, 0, 0, false);
};
function loaded_unitList() {
	myscroll_unitList = new iScroll('wrapper_unitList', {
		bounce: false,
		useTransition: true,
		vScroll: true,
		checkDOMChanges: true,
		onScrollMove: function(e) {
			console.log(e.x);
		}
	});
}
//document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
document.addEventListener('DOMContentLoaded', function () {
	setTimeout(loaded_unitList, 200);
}, false);
document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
