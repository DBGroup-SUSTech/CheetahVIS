var xData1 = ['6-7', '7-8', '8-9', '9-10', '10-11', '11-12', '12-13', '13-14', '14-15', '15-16', '16-17', '17-18', '18-19', '19-20', '20-21', '21-22', '22-23', '23-24'];
var xData2 = ['6-6:30', '6:30-7', '7-7:30', '7:30-8', '8-8:30', '8:30-9', '9-9:30', '9:30-10', '10-10:30', '10:30-11', '11-11:30', '11:30-12', '12-12:30', '12:30-13', '13-13:30', '13:30-14', '14-14:30', '14:30-15', '15-15:30', '15:30-16', '16-16:30', '16:30-17', '17-17:30', '17:30-18', '18-18:30', '18:30-19', '19-19:30', '19:30-20', '20-20:30', '20:30-21', '21-21:30', '21:30-22', '22-22:30', '22:30-23', '23-23:30', '23:30-24'];
var xData3 = ['6-6:10', '6:10-6:20', '6:20-6:30', '6:30-6:40', '6:40-6:50', '6:50-7', '7-7:10', '7:10-7:20', '7:20-7:30', '7:30-7:40', '7:40-7:50', '7:50-8', '8-8:10', '8:10-8:20', '8:20-8:30', '8:30-8:40', '8:40-8:50', '8:50-9', '9-9:10', '9:10-9:20', '9:20-9:30', '9:30-9:40', '9:40-9:50', '9:50-10', '10-10:10', '10:10-10:20', '10:20-10:30', '10:30-10:40', '10:40-10:50', '10:50-11', '11-11:10', '11:10-11:20', '11:20-11:30', '11:30-11:40', '11:40-11:50', '11:50-12', '12-12:10', '12:10-12:20', '12:20-12:30', '12:30-12:40', '12:40-12:50', '12:50-13', '13-13:10', '13:10-13:20', '13:20-13:30', '13:30-13:40', '13:40-13:50', '13:50-14', '14-14:10', '14:10-14:20', '14:20-14:30', '14:30-14:40', '14:40-14:50', '14:50-15', '15-15:10', '15:10-15:20', '15:20-15:30', '15:30-15:40', '15:40-15:50', '15:50-16', '16-16:10', '16:10-16:20', '16:20-16:30', '16:30-16:40', '16:40-16:50', '16:50-17', '17-17:10', '17:10-17:20', '17:20-17:30', '17:30-17:40', '17:40-17:50', '17:50-18', '18-18:10', '18:10-18:20', '18:20-18:30', '18:30-18:40', '18:40-18:50', '18:50-19', '19-19:10', '19:10-19:20', '19:20-19:30', '19:30-19:40', '19:40-19:50', '19:50-20', '20-20:10', '20:10-20:20', '20:20-20:30', '20:30-20:40', '20:40-20:50', '20:50-21', '21-21:10', '21:10-21:20', '21:20-21:30', '21:30-21:40', '21:40-21:50', '21:50-22', '22-22:10', '22:10-22:20', '22:20-22:30', '22:30-22:40', '22:40-22:50', '22:50-23', '23-23:10', '23:10-23:20', '23:20-23:30', '23:30-23:40', '23:40-23:50', '23:50-24'];

var yData1 = ['0-20', '20-40', '40-60', '60-80'];
var yData2 = ['0-10', '10-20', '20-30', '30-40', '40-50', '50-60', '60-70', '70-80'];
var yData3 = ['0-5', '5-10', '10-15', '15-20', '20-25', '25-30', '30-35', '35-40', '40-45', '45-50', '50-55', '55-60', '60-65', '65-70', '70-75', '75-80'];

var clickTimeId;

function chartDisplay1(timestampList, ts, chart1Data, setColor, road = false) {
    var myChart = echarts.init(document.getElementById('rchart1_' + ts));
    var legendData = chart1Data['type'];
    var seriesData = constructChart1Data(myChart, chart1Data);
    option = {
        animation: false,
        tooltip: {
            trigger: 'item'
        },
        legend: {
            y: 'bottom',
            data: legendData,
            show: false
        },
        grid: {
            left: '8%',
            right: '15%',
            bottom: '0%',
            containLabel: true
        },
        xdata: {
            'chartData': chart1Data,
            'chartNum': '1',
            'road': road,
            'seriesData1': seriesData,
        },
        yAxis: {
            name: 'Amount',
            type: 'value'
        },
        xAxis: {
            type: 'category',
            name: 'Time',
            data: xData1,
            animation: false
        },
        dataZoom: [{
            type: 'inside',
            animation: false
        }, {
            type: 'slider',
            top: '0%',
            height: '5%',
            handleSize: '80%',
            animation: false
        }, {
            type: 'slider',
            yAxisIndex: 0,
            width: '5%',
            bottom: '10%',
            left: "1%"
        }],
        series: seriesData,
        color: setColor.length !== 0 ? setColor : ['#c23531','#2f4554', '#61a0a8', '#d48265', '#91c7ae','#749f83',  '#ca8622', '#bda29a','#6e7074', '#546570', '#c4ccd3']
    };
    myChartEventBinding(timestampList, myChart, option);
}

function constructChart1Data(myChart, chart1Data) {
    if (!chart1Data) {
        chart1Data = myChart.getOption().xdata['chartData'];
    }
    var legendData = chart1Data['type'];
    var seriesData = [];
    var zoom, j, x, thisData;
    if (myChart.getOption()) {
        zoom = myChart.getOption().dataZoom[0];
    }
    if (zoom) {
        var end = zoom['end'];
        var start = zoom['start'];
    }
    for (var i = 0; i < legendData.length; i++) {
        seriesData[i] = {};
        seriesData[i]['name'] = legendData[i];
        seriesData[i]['type'] = 'bar';
        seriesData[i]['stack'] = 'Total';
        seriesData[i]['data'] = [];
        if (!zoom || end - start >= 50) {
            for (j = 6; j < 24; j++) {
                if (!chart1Data[j] || !chart1Data[j][seriesData[i]['name']]) {
                    seriesData[i]['data'].push(0);
                } else {
                    thisData = chart1Data[j][seriesData[i]['name']];
                    seriesData[i]['data'].push(thisData);
                }
            }
        } else if (end - start < 17) {
            for (j = 6; j < 24; j++) {
                for (x = 0; x < 6; x++) {
                    if (!chart1Data[j + '_' + x] || !chart1Data[j + '_' + x][seriesData[i]['name']]) {
                        seriesData[i]['data'].push(0);
                    } else {
                        thisData = chart1Data[j + '_' + x][seriesData[i]['name']];
                        seriesData[i]['data'].push(thisData);
                    }
                }
            }
        } else {
            for (j = 6; j < 24; j++) {
                if (!chart1Data[j + '.1'] || !chart1Data[j + '.1'][seriesData[i]['name']]) {
                    seriesData[i]['data'].push(0);
                } else {
                    thisData = chart1Data[j + +'.1'][seriesData[i]['name']];
                    seriesData[i]['data'].push(thisData);
                }
                if (!chart1Data[j + '.5'] || !chart1Data[j + '.5'][seriesData[i]['name']]) {
                    seriesData[i]['data'].push(0);
                } else {
                    thisData = chart1Data[j + '.5'][seriesData[i]['name']];
                    seriesData[i]['data'].push(thisData);
                }
            }

        }
    }
    return seriesData;
}

function chartDisplay2(timestampList, ts, chart2Data, road = false) {
    var myChart = echarts.init(document.getElementById('rchart2_' + ts));
    var hours = ['0-20', '20-40', '40-60', '60-80'];
    var returnJson = constructChart2Data(myChart, chart2Data);
    var data = returnJson['data'];
    var mx = returnJson['mx'];

    option = {
        animation: false,
        tooltip: {
            position: 'top'
        },
        grid: {
            top: '15%',
            left: '10%',
            right: '15%',
            bottom: '0%',
            containLabel: true
        },
        xAxis: {
            name: 'Time',
            type: 'category',
            data: xData1,
            splitArea: {
                show: true
            }
        },
        yAxis: {
            name: 'Average Speed (km/h)',
            type: 'category',
            data: hours,
            splitArea: {
                show: true
            }
        },
        xdata: {
            'chartData': chart2Data,
            'chartNum': '2',
            'road': road,
            'seriesData1_1': returnJson
        },
        dataZoom: [{
            type: 'inside'
        }, {
            type: 'slider',
            show: false
        }, {
            type: 'slider',
            show: false
        }, {
            type: 'slider',
            yAxisIndex: 0,
            width: '5%',
            bottom: '10%',
            left: "3%",
            top: '17%',
            marker: true
        }],
        visualMap: {
            min: 0,
            max: mx,
            calculable: true,
            show: false
        },
        series: [{
            type: 'heatmap',
            data: data,
            label: {
                normal: {
                    show: false
                }
            },
            itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }]
    };
    myChartEventBinding(timestampList, myChart, option);
}

function constructChart2Data(myChart, chart2Data) {

    var data = [];
    var mx = 0;
    var zoom, zoom1, zoom1Val, thisData, i, j, k, x;
    if (!chart2Data) {
        chart2Data = myChart.getOption().xdata['chartData'];
    }
    if (myChart.getOption()) {
        zoom = myChart.getOption().dataZoom[0];
        zoom1 = myChart.getOption().dataZoom[3];
    }
    if (zoom) {
        var end = zoom['end'];
        var start = zoom['start'];
    }
    if (zoom1) {
        var end1 = zoom1['end'];
        var start1 = zoom1['start'];
    }
    if (!zoom1 || end1 - start1 >= 50) {
        zoom1Val = 4;
    } else if (end1 - start1 < 17) {
        zoom1Val = 16;
    } else {
        zoom1Val = 8;
    }
    if (!zoom || end - start >= 50) {
        for (i = 0; i < 18; i++) {
            for (j = 0; j < zoom1Val; j++) {
                var sum = 0;
                for (k = 0; k < 16 / zoom1Val; k++) {
                    if (!chart2Data[i + 6]) {
                        sum += 0;
                    } else if (!chart2Data[i + 6][(j * (16 / zoom1Val)) + k]) {
                        sum += 0;
                    } else {
                        sum += chart2Data[i + 6][(j * (16 / zoom1Val)) + k];

                    }
                }
                data.push([j, i, sum]);
                mx = Math.max(mx, sum);
            }
        }
    } else if (end - start < 17) {
        for (i = 0; i < 18; i++) {
            for (x = 0; x < 6; x++) {
                for (j = 0; j < zoom1Val; j++) {
                    var sum = 0;
                    for (k = 0; k < 16 / zoom1Val; k++) {
                        if (!chart2Data[(i + 6) + '_' + x]) {
                            sum += 0;
                        } else if (!chart2Data[(i + 6) + '_' + x][(j * (16 / zoom1Val)) + k]) {
                            sum += 0;
                        } else {
                            sum += chart2Data[(i + 6) + '_' + x][(j * (16 / zoom1Val)) + k];
                        }
                    }
                    data.push([j, i * 6 + x, sum]);
                    mx = Math.max(mx, sum);
                }
            }
        }
    } else {
        for (i = 0; i < 18; i++) {
            for (j = 0; j < zoom1Val; j++) {
                var sum1 = 0;
                for (k = 0; k < 16 / zoom1Val; k++) {
                    if (!chart2Data[(i + 6) + '.1']) {
                        sum1 += 0;
                    } else if (!chart2Data[(i + 6) + '.1'][(j * (16 / zoom1Val)) + k]) {
                        sum1 += 0;
                    } else {
                        sum1 += chart2Data[(i + 6) + '.1'][(j * (16 / zoom1Val)) + k];
                    }
                }
                data.push([j, i * 2, sum1]);
                mx = Math.max(mx, sum1);
                var sum2 = 0;
                for (k = 0; k < 16 / zoom1Val; k++) {
                    if (!chart2Data[(i + 6) + '.5']) {
                        sum2 += 0;
                    } else if (!chart2Data[(i + 6) + '.5'][(j * (16 / zoom1Val)) + k]) {
                        sum2 += 0;
                    } else {
                        sum2 += chart2Data[(i + 6) + '.5'][(j * (16 / zoom1Val)) + k];
                    }
                }
                data.push([j, i * 2 + 1, sum2]);
                mx = Math.max(mx, sum2);
            }
        }
    }
    data = data.map(function (item) {
        return [item[1], item[0], item[2] || '-'];
    });
    return {
        data: data,
        mx: mx
    };
}

function chartDisplay3(timestampList, ts, chart3Data, road = false) {
    var myChart = echarts.init(document.getElementById('rchart3_' + ts));
    var res = constructChart3Data(myChart, chart3Data);
    var posData = res['posData'];
    var negData = res['negData'];
    option = {
        animation: false,
        title: {
            text: 'pretext',
            show: false
        },
        xdata: {
            'chartData': chart3Data,
            'chartNum': '3',
            'seriesData1': res,
            'road': road,
            'currentStatus': 1
        },
        tooltip: {
            trigger: 'item',
            position: [80, 50]
        },
        legend: {
            y: 'bottom',
            data: ['Forward', 'Backward']
        },
        grid: {
            top: '15%',
            left: '8%',
            right: '15%',
            bottom: '20%',
            containLabel: true
        },
        dataZoom: [{
            type: 'inside'
        }, {
            type: 'slider',
            show: false
        }, {
            type: 'slider',
            yAxisIndex: 0,
            width: '5%',
            top: '12%',
            bottom: '30%',
            left: "1%"
        }],
        xAxis: {
            name: 'Time',
            type: 'category',
            boundaryGap: false,
            data: xData1
        },
        yAxis: {
            name: 'Amount',
            type: 'value'
        },
        series: [
            {
                name: 'Forward',
                type: 'line',
                stack: 'Total1',
                data: posData
            },
            {
                name: 'Backward',
                type: 'line',
                stack: 'Total2',
                data: negData
            }
        ]
    };
    option.tooltip.formatter = function (data) {
        var option = myChart.getOption();
        return data.seriesName + "<br/>" + '<span style="display:inline-block;margin-right:5px;' +
            'border-radius:10px;width:9px;height:9px;background-color:' + data.color + '"></span>' +
            data.name + " : " + data.value + "</br>" + option['xdata']['seriesData' + option['xdata']['currentStatus']]['correlation'];
    };
    myChartEventBinding(timestampList, myChart, option);
}

function constructChart3Data(myChart, chart3Data) {
    var posData = [];
    var negData = [];
    var zoom, j, x;
    if (!chart3Data) {
        chart3Data = myChart.getOption().xdata['chartData'];
    }
    if (myChart.getOption()) {
        zoom = myChart.getOption().dataZoom[0];
    }
    if (zoom) {
        var end = zoom['end'];
        var start = zoom['start'];
    }
    if (!zoom || end - start >= 50) {
        for (j = 6; j < 24; j++) {
            if (!chart3Data[j]) {
                posData.push(0);
                negData.push(0);
            } else {
                if (!chart3Data[j]['0']) {
                    posData.push(0);
                } else {
                    posData.push(chart3Data[j]['0']);
                }
                if (!chart3Data[j]['1']) {
                    negData.push(0);
                } else {
                    negData.push(chart3Data[j]['1']);
                }

            }
        }
    } else if (end - start < 17) {
        for (j = 6; j < 24; j++) {
            for (x = 0; x < 6; x++) {
                if (!chart3Data[j + '_' + x]) {
                    posData.push(0);
                    negData.push(0);
                } else {
                    if (!chart3Data[j + '_' + x]['0']) {
                        posData.push(0);
                    } else {
                        posData.push(chart3Data[j + '_' + x]['0']);
                    }
                    if (!chart3Data[j + '_' + x]['1']) {
                        negData.push(0);
                    } else {
                        negData.push(chart3Data[j + '_' + x]['1']);
                    }

                }
            }
        }

    } else {
        for (j = 6; j < 24; j++) {
            if (!chart3Data[j + '.1']) {
                posData.push(0);
                negData.push(0);
            } else {
                if (!chart3Data[j + '.1']['0']) {
                    posData.push(0);
                } else {
                    posData.push(chart3Data[j + '.1']['0']);
                }
                if (!chart3Data[j + '.1']['1']) {
                    negData.push(0);
                } else {
                    negData.push(chart3Data[j + '.1']['1']);
                }

            }
            if (!chart3Data[j + '.5']) {
                posData.push(0);
                negData.push(0);
            } else {
                if (!chart3Data[j + '.5']['0']) {
                    posData.push(0);
                } else {
                    posData.push(chart3Data[j + '.5']['0']);
                }
                if (!chart3Data[j + '.5']['1']) {
                    negData.push(0);
                } else {
                    negData.push(chart3Data[j + '.5']['1']);
                }

            }
        }

    }
    return {
        correlation: 'Correlation: ' + calculateCorrelation(posData, negData).toFixed(4),
        posData: posData,
        negData: negData
    }
}

function chartDisplay4(timestampList, ts, chart4Data, setColor) {
    var myChart = echarts.init(document.getElementById('rchart4_' + ts));
    var legendData = chart4Data['type'];
    var seriesData = constructChart4Data(myChart, chart4Data);
    option = {
        animation: true,
        tooltip: {
            trigger: 'item',
            formatter: function (data) {
                if (!data.value) return;
                return data.seriesName + "<br/>" + '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' + data.color + '"></span>' + data.name + " : " + data.value.toFixed(2) + "%";
            }
        },
        legend: {
            y: 'bottom',
            data: legendData,
            show: false
        },
        grid: {
            left: '8%',
            right: '15%',
            bottom: '0%',
            containLabel: true
        },
        xdata: {
            'chartData': chart4Data,
            'chartNum': '4',
            'seriesData1': seriesData
        },
        yAxis: {
            name: 'Percentage (%)',
            type: 'value',
            max: 101
        },
        xAxis: {
            type: 'category',
            name: 'Time',
            data: xData1,
            animation: false
        },
        dataZoom: [{
            type: 'inside',
            animation: false
        }, {
            type: 'slider',
            top: '0%',
            height: '5%',
            handleSize: '80%',
            animation: false
        }, {
            type: 'slider',
            yAxisIndex: 0,
            width: '5%',
            bottom: '10%',
            left: "1%"
        }],
        series: seriesData,
        color: setColor
    };
    myChartEventBinding(timestampList, myChart, option);
}

function constructChart4Data(myChart, chart4Data) {
    if (!chart4Data) {
        chart4Data = myChart.getOption().xdata['chartData'];
    }
    var legendData = chart4Data['type'];
    var seriesData = [];
    var zoom, j, i, x, thisData;
    if (myChart.getOption()) {
        zoom = myChart.getOption().dataZoom[0];
    }
    if (zoom) {
        var end = zoom['end'];
        var start = zoom['start'];
    }
    for (i = 0; i < legendData.length; i++) {
        seriesData[i] = {};
        seriesData[i]['name'] = legendData[i];
        seriesData[i]['type'] = 'bar';
        seriesData[i]['stack'] = 'Total';
        seriesData[i]['data'] = [];
        if (!zoom || end - start >= 50) {
            for (j = 6; j < 24; j++) {
                if (!chart4Data[j] || !chart4Data[j][seriesData[i]['name']]) {
                    seriesData[i]['data'].push(0);
                } else {
                    thisData = chart4Data[j][seriesData[i]['name']];
                    seriesData[i]['data'].push((thisData / chart4Data[j]['sum']) * 100);
                }
            }

        } else if (end - start < 17) {
            for (j = 6; j < 24; j++) {
                for (x = 0; x < 6; x++) {
                    if (!chart4Data[j + '_' + x] || !chart4Data[j + '_' + x][seriesData[i]['name']]) {
                        seriesData[i]['data'].push(0);
                    } else {
                        thisData = chart4Data[j + '_' + x][seriesData[i]['name']];
                        seriesData[i]['data'].push((thisData / chart4Data[j + '_' + x]['sum']) * 100);
                    }
                }
            }

        } else {
            for (j = 6; j < 24; j++) {
                if (!chart4Data[j + '.1'] || !chart4Data[j + '.1'][seriesData[i]['name']]) {
                    seriesData[i]['data'].push(0);
                } else {
                    thisData = chart4Data[j + +'.1'][seriesData[i]['name']];
                    seriesData[i]['data'].push((thisData / chart4Data[j + +'.1']['sum']) * 100);
                }
                if (!chart4Data[j + '.5'] || !chart4Data[j + '.5'][seriesData[i]['name']]) {
                    seriesData[i]['data'].push(0);
                } else {
                    thisData = chart4Data[j + '.5'][seriesData[i]['name']];
                    seriesData[i]['data'].push((thisData / chart4Data[j + '.5']['sum']) * 100);
                }
            }
        }

    }
    return seriesData;
}

function chartDisplay5(timestampList, ts) {
    var myChart = echarts.init(document.getElementById('rchart5_' + ts));
    option = {
        title: {
            text: 'Percentage',
            x: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        grid: {
            top: '20%'
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            data: ['loading data'],
            show: false
        },
        series: [
            {
                name: 'Bus Route',
                type: 'pie',
                radius: '85%',
                center: ['50%', '60%'],
                data: [{
                    value: 100,
                    name: "loading data"
                }],
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                label: {
                    normal: {
                        show: false
                    },
                },
                labelLine: {
                    normal: {
                        show: false
                    }
                },
            }
        ]
    };
    myChart.setOption(option);

    myChart.on('click', function (evt) {
        if (evt.name !== 'Loading') {
            $('#rchart5_' + ts).hide();
            $('#chartWrapper6_' + ts).show();
            var c1 = echarts.getInstanceByDom(document.getElementById('rchart1_' + ts));
            var c6 = echarts.getInstanceByDom(document.getElementById('rchart6_' + ts));
            var chart6Option = c6.getOption();
            var setInd;
            var seriesData1 = c1.getOption().xdata.seriesData1;
            for (var ind in seriesData1) {
                if (seriesData1[ind].name === evt.name) {
                    setInd = ind;
                    break;
                }
            }
            chart6Option.title[0].text = 'Route ' + evt.name + ' Amount';
            chart6Option.series = [seriesData1[ind]];
            c6.setOption(chart6Option);
        }
    });
}

function chartDisplay6(timestampList, ts) {
    var myChart = echarts.init(document.getElementById('rchart6_' + ts));
    option = {
        title: {
            text: 'preset',
            textStyle: {
                fontSize: 10
            }
        },
        xAxis: {
            type: 'category',
            data: xData1
        },
        grid: {
            top: "20%",
            left: "20%",
            right: "5%",
            bottom: "10%"
        },
        yAxis: {
            type: 'value'
        },
        series: [],
        dataZoom: [{
            type: 'inside',
            animation: false
        }]
    };
    myChart.setOption(option);
}

function myChartEventBinding(timestampList, myChart, option, chartData) {
    myChart.setOption(option);
    chartDataZoom(timestampList, myChart, option, chartData);
    let chartNum = myChart.getOption().xdata['chartNum'];

    if (parseInt(chartNum) <= 3 && myChart.getOption().xdata['road']) {
        let timestamp = myChart.getDom().id.split('_')[1];
        let pieChart = echarts.init(document.getElementById('rchart4_' + timestamp));
        if (chartNum === '1') {
            myChart.on('mouseover', function (event) {
                let top_lines = [];
                for (let d of this.getOption()['series']) {
                    top_lines.push({name: d.name, value: d.data[event.dataIndex]});
                }
                top_lines.sort((a, b) => a.value < b.value ? 1 : -1).splice(5);
                let colorList = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd"];
                for (let i = 0; i < top_lines.length; i++) {
                    if(top_lines[i].name === 'Others') {
                        colorList[i] = '#bdbdbd';
                    }
                }

                let option = {
                    title: {
                        text: 'Top 5 Bus Routes at ' + event.name,
                        left: 'center',
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: '{a} <br/>{b} : {c} ({d}%)'
                    },
                    series: [
                        {
                            name: 'Lines',
                            type: 'pie',
                            radius: '55%',
                            center: ['50%', '60%'],
                            data: top_lines,
                        }
                    ],
                    color: colorList
                };
                pieChart.setOption(option);
            });
        }
    } else {
        if (chartNum === '1' || chartNum === '4') {
            myChart.on('click', function (evt) {
                clearTimeout(clickTimeId);
                var cur_ts = this.getDom().id.split('_')[1];
                clickTimeId = setTimeout(function() {
                    var indexList = [1, 4];
                    for (var i in indexList) {
                        var myChart = echarts.getInstanceByDom(document.getElementById('rchart' + indexList[i] + '_' + cur_ts));
                        var option = myChart.getOption();
                        var cInd = evt.componentIndex;
                        var cData = option.series.splice(cInd, 1)[0];
                        var color = option.color.splice(cInd % option.color.length, 1)[0];
                        option.series.splice(0, 0, cData);
                        option.color.splice(0, 0, color);
                        myChart.setOption(option, true);
                    }
                }, 250);
            });
            myChart.on('dblclick', function (evt) {
                clearTimeout(clickTimeId);
                var name = evt.seriesName;
                vm2.linePlaybackPrompt(name);
            });
        }

        if (chartNum === '1') {
            myChart.on('mouseover', function (evt) {
                // var dInd = evt.dataIndex;
                var seriesList = [];
                var cur_ts = this.getDom().id.split('_')[1];
                $('#rchart5_' + cur_ts).show();
                $('#chartWrapper6_' + cur_ts).hide();
                var thisOption = this.getOption();
                var pieChart = echarts.getInstanceByDom(document.getElementById('rchart5_' + cur_ts));
                var pieOption = pieChart.getOption();
                var startVal = thisOption.dataZoom[0].startValue;
                var endVal = thisOption.dataZoom[0].endValue;
                for (var ind in thisOption['series']) {
                    var sum = 0;
                    for (var i = startVal; i <= endVal; i++) {
                        sum += thisOption['series'][ind].data[i];
                    }
                    seriesList.push({
                        name: thisOption['series'][ind].name,
                        value: sum,
                    });
                }
                pieOption.series[0].data = seriesList;
                pieOption.color = thisOption.color;
                pieChart.setOption(pieOption, true);
            });
        }

        myChart.on('mouseover', function (evt) {
            var cur_ts = myChart.getDom().id.split('_')[1];
            var cur_ind = myChart.getDom().id.split('_')[0].slice(-1);
            if (cur_ind === '2') {
                if (evt.event_status === true) {
                    return;
                }
                for (var i = 0; i < timestampList.length; i++) {
                    var this_ts = timestampList[i];
                    if (cur_ind !== '2' || this_ts !== cur_ts) {
                        if (!document.getElementById('rchart2_' + this_ts)) return;
                        var c2 = echarts.getInstanceByDom(document.getElementById('rchart2_' + this_ts));
                        c2.dispatchAction({
                            type: 'highlight',
                            dataIndex: evt.dataIndex,
                            event_status: true
                        });
                    }
                }
            }
        });

        myChart.on('mouseout', function (evt) {
            var cur_ts = myChart.getDom().id.split('_')[1];
            var cur_ind = myChart.getDom().id.split('_')[0].slice(-1);
            if (cur_ind === '2') {
                if (evt.event_status === true) {
                    return;
                }
                for (var i = 0; i < timestampList.length; i++) {
                    var this_ts = timestampList[i];
                    if (cur_ind !== '2' || this_ts !== cur_ts) {
                        if (!document.getElementById('rchart2_' + this_ts)) return;
                        var c2 = echarts.getInstanceByDom(document.getElementById('rchart2_' + this_ts));
                        c2.dispatchAction({
                            type: 'downplay',
                            dataIndex: evt.dataIndex,
                            event_status: true
                        });
                    }
                }
            }
        });

        if (chartNum === '3') {
            myChart.on('legendselectchanged', function (evt) {
                var option = myChart.getOption();
                var count = 0;
                for (var i in evt.selected) {
                    count += evt.selected[i];
                }
                if (count < 2) {
                    option.tooltip[0].formatter = function (data) {
                        return data.seriesName + "<br/>" + '<span style="display:inline-block;margin-right:5px;' +
                            'border-radius:10px;width:9px;height:9px;background-color:' + data.color + '"></span>' +
                            data.name + " : " + data.value;
                    };
                } else {
                    option.tooltip[0].formatter = function (data) {
                        var option = myChart.getOption();
                        return data.seriesName + "<br/>" + '<span style="display:inline-block;margin-right:5px;' +
                            'border-radius:10px;width:9px;height:9px;background-color:' + data.color + '"></span>' +
                            data.name + " : " + data.value + "</br>" +
                            option['xdata']['seriesData' + option['xdata']['currentStatus']]['correlation'];
                    };
                }
                myChart.setOption(option);
            });
        }
    }
}

function chartDataZoom(timestampList, myChart, option, chartData) {
    myChart.on('datazoom', function (evt) {
        var cur_ts = myChart.getDom().id.split('_')[1];
        var cur_ind = myChart.getDom().id.split('_')[0].slice(-1);
        var option = myChart.getOption();
        var zoom = option.dataZoom[0];
        var start = zoom['start'];
        var end = zoom['end'];
        var chartNum = option.xdata['chartNum'];
        var value = 0;
        if (option.dataZoom[3]) {
            var zoom1 = option.dataZoom[3];
            var start1 = zoom1['start'];
            var end1 = zoom1['end'];
        }

        if (end - start < 17) {
            option['xAxis'][0].data = xData3;
            value = 3;
        } else if (end - start < 50) {
            option['xAxis'][0].data = xData2;
            value = 2;
        } else {
            option['xAxis'][0].data = xData1;
            value = 1;
        }
        if (chartNum === '1') {
            if (!option.xdata['seriesData' + value]) {
                option['series'] = constructChart1Data(myChart, chartData);
                option.xdata['seriesData' + value] = option['series'];
            } else {
                option['series'] = option.xdata['seriesData' + value];
            }
        } else if (chartNum === '2') {
            var value1 = 0;
            if (end1 - start1 < 17) {
                option['yAxis'][0].data = yData3;
                value1 = 3;
            } else if (end1 - start1 < 50) {
                option['yAxis'][0].data = yData2;
                value1 = 2;
            } else {
                option['yAxis'][0].data = yData1;
                value1 = 1;
            }
            if (!option.xdata['seriesData' + value + '_' + value1]) {
                var rtn = constructChart2Data(myChart, chartData);
                option['series'][0]['data'] = rtn['data'];
                option['visualMap'][0]['max'] = rtn['mx'];
                option['visualMap'][0]['range'][1] = rtn['mx'];
                option.xdata['seriesData' + value + '_' + value1] = rtn;
            } else {
                option['series'][0]['data'] = option.xdata['seriesData' + value + '_' + value1]['data'];
                option['visualMap'][0]['max'] = option.xdata['seriesData' + value + '_' + value1]['mx'];
                option['visualMap'][0]['range'][1] = option.xdata['seriesData' + value + '_' + value1]['mx'];
            }
        } else if (chartNum === '3') {
            if (!option.xdata['seriesData' + value]) {
                var res = constructChart3Data(myChart, chartData);
                option['series'][0]['data'] = res['posData'];
                option['series'][1]['data'] = res['negData'];
                option.title[0].text = res['correlation'];
                option.xdata['seriesData' + value] = res;
            } else {
                option['series'][0]['data'] = option.xdata['seriesData' + value]['posData'];
                option['series'][1]['data'] = option.xdata['seriesData' + value]['negData'];
                option.title[0].text = option.xdata['seriesData' + value]['correlation'];
            }
            option.xdata['currentStatus'] = value;
        } else if (chartNum === '4') {
            if (!option.xdata['seriesData' + value]) {
                option['series'] = constructChart4Data(myChart, chartData);
                option.xdata['seriesData' + value] = option['series'];
            } else {
                option['series'] = option.xdata['seriesData' + value];
            }
        }
        myChart.setOption(option, true);
        if (evt.event_status === true) {
            return;
        }
        for (var i = 0; i < timestampList.length; i++) {
            var this_ts = timestampList[i];
            if (cur_ind !== '1' || this_ts !== cur_ts) {
                if (document.getElementById('rchart1_' + this_ts)) {
                    var c1 = echarts.getInstanceByDom(document.getElementById('rchart1_' + this_ts));
                    c1.dispatchAction({
                        type: 'dataZoom',
                        dataZoomIndex: 0,
                        start: zoom.start,
                        end: zoom.end,
                        event_status: true
                    });
                }
            }
            if (cur_ind !== '2' || this_ts !== cur_ts) {
                if (document.getElementById('rchart2_' + this_ts)) {
                    var c2 = echarts.getInstanceByDom(document.getElementById('rchart2_' + this_ts));
                    c2.dispatchAction({
                        type: 'dataZoom',
                        dataZoomIndex: 0,
                        start: zoom.start,
                        end: zoom.end,
                        event_status: true
                    });
                    if (evt.dataZoomId && evt.dataZoomId[8] === '3') {
                        c2.dispatchAction({
                            type: 'dataZoom',
                            dataZoomIndex: 3,
                            start: zoom1.start,
                            end: zoom1.end,
                            event_status: true
                        });
                    }

                }
            }
            if (cur_ind !== '3' || this_ts !== cur_ts) {
                if (document.getElementById('rchart3_' + this_ts)) {
                    var c3 = echarts.getInstanceByDom(document.getElementById('rchart3_' + this_ts));
                    c3.dispatchAction({
                        type: 'dataZoom',
                        dataZoomIndex: 0,
                        start: zoom.start,
                        end: zoom.end,
                        event_status: true
                    });
                }
            }
            if (cur_ind !== '4' || this_ts !== cur_ts) {
                if (document.getElementById('rchart4_' + this_ts)) {
                    var c4 = echarts.getInstanceByDom(document.getElementById('rchart4_' + this_ts));
                    c4.dispatchAction({
                        type: 'dataZoom',
                        dataZoomIndex: 0,
                        start: zoom.start,
                        end: zoom.end,
                        event_status: true
                    });
                }
            }
        }
    });
}
