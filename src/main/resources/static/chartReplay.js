var xData1 = ['6-7', '7-8', '8-9', '9-10', '10-11', '11-12', '12-13', '13-14', '14-15', '15-16', '16-17', '17-18', '18-19', '19-20', '20-21', '21-22', '22-23', '23-24'];
var xData2 = ['6-6:30', '6:30-7', '7-7:30', '7:30-8', '8-8:30', '8:30-9', '9-9:30', '9:30-10', '10-10:30', '10:30-11', '11-11:30', '11:30-12', '12-12:30', '12:30-13', '13-13:30', '13:30-14', '14-14:30', '14:30-15', '15-15:30', '15:30-16', '16-16:30', '16:30-17', '17-17:30', '17:30-18', '18-18:30', '18:30-19', '19-19:30', '19:30-20', '20-20:30', '20:30-21', '21-21:30', '21:30-22', '22-22:30', '22:30-23', '23-23:30', '23:30-24'];
var xData3 = ['6-6:10', '6:10-6:20', '6:20-6:30', '6:30-6:40', '6:40-6:50', '6:50-7', '7-7:10', '7:10-7:20', '7:20-7:30', '7:30-7:40', '7:40-7:50', '7:50-8', '8-8:10', '8:10-8:20', '8:20-8:30', '8:30-8:40', '8:40-8:50', '8:50-9', '9-9:10', '9:10-9:20', '9:20-9:30', '9:30-9:40', '9:40-9:50', '9:50-10', '10-10:10', '10:10-10:20', '10:20-10:30', '10:30-10:40', '10:40-10:50', '10:50-11', '11-11:10', '11:10-11:20', '11:20-11:30', '11:30-11:40', '11:40-11:50', '11:50-12', '12-12:10', '12:10-12:20', '12:20-12:30', '12:30-12:40', '12:40-12:50', '12:50-13', '13-13:10', '13:10-13:20', '13:20-13:30', '13:30-13:40', '13:40-13:50', '13:50-14', '14-14:10', '14:10-14:20', '14:20-14:30', '14:30-14:40', '14:40-14:50', '14:50-15', '15-15:10', '15:10-15:20', '15:20-15:30', '15:30-15:40', '15:40-15:50', '15:50-16', '16-16:10', '16:10-16:20', '16:20-16:30', '16:30-16:40', '16:40-16:50', '16:50-17', '17-17:10', '17:10-17:20', '17:20-17:30', '17:30-17:40', '17:40-17:50', '17:50-18', '18-18:10', '18:10-18:20', '18:20-18:30', '18:30-18:40', '18:40-18:50', '18:50-19', '19-19:10', '19:10-19:20', '19:20-19:30', '19:30-19:40', '19:40-19:50', '19:50-20', '20-20:10', '20:10-20:20', '20:20-20:30', '20:30-20:40', '20:40-20:50', '20:50-21', '21-21:10', '21:10-21:20', '21:20-21:30', '21:30-21:40', '21:40-21:50', '21:50-22', '22-22:10', '22:10-22:20', '22:20-22:30', '22:30-22:40', '22:40-22:50', '22:50-23', '23-23:10', '23:10-23:20', '23:20-23:30', '23:30-23:40', '23:40-23:50', '23:50-24'];

var yData1 = ['0-20', '20-40', '40-60', '60-80'];
var yData2 = ['0-10', '10-20', '20-30', '30-40', '40-50', '50-60', '60-70', '70-80'];
var yData3 = ['0-5', '5-10', '10-15', '15-20', '20-25', '25-30', '30-35', '35-40', '40-45', '45-50', '50-55', '55-60', '60-65', '65-70', '70-75', '75-80'];

var legendData = [];
var chart3LegendData = [];

function getTs(marker) {
    return marker._popup.getContent().firstChild.id.split('_')[1];
}

function getMarkerLayerColor(marker) {
    return marker.layers[0].colorJSON.name;
}

function chartReplay1(colorList, chartTimestampList, keepMarker, deleteMarker) {
    var keepId = 'rchart1_' + getTs(keepMarker);
    var deleteId = 'rchart1_' + getTs(deleteMarker);
    var keepChart = echarts.getInstanceByDom(document.getElementById(keepId));
    var deleteChart = echarts.getInstanceByDom(document.getElementById(deleteId));
    var keepOption = keepChart.getOption();
    var deleteOption = deleteChart.getOption();
    var keepData = keepOption.xdata['chartData'];
    var deleteData = deleteOption.xdata['chartData'];
    keepOption.xdata['keepData'] = keepData;
    keepOption.xdata['deleteData'] = deleteData;
    var keepColor = getMarkerLayerColor(keepMarker);
    var deleteColor = getMarkerLayerColor(deleteMarker);
    legendData = ['Region ' + keepColor, 'Region ' + deleteColor];
    keepOption.color = colorList;
    delete keepOption.xdata['chartData'];
    for (var i = 1; i < 4; i++) {
        delete keepOption.xdata['seriesData' + i];
    }
    keepChart.setOption(keepOption);
    var seriesData = constructReplay1(keepChart, keepColor, deleteColor);
    keepOption['series'] = seriesData;
    keepOption.xdata['seriesData1'] = seriesData;
    ReplayBinding(chartTimestampList, keepChart, keepOption);
}

function constructReplay1(myChart) {
    var seriesData = [];
    var i, j, x, thisData;
    var zoom = myChart.getOption().dataZoom[0];
    var end = zoom['end'];
    var start = zoom['start'];
    var dataList = [myChart.getOption().xdata['keepData'], myChart.getOption().xdata['deleteData']];
    for (i = 0; i < legendData.length; i++) {
        var chart1Data = dataList[i];
        seriesData[i] = {};
        seriesData[i]['name'] = legendData[i];
        seriesData[i]['type'] = 'bar';
        seriesData[i]['stack'] = 'Total';
        seriesData[i]['data'] = [];
        if (!zoom || end - start >= 50) {
            for (j = 6; j < 24; j++) {
                if (!chart1Data[j] || !chart1Data[j]['sum']) {
                    seriesData[i]['data'].push(0);
                } else {
                    thisData = chart1Data[j]['sum'];
                    seriesData[i]['data'].push(thisData);
                }
            }
        } else if (end - start < 17) {
            for (j = 6; j < 24; j++) {
                for (x = 0; x < 6; x++) {
                    if (!chart1Data[j + '_' + x] || !chart1Data[j + '_' + x]['sum']) {
                        seriesData[i]['data'].push(0);
                    } else {
                        thisData = chart1Data[j + '_' + x]['sum'];
                        seriesData[i]['data'].push(thisData);
                    }
                }
            }
        } else {
            for (j = 6; j < 24; j++) {
                if (!chart1Data[j + '.1'] || !chart1Data[j + '.1']['sum']) {
                    seriesData[i]['data'].push(0);
                } else {
                    thisData = chart1Data[j + +'.1']['sum'];
                    seriesData[i]['data'].push(thisData);
                }
                if (!chart1Data[j + '.5'] || !chart1Data[j + '.5']['sum']) {
                    seriesData[i]['data'].push(0);
                } else {
                    thisData = chart1Data[j + '.5']['sum'];
                    seriesData[i]['data'].push(thisData);
                }
            }

        }

    }

    return seriesData;
}

function chartReplay2(chartTimestampList, keepMarker, deleteMarker) {
    var keepId = 'rchart2_' + getTs(keepMarker);
    var deleteId = 'rchart2_' + getTs(deleteMarker);
    var keepChart = echarts.getInstanceByDom(document.getElementById(keepId));
    var deleteChart = echarts.getInstanceByDom(document.getElementById(deleteId));
    var keepOption = keepChart.getOption();
    var deleteOption = deleteChart.getOption();
    var keepData = keepOption.xdata['chartData'];
    var deleteData = deleteOption.xdata['chartData'];
    if (!keepOption.xdata['keepData']) {
        keepOption.xdata['keepData'] = keepData;
    }
    if (!keepOption.xdata['deleteData']) {
        keepOption.xdata['deleteData'] = deleteData;
    }
    delete keepOption.xdata['chartData'];
    for (var i = 1; i < 4; i++) {
        for (var j = 1; j < 4; j++) {
            delete keepOption.xdata['seriesData' + i + '_' + j];
        }
    }
    keepChart.setOption(keepOption);
    var seriesData = constructReplay2(keepChart);
    keepOption['series'][0]['data'] = seriesData['data'];
    keepOption['visualMap'][0]['max'] = seriesData['mx'];
    keepOption['visualMap'][0]['range'][1] = seriesData['mx'];
    keepOption.xdata['seriesData1_1'] = seriesData;
    ReplayBinding(chartTimestampList, keepChart, keepOption);
}

function constructReplay2(myChart) {
    var data = [];
    var mx = 0;
    var zoom, zoom1Val, thisData, i, j, k, x;
    zoom = myChart.getOption().dataZoom[0];
    var zoom1 = myChart.getOption().dataZoom[3];
    var end = zoom['end'];
    var start = zoom['start'];
    var end1 = zoom1['end'];
    var start1 = zoom1['start'];
    var chart2DataKeep = myChart.getOption().xdata['keepData'];
    var chart2DataDelete = myChart.getOption().xdata['deleteData'];
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
                var keepItem = 0;
                var deleteItem = 0;
                for (k = 0; k < 16 / zoom1Val; k++) {
                    if (chart2DataKeep[i + 6] && chart2DataKeep[i + 6][(j * (16 / zoom1Val)) + k]) {
                        keepItem += chart2DataKeep[i + 6][(j * (16 / zoom1Val)) + k];
                    }
                    if (chart2DataDelete[i + 6] && chart2DataDelete[i + 6][(j * (16 / zoom1Val)) + k]) {
                        deleteItem += chart2DataDelete[i + 6][(j * (16 / zoom1Val)) + k];
                    }
                }
                thisData = keepItem + deleteItem;
                data.push([j, i, thisData]);
                mx = Math.max(mx, thisData);

            }
        }
    } else if (end - start < 17) {
        for (i = 0; i < 18; i++) {
            for (x = 0; x < 6; x++) {
                for (j = 0; j < zoom1Val; j++) {
                    var keepItem = 0;
                    var deleteItem = 0;
                    for (k = 0; k < 16 / zoom1Val; k++) {
                        if (chart2DataKeep[(i + 6) + '_' + x] && chart2DataKeep[(i + 6) + '_' + x][(j * (16 / zoom1Val)) + k]) {
                            keepItem += chart2DataKeep[(i + 6) + '_' + x][(j * (16 / zoom1Val)) + k];
                        }
                        if (chart2DataDelete[(i + 6) + '_' + x] && chart2DataDelete[(i + 6) + '_' + x][(j * (16 / zoom1Val)) + k]) {
                            deleteItem += chart2DataDelete[(i + 6) + '_' + x][(j * (16 / zoom1Val)) + k];
                        }
                    }
                    thisData = keepItem + deleteItem;
                    data.push([j, i * 6 + x, thisData]);
                    mx = Math.max(mx, thisData);
                }
            }
        }
    } else {
        for (i = 0; i < 18; i++) {
            for (j = 0; j < zoom1Val; j++) {
                var keepItem1 = 0;
                var deleteItem1 = 0;
                for (k = 0; k < 16 / zoom1Val; k++) {
                    if (chart2DataKeep[(i + 6) + '.1'] && chart2DataKeep[(i + 6) + '.1'][(j * (16 / zoom1Val)) + k]) {
                        keepItem1 += chart2DataKeep[(i + 6) + '.1'][(j * (16 / zoom1Val)) + k];
                    }
                    if (chart2DataDelete[(i + 6) + '.1'] && chart2DataDelete[(i + 6) + '.1'][(j * (16 / zoom1Val)) + k]) {
                        deleteItem1 += chart2DataDelete[(i + 6) + '.1'][(j * (16 / zoom1Val)) + k];
                    }
                }
                thisData = keepItem1 + deleteItem1;
                data.push([j, i * 2, thisData]);
                mx = Math.max(mx, thisData);
                var keepItem5 = 0;
                var deleteItem5 = 0;
                for (k = 0; k < 16 / zoom1Val; k++) {
                    if (chart2DataKeep[(i + 6) + '.5'] && chart2DataKeep[(i + 6) + '.5'][(j * (16 / zoom1Val)) + k]) {
                        keepItem5 += chart2DataKeep[(i + 6) + '.5'][(j * (16 / zoom1Val)) + k];
                    }
                    if (chart2DataDelete[(i + 6) + '.5'] && chart2DataDelete[(i + 6) + '.5'][(j * (16 / zoom1Val)) + k]) {
                        deleteItem5 += chart2DataDelete[(i + 6) + '.5'][(j * (16 / zoom1Val)) + k];
                    }
                }
                thisData = keepItem5 + deleteItem5;
                data.push([j, i * 2 + 1, thisData]);
                mx = Math.max(mx, thisData);
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

function chartReplay3(chartTimestampList, keepMarker, deleteMarker) {
    var keepId = 'rchart3_' + getTs(keepMarker);
    var deleteId = 'rchart3_' + getTs(deleteMarker);
    var keepChart = echarts.getInstanceByDom(document.getElementById(keepId));
    var deleteChart = echarts.getInstanceByDom(document.getElementById(deleteId));
    var keepOption = keepChart.getOption();
    var deleteOption = deleteChart.getOption();
    var keepData = keepOption.xdata['chartData'];
    var deleteData = deleteOption.xdata['chartData'];
    var keepColor = getMarkerLayerColor(keepMarker);
    var deleteColor = getMarkerLayerColor(deleteMarker);
    chart3LegendData = [keepColor + ' Forward', deleteColor + ' Forward', keepColor + ' Backward', deleteColor + ' backward']
    keepOption.legend[0].data = chart3LegendData;
    keepOption['series'].push({type: 'line', stack: 'Total3'});
    keepOption['series'].push({type: 'line', stack: 'Total4'});
    for (var i = 0; i < 4; i++) {
        keepOption['series'][i]['name'] = keepOption.legend[0].data[i];
    }
    if (!keepOption.xdata['keepData']) {
        keepOption.xdata['keepData'] = keepData;
    }
    if (!keepOption.xdata['deleteData']) {
        keepOption.xdata['deleteData'] = deleteData;
    }
    delete keepOption.xdata['chartData'];
    for (var i = 1; i < 4; i++) {
        delete keepOption.xdata['seriesData' + i];
    }
    keepChart.setOption(keepOption);
    var seriesData = constructReplay3(keepChart);
    keepOption['series'][0]['data'] = seriesData['posData0'];
    keepOption['series'][1]['data'] = seriesData['posData1'];
    keepOption['series'][2]['data'] = seriesData['negData0'];
    keepOption['series'][3]['data'] = seriesData['negData1'];
    keepOption.tooltip[0].formatter = function (data) {
        var option = keepChart.getOption();
        var rtn = data.seriesName + "<br/>" + '<span style="display:inline-block;margin-right:5px;' +
            'border-radius:10px;width:9px;height:9px;background-color:' + data.color + '"></span>' +
            data.name + " : " + data.value + "</br> Correlation With: </br>";
        for (var i = 0, j = 0; i < 4; i++) {
            if (i !== data.seriesIndex) {
                rtn += keepOption.legend[0].data[i] + ': ' +
                    option['xdata']['seriesData' + option['xdata']['currentStatus']]['correlation'][data.seriesIndex][j].value + ' </br>';
                j++;
            }
        }
        return rtn;
    };
    keepOption.xdata['seriesData1'] = seriesData;
    ReplayBinding(chartTimestampList, keepChart, keepOption);
}

function constructReplay3(myChart) {
    var posData = [[], []];
    var negData = [[], []];
    var i, j, x;
    var zoom = myChart.getOption().dataZoom[0];
    var end = zoom['end'];
    var start = zoom['start'];
    var dataList = [myChart.getOption().xdata['keepData'], myChart.getOption().xdata['deleteData']];
    for (i = 0; i < 2; i++) {
        var chart3Data = dataList[i];
        if (!zoom || end - start >= 50) {
            for (j = 6; j < 24; j++) {
                if (!chart3Data[j]) {
                    posData[i].push(0);
                    negData[i].push(0);
                } else {
                    if (!chart3Data[j]['0']) {
                        posData[i].push(0);
                    } else {
                        posData[i].push(chart3Data[j]['0']);
                    }
                    if (!chart3Data[j]['1']) {
                        negData[i].push(0);
                    } else {
                        negData[i].push(chart3Data[j]['1']);
                    }

                }
            }
        } else if (end - start < 17) {
            for (j = 6; j < 24; j++) {
                for (x = 0; x < 6; x++) {
                    if (!chart3Data[j + '_' + x]) {
                        posData[i].push(0);
                        negData[i].push(0);
                    } else {
                        if (!chart3Data[j + '_' + x]['0']) {
                            posData[i].push(0);
                        } else {
                            posData[i].push(chart3Data[j + '_' + x]['0']);
                        }
                        if (!chart3Data[j + '_' + x]['1']) {
                            negData[i].push(0);
                        } else {
                            negData[i].push(chart3Data[j + '_' + x]['1']);
                        }

                    }
                }
            }

        } else {
            for (j = 6; j < 24; j++) {
                if (!chart3Data[j + '.1']) {
                    posData[i].push(0);
                    negData[i].push(0);
                } else {
                    if (!chart3Data[j + '.1']['0']) {
                        posData[i].push(0);
                    } else {
                        posData[i].push(chart3Data[j + '.1']['0']);
                    }
                    if (!chart3Data[j + '.1']['1']) {
                        negData[i].push(0);
                    } else {
                        negData[i].push(chart3Data[j + '.1']['1']);
                    }

                }
                if (!chart3Data[j + '.5']) {
                    posData[i].push(0);
                    negData[i].push(0);
                } else {
                    if (!chart3Data[j + '.5']['0']) {
                        posData[i].push(0);
                    } else {
                        posData[i].push(chart3Data[j + '.5']['0']);
                    }
                    if (!chart3Data[j + '.5']['1']) {
                        negData[i].push(0);
                    } else {
                        negData[i].push(chart3Data[j + '.5']['1']);
                    }
                }
            }
        }
    }
    dataList = [posData[0], posData[1], negData[0], negData[1]];
    var correlation = [];
    for (i = 0; i < 4; i++) {
        var tempList = [];
        for (j = 0; j < 4; j++) {
            if (i !== j) {
                tempList.push({
                    i: i,
                    j: j,
                    value: calculateCorrelation(dataList[i], dataList[j]).toFixed(4)
                });
            }
        }
        correlation.push(tempList);
    }
    return {
        correlation: correlation,
        posData0: posData[0],
        negData0: negData[0],
        posData1: posData[1],
        negData1: negData[1]
    }
}

function chartReplay4(colorList, chartTimestampList, keepMarker, deleteMarker) {
    var keepId = 'rchart4_' + getTs(keepMarker);
    var deleteId = 'rchart4_' + getTs(deleteMarker);
    var keepChart = echarts.getInstanceByDom(document.getElementById(keepId));
    var deleteChart = echarts.getInstanceByDom(document.getElementById(deleteId));
    var keepOption = keepChart.getOption();
    var deleteOption = deleteChart.getOption();
    var keepData = keepOption.xdata['chartData'];
    var deleteData = deleteOption.xdata['chartData'];
    keepOption.xdata['keepData'] = keepData;
    keepOption.xdata['deleteData'] = deleteData;
    keepOption.color = colorList;
    delete keepOption.xdata['chartData'];
    for (var i = 1; i < 4; i++) {
        delete keepOption.xdata['seriesData' + i];
    }
    keepChart.setOption(keepOption);
    var seriesData = constructReplay4(keepChart);
    keepOption['series'] = seriesData;
    keepOption.xdata['seriesData1'] = seriesData;
    ReplayBinding(chartTimestampList, keepChart, keepOption);
}

function constructReplay4(myChart) {
    var seriesData = [];
    var i, j, x, thisData;
    var zoom = myChart.getOption().dataZoom[0];
    var end = zoom['end'];
    var start = zoom['start'];
    var dataList = [myChart.getOption().xdata['keepData'], myChart.getOption().xdata['deleteData']];
    var columnSumList = [];
    if (!zoom || end - start >= 50) {
        for (j = 6; j < 24; j++) {
            columnSumList.push(0);
        }
    } else if (end - start < 17) {
        for (j = 6; j < 24; j++) {
            for (x = 0; x < 6; x++) {
                columnSumList.push(0);
            }
        }
    } else {
        for (j = 6; j < 24; j++) {
            columnSumList.push(0);
            columnSumList.push(0);
        }
    }
    for (i = 0; i < legendData.length; i++) {
        var chart1Data = dataList[i];
        seriesData[i] = {};
        seriesData[i]['name'] = legendData[i];
        seriesData[i]['type'] = 'bar';
        seriesData[i]['stack'] = 'Total';
        seriesData[i]['data'] = [];
        if (!zoom || end - start >= 50) {
            for (j = 6; j < 24; j++) {
                if (chart1Data[j] && chart1Data[j]['sum']) {
                    columnSumList[j - 6] += chart1Data[j]['sum'];
                }
            }
        } else if (end - start < 17) {
            for (j = 6; j < 24; j++) {
                for (x = 0; x < 6; x++) {
                    if (chart1Data[j + '_' + x] && chart1Data[j + '_' + x]['sum']) {
                        columnSumList[(j - 6) * 6 + x] += chart1Data[j + '_' + x]['sum'];
                    }
                }
            }
        } else {
            for (j = 6; j < 24; j++) {
                if (chart1Data[j + '.1'] && chart1Data[j + '.1']['sum']) {
                    columnSumList[(j - 6) * 2] += chart1Data[j + '.1']['sum'];
                }
                if (chart1Data[j + '.5'] && chart1Data[j + '.5']['sum']) {
                    columnSumList[(j - 6) * 2 + 1] += chart1Data[j + '.5']['sum'];
                }
            }

        }

    }
    for (i = 0; i < legendData.length; i++) {
        chart1Data = dataList[i];
        seriesData[i] = {};
        seriesData[i]['name'] = legendData[i];
        seriesData[i]['type'] = 'bar';
        seriesData[i]['stack'] = 'Total';
        seriesData[i]['data'] = [];
        if (!zoom || end - start >= 50) {
            for (j = 6; j < 24; j++) {
                if (!chart1Data[j] || !chart1Data[j]['sum']) {
                    seriesData[i]['data'].push(0);
                } else {
                    thisData = chart1Data[j]['sum'];
                    seriesData[i]['data'].push((thisData / columnSumList[j - 6]) * 100);
                }
            }
        } else if (end - start < 17) {
            for (j = 6; j < 24; j++) {
                for (x = 0; x < 6; x++) {
                    if (!chart1Data[j + '_' + x] || !chart1Data[j + '_' + x]['sum']) {
                        seriesData[i]['data'].push(0);
                    } else {
                        thisData = chart1Data[j + '_' + x]['sum'];
                        seriesData[i]['data'].push((thisData / columnSumList[(j - 6) * 6 + x]) * 100);
                    }
                }
            }
        } else {
            for (j = 6; j < 24; j++) {
                if (!chart1Data[j + '.1'] || !chart1Data[j + '.1']['sum']) {
                    seriesData[i]['data'].push(0);
                } else {
                    thisData = chart1Data[j + +'.1']['sum'];
                    seriesData[i]['data'].push((thisData / columnSumList[(j - 6) * 2]) * 100);
                }
                if (!chart1Data[j + '.5'] || !chart1Data[j + '.5']['sum']) {
                    seriesData[i]['data'].push(0);
                } else {
                    thisData = chart1Data[j + '.5']['sum'];
                    seriesData[i]['data'].push((thisData / columnSumList[(j - 6) * 2 + 1]) * 100);
                }
            }

        }

    }

    return seriesData;
}

function ReplayBinding(timestampList, myChart, option) {
    myChart.setOption(option, true);
    myChart.off('datazoom');
    myChart.on('datazoom', function (evt) {
        var option = myChart.getOption();
        var zoom = option.dataZoom[0];
        var start = zoom['start'];
        var end = zoom['end'];
        var chartNum = option.xdata['chartNum'];
        var cur_ts = myChart.getDom().id.split('_')[1];
        var cur_ind = myChart.getDom().id.split('_')[0].slice(-1);
        var value = 0;
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
                option['series'] = constructReplay1(myChart);
                option.xdata['seriesData' + value] = option['series'];
            } else {
                option['series'] = option.xdata['seriesData' + value];
            }
        } else if (chartNum === '2') {
            var zoom1 = option.dataZoom[3];
            var start1 = zoom1['start'];
            var end1 = zoom1['end'];
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
                var rtn = constructReplay2(myChart);
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
                var res = constructReplay3(myChart);
                option['series'][0]['data'] = res['posData0'];
                option['series'][1]['data'] = res['posData1'];
                option['series'][2]['data'] = res['negData0'];
                option['series'][3]['data'] = res['negData1'];
                option.title[0].text = res['correlation'];
                option.xdata['seriesData' + value] = res;
            } else {
                option['series'][0]['data'] = option.xdata['seriesData' + value]['posData0'];
                option['series'][1]['data'] = option.xdata['seriesData' + value]['posData1'];
                option['series'][2]['data'] = option.xdata['seriesData' + value]['negData0'];
                option['series'][3]['data'] = option.xdata['seriesData' + value]['negData1'];
                option.title[0].text = option.xdata['seriesData' + value]['correlation'];
            }
            option.xdata['currentStatus'] = value;
        } else if (chartNum === '4') {
            if (!option.xdata['seriesData' + value]) {
                option['series'] = constructReplay4(myChart);
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

    var chartNum = myChart.getOption().xdata['chartNum'];
    if (chartNum === '3') {
        myChart.off('legendselectchanged');
        myChart.on('legendselectchanged', function (evt) {
            var selectedNum = 0;
            var selectedStatus = [];
            for (var i = 0; i < 4; i++) {
                if (evt.selected[chart3LegendData[i]]) {
                    selectedStatus.push(true);
                    selectedNum += 1;
                } else {
                    selectedStatus.push(false);
                }
            }
            var option = myChart.getOption();
            option.tooltip[0].formatter = function (data) {
                var option = myChart.getOption();
                var rtn = data.seriesName + "<br/>" + '<span style="display:inline-block;margin-right:5px;' +
                    'border-radius:10px;width:9px;height:9px;background-color:' + data.color + '"></span>' +
                    data.name + " : " + data.value;
                if (selectedNum > 1) {
                    rtn += "</br> Correlation With: </br>";
                    var corr = option['xdata']['seriesData' + option['xdata']['currentStatus']]['correlation'][data.seriesIndex];
                    for (var j = 0; j < 3; j++) {
                        if (selectedStatus[corr[j].j]) {
                            rtn += chart3LegendData[corr[j].j] + ': ' +
                                corr[j].value + ' </br>';
                        }
                    }
                }
                return rtn;
            };
            myChart.setOption(option, true);
        });
    }

    if (chartNum === '1' || chartNum === '4') {
        myChart.off('dblclick');
    }
}