var SeptaSim = SeptaSim || {};

(function(S, $)
{

	S.VehicleMarkerView = Backbone.View.extend({
		initialize: function() {
			this.paper = this.options.paper;
			this.mapView = this.options.mapView;
			
			this.model.bind('change', this.onVehicleChange, this);
			this.model.bind('select', this.onVehicleSelect, this);
			
			this.marker = null;
		},

		onVehicleChange: function() {
			this.render();
		},

		onVehicleSelect: function() {
			if (this.model.selected) {
				this.flashMarker();
			}
			this.render();
		},

		onVehicleClick: function() {
			if (!this.model.selected) {
				this.model.select();
			} else {
				this.model.deselect();
			}
		},

		flashMarker: function() {

		},

		createMarker: function(coords, isOutbound) {
			var color = (isOutbound ? '#00FF00': 'Red')
			this.marker = this.paper.circle(coords.x, coords.y, 0.005).attr({
						'stroke': color,
						'stroke-width': 1,
						'fill': color,
						'r': '0.005'
					});

			if(this.model.selected){
				var ox = this.marker.attr("cx");
				var oy = this.marker.attr("cy");
				this.marker.attr('r','0.007');
				this.marker.attr('stroke-width','2');
				this.marker.attr('fill','yellow');
			};
			
			var onVehicleClick = _.bind(this.onVehicleClick, this);
			$(this.marker.node).click(onVehicleClick);
		},

		createText: function(coords, isOutbound, displayString) {
			this.text = this.paper.text(coords.x, coords.y, displayString).attr({
						stroke: 'none',
						'text-size': 1,
						fill: (this.model.selected ? 'yellow' : (isOutbound ? 'green': 'red'))
					});
			this.text.transform('s0.002,0.002,' + coords.x + ',' + coords.y + 't15,0');
		},

		updateMarker: function(coords, isOutbound, displayString) {
			var color = (isOutbound ? '#00FF00': 'Red')
			this.marker.attr({
						cx: coords.x,
						cy: coords.y,
						'stroke': color,
						'fill': color,
						'r': '0.005'
					});

			if(this.model.selected){
				var ox = this.marker.attr("cx");
				var oy = this.marker.attr("cy");
				this.marker.attr('r','0.007');
				this.marker.attr('stroke-width','2');
				this.marker.attr('fill','yellow');
			};
		},

		updateText: function(coords, isOutbound) {
			this.text.attr({
						x: coords.x,
						y: coords.y,
						transform: '',
						fill: (this.model.selected ? 'yellow' : (isOutbound ? 'green': 'red'))
					});
			this.text.transform('s0.002,0.002,' + coords.x + ',' + coords.y + 't15,0');
		},

		removeMarker: function() {
			if (this.marker) {
				this.marker.remove();
				this.marker = null;
			}
		},

		removeText: function() {
			if (this.text) {
				this.text.remove();
				this.text = null;
			}
		},

		render: function() {
			if (this.model.get('active')) {
				var trainLocation = this.model.get('location');
				var coords = this.mapView.toMapCoords(trainLocation.lat, trainLocation.lon);
				var is_outbound = this.model.get('outbound?');
				var block_id = this.model.get('block_id');

				// If we don't have a marker yet...
				if (this.marker === null) {
					this.createMarker(coords, is_outbound);
//					this.createText(coords, is_outbound, block_id);

				// If we already have a marker...
				} else {
					this.updateMarker(coords, is_outbound);
//					this.updateText(coords, is_outbound, block_id);
				}
				
				var outbound = this.model.get('outbound');
				var routeName = this.model.get('routeName');
				var nextStation = this.model.get('nextStation');
				var arrivalTime = this.model.get('arrivalTime');
				
				var $tooltip = 'Route: ' + routeName + '\n' + 'Next Station: ' + nextStation + '\n' + 'Arrival Time: ' + arrivalTime;
				if(outbound){
					$tooltip += '\nOutbound Train';
				}
				else {
					$tooltip += '\nInbound Train';
				}
				
				addTip(this.marker.node, $tooltip);

			} else {
				this.removeMarker();
//				this.removeText();
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

							this.drawRoutes(STATIONS);

							this.stationCollection.each(function(station) {
								var coords = toMapCoords(station.get('stop_lat'), station.get('stop_lon'))
								var marker = paper.circle(coords.x, coords.y, 0.004).attr({
									'stroke': 'black',
									'stroke-width': 1,
									'fill': 'white'
								});

								addTip(marker.node, station.get('stop_name'));
								
								stationMarkers[station] = marker;
							});

							this.stationMarkers = stationMarkers;

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

							var route_to_color = {'AIR':'#91456C', 'CHE':'#94763C', 'CHW':'#00B4B2','DOY':'#775B49','ELW':'#007CC8','FOX':'#FF823D','NOR':'#EE4C69','PAO':'#20825C','CYN':'#6F549E','TRE':'#F683C9','WAR':'#F7AF42','WIL':'#8AD16B','WTR':'#5D5EBC'};
							
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
									'stroke-width': 4,
									'stroke': route_to_color[route_id]
								});
								
								
							}
						}
					});
	
					
})(SeptaSim, jQuery);

