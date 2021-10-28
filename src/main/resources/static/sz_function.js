var trsjlist = [];//轨迹，删除使用
var layerlist = new Set();//每个增加的层级，之后删除使用
var selectedLayer = []; //default值是1。 1代表选中，0代表不选。通过select按钮控制。
var restring = "";//储存结果，";"为分割，每个一","分割经纬度
var flagfirstquery = true;//判断为第一次画框
var motionlist = [];
var final_str;
var marklistdir = [];
var marklistopdir = [];
var playback;
var flag2 = 0;
let stationGroup;
var cfg = {
    // radius should be small ONLY if scaleRadius is true (or small radius is intended)
    "radius": 0.002,
    "maxOpacity": .7,
    // scales the radius based on map zoom
    "scaleRadius": true,
    // if set to false the heatmap uses the global maximum for colorization
    // if activated: uses the data maximum within the current map boundaries
    //   (there will always be a red spot with useLocalExtremas true)
    "useLocalExtrema": true,
    // which field name in your data represents the latitude - default "lat"
    latField: 'lat',
    // which field name in your data represents the longitude - default "lng"
    lngField: 'lng',
    // which field name in your data represents the data value - default "value"
    valueField: 'count'
};//add 11.19
var heatmapLayer = new HeatmapOverlay(cfg);//add 11.19
var osmUrl = 'https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoid2VudGFvIiwiYSI6ImNrMjYyd2xlaTBhcWIzZ3FobDIwdW9xamoifQ.AVNeT2rBOhUtQnQfFjs7Fw',
    osmAttrib = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    osm = L.tileLayer(osmUrl, {maxZoom: 18, attribution: osmAttrib}),
    map = new L.Map('map', {
        center: new L.LatLng(22.60, 114.19),
        zoom: 11.3,
        fullscreenControl: true,
        layers: [heatmapLayer],
        // preferCanvas: true
    }),
    drawnItems = L.featureGroup().addTo(map);
// osm.addTo(map);
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    maxZoom: 19
}).addTo(map);
var line_map = new Map();//储存所有的图表
var totalbusline = [];
var runTime_map = new Map();
var Station_markers = L.markerClusterGroup();
var lgroup = L.layerGroup();
var flag0 = 0;
var flag3 = 0;
var flag1 = 1;
var color = [0, '#fff176', '#66bb6a', '#29b6f6'];
var chartTimestampList = [];
var drawLayerList = [];
let colorList = d3.schemeCategory10;
colorList.push('#bdbdbd');
var colorPointer = 0;
var drawRectangle = new L.Draw.Polygon(map);
var deleteLayer = new L.EditToolbar.Delete(map, {
    featureGroup: drawnItems
});
var layerColor = [
    {index: 0, name: 'Red', value: '#d32f2f', used: false},
    {index: 1, name: 'Green', value: '#388e3c', used: false},
    {index: 2, name: 'Blue', value: '#1976d2', used: false}
];
var curChartNum = 0;
var maxChartNum = 3;
var curTrsjTimestamp;
var colorMapList = [];

// minimap
var mini_map = new L.Map('minimap', {
    center: new L.LatLng(22.5854886, 114.0250396),
    zoom: 10,
    zoomControl: false,
    attributionControl: false
});
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    subdomains: 'minimap'
}).addTo(mini_map);
mini_map.dragging.disable();
mini_map.touchZoom.disable();
mini_map.doubleClickZoom.disable();
mini_map.scrollWheelZoom.disable();

var minimap_interval = null;
var mini_canvasLayer = new L.Minimap();
mini_canvasLayer.delegate(this).addTo(mini_map);
var click_minimap = false;
// timeline data
var dataIdx = 0;
var min_offset = 0;
var timeline_chart_data = timeline_chart;
// var timeline_socket = new WebSocket('ws://10.20.54.101:9981/timeline');
var timeline_interval = null;
var min_frame = 30;
var cvs = null;
var traj = timeline_traj;
var mapCanvasLayer = new L.CanvasLayer();
mapCanvasLayer.delegate(this).addTo(map);
var rightbar_time = traj.length - 6;
var leftbar_time = 0;
var timeline_speed = 60;
// timeline_socket.onmessage = function (msg) {
//     var msg_data = JSON.parse(msg.data);
//     if(msg_data.id == -1) {
//         timeline_chart_data = msg_data.data;
//         drawTimeline();
//     }
// }

// d3.select("body").append("h4")
//     .attr("style", "z-index: 500; position: absolute; bottom: 0px; left: 230px;")
//     .attr("id", "minimap_time")
//     .text("00:00");
var timeline_head = d3.select("#timeline_footer").append("h1")
    .attr("style", "z-index: -1; font-family: Times New Roman; font-size: 600%; margin-left: 40px; text-align: left; bottom: 100px; position: absolute; display: block;");
var data_time = "00:00";
timeline_head.datum(data_time);
timeline_head.text(function (d, i) {
    return d;
});
timeline_head.append("sub")
    .attr("id", "speed")
    .attr("style", "font-size:20px;font-family: Times New Roman;")
    .text("×" + timeline_speed);


map.on('dragstart', function (e) {
    clearInterval(timeline_interval);
});


function getTimeString(h, m) {
    if (h < 10) {
        h = '0' + h;
    }
    if (m < 10) {
        m = '0' + m;
    }
    return h + ':' + m;
}


function getSelectedDate() {
    return "2016-" + vm2.dateValue.Format('MM-dd');
}


var svg_width = screen.width * 0.6, svg_height = 150,
    svg_margin = {left: 50, top: 30, right: 20, bottom: 20},
    rect_width = svg_width - svg_margin.left - svg_margin.right,
    rect_height = svg_height - svg_margin.top - svg_margin.bottom,
    hour_width = (svg_width - svg_margin.left - svg_margin.right) / 24;

d3.select("#timeline_footer").append("svg")
    .attr("width", svg_width).attr("height", svg_height)
    .attr("style", "position:absolute;top:10px;left:15%;pointer-events:all;")
    .attr("pointer-events", "all");


var g = d3.select("#timeline_footer").select("svg").append("g")
    .attr("transform", "translate(" + svg_margin.left + "," + svg_margin.top + ")");

var scale_x = d3.scaleLinear()
    .domain([0, timeline_chart_data.length - 1])
    .range([0, rect_width]);

var scale_y = d3.scaleLinear()
    .domain([0, d3.max(timeline_chart_data)])
    .range([rect_height, 0]);

var line_generator = d3.line()
    .x(function (d, i) {
        return scale_x(i);
    })
    .y(function (d, i) {
        return scale_y(d);
    })
    .curve(d3.curveMonotoneX);

d3.select("#timeline_footer").select("g").append("path").attr("d", line_generator(timeline_chart_data));
// x轴
g.append("g")
    .attr("class", "axis")
    .call(
        d3.axisBottom(scale_x)
            .ticks(23)
            .tickFormat(function (v) {
                // 格式化刻度值
                return getTimeString(parseInt(v / 60), v % 60);
            })
    ).attr("transform", "translate(0, " + rect_height + ")");
// y轴
g.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(scale_y).ticks(6));
g.append("text")
    .text("# of bus")
    .attr("transform", "rotate(-90)")
    .attr("dy", "1em")
    .attr("text-anchor", "end");

function subject(d) {
    return {x: d3.event.x, y: d3.event.y}
}

var dragbar_width = 3;

var drag = d3.drag()
    .subject(subject)
    .on("drag", dragmove);

var dragright = d3.drag()
    .subject(subject)
    .on("drag", rdragresize);

var dragleft = d3.drag()
    .subject(subject)
    .on("drag", ldragresize);

var newg = d3.select("#timeline_footer").select("svg").append("g")
    .attr("id", "timeline_newg")
    .data([{x: svg_margin.left, y: svg_margin.top}]);

var current_line = newg.append("rect")
    .attr("x", function (d) {
        return d.x;
    })
    .attr("y", function (d) {
        return d.y;
    })
    .attr("id", "timeline_curline")
    .attr("height", rect_height)
    .attr("width", 3)
    .attr("fill", "red");

var dragrect = newg.append("rect")
    .attr("x", function (d) {
        return d.x;
    })
    .attr("y", function (d) {
        return d.y;
    })
    .attr("id", "timeline_dragrect")
    .attr("height", rect_height)
    .attr("width", rect_width)
    .attr("fill", "lightblue")
    .attr("fill-opacity", .3)
    .attr("cursor", "pointer")
    .call(drag)
    .on("click", function () {
        if (d3.event.defaultPrevented)
            return;
        d3.select("#timeline_curline")
            .attr("x", function (d) {
                return d3.mouse(this)[0];
            })
        dragEvent(d3.mouse(this)[0], false);

        if (!timelineVue._data.playing) {
            mapCanvasLayer.drawLayer();
            clearInterval(timeline_interval);
        }
    });

var dragbarleft = newg.append("rect")
    .attr("x", function (d) {
        return (svg_margin.left - dragbar_width);
    })
    .attr("y", function (d) {
        return d.y;
    })
    .attr("height", rect_height)
    .attr("id", "dragleft")
    .attr("width", dragbar_width)
    .attr("fill", "#F4ACB7")
    .attr("cursor", "ew-resize")
    .call(dragleft);

var dragbarright = newg.append("rect")
    .attr("x", function (d) {
        return svg_width - svg_margin.right;
    })
    .attr("y", function (d) {
        return d.y;
    })
    .attr("id", "dragright")
    .attr("height", rect_height)
    .attr("width", dragbar_width)
    .attr("fill", "#DEC5E3")
    .attr("cursor", "ew-resize")
    .call(dragright);


function dragmove(d) {
    // dragrect
    d3.select("#timeline_dragrect")
        .attr("x", d.x = Math.max(svg_margin.left, Math.min(svg_width - rect_width - svg_margin.right, d3.event.x - rect_width / 2)))
    // dragbarleft
    d3.select("#dragleft")
        .attr("x", function (d) {
            return d.x - dragbar_width;
        });
    // dragbarright
    d3.select("#dragright")
        .attr("x", function (d) {
            return d.x + rect_width;
        });
    d3.select("#timeline_curline")
        .attr("x", function (d) {
            return d.x;
        });
    dragEvent(d.x, true);
    rightTimeChange(d.x + rect_width);
}

function ldragresize(d) {
    let oldx = d.x;
    d.x = Math.max(svg_margin.left, Math.min(d.x + rect_width, d3.event.x));
    rect_width = rect_width + (oldx - d.x);
    d3.select("#dragleft")
        .attr("x", function (d) {
            return d.x - dragbar_width;
        });
    // dragrect
    d3.select("#timeline_dragrect")
        .attr("x", function (d) {
            return d.x;
        })
        .attr("width", rect_width);
    d3.select("#dragright")
        .attr("x", function (d) {
            return d.x + rect_width;
        });
    d3.select("#timeline_curline")
        .attr("x", function (d) {
            return d.x;
        });
    dragEvent(d.x, true);
}

function rdragresize(d) {
    var dragx = Math.max(d.x, Math.min(svg_width - svg_margin.right, d.x + rect_width + d3.event.dx));
    rect_width = dragx - d.x;
    d3.select("#dragright")
        .attr("x", function (d) {
            return dragx
        });
    // dragrect
    d3.select("#timeline_dragrect")
        .attr("width", rect_width);
    d3.select("#timeline_curline")
        .attr("x", d3.select("#timeline_dragrect").attr("x"));
    dragEvent(d3.select("#timeline_dragrect").attr("x"), true);
    rightTimeChange(dragx);
}

function dragEvent(x, leftChange) {
    let h = parseInt((x - svg_margin.left) / hour_width);
    let m = parseInt((x - svg_margin.left) / hour_width * 60 % 60);
    let data_time = getTimeString(h, m);
    d3.select("#timeline_footer").select("h1").datum(data_time).text(function (d, i) {
        return d;
    });
    d3.select("#timeline_footer").select("h1").append("sub")
        .attr("id", "speed")
        .attr("style", "font-size:20px;font-family: Times New Roman;")
        .text("×" + timeline_speed);
    dataIdx = (h * 60 + m) * 3;
    min_offset = 0;
    if (leftChange) {
        leftbar_time = dataIdx;
    }
}

function rightTimeChange(x) {
    let h = parseInt((x - svg_margin.left) / hour_width);
    let m = parseInt((x - svg_margin.left) / hour_width * 60 % 60);
    rightbar_time = (h * 60 + m) * 3;
}

function BusFlowColor(value) {
    let hue = ((1 - value) * 120).toString(10);
    return ["hsl(", hue, ",100%,50%)"].join("");
}

function onDrawTimelineLayer(info) {
    clearInterval(timeline_interval);
    let cxt = info.canvas.getContext('2d');
    cvs = info.canvas;

    function drawPoints() {
        if (dataIdx <= rightbar_time) {
            cxt.clearRect(0, 0, info.canvas.width, info.canvas.height);
            for (var i = 0; i < traj.length - 1; i++) {
                cxt.beginPath();
                var dx, dy, dz;
                dx = traj[i][dataIdx] + ((traj[i][dataIdx + 3] - traj[i][dataIdx]) / min_frame * min_offset);
                dy = traj[i][dataIdx + 1] + ((traj[i][dataIdx + 4] - traj[i][dataIdx + 1]) / min_frame * min_offset);
                dz = traj[i][dataIdx + 2] + ((traj[i][dataIdx + 5] - traj[i][dataIdx + 2]) / min_frame * min_offset);
                if (dz === 0) {
                    cxt.fillStyle = "grey";
                } else if (dz < 5) {
                    cxt.fillStyle = BusFlowColor(1);
                } else if (dz < 19) {
                    cxt.fillStyle = BusFlowColor(0.6);
                } else if (dz < 30) {
                    cxt.fillStyle = BusFlowColor(0.25);
                } else if (dz >= 30) {
                    cxt.fillStyle = BusFlowColor(0);
                }
                let dot = info.layer._map.latLngToContainerPoint([dx, dy]);
                if (map.getZoom() <= 12) {
                    cxt.arc(dot.x, dot.y, 3, 0, Math.PI * 2);
                } else if (map.getZoom() <= 13) {
                    cxt.arc(dot.x, dot.y, 4, 0, Math.PI * 2);
                } else if (map.getZoom() <= 14) {
                    cxt.arc(dot.x, dot.y, 5, 0, Math.PI * 2);
                } else if (map.getZoom() > 14) {
                    cxt.arc(dot.x, dot.y, 6, 0, Math.PI * 2);
                }
                cxt.fill();
                d3.select("#timeline_curline")
                    .attr("x", ((dataIdx / 3) / 60) / 24 * (screen.width * 0.6 - 70) + 50);
            }
            if (min_offset < min_frame) {
                min_offset += 1;
            } else if (dataIdx < traj[1].length - 5) {
                min_offset = 0;
                let h = parseInt(dataIdx / 3 / 60);
                let m = (dataIdx / 3) % 60;
                if (h === 23 && m === 58) {
                    min_offset = 0;
                    dataIdx = leftbar_time;
                }
                let hdata = getTimeString(h, m);
                d3.select("#timeline_footer").select("h1").datum(hdata).text(function (d) {
                    return d;
                });
                d3.select("#timeline_footer").select("h1").append("sub")
                    .attr("id", "speed")
                    .attr("style", "font-size:20px;font-family: Times New Roman;")
                    .text("×" + timeline_speed);
                dataIdx += 3;
            }
        } else {
            min_offset = 0;
            dataIdx = leftbar_time;
        }
    }

    timeline_interval = setInterval(drawPoints, 1000 / 30);
    if (!timelineVue.playing) {
        drawPoints();
        clearInterval(timeline_interval);
        if (min_offset === 0) {
            dataIdx = Math.min(dataIdx - 3, 0);
            min_offset = min_frame - 1;
        } else {
            min_offset -= 1;
        }
    }
    if (!vm2.isBusFlowShow) {
        cvs.style.visibility = 'hidden';
    }
}

function onDrawMiniLayer(info) {
    let mini_cxt = info.canvas.getContext('2d');

    function minimapDrawPoints() {
        if (dataIdx < traj[1].length - 5) {
            mini_cxt.clearRect(0, 0, info.canvas.width, info.canvas.height);
            for (var i = 0; i < traj.length - 1; i++) {
                mini_cxt.beginPath();
                var dx, dy, dz;
                dx = traj[i][dataIdx] + ((traj[i][dataIdx + 3] - traj[i][dataIdx]));
                dy = traj[i][dataIdx + 1] + ((traj[i][dataIdx + 4] - traj[i][dataIdx + 1]));
                dz = traj[i][dataIdx + 2] + ((traj[i][dataIdx + 5] - traj[i][dataIdx + 2]));
                if (dz === 0) {
                    mini_cxt.fillStyle = "grey";
                } else if (dz < 5) {
                    mini_cxt.fillStyle = BusFlowColor(1);
                } else if (dz < 19) {
                    mini_cxt.fillStyle = BusFlowColor(0.6);
                } else if (dz < 30) {
                    mini_cxt.fillStyle = BusFlowColor(0.25);
                } else if (dz >= 30) {
                    mini_cxt.fillStyle = BusFlowColor(0);
                }
                let dot = info.layer._map.latLngToContainerPoint([dx, dy]);
                mini_cxt.arc(dot.x, dot.y, 1, 0, Math.PI * 2);
                mini_cxt.fill();
            }
            if (dataIdx < traj[1].length - 5) {
                var h = parseInt(dataIdx / 3 / 60);
                var m = (dataIdx / 3) % 60;
                if (h === 23 && m === 58) {
                    dataIdx = 0;
                }
                d3.select("body").select("h4")
                    .text(getTimeString(h, m));
                dataIdx += 3;
            }
        } else {
            dataIdx = 0;
        }
    }

    minimap_interval = setInterval(minimapDrawPoints, 500);
}

var chartInfo = {};

// map.on('zoomend', setIconSize);

function setIconSize() {
    let iconElements = document.getElementsByClassName('bus_marker');
    let zoom = Math.sqrt(map.getZoom() - 12);
    for (let i = 0; i < iconElements.length; i++) {
        iconElements[i].style.height =
            iconElements[i].style.width = 25 + (map.getZoom() - 12) * 5.5 + 'px';
    }
}

$.ajax({ //加公交站点
    type: "GET",
    url: "/get_Station",//注意路径
    data: "",
    scriptCharset: 'utf-8',
    success: function (data) {
        var Station_data = decodeURIComponent(data).split("\n");
        // alert(Station_data)
        var cnt = 0;
        for (var i = 0; i < Station_data.length; i++) {
            var a = Station_data[i].split("+");
            if (parseFloat(a[0]) > 0) {
                if (parseFloat(a[1]) > 0) {
                    var title = a[2];
                    var marker = L.marker(new L.LatLng(parseFloat(a[0]), parseFloat(a[1])), {title: title});

                    marker.bindPopup(title);

                    Station_markers.addLayer(marker);
                }
            }
        }
        map.addLayer(Station_markers);
    }
});

function getLineInfo_runtime(date) {
    $.ajax({
        type: "GET",
        url: "http://10.20.126.63:9981/getLines",//注意路径
        data: {
            date: date
        },
        scriptCharset: 'utf-8',
        success: function (data) {
            var busRuntimeData = decodeURIComponent(data).split("++++")[1].split("\n");
            var tmplineid = busRuntimeData[0].split("\t")[0];
            var array = [];
            for (var cnt = 0; cnt < 24; cnt++) {//24小时的数据
                array.push(0);
            }
            for (var i = 0; i < busRuntimeData.length; i++) {
                if (tmplineid != busRuntimeData[i].split("\t")[0]) {
                    runTime_map.set(tmplineid, array);
                    array = [];
                    for (var cnt = 0; cnt < 24; cnt++) {//24小时的数据
                        array.push(0);
                    }
                    tmplineid = busRuntimeData[i].split("\t")[0]
                }
                var time = busRuntimeData[i].split("\t")[1];
                array[parseInt(time)] = parseFloat(busRuntimeData[i].split("\t")[2])
            }
        }
    });
}


function getLineInfo(date) {
    $.ajax({ //加公交线路
        type: "GET",
        url: "http://10.20.126.63:9981/getLines",
        data: {
            date: date
        },
        scriptCharset: 'utf-8',
        success: function (data) {
            console.log(this.url);
            var lines = decodeURIComponent(data).split("++++")[0].split("\n");
            // console.log(lines);
            for (var i = 0; i < lines.length; i++) {
                var a = lines[i].split("\t");
                chartInfo[a[0]] = {
                    timechar: {
                        name: a[0],
                        type: 'bar',
                        yAxisIndex: 0,
                        data: runTime_map.get(a[0])
                    },
                    numchar: {
                        name: a[0],
                        type: 'bar',
                        yAxisIndex: 0,
                        data: line_map.get(a[0])
                    }

                };
                var latlngs = eval(a[1]);
                var polyline;

                try {
                    polyline = L.polyline(latlngs, {color: '#ffa259', weight: 0.8}).addTo(map);
                } catch (err) {
                    continue;
                }
                lgroup.addLayer(polyline);
                var content = '<div id=' + a[0] + ' style = "width: 350px; height: 350px"></div>' +
                    '<div id=car' + a[0] + ' style = "width: 350px; height: 350px"></div>';
                var popup = L.popup({minWidth: 355});
                polyline.on('mouseover', function (e) {
                    e.target.setStyle({
                        color: 'red',
                        opacity: 1,
                        weight: 6
                    });
                });
                popup.setContent(content);
                polyline.bindPopup(popup);
                polyline.on('popupopen', function (e) {
                    var layer = e.target;
                    var popup = layer.getPopup();
                    popup.openOn(map);
                    var cha = "";
                    var divhtmlarray = popup._content.split("");
                    for (var i = 8; i < divhtmlarray.length; i++) {
                        if (divhtmlarray[i] !== ' ') {
                            cha += divhtmlarray[i];
                        } else {
                            break;
                        }
                    }
                    var buslinedata = line_map.get(cha);
                    var bus_runtime = [];
                    for (var h = 0; h < 24; h++) {
                        bus_runtime.push(0);
                    }
                    bus_runtime = runTime_map.get(cha);
                    var thisChart = echarts.init(document.getElementById(cha));

                    console.log(bus_runtime);

                    var option = {
                        title: {
                            text: "Bus route " + cha + " Average Run Time",
                            font: 10
                        },
                        calculable: true,
                        tooltip: {
                            trigger: 'axis',
                            axisPointer: {
                                label: {
                                    show: true
                                }
                            }
                        },
                        grid: {
                            left: '10%',
                            right: '25%'
                            // containLabel: true
                        },
                        xAxis: {
                            name: 'Departure\nTime',
                            data: ["0-1", "1-2", "2-3", "3-4", "4-5", "5-6", "6-7", "7-8", "8-9", "9-10", "10-11", "11-12", "11-12",
                                "12-13", "13-14", "14-15", "15-16", "16-17", "17-18", "18-19",
                                "19-20", "20-21", "21-22", "22-23", "23-24"]
                        },
                        yAxis: [
                            {
                                type: 'value',
                                name: 'Run Time'
                            }
                        ],
                        dataZoom: [
                            {
                                show: true,
                                start: 0,
                                end: 100
                            },
                            {
                                type: 'inside',
                                start: 94,
                                end: 100
                            },
                            {
                                show: true,
                                yAxisIndex: 0,
                                filterMode: 'empty',
                                width: 30,
                                height: '85%',
                                showDataShadow: false,
                                left: '100%'
                            }
                        ],
                        series: [
                            {
                                name: 'Average time',
                                type: 'bar',
                                yAxisIndex: 0,
                                data: bus_runtime
                            }
                        ]
                    };

                    // 使用刚指定的配置项和数据显示图表。
                    thisChart.setOption(option);
                    if (!bus_runtime) {
                        document.getElementById(cha).style.visibility = "hidden";
                        document.getElementById(cha).style.width = 0;
                        document.getElementById(cha).style.height = 0;
                    } else {
                        document.getElementById(cha).style.visibility = "visible";
                        document.getElementById(cha).style.width = 350;
                        document.getElementById(cha).style.height = 250;
                    }

                    var thisChart2 = echarts.init(document.getElementById("car" + cha));
                    var option2 = {
                        title: {
                            text: "Bus route " + cha + " Number of Buses Per Hour",
                            font: 10
                        },
                        calculable: true,
                        tooltip: {
                            trigger: 'axis',
                            axisPointer: {
                                type: 'shadow',
                                label: {
                                    show: true
                                }
                            }
                        },
                        grid: {
                            left: '10%',
                            right: '20%'
                            // containLabel: true
                        },
                        xAxis: {
                            name: 'Time',
                            data: ["0-1", "1-2", "2-3", "3-4", "4-5", "5-6", "6-7", "7-8", "8-9", "9-10", "10-11", "11-12", "11-12",
                                "12-13", "13-14", "14-15", "15-16", "16-17", "17-18", "18-19",
                                "19-20", "20-21", "21-22", "22-23", "23-24"]
                        },
                        yAxis: [
                            {
                                type: 'value',
                                name: 'Amount'
                            }
                        ],

                        dataZoom: [
                            {
                                show: true,
                                start: 0,
                                end: 100
                            },
                            {
                                type: 'inside',
                                start: 94,
                                end: 100
                            },
                            {
                                show: true,
                                yAxisIndex: 0,
                                filterMode: 'empty',
                                width: 30,
                                height: '85%',
                                showDataShadow: false,
                                left: '100%'
                            }
                        ],
                        series: [
                            {
                                name: 'Number of buses',
                                type: 'bar',
                                yAxisIndex: 0,
                                data: buslinedata
                            }
                        ]
                    };

                    // 使用刚指定的配置项和数据显示图表。
                    thisChart2.setOption(option2);

                    layer.setStyle({
                        color: 'red',
                        opacity: 1,
                        weight: 6
                    });
                });
                polyline.on('mouseout', function (e) {
                    // this.closePopup();
                    var layer = e.target;
                    layer.setStyle({
                        color: '#ffa259',
                        weight: 0.8
                    });
                });
            }
            map.addLayer(lgroup);
        }
    });

    $.ajax({
        type: "GET",
        url: "http://10.20.126.63:9981/getbusline",//注意路径
        data: {
            date: date
        },
        scriptCharset: 'utf-8',
        success: function (data) {
            console.log(this.url);
            var busline_data = data.split("\n");
            for (var i = 0; i < busline_data.length; i++) {
                var line_id = busline_data[i].split(":")[0];
                var time_number = busline_data[i].split(":")[1].split(";");
                var array = [];
                for (var cnt = 0; cnt < 24; cnt++) {//24小时的数据
                    array.push(0);
                }
                for (var j = 0; j < time_number.length; j++) {
                    array[parseInt(time_number[j].split(",")[0])] = parseInt(time_number[j].split(",")[1]);
                }
                line_map.set(line_id, array);
            }
            for (var i = 0; i < 24; i++) {
                totalbusline.push(0);
            }
            line_map.forEach(function (value, key, map) {
                var totallinetmp = value;
                for (var j = 0; j < totallinetmp.length; j++) {
                    totalbusline[j] += parseInt(totallinetmp[j]);
                }
            });
        }
    });

}

function getColor() {
    var color = colorList[colorPointer];
    colorPointer = (colorPointer + 1) % (colorList.length - 1);
    return color;
}

function getLayerColor() {
    for (var i in layerColor) {
        if (layerColor[i].used === false) {
            layerColor[i].used = true;
            return layerColor[i];
        }
    }
}

function getColorMap(markerId) {
    for (var i in colorMapList) {
        if (colorMapList[i].markerId === markerId) {
            return colorMapList[i];
        }
    }
    return -1;
}

function putLineColor(markerId, lineList) {
    var lineColorMap = {};
    var rtn = getColorMap(markerId);
    if (rtn !== -1) {
        lineColorMap = rtn;
    } else {
        lineColorMap['markerId'] = markerId;
        lineColorMap['colorMap'] = {};
    }
    var lastColor = -1;
    for (var i = 0, lineListLength = lineList.length; i < lineListLength; i++) {
        if (lineList[i] === 'Others') {
            lastColor = colorList[colorList.length - 1];
        } else {
            var res = getLineColor(lineList[i]);
            if (res !== -1) {
                lastColor = res;
            } else {
                var color = getColor();
                if (lastColor !== -1 && lastColor === color) {
                    lastColor = color;
                } else {
                    lastColor = color;
                }
            }
        }
        lineColorMap['colorMap'][lineList[i]] = lastColor;
    }
    if (rtn === -1) {
        colorMapList.push(lineColorMap);
    }
}

function deleteLineColor(markerId) {
    for (var i in colorMapList) {
        if (colorMapList[i].markerId === markerId) {
            colorMapList.splice(i, 1);
        }
    }
}

function getLineColor(lineName) {
    for (var i in colorMapList) {
        var colorMap = colorMapList[i]['colorMap'];
        if (colorMap[lineName]) {
            return colorMap[lineName];
        }
    }
    return -1;
}

map.on(L.Draw.Event.CREATED, function (event) {
    var layer = event.layer;
    var setColor = getLayerColor();
    layer.options.color = setColor['value'];
    layer['colorJSON'] = setColor;
    drawnItems.addLayer(layer);
    layerlist.add(layer);
    selectedLayer.push(1);
    drawLayerList.push(layer._leaflet_id);
    searchByRegion();
    curChartNum = drawLayerList.length;
    vm2.drawDeleteDisabled = false;
    if (curChartNum >= maxChartNum) {
        vm2.drawCreateDisabled = true;
    }
    drawRectangle.disable();
    vm2.drawText = "Draw";
    vm2.drawStatus = false;
    var coordinates = layer.toGeoJSON().geometry.coordinates;
    var dataString = coordinates.toString();
    var setLatLng = {lat: 0, lng: 0};
    for (var i = 0, length = coordinates[0].length; i < length - 1; i++) {
        setLatLng['lat'] += coordinates[0][i][1];
        setLatLng['lng'] += coordinates[0][i][0];
    }
    setLatLng['lat'] = setLatLng['lat'] / (length - 1);
    setLatLng['lng'] = setLatLng['lng'] / (length - 1);
    var chartIcon = L.icon({
        iconUrl: 'charticon/markerChart.png',
        iconSize: [40, 40],
        iconAnchor: [18, 35],
        popupAnchor: [0, -30]
    });
    var marker = new L.marker(setLatLng, {icon: chartIcon, draggable: 'true'});
    this.addLayer(marker);
    var line = L.polyline([setLatLng, setLatLng]);
    map.addLayer(line);
    layer['marker'] = marker;
    marker['lines'] = [line];
    marker['layers'] = [layer];
    displayChartAcross(marker, dataString, setLatLng);
    marker.on('drag', (evt) => {
        var curPos = [evt.latlng['lat'], evt.latlng['lng']];
        for (var i = 0, length = marker.lines.length; i < length; i++) {
            var originLatLng = marker.lines[i]['_latlngs'][0];
            marker.lines[i].setLatLngs([originLatLng, curPos]);
        }
    });
    marker.on('dragend', (evt) => {
        marker.openPopup();
        var wrapper = marker.getPopup()['_wrapper'];
        if (wrapper && wrapper.firstChild.firstChild.firstChild.id.startsWith('chartApp')) {
            var layer = marker.layers[0];
            var curPos = [evt.target['_latlng']['lat'], evt.target['_latlng']['lng']];
            for (var i = 0, length = drawLayerList.length; i < length; i++) {
                if (layer._leaflet_id !== drawLayerList[i]) {
                    var thisLayer = map['_layers'][drawLayerList[i]];
                    console.log(!thisLayer.hasOwnProperty("merged"));
                    var thisMarker = thisLayer.marker;
                    var thisPopup = thisMarker.getPopup();
                    if (!thisLayer.hasOwnProperty("merged") && thisPopup.isOpen()) {
                        var thisWrapper = thisPopup['_wrapper'];
                        var coor = thisLayer.toGeoJSON().geometry.coordinates[0];
                        var lowLat = coor[0][1];
                        var lowLng = coor[0][0];
                        var highLat = coor[0][1];
                        var highLng = coor[0][0];
                        for (var j = 0, coorLength = coor.length; j < coorLength - 1; j++) {
                            if (lowLat > coor[j][1]) lowLat = coor[j][1];
                            if (lowLng > coor[j][0]) lowLng = coor[j][0];
                            if (highLat < coor[j][1]) highLat = coor[j][1];
                            if (highLng < coor[j][0]) highLng = coor[j][0];
                        }
                        if (thisWrapper && thisWrapper.firstChild.firstChild.firstChild.id.startsWith('chartApp')) {
                            if (((curPos[0] >= lowLat && curPos[0] <= highLat || (curPos[0] >= highLat && curPos[0] <= lowLat)) &&
                                ((curPos[1] >= lowLng && curPos[1] <= highLng) || (curPos[1] >= highLng && curPos[1] <= lowLng)))) {
                                marker.layers.push(thisLayer);
                                thisLayer.marker = marker;
                                thisLayer['merged'] = true;
                                layer['merged'] = true;
                                var colorList = [layer.options.color, thisLayer.options.color];
                                mergeCharts(colorList, marker, thisMarker);
                                var lines = thisMarker.lines;
                                for (var j = 0, lineLength = thisMarker.lines.length; j < lineLength; j++) {
                                    var originLatLng = lines[j]['_latlngs'][0];
                                    lines[j].setLatLngs([originLatLng, curPos]);
                                    marker.lines.push(lines[j]);
                                }
                                const thisTimestamp = thisMarker._popup.getContent().firstChild.id.split('_')[1];
                                var deleteInd = chartTimestampList.findIndex((x) => x === thisTimestamp);
                                if (deleteInd !== -1) {
                                    chartTimestampList.splice(deleteInd, 1);
                                }
                                map.removeLayer(thisMarker);
                                deleteLineColor(thisMarker._leaflet_id);
                                break; // only merge the first found overlapping popups
                            }
                        }
                    }
                }
            }
        }
    });
    bindCharts(marker, dataString, 0, marker._leaflet_id);
});

map.on(L.Draw.Event.DELETED, function (event) {
    var layers = event.layers._layers;
    for (var ind in layers) {
        var marker = layers[ind].marker;
        if (marker._popup.getContent().firstChild && marker._popup.getContent().firstChild.id.startsWith("chartApp")) {
            const thisTimestamp = marker._popup.getContent().firstChild.id.split('_')[1];
            var deleteInd = chartTimestampList.findIndex((x) => x === thisTimestamp);
            if (deleteInd !== -1) {
                chartTimestampList.splice(deleteInd, 1);
            }
        }
        if (marker.lines) {
            for (var i = 0, length = marker.lines.length; i < length; i++) {
                map.removeLayer(marker.lines[i]);
            }
        }
        deleteLineColor(marker._leaflet_id);
        map.removeLayer(marker);
        for (var i in marker.layers) {
            var layer = marker.layers[i];
            if (layer.acrossLine) {
                for (var i in layer.acrossLine) {
                    if (layer.acrossLine[i]._popup.getContent().firstChild && layer.acrossLine[i]._popup.getContent().firstChild.id.startsWith("chartApp")) {
                        const thisTimestamp = layer.acrossLine[i]._popup.getContent().firstChild.id.split('_')[1];
                        var deleteInd = chartTimestampList.findIndex((x) => x === thisTimestamp);
                        if (deleteInd !== -1) {
                            chartTimestampList.splice(deleteInd, 1);
                        }
                    }
                    map.removeLayer(layer.acrossLine[i]);
                }
            }
            layerColor[layer.colorJSON.index].used = false;
            map.removeLayer(layer);
            drawLayerList = arrayRemove(drawLayerList, layer._leaflet_id);
        }
    }
    curChartNum = drawLayerList.length;
    layers = event.layers;
    layers.eachLayer(function (layer) {
        layerlist.delete(layer);
    });
    vm2.drawCreateDisabled = false;
    if (curChartNum <= 0) {
        vm2.drawDeleteDisabled = true;
    }
    searchByRegion();
});

function displayChartAcross(marker, coorString, setLatLng) {
    var layer = marker.layers[0];
    for (var i = 0, length = drawLayerList.length; i < length; i++) {
        if (layer._leaflet_id !== drawLayerList[i]) {
            var thisLayer = map['_layers'][drawLayerList[i]];
            var thisCoordinates = thisLayer.toGeoJSON().geometry.coordinates;
            var thisSetLatLng = {lat: 0, lng: 0};
            for (var j = 0, coorLength = thisCoordinates[0].length; j < coorLength - 1; j++) {
                thisSetLatLng['lat'] += thisCoordinates[0][j][1];
                thisSetLatLng['lng'] += thisCoordinates[0][j][0];
            }
            thisSetLatLng['lat'] = thisSetLatLng['lat'] / (coorLength - 1);
            thisSetLatLng['lng'] = thisSetLatLng['lng'] / (coorLength - 1);
            var thisLine = L.polyline([thisSetLatLng, setLatLng], {color: '#9e9e9e', weight: 7, clickable: true});
            map.addLayer(thisLine);
            if (layer['acrossLine']) {
                layer['acrossLine'].push(thisLine);
            } else {
                layer['acrossLine'] = [thisLine];
            }
            if (thisLayer['acrossLine']) {
                thisLayer['acrossLine'].push(thisLine);
            } else {
                thisLayer['acrossLine'] = [thisLine];
            }
            var dataString = coorString + 'p' +
                thisLayer.toGeoJSON().geometry.coordinates.toString();
            bindCharts(thisLine, dataString, 11, marker._leaflet_id);
        }
    }
}

function bindCharts(objectLayer, dataString, val, marker_id = -1) {
    var div = L.DomUtil.create('div');
    div.style.width = '301px';
    div.style.height = '40px';
    objectLayer.bindPopup(div, {closeOnClick: false, autoClose: false});
    objectLayer.on('popupopen', function () {
        new Promise(function (resolve, reject) {
            var timeStamp = Date.now() + val;
            div.id = "chartWrapper" + timeStamp;
            div.innerHTML = '<div id="chartLoadingApp' + timeStamp + '">' +
                '<div v-loading="loading" style="width:301px;height:40px;"></div>' +
                '</div>';
            resolve(timeStamp);
        }).then(function (timeStamp) {
            if (document.getElementById('chartLoadingApp' + timeStamp)) {
                new Vue({
                    data() {
                        return {
                            loading: true
                        };
                    }
                }).$mount('#chartLoadingApp' + timeStamp);
            }
            $.ajax({
                type: "GET",
                url: "http://10.20.126.63:9981/getRegionInfo?" + getSelectedDate() + ";" + timeStamp + ';' + dataString,
                // url: "/test_data.json",
                dataType: 'json',
                scriptCharset: 'utf-8',
                success: function (data) {
                    dataReceived(data, div, marker_id, timeStamp);
                },
                error: function () {
                    div.innerHTML = "<p>err: Network issue, please refresh.</p>";
                }
            });
            objectLayer.off('popupopen');
        });
    });
}

function dataReceived(data, div, marker_id, timeStamp) {
    var ts = data['timestamp'];
    if (document.getElementById("chartWrapper" + ts)) {
        div = document.getElementById("chartWrapper" + ts);
        // div = document.getElementById("chartWrapper" + timeStamp);
        div.style.height = 'auto';
        var chart1Data, chart2Data, chart3Data;
        chart1Data = data['chart1'];
        chart2Data = data['chart2'];
        chart3Data = data['chart3'];
        var timestamp = Date.now();
        bindPopupOpen(timestamp, div, chart1Data, chart2Data, chart3Data, marker_id);
    }
}

function bindPopupOpen(timestamp, div, chart1Data, chart2Data, chart3Data, marker_id) {
    new Promise(function (resolve, reject) {
        div.innerHTML =
            '<div id="chartApp_' + timestamp + '">' +
            '<el-collapse v-model="activeName1">' +
            '<el-collapse-item title="Bus Route Flow-Time" name="1">' +
            '<el-tabs v-model="activeName2">\n' +
            '<el-tab-pane label="Total" name="first">' +
            '<el-popover :close-delay="500" placement="right-start" width="175" style="height:240px;" trigger="hover">' +
            '<div slot="reference" id="rchart1_' + timestamp + '" style="width:300px;height:250px;"></div>' +
            '<div id="rchart5_' + timestamp + '" style="width:150px;height:240px;"></div>' +
            '<div id ="chartWrapper6_' + timestamp + '">' +
            '<el-button icon="el-icon-arrow-left" size="mini" circle @click="goBack"></el-button>' +
            '<div id="rchart6_' + timestamp + '" style="width:150px;height:212px;"></div>' +
            '</div>' +
            '</el-popover>' +
            '</el-tab-pane>\n' +
            '<el-tab-pane label="Percentage" name="second">' +
            '<div id="rchart4_' + timestamp + '" style="width:300px;height:250px;"></div>' +
            '</el-tab-pane>' +
            '</el-tabs>' +
            '</el-collapse-item>' +
            '<el-collapse-item title="Average Speed-Time" name="2">' +
            '<div id="rchart2_' + timestamp + '" style="width:300px;height:250px;"></div>' +
            '</el-collapse-item>' +
            '<el-collapse-item title="Directional flow-Time" name="3">' +
            '<div id="rchart3_' + timestamp + '" style="width:300px;height:250px;"></div>' +
            '</el-collapse-item>' +
            '</el-collapse>' +
            '</div>';
        var Main = new Vue({
            el: '#chartApp_' + timestamp,
            data: {
                activeName1: ['1'],
                activeName2: 'first',
                drawer: false,
                direction: 'rtl',
                closeDelay: 500
            },
            methods: {
                goBack: function () {
                    $('#rchart5_' + timestamp).show();
                    $('#chartWrapper6_' + timestamp).hide();
                }
            }
        });
        chartTimestampList.push(timestamp.toString());
        resolve();
    }).then(function () {
        var legend = chart1Data['type'];
        if (marker_id !== -1) {
            putLineColor(marker_id, legend);
        }
        var setColor = [];
        for (var i in legend) {
            setColor.push(getLineColor(legend[i]));
        }
        chartDisplay1(chartTimestampList, timestamp, chart1Data, setColor);
        chartDisplay2(chartTimestampList, timestamp, chart2Data);
        chartDisplay3(chartTimestampList, timestamp, chart3Data);
        chartDisplay4(chartTimestampList, timestamp, chart1Data, setColor);
        chartDisplay5(chartTimestampList, timestamp);
        chartDisplay6(chartTimestampList, timestamp);
        $('#chartWrapper6_' + timestamp).hide();
    }).catch(function () {
        div.innerHTML = "chart error, please refresh.";
    });
}

function mergeCharts(colorList, keepMarker, deleteMarker) {
    chartReplay1(colorList, chartTimestampList, keepMarker, deleteMarker);
    chartReplay2(chartTimestampList, keepMarker, deleteMarker);
    chartReplay3(chartTimestampList, keepMarker, deleteMarker);
    chartReplay4(colorList, chartTimestampList, keepMarker, deleteMarker);
}

function heatMap() {//show heat map, click once show, click twice hid.
    $.ajax({
        type: "GET",
        url: "/show_heatmap",//注意路径
        data: restring,
        success: function (data) {
            var record = [];
            var heatdata = data.toString().split("\n");
            for (var i = 0; i < heatdata.length; i++) {
                if (heatdata[i].length > 1) {
                    var tmp = {
                        lat: parseFloat(heatdata[i].split(" ")[0]),
                        lng: parseFloat(heatdata[i].split(" ")[1]),
                        count: 1
                    };
                    record.push(tmp);
                }
            }
            var testData = {
                max: 20,
                //data: [{lat: 24.6408, lng:46.7728, count: 3},{lat: 50.75, lng:-1.55, count: 1},{lat: 52.6333, lng:1.75, count: 1},{lat: 48.15, lng:9.4667, count: 1},{lat: 52.35, lng:4.9167, count: 2},{lat: 60.8, lng:11.1, count: 1},{lat: 43.561, lng:-116.214, count: 1},{lat: 47.5036, lng:-94.685, count: 1},{lat: 42.1818, lng:-71.1962, count: 1},{lat: 42.0477, lng:-74.1227, count: 1},{lat: 40.0326, lng:-75.719, count: 1},{lat: 40.7128, lng:-73.2962, count: 2},{lat: 27.9003, lng:-82.3024, count: 1},{lat: 38.2085, lng:-85.6918, count: 1},{lat: 46.8159, lng:-100.706, count: 1},{lat: 30.5449, lng:-90.8083, count: 1},{lat: 44.735, lng:-89.61, count: 1},{lat: 41.4201, lng:-75.6485, count: 2},{lat: 39.4209, lng:-74.4977, count: 1},{lat: 39.7437, lng:-104.979, count: 1},{lat: 39.5593, lng:-105.006, count: 1},{lat: 45.2673, lng:-93.0196, count: 1},{lat: 41.1215, lng:-89.4635, count: 1},{lat: 43.4314, lng:-83.9784, count: 1},{lat: 43.7279, lng:-86.284, count: 1},{lat: 40.7168, lng:-73.9861, count: 1},{lat: 47.7294, lng:-116.757, count: 1},{lat: 47.7294, lng:-116.757, count: 2},{lat: 35.5498, lng:-118.917, count: 1},{lat: 34.1568, lng:-118.523, count: 1},{lat: 39.501, lng:-87.3919, count: 3},{lat: 33.5586, lng:-112.095, count: 1},{lat: 38.757, lng:-77.1487, count: 1},{lat: 33.223, lng:-117.107, count: 1},{lat: 30.2316, lng:-85.502, count: 1},{lat: 39.1703, lng:-75.5456, count: 8},{lat: 30.0041, lng:-95.2984, count: 2},{lat: 29.7755, lng:-95.4152, count: 1},{lat: 41.8014, lng:-87.6005, count: 1},{lat: 37.8754, lng:-121.687, count: 7},{lat: 38.4493, lng:-122.709, count: 1},{lat: 40.5494, lng:-89.6252, count: 1},{lat: 42.6105, lng:-71.2306, count: 1},{lat: 40.0973, lng:-85.671, count: 1},{lat: 40.3987, lng:-86.8642, count: 1},{lat: 40.4224, lng:-86.8031, count: 4},{lat: 47.2166, lng:-122.451, count: 1},{lat: 32.2369, lng:-110.956, count: 1},{lat: 41.3969, lng:-87.3274, count: 2},{lat: 41.7364, lng:-89.7043, count: 2},{lat: 42.3425, lng:-71.0677, count: 1},{lat: 33.8042, lng:-83.8893, count: 1},{lat: 36.6859, lng:-121.629, count: 2},{lat: 41.0957, lng:-80.5052, count: 1},{lat: 46.8841, lng:-123.995, count: 1},{lat: 40.2851, lng:-75.9523, count: 2},{lat: 42.4235, lng:-85.3992, count: 1},{lat: 39.7437, lng:-104.979, count: 2},{lat: 25.6586, lng:-80.3568, count: 7},{lat: 33.0975, lng:-80.1753, count: 1},{lat: 25.7615, lng:-80.2939, count: 1},{lat: 26.3739, lng:-80.1468, count: 1},{lat: 37.6454, lng:-84.8171, count: 1},{lat: 34.2321, lng:-77.8835, count: 1},{lat: 34.6774, lng:-82.928, count: 1},{lat: 39.9744, lng:-86.0779, count: 1},{lat: 35.6784, lng:-97.4944, count: 2},{lat: 33.5547, lng:-84.1872, count: 1},{lat: 27.2498, lng:-80.3797, count: 1},{lat: 41.4789, lng:-81.6473, count: 1},{lat: 41.813, lng:-87.7134, count: 1},{lat: 41.8917, lng:-87.9359, count: 1},{lat: 35.0911, lng:-89.651, count: 1},{lat: 32.6102, lng:-117.03, count: 1},{lat: 41.758, lng:-72.7444, count: 1},{lat: 39.8062, lng:-86.1407, count: 1},{lat: 41.872, lng:-88.1662, count: 1},{lat: 34.1404, lng:-81.3369, count: 1},{lat: 46.15, lng:-60.1667, count: 1},{lat: 36.0679, lng:-86.7194, count: 1},{lat: 43.45, lng:-80.5, count: 1},{lat: 44.3833, lng:-79.7, count: 1},{lat: 45.4167, lng:-75.7, count: 2},{lat: 43.75, lng:-79.2, count: 2},{lat: 45.2667, lng:-66.0667, count: 3},{lat: 42.9833, lng:-81.25, count: 2},{lat: 44.25, lng:-79.4667, count: 3},{lat: 45.2667, lng:-66.0667, count: 2},{lat: 34.3667, lng:-118.478, count: 3},{lat: 42.734, lng:-87.8211, count: 1},{lat: 39.9738, lng:-86.1765, count: 1},{lat: 33.7438, lng:-117.866, count: 1},{lat: 37.5741, lng:-122.321, count: 1},{lat: 42.2843, lng:-85.2293, count: 1},{lat: 34.6574, lng:-92.5295, count: 1},{lat: 41.4881, lng:-87.4424, count: 1},{lat: 25.72, lng:-80.2707, count: 1},{lat: 34.5873, lng:-118.245, count: 1},{lat: 35.8278, lng:-78.6421, count: 1}]
                data: []
            };//add 11.19
            if (flag1 == 1) {
                flag1 = 0;
                testData.data = record;
                testData.data[0].count += 1;
                heatmapLayer.setData(testData);//add 11.19
            } else {
                flag1 = 1;
                testData.data = [];
                heatmapLayer.setData(testData);//add 11.19
            }
        }
    })
}

function trajDis() { //click once hid trajectory, click twice show trajectory.
    var tmp;
    if (flag2 == 0) {
        flag2 = 1;
        tmp = trsjlist;
        for (i = 0; i < trsjlist.length; i++) {
            tmp[i].remove();
            //map.removeLayer(motionlist[i]);
        }
    } else {
        flag2 = 0;
        for (i = 0; i < trsjlist.length; i++) {
            trsjlist[i].addTo(map);
            //map.removeLayer(motionlist[i]);
        }
    }
}

function trajClean() {
    if (window.confirm("确认清除所有轨迹？")) {
        var testData = {
            data: []
        };//add 11.19
        heatmapLayer.setData(testData);//add 11.19
        restring = "";
        flagfirstquery = true;
        // $("#table_result tr:not(:first)").remove();
        // $("#table_region tr:not(:first)").remove();
        for (i = 0; i < trsjlist.length; i++) {
            trsjlist[i].remove();
            //map.removeLayer(motionlist[i]);
        }
        layerlist.forEach(function (alayer) {
            alayer.remove();
        });
        for (i = 0; i < marklistdir.length; i++) {
            marklistdir[i].remove();
        }
        for (i = 0; i < marklistopdir.length; i++) {
            marklistopdir[i].remove();
        }
        marklistdir = [];
        marklistopdir = [];
        trsjlist = [];
        //motionlist = [];
        layerlist = new Set();
        $("#onShowNum").text("");
        $("#showTotalNum").text("");
        //$.get("/clear","clear",function(){});
    }
}

function searchByRegion() { // Region Search
    restring = "";
    curTrsjTimestamp = Date.now();
    restring += curTrsjTimestamp + ';';
    drawLayerList.forEach(function (layerId) {
        var resp = map['_layers'][layerId].toGeoJSON().geometry.coordinates.toString();
        restring += resp + "p";
    });
    $.get("http://10.20.126.63:9981/trajTran", restring, function (data) {
        var rtn = JSON.parse(data);
        if (rtn['timestamp'] === curTrsjTimestamp.toString()) {
            for (var i = 0; i < trsjlist.length; i++) {
                trsjlist[i].remove();
            }
            trsjlist = [];
            if (rtn['data']) {
                render(rtn['data']);
            }
        } else {
            console.log("data deprecated.");
        }
    });
    restring = "";
}

function render(data) {
    if (data === "NO_TRAJ")
        alert("no trajectory");
    else {
        var trajs = data.toString().split("\n");
        if(vm2.isBusLinesShow === true) {
            vm2.isBusLinesShow = false;
            map.removeLayer(lgroup);
        }
        for (var j = 0, len = trajs.length - 1; j < len; j++) {
            eval("var longLatList = " + trajs[j]);//经纬度数组
            var gPath = L.polyline(longLatList, {
                "weight": 1.5,　　　　//线宽
                "opacity": 0.6,　　//透明度
                "color": "#74325c"　//颜色
            });

            for (var i = 0; i < longLatList.length; i++) {
                if (longLatList[i] === undefined) {
                    gPath = undefined;
                    break;
                }
            }
            if (gPath !== undefined) {
                gPath.addTo(map);
                trsjlist.push(gPath);
            }

        }
    }
}

var vm2 = new Vue({
    el: "#app2",
    data: {
        lineSearchId: [],
        line_ids: [],
        roadValue: '',
        roadOptions: [],
        road_loading_status: false,
        isRoadShow: false,
        isBusLinesShow: true,
        isStationsShow: true,
        isLineStationsShow: false,
        isBusFlowShow: false,
        date_range: [new Date(2016, 0, 1, 6, 0), new Date(2016, 0, 1, 11, 0)],
        line_loading_status: false,
        // road_loading_status: false,
        isCollapse: true,
        notCollapse: false,
        table: false,
        value: [],//储存右侧所有的值
        topLine: [{
            label: 'M131',
            key: 'M131'
        }],//储存所有的数据
        optionInfo: optionInfo,
        drawStatus: false,
        deleteStatus: false,
        drawText: "Draw",
        deleteIcon: "el-icon-delete",
        drawCreateDisabled: false,
        drawDeleteDisabled: true,
        pickerOptions: {
            disabledDate(time) {
                return time.getTime() < new Date(2019, 0, 1) ||
                    time.getTime() > new Date(2019, 0, 7);
            }
        },
        dateValue: new Date(2019, 0, 1),
        defaultOpeneds: ['1']
    },
    methods: {
        linePlaybackPrompt: function (name) {
            this.$confirm('Sure to Analyze Line ' + name + '?', 'Prompt', {
                confirmButtonText: 'Yes',
                cancelButtonText: 'No',
                type: 'warning'
            }).then(() => {
                this.$message({
                    type: 'success',
                    message: 'Running Analysis.'
                });
                this.line_ids.push(name);
                this.linePlayBack();
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: 'Cancelled Analysis.'
                });
            });
        },
        showBusFlow: function () {
            if (this.isBusFlowShow) {
                cvs.style.visibility = 'visible';
                if (click_minimap === false) {
                    dataIdx = 0;
                    min_offset = 0;
                }
                // $("#minimap_time").hide();
                clearInterval(minimap_interval);
                $("#minimap").hide();
                $("#timeline_footer").show();
                let h = parseInt(dataIdx / 3 / 60);
                let m = (dataIdx / 3) % 60;
                if (h === 23 && m === 58) {
                    min_offset = 0;
                    dataIdx = leftbar_time;
                }
                let hdata = getTimeString(h, m);
                d3.select("#timeline_footer").select("h1").datum(hdata).text(function (d) {
                    return d;
                });
                mapCanvasLayer.drawLayer();
            } else {
                cvs.style.visibility = 'hidden';
                click_minimap = false;
                $("#timeline_footer").hide();
                clearInterval(timeline_interval);
                // $("#minimap_time").show();
                $("#minimap").show();
                timelineVue.pauseIcon();
                mini_canvasLayer.drawLayer();
            }
        },
        drawCreate: function () {
            if (!this.drawStatus) {
                this.drawStatus = true;
                drawRectangle.enable();
                this.drawText = "Cancel";
            } else {
                drawRectangle.disable();
                this.drawStatus = false;
                this.drawText = "Draw";
            }
        },
        drawDelete: function () {
            if (!this.deleteStatus) {
                deleteLayer.enable();
                this.deleteIcon = "el-icon-check";
                this.deleteStatus = true;
            } else {
                try {
                    deleteLayer.save();
                    deleteLayer.disable();
                } catch (err) {
                }
                this.deleteIcon = "el-icon-delete";
                this.deleteStatus = false;
            }
        },
        showStations: function () {
            if (this.isStationsShow) {
                map.addLayer(Station_markers);
            } else {
                map.removeLayer(Station_markers);
            }
        },
        showBusLines: function () {
            if (!this.isBusLinesShow) {
                map.removeLayer(lgroup);
            } else {
                map.addLayer(lgroup);
            }
        },
        showLineStations: function () {
            if (this.isLineStationsShow === true) {
                stationGroup = L.layerGroup();
                axios.get('http://10.20.126.63:9981/queryline', {
                    params: {
                        lineIds: this.line_ids + ''
                    }
                }).then(response => {
                    for (let line in response.data) {
                        for (let i = 0; i < response.data[line].length; i++) {
                            var myIcon = L.icon({
                                iconUrl: '/busicon/station.png',
                                iconSize: [20, 20],
                                iconAnchor: [10, 20],
                                className: 'stationIcon'
                            });
                            let marker = L.marker([response.data[line][i].LATITUDE, response.data[line][i].LONGITUDE], {
                                icon: myIcon,
                                title: response.data[line][i].NAME
                            });
                            stationGroup.addLayer(marker);
                        }
                    }
                });
                stationGroup.addTo(map);
            } else {
                stationGroup.clearLayers();
            }
        },
        heatMap: heatMap,
        linePlayBack: function () {
            if (this.line_ids + '' === '') {
                alert('Please enter line id');
            } else {
                let color = [0, "#377eb8", "#4daf4a", "#984ea3","#a65628", "#17becf"];

                this.date_range[0].setFullYear(2016, this.dateValue.getMonth(), this.dateValue.getDate());
                this.date_range[1].setFullYear(2016, this.dateValue.getMonth(), this.dateValue.getDate());
                let start_date = this.date_range[0].Format('yyyy-MM-dd hh:mm:ss');
                let end_date = this.date_range[1].Format('yyyy-MM-dd hh:mm:ss');

                let that = this;
                flagfirstquery = true;
                this.line_loading_status = true;
                flagfirstquery = true;
                let lineIds = this.line_ids + '';
                $.ajax({
                    type: 'GET',
                    url: 'http://10.20.126.63:9981/queryid',
                    // url: '/test_data.json',
                    data: {
                        lineId: lineIds,
                        start: start_date,
                        end: end_date
                    },
                    success: function (data) {
                        console.log(this.url);
                        let cnt = 0;
                        data = JSON.parse(data);
                        playbackClearLines();
                        let tracks = [];
                        for (let lineId in data) {
                            let line_data = data[lineId];
                            cnt++;
                            if (line_data === 'no this line' || line_data === 'no data') {
                                console.log(lineId + ' no data');
                                continue;
                            }
                            let total_tmp_data = line_data['data'].split("\n");
                            let tmp_data = total_tmp_data.slice(1);
                            let my_line = total_tmp_data[0];
                            let latlngs = eval(my_line);
                            let polyline = L.polyline(latlngs, {
                                color: color[(cnt - 1) % (color.length - 1) + 1],
                                weight: 4,
                                className: 'line_path'
                            }).addTo(map);
                            let content =
                                '<div id="lineInfo">' +
                                '    <span style="font-size: 24px; font-weight: bold">Bus Route ' + lineId + '</span>\n' +
                                '    <el-collapse v-model="valueName">' +
                                '         <el-collapse-item title="Forward/Backward bus number" name="1">\n' +
                                '              <div id=pos_neg' + lineId + ' style="width: 350px; height: 250px"></div>\n' +
                                '         </el-collapse-item>' +
                                '         <el-collapse-item v-show="showPeople" title="Number of people at each stop" name="2">\n' +
                                '              <div id=card' + lineId + ' style="width: 350px; height: 250px"></div>\n' +
                                '         </el-collapse-item>' +
                                '         <el-collapse-item title="Number of buses per hour" name="3">\n' +
                                '              <div id=car' + lineId + ' style = "width: 350px; height: 250px"></div>\n' +
                                '         </el-collapse-item>' +
                                '    </el-collapse>' +
                                '</div>';
                            let popup = L.popup({minWidth: 355});

                            popup.setContent(content);
                            polyline.bindPopup(popup);
                            //展示查询的线路 end
                            polyline.on('popupopen', function (e) {
                                let popup = e.target.getPopup();
                                popup.openOn(map);
                                let echart = echarts;
                                let vue2 = new Vue({
                                    el: '#lineInfo',
                                    data: {
                                        valueName: '[1]',
                                        showPeople: true
                                    },
                                    method: {},
                                    mounted: function () {
                                        let buslinedata = line_map.get(lineId);

                                        let line_pos = new Map();
                                        let line_neg = new Map();

                                        let min_date = new Date(start_date);
                                        let max_date = new Date(end_date);

                                        min_date = new Date(Math.floor(min_date.getTime() / 3600000) * 3600000);
                                        max_date = new Date((Math.ceil(max_date.getTime() / 3600000)) * 3600000);
                                        let slides = 20;
                                        let date = new Date(min_date);
                                        while (true) {
                                            if (date >= max_date) {
                                                break;
                                            }
                                            line_pos.set(new Date(date).getTime(), new Set());
                                            line_neg.set(new Date(date).getTime(), new Set());
                                            date.setMinutes(slides + date.getMinutes());
                                        }
                                        let x_axis_pos_neg = Array.from(line_pos.keys());
                                        for (let i = 0; i < tmp_data.length; i++) {
                                            let line_data = tmp_data[i].split(';');
                                            for (let j = 0; j < line_data.length; j++) {
                                                let bus_data = line_data[j].split(',');
                                                let date = new Date(parseInt(bus_data[2]));
                                                let plate_num = bus_data[3];

                                                let date_range;
                                                for (let k = 0; k < x_axis_pos_neg.length; k++) {
                                                    if (x_axis_pos_neg[k] <= date && date <= x_axis_pos_neg[k] + slides * 60 * 1000) {
                                                        date_range = x_axis_pos_neg[k];
                                                    }
                                                }
                                                if (parseInt(bus_data[5]) === 1) {
                                                    line_pos.get(date_range).add(plate_num);
                                                } else if (parseInt(bus_data[5]) === 0) {
                                                    line_neg.get(date_range).add(plate_num);
                                                }
                                            }
                                        }
                                        let carddata = line_data['swipe'].split(';');
                                        let stops = [];
                                        let swipenums = [];
                                        this.showPeople = false;
                                        for (let i = 0; i < carddata.length; i++) {
                                            let x = carddata[i].split(':');
                                            stops.push(decodeURIComponent(x[0]));
                                            swipenums.push(x[1]);
                                            if (parseInt(x[1]) !== 0) {
                                                this.showPeople = true;
                                            }
                                        }
                                        for (let i = 0; i < stops.length; i++) {
                                            stops[i] = 'S' + (i + 1);
                                        }
                                        let thischart = echarts.init($('#card' + lineId)[0]);
                                        let option = {
                                            title: {
                                                text: 'Number of people at each stop',
                                                font: 10
                                            },
                                            calculable: true,
                                            tooltip: {
                                                trigger: 'axis',
                                                axisPointer: {
                                                    type: 'shadow',
                                                    label: {
                                                        show: true
                                                    }
                                                }
                                            },
                                            grid: {
                                                left: '10%',
                                                right: '20%',
                                                bottom: '10%'
                                                // containLabel: true
                                            },
                                            xAxis: {
                                                name: 'Stops',
                                                data: stops,
                                                axisLabel: {
                                                    textStyle: {
                                                        fontSize: 8
                                                    }
                                                    // formatter: function (val) {
                                                    //     return val.split('').join('\n');
                                                    // }
                                                }
                                            },
                                            yAxis: [
                                                {
                                                    type: 'value',
                                                    name: 'Amount'
                                                }
                                            ],

                                            dataZoom: [{
                                                type: 'inside'
                                            }],
                                            series: [
                                                {
                                                    name: 'Amount',
                                                    type: 'bar',
                                                    yAxisIndex: 0,
                                                    data: swipenums
                                                }
                                            ]
                                        };
                                        let thisChart2 = echarts.init($("#car" + lineId)[0]);
                                        let option2 = {
                                            title: {
                                                text: 'Number of buses per hour',
                                                font: 10
                                            },
                                            calculable: true,
                                            tooltip: {
                                                trigger: 'axis',
                                                axisPointer: {
                                                    type: 'shadow',
                                                    label: {
                                                        show: true
                                                    }
                                                }
                                            },
                                            grid: {
                                                left: '10%',
                                                right: '15%',
                                                bottom: '8%'
                                                // containLabel: true
                                            },
                                            xAxis: {
                                                name: 'Time',
                                                data: ["0-1", "1-2", "2-3", "3-4", "4-5", "5-6", "6-7", "7-8", "8-9", "9-10", "10-11", "11-12", "11-12",
                                                    "12-13", "13-14", "14-15", "15-16", "16-17", "17-18", "18-19",
                                                    "19-20", "20-21", "21-22", "22-23", "23-24"]
                                            },
                                            yAxis: [
                                                {
                                                    type: 'value',
                                                    name: 'Amount'
                                                }
                                            ],
                                            series: [
                                                {
                                                    name: 'Amount',
                                                    type: 'bar',
                                                    yAxisIndex: 0,
                                                    data: buslinedata
                                                }
                                            ]
                                        };
                                        let thischart3 = echarts.init($('#pos_neg' + lineId)[0]);
                                        let x_axis_pos_neg2 = [];
                                        let y_axis_pos = [];
                                        let y_axis_neg = [];
                                        for (let i = 0; i < x_axis_pos_neg.length; i++) {
                                            let date = new Date(x_axis_pos_neg[i]);
                                            x_axis_pos_neg2[i] = date.getHours() + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
                                            y_axis_pos.push(line_pos.get(x_axis_pos_neg[i]).size);
                                            y_axis_neg.push(line_neg.get(x_axis_pos_neg[i]).size);
                                        }

                                        let option3 = {
                                            animation: true,
                                            title: {
                                                text: 'Forward/Backward bus number',
                                                font: 10
                                            },
                                            tooltip: {
                                                trigger: 'axis'
                                            },
                                            legend: {
                                                y: 'bottom',
                                                data: ['Forward', 'Backward']
                                            },
                                            grid: {
                                                top: '25%',
                                                left: '3%',
                                                right: '15%',
                                                bottom: '10%',
                                                containLabel: true
                                            },
                                            dataZoom: [{
                                                type: 'inside'
                                            }],
                                            xAxis: {
                                                name: 'Time',
                                                type: 'category',
                                                boundaryGap: false,
                                                data: x_axis_pos_neg2
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
                                                    data: y_axis_pos
                                                },
                                                {
                                                    name: 'Backward',
                                                    type: 'line',
                                                    stack: 'Total2',
                                                    data: y_axis_neg
                                                }
                                            ]
                                        };
                                        thischart.setOption(option);
                                        // 使用刚指定的配置项和数据显示图表。
                                        thisChart2.setOption(option2);
                                        thischart3.setOption(option3);
                                    }
                                });

                            });
                            for (let i = 0; i < tmp_data.length; i++) {
                                let directions = [];
                                let thisline = tmp_data[i].split(";");
                                let cor = [];
                                let time = [];
                                let speed = [];
                                let plate_num;
                                let direction;
                                for (var j = 0; j < thisline.length; j++) {
                                    var tmpNode = thisline[j].split(",");
                                    cor.push([parseFloat(tmpNode[1]), parseFloat(tmpNode[0])]);
                                    time.push(parseInt(tmpNode[2]));
                                    speed.push((parseFloat(tmpNode[4])).toFixed(2));
                                    plate_num = decodeURIComponent(tmpNode[3]);
                                    directions.push(parseInt(tmpNode[5]));
                                }
                                var houseToCoordley = {
                                    "type": "Feature",
                                    "geometry": {
                                        "type": "MultiPoint",
                                        "coordinates": cor
                                    },
                                    "properties": {
                                        "time": time,
                                        "plate": plate_num,
                                        "line_id": lineId,
                                        "cnt": (cnt - 1) % (color.length - 1) + 1,
                                        "directions": directions,
                                        "speed": speed
                                    }
                                };
                                tracks.push(houseToCoordley)
                            }
                        }
                        let myicon = L.icon({
                            iconUrl: null,
                            className: 'bus_marker',
                        });
                        let playbackOptions = {
                            playControl: true,
                            dateControl: false,
                            sliderControl: true,
                            popups: true,
                            tickLen: 10000,
                            orientIcons: true,
                            marker: {
                                icon: myicon
                            }
                        };
                        playback = new L.Playback(map, tracks, null, playbackOptions);
                        that.line_loading_status = false;
                    }
                });
            }
        },

        showRoads: function () {
            if (this.isRoadShow === false) {
                $('.road_path').remove();
            } else {
                let that = this;
                this.isBusLinesShow = false;
                this.showBusLines();
                axios.get('http://10.20.126.63:9981/roadInfo').then(response => {
                    let road_data = response.data;
                    for (let road_name in road_data) {
                        if (!road_data.hasOwnProperty(road_name)) continue;
                        let road_list = road_data[road_name].split(',');
                        let latlngs = [];
                        for (let i = 0; i < road_list.length; i += 2) {
                            latlngs.push([parseFloat(road_list[i + 1]), parseFloat(road_list[i])]);
                        }
                        let polyline;
                        try {
                            polyline = L.polyline(latlngs, {
                                color: '#fdc086',
                                weight: 2,
                                opacity: 0,
                                className: 'road_path'
                            }).addTo(map);
                        } catch (err) {
                            alert(err);
                        }
                        let timestamp = Date.now();
                        let content =
                            '<div id=roadInfo' + timestamp + ' v-loading="roadLoading">' +
                            '    <span style="font-size: 24px; font-weight: bold">' + road_name + '</span>\n' +
                            '    <el-collapse v-model="roadInfoHidden">' +
                            '        <el-collapse-item title="Bus Route Flow-Time" name="1">' +
                            '        <el-collapse-item title="Bus Route Flow-Time" name="1">' +
                            '            <el-popover placement="right-start" trigger="hover" >' +
                            '                <template><div slot="reference" v-bind:id="\'rchart1_\' + timeId" style="width: 370px; height: 300px"></div></template>' +
                            '                <div>' +
                            '                    <div><el-row style="margin-bottom: 5px"><el-col :offset="15"><el-button size="mini" @click="playbackRoad()">Analyze</el-button></el-col></el-row></div>' +
                            '                    <div v-bind:id="\'rchart4_\' + timeId" style="width: 240px; height: 220px"></div>' +
                            '                </div>' +
                            '            </el-popover>' +
                            '        </el-collapse-item>' +
                            '        <el-collapse-item title="Average Speed (km/h)" name="2">' +
                            '            <div v-bind:id="\'rchart2_\' + timeId" style="width: 370px; height: 300px"></div>' +
                            '        </el-collapse-item>' +
                            '        <el-collapse-item title="Directional Flow-Time" name="3">' +
                            '                <div v-bind:id="\'rchart3_\' + timeId" style="width: 370px; height: 300px"></div>' +
                            '            </el-popover>' +
                            '        </el-collapse-item>' +
                            '    </el-collapse>' +
                            '</div>\n';
                        let popup = L.popup({minWidth: 380});
                        popup.setContent(content);
                        polyline.bindPopup(popup, {autoClose: false, closeOnClick: false});
                        polyline.on('mouseover', function (e) {
                            e.target.setStyle({
                                color: 'red',
                                opacity: 1,
                                weight: 6
                            });
                        });
                        polyline.on('mouseout', function (e) {
                            e.target.setStyle({
                                color: 'red',
                                weight: 2,
                                opacity: 0
                            });
                        });
                        polyline.on('popupopen', function (e) {
                            axios.get('http://10.20.126.63:9981/road', {
                                params: {
                                    roadId: road_name,
                                    date: getSelectedDate()
                                }
                            }).then(response => {
                                let data = response.data;
                                console.log(this.url);
                                let popup = e.target.getPopup();
                                let vmRoad = new Vue({
                                    el: '#roadInfo' + timestamp,
                                    data: {
                                        roadInfoHidden: '[1]',
                                        roadLoading: false,
                                        timeId: Date.now()
                                    },
                                    methods: {
                                        playbackRoad: function () {
                                            let pieChart = echarts.getInstanceByDom(document.getElementById('rchart4_' + this.timeId));
                                            let topLines = pieChart.getOption().series[0].data;
                                            that.line_ids = [];
                                            for (let i = 0; i < topLines.length; i++) {
                                                that.line_ids.push(topLines[i].name);
                                            }
                                            this.$message('Start searching bus lines');
                                            that.linePlayBack();
                                        }
                                    },
                                    mounted: function () {
                                        let chart1Data = data.chart1;
                                        let chart2Data = data.chart2;
                                        let chart3Data = data.chart3;
                                        let timestampList = [this.timeId];
                                        var legend = chart1Data['type'];
                                        var setColor = [];
                                        putLineColor(555, legend);
                                        for (var i in legend) {
                                            setColor.push(getLineColor(legend[i]));
                                        }
                                        let colorsList = ['#bdbdbd', "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];
                                        chartDisplay1(timestampList, this.timeId, chart1Data, setColor, true);
                                        chartDisplay2(timestampList, this.timeId, chart2Data, true);
                                        chartDisplay3(timestampList, this.timeId, chart3Data, true);
                                    }
                                });
                            })
                        })
                    }
                });
            }
        },
        trajDis: trajDis,
        clearLines: function () {
            this.line_ids = [];
            playbackClearLines();
        },
        trajClean: trajClean,
        searchByRegion: searchByRegion,

        filterMethod: function (query, item) {
            return item.label.indexOf(query) > -1
        },

        testValue: function () {
            if (this.value.length > 0)
                alert(this.value[0]);
        },
        dateChange: function () {
            this.isBusLinesShow = true;
            getLineInfo_runtime(getSelectedDate());
            getLineInfo(getSelectedDate());
        }
    },
    mounted: function () {
        axios.get('http://10.20.126.63:9981/roadInfo').then(response => {
            let data = response.data;
            for (let road_name in data) {
                this.roadOptions.push(road_name);
            }
        });
        let date = new Date(this.dateValue.getTime() - (this.dateValue.getTimezoneOffset() * 60000));
        date.setFullYear(2016);
        let dateString = date.toISOString().split("T")[0];
        getLineInfo_runtime(dateString);
        getLineInfo(dateString);
        axios.get('http://10.20.126.63:9981/getLineInfo').then(response => {
            for (let i = 0; i < response.data.data.length; i++) {
                this.lineSearchId.push(response.data.data[i]);
            }
        });
    }
});

function playbackClearLines() {
    $('#control').remove();
    $('.line_path').remove();
    if (playback) {
        playback.destroy();
        playback = null;
    }
}

var optionInfo = {
    tooltip: {
        trigger: 'axis',
        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        }
    },
    title: {
        text: "",
        font: 10
    },
    legend: {
        data: []
    },
    grid: {
        left: '10%',
        right: '20%'
        // containLabel: true
    },
    xAxis: [
        {
            type: 'category',
            data: ["0-1", "1-2", "2-3", "3-4", "4-5", "5-6", "6-7", "7-8", "8-9", "9-10", "10-11", "11-12", "11-12",
                "12-13", "13-14", "14-15", "15-16", "16-17", "17-18", "18-19",
                "19-20", "20-21", "21-22", "22-23", "23-24"]
        }
    ],
    yAxis: [],
    series: [],
    dataZoom: [
        {
            show: true,
            start: 0,
            end: 100
        },
        {
            type: 'inside',
            start: 94,
            end: 100
        },
        {
            show: true,
            yAxisIndex: 0,
            filterMode: 'empty',
            width: 30,
            height: '80%',
            showDataShadow: false,
            left: '93%'
        }
    ],

};

var yaxisinfp = {
    time: {
        axisLine: {
            lineStyle: {
                color: '#0177d4'
            }
        },
        axisLabel: {
            color: '#ff2c2f',
            fontSize: 12,
            formatter: function (value, index) {
                var value;
                if (value >= 1000) {
                    value = value / 1000 + 'k';
                } else if (value < 1000) {
                    value = value;
                }
                return value
            }
        },
        splitLine: {
            show: false,
            lineStyle: {
                color: '#0177d4'
            }
        }


    },
    num: {
        type: 'value'
    }
};

var timelineVue = new Vue({
    el: "#busFlow",
    data: {
        playing: false
    },
    methods: {
        resetIcon: function () {
            dataIdx = 0;
            timeIdx = 0;
            this.playing = false;
            mapCanvasLayer.drawLayer();
            min_frame = 30;
            timeline_speed = 60;
            $("#speed").remove();
            d3.select("#timeline_footer").select("h1").append("sub")
                .attr("id", "speed")
                .attr("style", "font-size:20px;font-family: Times New Roman;")
                .text("×" + timeline_speed);
        },
        playIcon: function () {
            this.playing = true;
            mapCanvasLayer.drawLayer();
        },
        pauseIcon: function () {
            this.playing = false;
            clearInterval(timeline_interval);

        },
        accelerateIcon: function () {
            if (min_frame !== 1) {
                timeline_speed *= 2;
            }
            min_frame = Math.max(1, parseInt(min_frame / 2));
            $("#speed").remove();
            d3.select("#timeline_footer").select("h1").append("sub")
                .attr("id", "speed")
                .attr("style", "font-size:20px;font-family: Times New Roman;")
                .text("×" + timeline_speed);

        },
        decelerateIcon: function () {
            min_frame = parseInt(min_frame * 2);
            timeline_speed /= 2;
            $("#speed").remove();
            d3.select("#timeline_footer").select("h1").append("sub")
                .attr("id", "speed")
                .attr("style", "font-size:20px;font-family: Times New Roman;")
                .text("×" + timeline_speed);
        }
    }
});


var snapshotVue = new Vue({
    el: "#snapshot",
    data: {
        snapshoting: false,
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        shotloading: false,
        cnt: 0
    },
    methods: {
        saveSnapshot: function () {
            var test = document.getElementById("draw_rec").getContext("2d");
            console.log(test.width, test.height);
            console.log(this.x, this.y, this.w, this.h);
            this.shotloading = true;
            $("#draw_rec").remove();
            html2canvas($('#map').get(0), {
                useCORS: true,
                logging: false,
                letterRendering: 1,
                allowTaint: false,
                height: document.getElementById("map").offsetHeight,
                width: document.getElementById("map").offsetWidth
            }).then(
                function (canvas) {
                    // console.log("w:" + canvas.width());
                    // console.log("h:" + canvas.height());
                    let name = "snapshot-" + snapshotVue.cnt;
                    let zoom_canvas = document.createElement("canvas");
                    zoom_canvas.width = 1000;
                    zoom_canvas.height = 1000 / snapshotVue.w * snapshotVue.h;
                    zoom_canvas.getContext("2d").drawImage(canvas, snapshotVue.x, snapshotVue.y,
                        snapshotVue.w, snapshotVue.h, 0, 0, 1000, 1000 / snapshotVue.w * snapshotVue.h);
                    let resize_canvas = document.createElement("canvas");
                    resize_canvas.width = 214.35;
                    resize_canvas.height = 214.35 / snapshotVue.w * snapshotVue.h;
                    resize_canvas.getContext("2d").drawImage(canvas, snapshotVue.x, snapshotVue.y,
                        snapshotVue.w, snapshotVue.h, 0, 0, 214.35, 214.35 / snapshotVue.w * snapshotVue.h);

                    let insert_html = "        <div class=\"card\" style=\"margin: 5px; width: 90%;\">\n" +
                        "            <img id=\'" + name + "\' class=\"snapshotcard\" src=\"" + resize_canvas.toDataURL("image/png")
                        + "\" alt=\"Avatar\" width=\"100%\" style=\"width: fit-content;\">\n" +
                        "            <div class=\"container\">\n" +
                        "              <h6><b> " + name + " </b></h6>\n" +
                        "            </div>\n" +
                        "          </div>\n";
                    let card_list = document.getElementById("cardList");
                    card_list.innerHTML += insert_html;

                    let previewText = "<li><img data-original=\"" + zoom_canvas.toDataURL("image/png") + "\" src=\"" +
                        resize_canvas.toDataURL("image/png") + "\" alt=\"Avatar\"></li>";
                    let previewList = document.getElementById("PicLists");
                    previewList.innerHTML += previewText;
                    snapshotVue.snapshoting = false;
                    snapshotVue.shotloading = false;
                    snapshotVue.cnt += 1;

                }
            )
        },
        cancel: function () {
            $("#draw_rec").remove();
            this.snapshoting = false;
        },
        snapshotIcon: function () {
            this.snapshoting = true;
            d3.select("body").append("canvas")
                .attr("id", "draw_rec")
                .attr("style", "top: 0px; left: 300px; z-index: 1000; cursor: crosshair; position: absolute;")
                .attr("width", $("#map").width())
                .attr("height", $("#map").height());
            var draw_rec = document.getElementById("draw_rec");
            var snapctx = draw_rec.getContext("2d");
            var canvasx = $(draw_rec).offset().left;
            var canvasy = $(draw_rec).offset().top;
            var last_mousex = 0, last_mousey = 0, mousex = 0, mousey = 0;
            var mousedown = false;

            $(draw_rec).on('mousedown', function (e) {
                last_mousex = parseInt(e.clientX - canvasx);
                last_mousey = parseInt(e.clientY - canvasy);
                mousedown = true;
            });

            $(draw_rec).on('mouseup', function (e) {
                mousedown = false;
            });

            $(draw_rec).on('mousemove', function (e) {
                mousex = parseInt(e.clientX - canvasx);
                mousey = parseInt(e.clientY - canvasy);
                if (mousedown) {
                    snapctx.clearRect(0, 0, draw_rec.width, draw_rec.height); //clear canvas
                    snapctx.beginPath();
                    var snap_width = mousex - last_mousex;
                    var snap_height = mousey - last_mousey;
                    snapshotVue.x = last_mousex;
                    snapshotVue.y = last_mousey;
                    snapshotVue.w = snap_width;
                    snapshotVue.h = snap_height;
                    snapctx.rect(last_mousex, last_mousey, snap_width, snap_height);
                    snapctx.strokeStyle = 'red';
                    snapctx.lineWidth = 2;
                    snapctx.stroke();
                }
            });

        }
    }
});

function miniMapDisable() {
    vm2.isBusFlowShow = true;
    vm2.isBusLinesShow = false;
    vm2.isStationsShow = false;
    click_minimap = true;
    vm2.showBusLines();
    vm2.showStations();
    vm2.showBusFlow();
    clearInterval(minimap_interval);
}

$("#timeline_footer").hide();
$("#timeline_footer").dblclick(
    function (e) {
        L.DomEvent.stopPropagation(e);
    }
);

$(document).on('click', '.card', function () {
    let idx = parseInt($(this).context.innerText.split("-")[1]);
    viewer.destroy();
    galley = document.getElementById('galley');
    viewer = new Viewer(galley, {
        url: 'data-original',
        initialViewIndex: idx
    });
    viewer.show();


});

var galley = document.getElementById('galley');
var viewer = new Viewer(galley, {
    url: 'data-original',
});
$("#galley").hide();