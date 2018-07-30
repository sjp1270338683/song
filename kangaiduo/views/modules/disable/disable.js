
    // 禁用F12
    document.onkeydown = function(e) {
		var theEvent = window.event || e;
		if (theEvent.keyCode == 123) {
			theEvent.keyCode = 0;
			theEvent.returnValue = false;
			return false
		}
    };
    // 屏蔽右键
    document.oncontextmenu = function() {
        return false;
    };
    // 屏蔽选中-
    document.onselectstart = function() {
        return false;
    };
