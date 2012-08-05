var SeptaSim = SeptaSim || {};

(function(S, $)
{
	S.ActiveTripView = Backbone.View.extend({
		
		initialize: function() {
			this.model.bind('change', this.onTripChange, this);
			this.model.bind('select', this.onTripSelect, this);

			this.visible = false;
		},
		
		onTripChange: function() {
			this.render()
		},

		onTripSelect: function() {

		},
		
		events : {
			'click' : 'onTripRowClick',
			'click .add-time' : 'onAddTime',
			'click .subtract-time' : 'onSubtractTime'
		},

		onAddTime: function() {
			this.model.changeSchedule(this.model.toStation.id, 1);
		},

		onSubtractTime: function() {
			this.model.changeSchedule(this.model.toStation.id, -1);
		},

		onTripRowClick : function() {
			// pass the relevant row model to the parent AllTripsView
			//this.parent.analyzeCellClick(this.model);
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
					$el.append('<td><button class="add-time">+</button></td><td><button class="subtract-time">&ndash;</button></td>');
				//});

				if (!this.visible) {
					this.visible = true;
					$el.appendTo(this.options.parentView.$el).hide();
					$el.fadeIn('slow');
				}
				
			} else {
				var $el = this.$el;
				var self = this;

				if (this.visible) {
					self.visible = false;
					$el.fadeOut('slow', function() { $el.remove(); });
				}
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
			var self = this;
			
			var $table = $('<table class="table table-striped table-condensed"></table>');
			
			this.trainCollection.each(function(train) {
				
				var view = new S.ActiveTripView({
					model: train,
					parentView: self
				});
				
				allTripsViews[train] = view;
				
//				$table.append(view.$el);
			});
			
			this.allTripsViews = allTripsViews;
			
			$('#train-schedule').html($table);
			this.$el = $table;
			
		} //end of render
		
	});
					
})(SeptaSim, jQuery);

