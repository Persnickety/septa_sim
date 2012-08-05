var SeptaSim = SeptaSim || {};

(function(S, $)
{
	S.SeptaMapView = Backbone.View.extend({
						initialize: function() {

							var w = $('#septa-canvas').width();
							var h = $('#septa-canvas').height();

							this.paper = Raphael('septa-canvas', w, h);
							this.stationCollection = this.options.stationCollection;
							this.trainCollection = this.options.trainCollection;

						},
	          
						render: function() {

							var stationMarkers = {};
							var paper = this.paper;

							$.get(
								'http://septasim.onlinewebshop.net/stations_by_route.php',
								function(data) {
									console.log(data);
								}
							)

							paper.clear();
							this.stationCollection.each(function(station) {
								var x = station.get('stop_lon');
								var y = station.get('stop_lat');
								stationMarkers[station] = paper.circle(x, y, 10);
							});

							this.stationMarkers = stationMarkers;
							
						}
					});
	
					
})(SeptaSim, jQuery);

