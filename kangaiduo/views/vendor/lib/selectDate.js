/**
 * Created by helang.love@qq.com on 2018/3/11.
 */

$.extend({
    selectDate: function(g, a, k) {
        var d, e, b;
        b = new Date;
        !a.start || !a.end || a.end < a.start ? (d = b.getFullYear() - 60, e = b.getFullYear()) : (d = a.start, e = a.end);
        b = a.select && 3 == a.select.length ? [a.select[0] - d, a.select[1] - 1, a.select[2] - 1] : [e - d, b.getMonth(), b.getDate() - 1];
        new MobileSelect({
            trigger: g,
            title: a.title || "",
            wheels: function(a, b) {
                for (var d = [{
                        data: []
                    }]; a <= b; a++) {
                    for (var e = {
                            id: a,
                            value: a + "\u5e74",
                            childs: []
                        }, c = 1; 12 >= c; c++) {
                        for (var h = [], g = 1 == c || 3 == c || 5 == c || 7 == c || 8 == c || 10 == c || 12 == c ? 31 : 2 == c ? 0 == a % 4 && 0 != a % 100 ? 29 : 0 == a % 400 ? 29 : 28 : 30, f = 1; f <= g; f++) 
                        	h.push({id: f,value: f<10 ? "0"+f + "\u65e5"  : f + "\u65e5"});
                            e.childs.push({id: c,value: c<10? "0"+c+ "\u6708"  : c + "\u6708",childs: h })
                    }
                    d[0].data.push(e)
                }
                return d
            }(d, e),
            position: b,
            callback: function(a, b) {
                k({
                    year: b[0].id,
                    month: b[1].id,
                    day: b[2].id
                })
            }
        })
    }
});