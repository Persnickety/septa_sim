var SeptaSim = SeptaSim || {};

(function(S, $)
{
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

							mapSet = paper.set();

							var lats = this.stationCollection.pluck('stop_lat');
							var lons = this.stationCollection.pluck('stop_lon');
							this.setViewBox(_.min(lats), _.min(lons), _.max(lats), _.max(lons));

							this.stationCollection.each(function(station) {
								var coords = toMapCoords(station.get('stop_lat'), station.get('stop_lon'))
								var marker = paper.circle(coords.x, coords.y, 0.002).attr({
									'stroke': 'none',
									'fill': 'black'
								});

								mapSet.push(marker);
								stationMarkers[station] = marker;
							});

							this.stationMarkers = stationMarkers;
							
						}
					});
	
					
})(SeptaSim, jQuery);

