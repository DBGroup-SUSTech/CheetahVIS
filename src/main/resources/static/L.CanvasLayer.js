
L.DomUtil.setTransform = L.DomUtil.setTransform || function (el, offset, scale) {
    var pos = offset || new L.Point(0, 0);

    el.style[L.DomUtil.TRANSFORM] =
        (L.Browser.ie3d ?
            'translate(' + pos.x + 'px,' + pos.y + 'px)' :
            'translate3d(' + pos.x + 'px,' + pos.y + 'px,0)') +
        (scale ? ' scale(' + scale + ')' : '');
};


L.CanvasLayer = (L.Layer ? L.Layer : L.Class).extend({ 
    // -- initialized is called on prototype 
    initialize: function (options) {
        this._map    = null;
        this._canvas = null;
        this._frame  = null;
        this._delegate = null;
        L.setOptions(this, options);
    },

    delegate :function(del){
        this._delegate = del;
        return this;
    },

    needRedraw: function () {
        if (!this._frame) {
            this._frame = L.Util.requestAnimFrame(this.drawLayer, this);
        }
        return this;
    },
    
    //-------------------------------------------------------------
    _onLayerDidResize: function (resizeEvent) {
        this._canvas.width = resizeEvent.newSize.x;
        this._canvas.height = resizeEvent.newSize.y;
    },
    //-------------------------------------------------------------
    _onLayerDidMove: function () {
        var topLeft = this._map.containerPointToLayerPoint([0, 0]);
        L.DomUtil.setPosition(this._canvas, topLeft);
        this.drawLayer();
    },
    //-------------------------------------------------------------
    getEvents: function () {
        var events = {
            resize: this._onLayerDidResize,
            moveend: this._onLayerDidMove,
            zoom: this._onLayerDidMove
        };
        if (this._map.options.zoomAnimation && L.Browser.any3d) {
            events.zoomanim =  this._animateZoom;
        }

        return events;
    },
    //-------------------------------------------------------------
    onAdd: function (map) {
        this._map = map;
        this._canvas = L.DomUtil.create('canvas', 'leaflet-layer');
        this.tiles = {};

        var size = this._map.getSize();
        this._canvas.width = size.x;
        this._canvas.height = size.y;

        var animated = this._map.options.zoomAnimation && L.Browser.any3d;
        L.DomUtil.addClass(this._canvas, 'leaflet-zoom-' + (animated ? 'animated' : 'hide'));


        map._panes.overlayPane.appendChild(this._canvas);

        map.on(this.getEvents(),this);
        
        var del = this._delegate || this;
        del.onLayerDidMount && del.onLayerDidMount(); // -- callback
        this.needRedraw();
    },
    
    //-------------------------------------------------------------
    onRemove: function (map) {
        var del = this._delegate || this;
        del.onLayerWillUnmount && del.onLayerWillUnmount(); // -- callback
   
        if (this._frame) {
            L.Util.cancelAnimFrame(this._frame);
        }

        map.getPanes().overlayPane.removeChild(this._canvas);
 
        map.off(this.getEvents(),this);
        
        this._canvas = null;

    },

    //------------------------------------------------------------
    addTo: function (map) {
        map.addLayer(this);
        return this;
    },
    // --------------------------------------------------------------------------------
    LatLonToMercator: function (latlon) {
        return {
            x: latlon.lng * 6378137 * Math.PI / 180,
            y: Math.log(Math.tan((90 + latlon.lat) * Math.PI / 360)) * 6378137
        };
    },

    //------------------------------------------------------------------------------
    drawLayer: function () {
        var size   = this._map.getSize();
        var bounds = this._map.getBounds();
        var zoom   = this._map.getZoom();
        // cvs = this._canvas;

        var center = this.LatLonToMercator(this._map.getCenter());
        var corner = this.LatLonToMercator(this._map.containerPointToLatLng(this._map.getSize()));

        var del = this._delegate || this;
        del.onDrawTimelineLayer && del.onDrawTimelineLayer( {
                                                layer : this,
                                                canvas: this._canvas,
                                                bounds: bounds,
                                                size: size,
                                                zoom: zoom,
                                                center : center,
                                                corner : corner
                                            });
        this._frame = null;
    },

    // onDrawLayer: function(info) {
    //     clearInterval(timeline_interval);
    //     var cxt = info.canvas.getContext('2d');
    //     // info.canvas.id = 'busFlow';
    //     // cxt.clearRect(0, 0, info.canvas.width, info.canvas.height);
    //     function drawPoints() {
    //         if (dataIdx <= rightbar_time) {
    //             cxt.clearRect(0, 0, info.canvas.width, info.canvas.height);
    //             for (var i = 0; i < traj.length - 1; i++) {
    //                 cxt.beginPath();
    //                 var dx, dy, dz;
    //                 dx = traj[i][dataIdx] + ((traj[i][dataIdx + 3] - traj[i][dataIdx]) / min_frame * min_offset);
    //                 dy = traj[i][dataIdx + 1] + ((traj[i][dataIdx + 4] - traj[i][dataIdx + 1]) / min_frame * min_offset);
    //                 dz = traj[i][dataIdx + 2] + ((traj[i][dataIdx + 5] - traj[i][dataIdx + 2]) / min_frame * min_offset);
    //                 if (dz === 0) {
    //                     cxt.fillStyle = "grey";
    //                 } else if (dz < 5) {
    //                     cxt.fillStyle = BusFlowColor(1);
    //                 } else if (dz < 19) {
    //                     cxt.fillStyle = BusFlowColor(0.6);
    //                 } else if (dz < 30) {
    //                     cxt.fillStyle = BusFlowColor(0.25);
    //                 } else if (dz >= 30) {
    //                     cxt.fillStyle = BusFlowColor(0);
    //                 }
    //                 let dot = info.layer._map.latLngToContainerPoint([dx, dy]);
    //                 if (map.getZoom() <= 12) {
    //                     cxt.arc(dot.x, dot.y, 3, 0, Math.PI * 2);
    //                 } else if (map.getZoom() <= 13) {
    //                     cxt.arc(dot.x, dot.y, 4, 0, Math.PI * 2);
    //                 } else if (map.getZoom() <= 14) {
    //                     cxt.arc(dot.x, dot.y, 5, 0, Math.PI * 2);
    //                 } else if (map.getZoom() > 14) {
    //                     cxt.arc(dot.x, dot.y, 6, 0, Math.PI * 2);
    //                 }
    //                 cxt.fill();
    //                 d3.select("#timeline_curline")
    //                     .attr("x", ((dataIdx / 3) / 60) / 24 * (screen.width * 0.7 - 80) + 50);
    //             }
    //             if (min_offset < min_frame) {
    //                 min_offset += 1;
    //             } else if (dataIdx < traj[1].length - 5) {
    //                 min_offset = 0;
    //                 var h = parseInt(dataIdx / 3 / 60);
    //                 var m = (dataIdx / 3) % 60;
    //                 if (h === 23 && m === 58) {
    //                     min_offset = 0;
    //                     dataIdx = leftbar_time;
    //                 }
    //                 var hdata = getTimeString(h, m);
    //                 d3.select("#timeline_footer").select("h1").datum(hdata).text(function (d) {
    //                     return d;
    //                 });
    //                 dataIdx += 3;
    //             }
    //         } else {
    //             min_offset = 0;
    //             dataIdx = leftbar_time;
    //         }
    //     }
    //
    //     timeline_interval = setInterval(drawPoints, 1000 / 30);
    //     if (!timelineVue.playing) {
    //         drawPoints();
    //         clearInterval(timeline_interval);
    //         if(min_offset === 0) {
    //             dataIdx = Math.min(dataIdx - 3, 0);
    //             min_offset = min_frame - 1;
    //         }else {
    //             min_offset -= 1;
    //         }
    //     }
    //     if (!vm2.isBusFlowShow) {
    //         cvs.style.visibility = 'hidden';
    //     }
    // },

    // -- L.DomUtil.setTransform from leaflet 1.0.0 to work on 0.0.7
    //------------------------------------------------------------------------------
    _setTransform: function (el, offset, scale) {
        var pos = offset || new L.Point(0, 0);

        el.style[L.DomUtil.TRANSFORM] =
			(L.Browser.ie3d ?
				'translate(' + pos.x + 'px,' + pos.y + 'px)' :
				'translate3d(' + pos.x + 'px,' + pos.y + 'px,0)') +
			(scale ? ' scale(' + scale + ')' : '');
    },

    //------------------------------------------------------------------------------
    _animateZoom: function (e) {
        var scale = this._map.getZoomScale(e.zoom);
        // -- different calc of animation zoom  in leaflet 1.0.3 thanks @peterkarabinovic, @jduggan1 
        var offset = L.Layer ? this._map._latLngBoundsToNewLayerBounds(this._map.getBounds(), e.zoom, e.center).min :
                               this._map._getCenterOffset(e.center)._multiplyBy(-scale).subtract(this._map._getMapPanePos());

        L.DomUtil.setTransform(this._canvas, offset, scale);


    }
});

L.canvasLayer = function () {
    return new L.CanvasLayer();
};
