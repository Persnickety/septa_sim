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
		
		tagName: 'tr',
		
		render: function() {
			var is_active = this.model.get('active');
			
			this.$el.empty();
			
			if (is_active) {
				var routeName = this.model.get('routeName');
				var tripID = this.model.id;
				var nextStation = this.model.get('nextStation');
				var arrivalTime = this.model.get('arrivalTime');
			
				var $el = this.$el;
				//$el.html('<tr></tr>');
				//this.collection.each(function(train) {
					$el.append('<td>'+ routeName +'</td>');
					$el.append('<td>'+ tripID +'</td>');
					$el.append('<td>'+ nextStation +'</td>');
					$el.append('<td>'+ arrivalTime +'</td>');
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
			var $table = $('<table class="table table-striped table-condensed"></table>');
			
			this.trainCollection.each(function(train) {
				
				var view = new S.ActiveTripView({
					model: train
				});
				
				allTripsViews[train] = view;
				
				$table.append(view.$el);
			});
			
			this.allTripsViews = allTripsViews;
			
			$('#train-schedule').html($table);
			
		} //end of render
		
	});
					
})(SeptaSim, jQuery);

