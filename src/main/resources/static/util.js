function calculateCorrelation(x, y) {
    var sumX = 0;
    var sumXSquare = 0;
    var sumYSquare = 0;
    var sumY = 0;
    var sumXY = 0;
    for (var i = 0, length = x.length; i < length; i++) {
        sumX += x[i];
        sumY += y[i];
        sumXSquare += Math.pow(x[i], 2);
        sumYSquare += Math.pow(y[i], 2);
        sumXY += x[i] * y[i];
    }
    var num = sumXY - (sumX * sumY / length);
    var den = Math.sqrt((sumXSquare - Math.pow(sumX, 2) / length) *
        (sumYSquare - Math.pow(sumY, 2) / length));
    if (den === 0.0) {
        return 0.0;
    } else {
        return num / den;
    }
}

function arrayRemove(arr, value) {

    return arr.filter(function(ele){
        return ele !== value;
    });

}

Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}