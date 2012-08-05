var SeptaSim = SeptaSim || {};

(function(S, $)
{
	S.TimeSliderView = Backbone.View.extend({
		initialize: function() {
			var $slider = $('#septa-time-slider');
			this.trainCollection = this.options.trainCollection;
			this.stationCollection = this.options.stationCollection;
			$slider.change(_.bind(this.onSliderChange, this));

			var play = function() {
				$slider.val($slider.val()*1 + 1).change();
				_.delay(play, 100);
			}

			play();
		},

		onSliderChange: function(evt) {
			var $slider = $(evt.target);
			this.trainCollection.currentTime = $slider.val();
			this.trainCollection.updateAllTrainPositions(this.stationCollection);
		}
	});


	S.VehicleMarkerView = Backbone.View.extend({
		initialize: function() {
			this.paper = this.options.paper;
			this.mapView = this.options.mapView;
			this.model.bind('change', this.onVehicleChange, this);
			this.marker = null;
		},

		onVehicleChange: function() {
			this.render()
		},

		render: function() {
			if (this.model.get('active')) {
				var trainLocation = this.model.get('location');
				var coords = this.mapView.toMapCoords(trainLocation.lat, trainLocation.lon);
				var is_outbound = this.model.get('outbound?');
				var is_trenton = this.model.get('trenton?');
				var block_id = this.model.get('block_id');

				if (is_trenton) {
//					console.log(block_id);
				}

				if (this.marker === null) {
					this.marker = this.paper.circle(coords.x, coords.y, 0.005).attr({
//					this.marker = this.paper.text(coords.x, coords.y, block_id).attr({
						stroke: 'none',
						fill: (is_outbound ? 'greed': 'red')
					});
				} else {
					this.marker.attr({
						cx: coords.x,
						cy: coords.y,
						fill: (is_outbound ? 'greed': 'red')
					});
				}
			} else {
				if (this.marker) {
					this.marker.remove();
					this.marker = null;
				}
			}
		}
	});
	
	S.SeptaMapView = Backbone.View.extend({
						initialize: function() {

							var w = $('#septa-canvas').width();
							var h = $('#septa-canvas').height();

							this.paper = Raphael('septa-canvas', w, h);
							this.width = w;
							this.height = h;

							this.stationCollection = this.options.stationCollection;
							this.trainCollection = this.options.trainCollection;

						},

						// Returns a pair of x, y coordinates.
						toMapCoords: function(lat, lon) {
							var coords = {
								x: lon,
								y: -lat*2
							};
							return coords;
						},

						setViewBox: function(minLat, minLon, maxLat, maxLon) {
							this.paper.setViewBox(minLon, -maxLat*2, (maxLon - minLon), (maxLat - minLat)*2, true);
						},
	          
						render: function() {

							var stationMarkers = {};
							var paper = this.paper;
							var mapSet = this.mapSet;
							var toMapCoords = this.toMapCoords;

//							$.ajax({
//								type: 'GET',
//								url: 'http://septasim.onlinewebshop.net/stations_by_route.php',
//								success: function(data) {
//										console.log(data);
//									}
//							);

							var lats = this.stationCollection.pluck('stop_lat');
							var lons = this.stationCollection.pluck('stop_lon');
							this.setViewBox(_.min(lats), _.min(lons), _.max(lats), _.max(lons));

							this.stationCollection.each(function(station) {
								var coords = toMapCoords(station.get('stop_lat'), station.get('stop_lon'))
								var marker = paper.circle(coords.x, coords.y, 0.002).attr({
									'stroke': 'none',
									'fill': 'black'
								});

								stationMarkers[station] = marker;
							});

							this.stationMarkers = stationMarkers;
							this.drawRoutes(STATIONS);

							var vehicleMarkerViews = [];
							var self = this;
							this.trainCollection.each(function(train) {
								var view = new S.VehicleMarkerView({
									paper: paper,
									mapView: self,
									model: train
								});
								vehicleMarkerViews[train] = view;
							});
							this.vehicleMarkerViews = vehicleMarkerViews;
						},

						drawRoutes: function(stations_by_route) {
							var stationCollection = this.stationCollection;
							var toMapCoords = this.toMapCoords;
							var paper = this.paper;

							for (route_id in stations_by_route) {
								var pathCoords = '';

								_.each(stations_by_route[route_id], function(stop_id) {
									var station = stationCollection.get(stop_id);
									coords = toMapCoords(station.get('stop_lat'), station.get('stop_lon'));

									if (pathCoords === '') {
										pathCoords += 'M' + coords.x + ' ' + coords.y;
									} else {
										pathCoords += 'L' + coords.x + ' ' + coords.y;
									}
								});

								paper.path(pathCoords).attr({
									'stroke-width': 0.2
								});
							}
						}
					});
	
					
})(SeptaSim, jQuery);

