SeptaSim = SeptaSim || {}

(function(S, $)
{
	S.AllSchedulesView = Backbone.View.extend({
						render: function() {
							var $el = this.$el;
							$el.html('<ul></ul>');
							this.collection.each(function(train) {
								$el.append('<li>'+ train.tripInfo +'</li>');
								$el.append('<li>'+ train.nextStation +'</li>');
								$el.append('<li>'+ train.arrivalTime +'</li>');
							});
						}
					});
	
					
})(SeptaSim, jQuery);

