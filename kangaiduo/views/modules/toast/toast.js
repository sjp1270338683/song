toast= {
    setToast: function(msg, timeType) {
        var time;
        if(timeType == 'two'){
            time = 2000
        }else if(timeType == 'three'){
            time = 3000
        }else if(timeType == 'five'){
            time = 5000
        }else{
            time = timeType;
        }
        if(msg){
              $('#m-TopTip').text(msg).show();
            setTimeout(function() {
              $('#m-TopTip').hide();
            }, time || 1000)
        }
    },
    clearToast:function(){
        $('#m-TopTip').hide();
    }
};