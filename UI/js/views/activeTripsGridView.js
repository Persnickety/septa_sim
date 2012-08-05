var SeptaSim = SeptaSim || {};

(function(S, $)
{
	S.ActiveTripView = Backbone.View.extend({
		
		initialize: function() {
			this.model.bind('change', this.onTripChange, this);
		},
		
		onTripChange: function() {
			this.render()
		},
		
		render: function() {
			var is_active = this.model.get('active');

			if (is_active) {
				var routeName = this.model.get('routeName');
				var tripID = this.model.id;
				var nextStation = this.model.get('nextStation');
				var arrivalTime = this.model.get('arrivalTime');
			
				var $el = this.$el;
				$el.html('<ul></ul>');
				//this.collection.each(function(train) {
					$el.append('<li>'+ routeName +'</li>');
					$el.append('<li>'+ tripID +'</li>');
					$el.append('<li>'+ nextStation +'</li>');
					$el.append('<li>'+ arrivalTime +'</li>');
				//});
			} else {
				var $el = this.$el;
				$el.slideUp('slow', function() { $el.remove(); });

			}
			
			return this;
		}
		
	});
	
	S.AllTripsView = Backbone.View.extend({
		
		initialize: function() {
			this.trainCollection = this.options.trainCollection;
		},
		
		render: function() {
			var allTripsViews = [];
			
			var $el = this.$el;
			
			this.trainCollection.each(function(train) {
				var view = new S.ActiveTripView({
					model: train
				});
				
				allTripsViews[train] = view;
				
				$el.append(view.$el);
			});
			
			this.allTripsViews = allTripsViews;
			
			$('#train-schedule').html($el);
			
		} //end of render
		
	});
					
})(SeptaSim, jQuery);

