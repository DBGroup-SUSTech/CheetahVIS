// UMD initialization to work with CommonJS, AMD and basic browser script include
(function (factory) {
    var L;
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['leaflet'], factory);
    } else if (typeof module === 'object' && typeof module.exports === "object") {
        // Node/CommonJS
        L = require('leaflet');
        module.exports = factory(L);
    } else {
        // Browser globals
        if (typeof window.L === 'undefined')
            throw 'Leaflet must be loaded first';
        factory(window.L);
    }
}(function (L) {

    L.Playback = L.Playback || {};

    L.Playback.Util = L.Class.extend({
        statics: {

            DateStr: function (time) {
                let date = new Date(time);
                date.setFullYear(2019);
                return date.toDateString();
            },

            TimeStr: function (time) {
                var d = new Date(time);
                var h = d.getHours();
                var m = d.getMinutes();
                var s = d.getSeconds();
                var tms = time / 1000;
                var dec = (tms - Math.floor(tms)).toFixed(2).slice(1);
                var mer = 'AM';
                if (h > 11) {
                    h %= 12;
                    mer = 'PM';
                }
                if (h === 0) h = 12;
                if (m < 10) m = '0' + m;
                if (s < 10) s = '0' + s;
                return h + ':' + m + ':' + s + dec + ' ' + mer;
            },

            ParseGPX: function (gpx) {
                var geojson = {
                    type: 'Feature',
                    geometry: {
                        type: 'MultiPoint',
                        coordinates: []
                    },
                    properties: {
                        time: [],
                        speed: [],
                        altitude: []
                    },
                    bbox: []
                };
                var xml = $.parseXML(gpx);
                var pts = $(xml).find('trkpt');
                for (var i = 0, len = pts.length; i < len; i++) {
                    var p = pts[i];
                    var lat = parseFloat(p.getAttribute('lat'));
                    var lng = parseFloat(p.getAttribute('lon'));
                    var timeStr = $(p).find('time').text();
                    var eleStr = $(p).find('ele').text();
                    var t = new Date(timeStr).getTime();
                    var ele = parseFloat(eleStr);

                    var coords = geojson.geometry.coordinates;
                    var props = geojson.properties;
                    var time = props.time;
                    var altitude = geojson.properties.altitude;

                    coords.push([lng, lat]);
                    time.push(t);
                    altitude.push(ele);
                }
                return geojson;
            }
        }

    });

    L.Playback = L.Playback || {};

    let _svg = '<svg xmlns="http://www.w3.org/2000/svg" width="14px" height="22px">\n' +
        '<rect class="bus" x="0" y="0" width="14px" height="8px" fill="direction" stroke-width="0"></rect>\n' +
        '<rect class="bus" x="0" y="8" width="14px" height="14px" fill="line" stroke-width="0"></rect></svg>';
    let _color = [0, "#377eb8", "#4daf4a", "#984ea3","#a65628", "#17becf"];

    function getIconUrl(line, direction) {
        let svg = _svg;
        let iconUrl = 'data:image/svg+xml;base64,';
        if (direction === 0) {
            svg = svg.replace('direction', '#ff7f0e');
        } else {
            svg = svg.replace('direction', '#e53935');
        }
        svg = svg.replace('line', _color[line]);
        iconUrl += btoa(svg);
        return iconUrl;
    }

    L.Playback.MoveableMarker = L.Marker.extend({
        initialize: function (startLatLng, options, feature) {
            var marker_options = options.marker || {};
            if (jQuery.isFunction(marker_options)) {
                marker_options = marker_options(feature);
            }
            marker_options.icon.options.iconUrl = getIconUrl(feature.properties.cnt, feature.properties.direction);
            marker_options.icon.iconSize = [14, 22];
            L.Marker.prototype.initialize.call(this, startLatLng, marker_options);
            this.popupContent = '';
            this.feature = feature;

            if (marker_options.getPopup) {
                this.popupContent = marker_options.getPopup(feature);
            }

            if (options.popups) {
                this.bindPopup(this.getPopupContent() + startLatLng.toString());
            }

            if (options.labels) {
                if (this.bindLabel) {
                    this.bindLabel(this.getPopupContent());
                } else {
                    console.log("Label binding requires leaflet-label (https://github.com/Leaflet/Leaflet.label)");
                }
            }
        },

        getPopupContent: function () {
            if (this.popupContent !== '') {
                return this.popupContent + '<br/>';
            }

            return '';
        },

        move: function (latLng, transitionTime, speed) {
            // Only if CSS3 transitions are supported
            if (L.DomUtil.TRANSITION) {
                if (this._icon) {
                    this._icon.style[L.DomUtil.TRANSITION] = 'all ' + transitionTime + 'ms linear';
                    if (this._popup && this._popup._wrapper)
                        this._popup._wrapper.style[L.DomUtil.TRANSITION] = 'all ' + transitionTime + 'ms linear';
                }
                if (this._shadow) {
                    this._shadow.style[L.DomUtil.TRANSITION] = 'all ' + transitionTime + 'ms linear';
                }
            }
            this.setLatLng(latLng);
            this._popup.setContent("<b>Line：" + this.feature.properties.line_id + "</b><br> <b>Plate：<b/>" + this.feature.properties.plate + "<br> <b>Speed: </b> " + speed + "km/h");
            // this.bindTooltip(this.feature.properties.line_id, {direction: 'auto', permanent: true}).openTooltip();
        },

        // modify leaflet markers to add our roration code
        /*
         * Based on comments by @runanet and @coomsie
         * https://github.com/CloudMade/Leaflet/issues/386
         *
         * Wrapping function is needed to preserve L.Marker.update function
         */
        _old__setPos: L.Marker.prototype._setPos,

        _updateImg: function (i, a, s) {
            var transform = '';
            transform += ' rotateZ(' + this.options.iconAngle + 'deg)';
            i.style['transform-origin'] = 'center';
            i.style[L.DomUtil.TRANSFORM] += transform;
        },
        setIconAngle: function (iconAngle) {
            this.options.iconAngle = iconAngle;
            if (this._map)
                this.update();
        },
        _setPos: function (pos) {
            if (this._icon) {
                this._icon.style[L.DomUtil.TRANSFORM] = "";
            }
            if (this._shadow) {
                this._shadow.style[L.DomUtil.TRANSFORM] = "";
            }
            this._old__setPos.apply(this, [pos]);
            if (this.options.iconAngle) {
                var a = this.options.icon.options.iconAnchor;
                var s = this.options.icon.options.iconSize;
                var i;
                if (this._icon) {
                    i = this._icon;
                    this._updateImg(i, a, s);
                }

                if (this._shadow) {
                    // Rotate around the icons anchor.
                    s = this.options.icon.options.shadowSize;
                    i = this._shadow;
                    this._updateImg(i, a, s);
                }

            }
        }
    });

    L.Playback = L.Playback || {};


    L.Playback.Track = L.Class.extend({
        initialize: function (geoJSON, options) {
            options = options || {};
            var tickLen = options.tickLen || 250;
            this._staleTime = options.staleTime || 60 * 60 * 1000;
            this._fadeMarkersWhenStale = options.fadeMarkersWhenStale || false;

            this._geoJSON = geoJSON;
            this._tickLen = tickLen;
            this._ticks = [];
            this._marker = null;
            this._orientations = [];
            this._speeds = [];
            this._directions = [];
            this._preDirection = -2;
            this._tickTime = [];
            this._flag = true;
            var sampleTimes = geoJSON.properties.time;

            this._orientIcon = options.orientIcons;
            var previousOrientation;
            var samples = geoJSON.geometry.coordinates;
            var speeds = geoJSON.properties.speed;
            var directions = geoJSON.properties.directions;
            var currSample = samples[0];
            var nextSample = samples[1];

            var currSampleTime = sampleTimes[0];
            var t = currSampleTime;  // t is used to iterate through tick times
            var nextSampleTime = sampleTimes[1];
            var tmod = t % tickLen; // ms past a tick time
            var rem, ratio;

            var curSpeed = speeds[0];

            // handle edge case of only one t sample
            if (sampleTimes.length === 1) {
                if (tmod !== 0)
                    t += tickLen - tmod;
                this._ticks[t] = samples[0];
                this._speeds[t] = speeds[0];
                this._orientations[t] = 0;
                this._startTime = t;
                this._endTime = t;
                this._tickTime.push(t);
                this._directions[t] = directions[0];
                return;
            }
            // interpolate first tick if t not a tick time
            if (tmod !== 0) {
                rem = tickLen - tmod;
                ratio = rem / (nextSampleTime - currSampleTime);
                t += rem;
                this._ticks[t] = this._interpolatePoint(currSample, nextSample, ratio);
                this._speeds[t] = curSpeed;
                this._orientations[t] = this._directionOfPoint(currSample, nextSample);
                this._directions[t] = directions[0];
                previousOrientation = this._orientations[t];
                this._tickTime.push(t);
            } else {
                this._ticks[t] = currSample;
                this._speeds[t] = curSpeed;
                this._orientations[t] = this._directionOfPoint(currSample, nextSample);
                this._directions[t] = directions[0];
                previousOrientation = this._orientations[t];
                this._tickTime.push(t);
            }

            this._startTime = t;
            t += tickLen;
            while (t < nextSampleTime) {
                ratio = (t - currSampleTime) / (nextSampleTime - currSampleTime);
                this._ticks[t] = this._interpolatePoint(currSample, nextSample, ratio);
                this._speeds[t] = curSpeed;
                this._orientations[t] = this._directionOfPoint(currSample, nextSample, previousOrientation);


                if (this._directions[t]) {

                }
                this._directions[t] = directions[0];
                previousOrientation = this._orientations[t];
                this._tickTime.push(t);
                t += tickLen;
            }

            // iterating through the rest of the samples
            for (var i = 1, len = samples.length; i < len; i++) {
                currSample = samples[i];
                nextSample = samples[i + 1];
                t = currSampleTime = sampleTimes[i];
                nextSampleTime = sampleTimes[i + 1];
                curSpeed = speeds[i];
                tmod = t % tickLen;
                if (tmod !== 0 && nextSampleTime) {
                    rem = tickLen - tmod;
                    ratio = rem / (nextSampleTime - currSampleTime);
                    t += rem;
                    this._ticks[t] = this._interpolatePoint(currSample, nextSample, ratio);
                    this._speeds[t] = curSpeed;
                    this._directions[t] = directions[i];
                    this._tickTime.push(t);
                    if (nextSample) {
                        this._orientations[t] = this._directionOfPoint(currSample, nextSample, previousOrientation);
                        previousOrientation = this._orientations[t];
                    } else {
                        this._orientations[t] = previousOrientation;
                    }
                } else {
                    this._ticks[t] = currSample;
                    this._speeds[t] = curSpeed;
                    this._directions[t] = directions[i];
                    this._tickTime.push(t);
                    if (nextSample) {
                        this._orientations[t] = this._directionOfPoint(currSample, nextSample, previousOrientation);
                        previousOrientation = this._orientations[t];
                    } else {
                        this._orientations[t] = previousOrientation;
                    }
                }

                t += tickLen;
                while (t < nextSampleTime) {
                    ratio = (t - currSampleTime) / (nextSampleTime - currSampleTime);
                    this._directions[t] = directions[i];
                    if (nextSampleTime - currSampleTime > options.maxInterpolationTime) {
                        this._ticks[t] = currSample;
                        this._speeds[t] = curSpeed;
                        this._tickTime.push(t);

                        if (nextSample) {
                            this._orientations[t] = this._directionOfPoint(currSample, nextSample, previousOrientation);
                            previousOrientation = this._orientations[t];
                        } else {
                            this._orientations[t] = previousOrientation;
                        }
                    } else {
                        this._ticks[t] = this._interpolatePoint(currSample, nextSample, ratio);
                        this._speeds[t] = curSpeed;
                        this._tickTime.push(t);
                        if (nextSample) {
                            this._orientations[t] = this._directionOfPoint(currSample, nextSample, previousOrientation);
                            previousOrientation = this._orientations[t];
                        } else {
                            this._orientations[t] = previousOrientation;
                        }
                    }

                    t += tickLen;
                }
            }
            // the last t in the while would be past bounds
            this._endTime = t - tickLen;
            this._lastTick = this._ticks[this._endTime];
            /*
            if(this._geoJSON.properties.plate.slice(-4) === '8533') {
                console.log(this._ticks);
                for(let t in this._ticks) {
                    console.log(new Date(parseInt(t)).Format('hh:mm:ss'));
                    console.log(this._ticks[t]);
                }
            }
            */
        },

        _interpolatePoint: function (start, end, ratio) {
            try {
                var delta = [end[0] - start[0], end[1] - start[1]];
                var offset = [delta[0] * ratio, delta[1] * ratio];
                return [start[0] + offset[0], start[1] + offset[1]];
            } catch (e) {
                console.log('err: cant interpolate a point');
                console.log(['start', start]);
                console.log(['end', end]);
                console.log(['ratio', ratio]);
            }
        },

        _directionOfPoint: function (start, end, previousOrientation = -1) {
            return this._getBearing(start[1], start[0], end[1], end[0], previousOrientation);
        },

        _getBearing: function (startLat, startLong, endLat, endLong, previousOrientation) {
            let sLat = startLat;
            let sLong = startLong;
            let eLat = endLat;
            let eLong = endLong;

            startLat = this._radians(startLat);
            startLong = this._radians(startLong);
            endLat = this._radians(endLat);
            endLong = this._radians(endLong);

            var dLong = endLong - startLong;

            var dPhi = Math.log(Math.tan(endLat / 2.0 + Math.PI / 4.0) / Math.tan(startLat / 2.0 + Math.PI / 4.0));
            if (Math.abs(dLong) > Math.PI) {
                if (dLong > 0.0)
                    dLong = -(2.0 * Math.PI - dLong);
                else
                    dLong = (2.0 * Math.PI + dLong);
            }
            let y = (this._degrees(Math.atan2(dLong, dPhi)) + 360.0) % 360;
            let num;
            let dis = (startLat - endLat) * (startLat - endLat) + (startLong - endLong) * (startLong - endLong) * 1e10;
            if (dis <= 0.0001) return previousOrientation;
            let x = previousOrientation;
            let xx = (x + 360) % 360;
            if (xx > y) {
                if (xx - y > 180) {
                    num = x + (360 - x % 360) + y;
                } else {
                    num = x - x % 360 + y;
                }
            } else if (xx < y) {
                if (y - xx > 180) {
                    num = (x - x % 360) - (360 - y);
                } else {
                    num = x - x % 360 + y;
                }
            } else {
                num = x;
            }
            // if (Math.abs(Math.abs(xx - y) - 180) <= )
            if (Math.abs(eLat - 22.543335) <= 0.001 &&  Math.abs(eLong - 113.9409) <= 0.001 && Math.abs(num) === 360) {
                console.log([x,xx,y,num]);
            }
            /*
            num = d;
            let minValue = Math.min(previousOrientation, d);
            let maxValue = Math.max(previousOrientation, d);
            if(maxValue - minValue >= 180) {
                console.log([startLat, startLong, endLat, endLong]);
                console.log([d, previousOrientation]);
            }
            if (maxValue >= 340 && minValue <= 20) {
                console.log([startLat, startLong, endLat, endLong]);
                console.log([d, previousOrientation]);
            }
             */
            return num;
        },

        _radians: function (n) {
            return n * (Math.PI / 180);
        },
        _degrees: function (n) {
            return n * (180 / Math.PI);
        },

        getFirstTick: function () {
            return this._ticks[this._startTime];
        },

        getLastTick: function () {
            return this._ticks[this._endTime];
        },

        getStartTime: function () {
            return this._startTime;
        },

        getEndTime: function () {
            return this._endTime;
        },

        getTickMultiPoint: function () {
            var t = this.getStartTime();
            var endT = this.getEndTime();
            var coordinates = [];
            var time = [];
            while (t <= endT) {
                time.push(t);
                coordinates.push(this.tick(t));
                t += this._tickLen;
            }

            return {
                type: 'Feature',
                geometry: {
                    type: 'MultiPoint',
                    coordinates: coordinates
                },
                properties: {
                    time: time
                }
            };
        },

        trackPresentAtTick: function (timestamp) {
            return (timestamp >= this._startTime);
        },

        trackStaleAtTick: function (timestamp) {
            return ((this._endTime + this._staleTime) <= timestamp);
        },

        tick: function (timestamp) {
            if (timestamp > this._endTime)
                timestamp = this._endTime;
            if (timestamp < this._startTime)
                timestamp = this._startTime;
            return this._ticks[timestamp];
        },

        tickSpeed: function (timestamp) {
            if (timestamp > this._endTime)
                timestamp = this._endTime;
            if (timestamp < this._startTime)
                timestamp = this._startTime;
            return this._speeds[timestamp];
        },

        tickDirection: function (timestamp) {
            if (timestamp > this._endTime)
                timestamp = this._endTime;
            if (timestamp < this._startTime)
                timestamp = this._startTime;
            return this._directions[timestamp];
        },

        tickTime: function (index) {
            let timestamp = this._tickTime[index];
            if (timestamp > this._endTime)
                timestamp = this._endTime;
            if (timestamp < this._startTime)
                timestamp = this._startTime;
            return timestamp;
        },

        courseAtTime: function (timestamp) {
            //return 90;
            if (timestamp > this._endTime)
                timestamp = this._endTime;
            if (timestamp < this._startTime)
                timestamp = this._startTime;
            return this._orientations[timestamp];
        },

        setMarker: function (timestamp, options) {
            var lngLat = null;

            // if time stamp is not set, then get first tick
            if (timestamp) {
                lngLat = this.tick(timestamp);
            } else {
                lngLat = this.getFirstTick();
            }

            if (lngLat) {
                var latLng = new L.LatLng(lngLat[1], lngLat[0]);
                this._marker = new L.Playback.MoveableMarker(latLng, options, this._geoJSON);
                if (options.mouseOverCallback) {
                    this._marker.on('mouseover', options.clickCallback);
                }
                if (options.clickCallback) {
                    this._marker.on('click', options.clickCallback);
                }

                //hide the marker if its not present yet and fadeMarkersWhenStale is true
                if (this._fadeMarkersWhenStale && !this.trackPresentAtTick(timestamp)) {
                    this._marker.setOpacity(0);
                }
            }

            return this._marker;
        },

        moveMarker: function (latLng, transitionTime, timestamp, speed) {
            let curDirection = this.tickDirection(timestamp);
            if (curDirection !== this._preDirection) {
                let busIcon = L.icon({
                    iconUrl: getIconUrl(this._geoJSON.properties.cnt, curDirection),  // jpg png gif都可以
                    iconSize: [14, 22],
                    className: 'bus_marker',
                });
                this._marker.setIcon(busIcon);
            }
            this._preDirection = curDirection;
            if(this._geoJSON.properties.plate.slice(-4) === '3537') {
                console.log('BD3537');
            }
            if (this._marker) {
                if (this._fadeMarkersWhenStale) {
                    //show the marker if its now present
                    if (this.trackPresentAtTick(timestamp)) {
                        this._marker.setOpacity(1);
                    } else {
                        this._marker.setOpacity(0);
                    }

                    if (this.trackStaleAtTick(timestamp)) {
                        this._marker.setOpacity(0.25);
                    }
                }
                if (this._orientIcon) {
                    this._marker.setIconAngle(this.courseAtTime(timestamp));
                }

                this._marker.move(latLng, transitionTime, speed);
            }
        },

        getMarker: function () {
            return this._marker;
        }

    });

    L.Playback = L.Playback || {};

    L.Playback.TrackController = L.Class.extend({

        initialize: function (map, tracks, options) {
            this.options = options || {};

            this._map = map;

            this._tracks = [];

            // initialize tick points
            this.setTracks(tracks);
        },

        clearTracks: function () {
            while (this._tracks.length > 0) {
                var track = this._tracks.pop();
                var marker = track.getMarker();

                if (marker) {
                    this._map.removeLayer(marker);
                }
            }
        },

        setTracks: function (tracks) {
            // reset current tracks
            this.clearTracks();

            this.addTracks(tracks);
        },

        addTracks: function (tracks) {
            // return if nothing is set
            if (!tracks) {
                return;
            }

            if (tracks instanceof Array) {
                for (var i = 0, len = tracks.length; i < len; i++) {
                    this.addTrack(tracks[i]);
                }
            } else {
                this.addTrack(tracks);
            }
        },

        // add single track
        addTrack: function (track, timestamp) {
            // return if nothing is set
            if (!track) {
                return;
            }
            var marker = track.setMarker(timestamp, this.options);
            if (marker) {
                marker.addTo(this._map);

                this._tracks.push(track);
            }
        },

        tock: function (timestamp, transitionTime) {
            for (var i = 0, len = this._tracks.length; i < len; i++) {
                var lngLat = this._tracks[i].tick(timestamp);
                // console.log('tock' + new Date(timestamp));
                var speed = this._tracks[i].tickSpeed(timestamp);
                var latLng = new L.LatLng(lngLat[1], lngLat[0]);
                this._tracks[i].moveMarker(latLng, transitionTime, timestamp, speed);
            }
        },

        getStartTime: function () {
            var earliestTime = 0;

            if (this._tracks.length > 0) {
                earliestTime = this._tracks[0].getStartTime();
                for (var i = 1, len = this._tracks.length; i < len; i++) {
                    var t = this._tracks[i].getStartTime();
                    if (t < earliestTime) {
                        earliestTime = t;
                    }
                }
            }

            return earliestTime;
        },

        getEndTime: function () {
            var latestTime = 0;

            if (this._tracks.length > 0) {
                latestTime = this._tracks[0].getEndTime();
                for (var i = 1, len = this._tracks.length; i < len; i++) {
                    var t = this._tracks[i].getEndTime();
                    if (t > latestTime) {
                        latestTime = t;
                    }
                }
            }

            return latestTime;
        },

        getTracks: function () {
            return this._tracks;
        }
    });
    L.Playback = L.Playback || {};

    L.Playback.Clock = L.Class.extend({

        initialize: function (trackController, callback, options) {
            this._trackController = trackController;
            this._callbacksArry = [];
            if (callback) this.addCallback(callback);
            L.setOptions(this, options);
            this._speed = this.options.speed;
            this._tickLen = this.options.tickLen;
            this._cursor = trackController.getStartTime();
            this._transitionTime = this._tickLen / this._speed;
        },

        _tick: function (self) {
            if (self._cursor > self._trackController.getEndTime()) {
                clearInterval(self._intervalID);
                return;
            }
            self._trackController.tock(self._cursor, self._transitionTime);
            self._callbacks(self._cursor);
            self._cursor += self._tickLen;
        },

        _callbacks: function (cursor) {
            var arry = this._callbacksArry;
            for (var i = 0, len = arry.length; i < len; i++) {
                arry[i](cursor);
            }
        },

        addCallback: function (fn) {
            this._callbacksArry.push(fn);
        },

        start: function () {
            if (this._intervalID) return;
            this._intervalID = window.setInterval(
                this._tick,
                this._transitionTime,
                this);
        },

        stop: function () {
            if (!this._intervalID) return;
            clearInterval(this._intervalID);
            this._intervalID = null;
        },

        getSpeed: function () {
            return this._speed;
        },

        isPlaying: function () {
            return this._intervalID ? true : false;
        },

        setSpeed: function (speed) {
            this._speed = speed;
            this._transitionTime = this._tickLen / speed;
            if (this._intervalID) {
                this.stop();
                this.start();
            }
        },

        setCursor: function (ms) {
            var time = parseInt(ms);
            if (!time) return;
            var mod = time % this._tickLen;
            if (mod !== 0) {
                time += this._tickLen - mod;
            }
            this._cursor = time;
            this._trackController.tock(this._cursor, 0);
            this._callbacks(this._cursor);
        },

        getTime: function () {
            return this._cursor;
        },

        getStartTime: function () {
            return this._trackController.getStartTime();
        },

        getEndTime: function () {
            return this._trackController.getEndTime();
        },

        getTickLen: function () {
            return this._tickLen;
        }

    });

// Simply shows all of the track points as circles.
// TODO: Associate circle color with the marker color.

    L.Playback = L.Playback || {};

    L.Playback.TracksLayer = L.Class.extend({
        initialize: function (map, options) {
            var layer_options = options.layer || {};

            if (jQuery.isFunction(layer_options)) {
                layer_options = layer_options(feature);
            }

            if (!layer_options.pointToLayer) {
                layer_options.pointToLayer = function (featureData, latlng) {
                    return new L.CircleMarker(latlng, {radius: 5});
                };
            }

            this.layer = new L.GeoJSON(null, layer_options);

            var overlayControl = {
                'GPS Tracks': this.layer
            };

            this.tracks = L.control.layers(null, overlayControl, {
                collapsed: false
            }).addTo(map);
        },

        clearFrom: function (map) {
            map.removeControl(this.tracks);
        },
        // clear all geoJSON layers
        clearLayer: function () {
            for (var i in this.layer._layers) {
                this.layer.removeLayer(this.layer._layers[i]);
            }
        },

        // add new geoJSON layer
        addLayer: function (geoJSON) {
            this.layer.addData(geoJSON);
        }
    });
    L.Playback = L.Playback || {};

    L.Playback.DateControl = L.Control.extend({
        options: {
            position: 'bottomleft',
            dateFormatFn: L.Playback.Util.DateStr,
            timeFormatFn: L.Playback.Util.TimeStr
        },

        initialize: function (playback, options) {
            L.setOptions(this, options);
            this.playback = playback;
        },

        onAdd: function (map) {
            this._container = L.DomUtil.create('div', 'leaflet-control-layers leaflet-control-layers-expanded');

            var self = this;
            var playback = this.playback;
            var time = playback.getTime();

            var datetime = L.DomUtil.create('div', 'datetimeControl', this._container);

            // date time
            this._date = L.DomUtil.create('p', '', datetime);
            this._time = L.DomUtil.create('p', '', datetime);

            this._date.innerHTML = this.options.dateFormatFn(time);
            this._time.innerHTML = this.options.timeFormatFn(time);

            // setup callback
            playback.addCallback(function (ms) {
                self._date.innerHTML = self.options.dateFormatFn(ms);
                self._time.innerHTML = self.options.timeFormatFn(ms);
            });

            return this._container;
        }
    });

    L.Playback.PlayControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        initialize: function (playback) {
            this.playback = playback;
        },

        onAdd: function (map) {
            var playback = this.playback;
            playback.setSpeed(100);
            var _html =
                '<div class="navbar" id="control">\n' +
                '    <div class="navbar-inner">\n' +
                '        <ul class="nav">\n' +
                '            <li class="ctrl">\n' +
                '                <a class="nav-link active" id="play-pause" href="#">\n' +
                '                    <i id="play-pause-icon" class="fa fa-play fa-lg"></i>\n' +
                '                </a>\n' +
                '            </li>\n' +
                '            <li class="nav pull-right ctrl" id="sliderControl">\n' +
                '                <div id="slider"></div>\n' +
                '            </li>\n' +
                '            <li class="nav ctrl">\n' +
                '                <div id="clock-btn" class="clock" href="#">\n' +
                '                    <span id="cursor-date"></span><br />\n' +
                '                    <span id="cursor-time"></span>\n' +
                '                </div>\n' +
                '            </li>\n' +
                '            <li class="dropup">\n' +
                '                <a id="speed-btn" data-toggle="dropdown" href="#">\n' +
                '                    <i class="fa fa-tachometer-alt fa-lg"></i>\n' +
                '                    <span id="speed-icon-val" class="speed">1</span>x' +
                '                </a>\n' +
                '                <div class="speed-menu dropdown-menu" role="menu" aria-labelledby="speed-btn" id="">\n' +
                '                        <label>Speed</label>\n' +
                '                        <div id="speed-slider"></div>' +
                '                </div>\n' +
                '            </li>\n' +
                '        </ul>\n' +
                '    </div>\n' +
                '</div>';
            $('#map').after(_html);
            this._setup();
            return L.DomUtil.create('div');
        },

        _setup: function () {
            var playback = this.playback;
            $('#control').css({
                'position': 'absolute',
                'bottom': '10px',
                'z-index': 10000,
                'left': '330px',
                'color': '#777777'
            });
            $('.navbar-inner').css({
                'min-height': '40px',
                'background-color': '#fafafa',
                'box-shadow': '0 1px 4px rgba(0, 0, 0, 0.065)',
                'border': '1px solid #d4d4d4'
            });
            $('#play-pause').css({
                'padding': '10px 15px 10px'
            });
            $('#play-pause-icon').css({
                'color': '#777777'
            });
            $('.ctrl').css({
                'border-right': '1px solid #d4d4d4'
            });
            $('#sliderControl').css({
                'padding-left': '10px',
                'padding-right': '10px'
            });
            $('#slider').css({
                'left': '4px',
                'width': '200px',
                'margin': '13px',
                'padding-right': '14px'
            });
            $('.speed-menu').css({
                'min-width': '77px',
                'text-align': 'center',
                'padding-bottom': '20px'
            });
            $('#clock-btn').css({
                'text-align': 'center',
                'font-size': '14px',
                'margin-left': '4px',
                'margin-right': '4px',
                'padding-left': '5px',
                'padding-right': '5px'
            });
            $('#speed-btn').css({
                'color': '#777777',
                'display': 'block',
                'padding': '10px 15px 10px'
            });
            $('#play-pause').click(function () {
                if (playback.isPlaying()) {
                    playback.stop();
                    $('#play-pause-icon').removeClass('fa-pause');
                    $('#play-pause-icon').addClass('fa-play');
                } else {
                    playback.start();
                    $('#play-pause-icon').addClass('fa-pause');
                    $('#play-pause-icon').removeClass('fa-play');
                }
            });
            $('#slider').slider({
                min: playback.getStartTime(),
                max: playback.getEndTime(),
                step: playback.getTickLen(),
                value: playback.getTime(),
                slide: function (event, ui) {
                    playback.setCursor(ui.value);
                    $('#slider').val(ui.value.toString());
                }
            });
            $('#speed-slider').slider({
                min: 20,
                max: 200,
                value: playback.getSpeed(),
                step: 20,
                orientation: 'vertical',
                slide: function (event, ui) {
                    var speed = parseFloat(ui.value);
                    playback.setSpeed(speed);
                    $('#speed-icon-val').html((speed / 100).toFixed(1));
                }
            });
            $('#speed-slider').css({
                'margin-left': 'auto',
                'margin-right': 'auto'
            });
            let date = new Date(playback.getStartTime());
            var startTime = date.getTime();
            $('#cursor-date').html(L.Playback.Util.DateStr(startTime));
            $('#cursor-time').html(L.Playback.Util.TimeStr(startTime));
            playback.addCallback(function (ms) {
                $('#slider').slider('value', ms);
                let date = new Date(ms);
                ms = date.getTime();
                $('#cursor-date').html(L.Playback.Util.DateStr(ms));
                $('#cursor-time').html(L.Playback.Util.TimeStr(ms));
            })
        }
    });

    L.Playback = L.Playback.Clock.extend({
        statics: {
            MoveableMarker: L.Playback.MoveableMarker,
            Track: L.Playback.Track,
            TrackController: L.Playback.TrackController,
            Clock: L.Playback.Clock,
            Util: L.Playback.Util,

            TracksLayer: L.Playback.TracksLayer,
            PlayControl: L.Playback.PlayControl,
            DateControl: L.Playback.DateControl,
        },

        options: {
            tickLen: 250,
            speed: 100,
            maxInterpolationTime: 5 * 60 * 1000, // 5 minutes

            tracksLayer: false,

            playControl: false,
            dateControl: false,

            // options
            layer: {
                // pointToLayer(featureData, latlng)
            },

            marker: {
                // getPopup(feature)
            }
        },

        initialize: function (map, geoJSON, callback, options) {
            L.setOptions(this, options);
            this._map = map;
            this._trackController = new L.Playback.TrackController(map, null, this.options);
            L.Playback.Clock.prototype.initialize.call(this, this._trackController, callback, this.options);

            if (this.options.tracksLayer) {
                this._tracksLayer = new L.Playback.TracksLayer(map, options);
            }

            this.setData(geoJSON);


            if (this.options.playControl) {
                this.playControl = new L.Playback.PlayControl(this);
                this.playControl.addTo(map);
            }

            if (this.options.dateControl) {
                this.dateControl = new L.Playback.DateControl(this, options);
                this.dateControl.addTo(map);
            }

        },

        clearData: function () {
            this._trackController.clearTracks();

            if (this._tracksLayer) {
                this._tracksLayer.clearLayer();
            }
        },

        setData: function (geoJSON) {
            this.clearData();

            this.addData(geoJSON, this.getTime());

            this.setCursor(this.getStartTime());
        },

        // bad implementation
        addData: function (geoJSON, ms) {
            // return if data not set
            if (!geoJSON) {
                return;
            }

            if (geoJSON instanceof Array) {
                for (var i = 0, len = geoJSON.length; i < len; i++) {
                    this._trackController.addTrack(new L.Playback.Track(geoJSON[i], this.options), ms);
                }
            } else {
                this._trackController.addTrack(new L.Playback.Track(geoJSON, this.options), ms);
            }

            this._map.fire('playback:set:data');

            if (this.options.tracksLayer) {
                this._tracksLayer.addLayer(geoJSON);
            }
        },

        destroy: function () {
            this.clearData();
            $('#control').remove();
            if (this.playControl) {
                this._map.removeControl(this.playControl);
            }
            if (this.dateControl) {
                this._map.removeControl(this.dateControl);
            }
            if (this._tracksLayer) {
                this._tracksLayer.clearFrom(this._map);
            }
        }
    });

    L.Map.addInitHook(function () {
        if (this.options.playback) {
            this.playback = new L.Playback(this);
        }
    });

    L.playback = function (map, geoJSON, callback, options) {
        return new L.Playback(map, geoJSON, callback, options);
    };
    return L.Playback;

}));
