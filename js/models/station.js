var SeptaSim = SeptaSim || {};

(function(S)
{

	S.Station = Backbone.Model.extend({
		idAttribute: "stop_id"
	});
				
	S.StationCollection = Backbone.Collection.extend({
		url: '',
		model: S.Station,
		getInterpolatedLocation: function(fromStation, toStation, timeInterval){
			return getInterpolatedLocation(fromStation.get('stop_lat'),  fromStation.get('stop_lon'), toStation.get('stop_lat'), toStation.get('stop_lon'), timeInterval);
		}
	});
	
})(SeptaSim);
