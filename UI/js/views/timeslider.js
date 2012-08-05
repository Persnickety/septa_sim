var SeptaSim = SeptaSim || {};

(function(S, $)
{
	S.TimeSliderView = Backbone.View.extend({
		initialize: function() {
			var $slider = $('#septa-time-slider');
			var $play = $('#septa-play-button');
			var $pause = $('#septa-pause-button');

			this.trainCollection = this.options.trainCollection;
			this.stationCollection = this.options.stationCollection;

			$slider.change(_.bind(this.onSliderChange, this));
			$play.click(_.bind(this.startSimulation, this));
			$pause.click(_.bind(this.pauseSimulation, this));

			this.startSimulation();
		},

		startSimulation: function() {
			if (!this.isStarted) {
				this.isStarted = true
				this.continueSimulation();
			}
		},

		continueSimulation: function() {
			var $slider = $('#septa-time-slider');
			$slider.val($slider.val()*1 + 1).change();
			this.simContinuationId = _.delay(_.bind(this.continueSimulation, this), 100);
		},

		pauseSimulation: function() {
			if (this.isStarted) {
				clearTimeout(this.simContinuationId);
				this.isStarted = false;
			}
		},

		onSliderChange: function(evt) {
			var $slider = $(evt.target);
			this.trainCollection.currentTime = $slider.val();
			this.trainCollection.updateAllTrainPositions(this.stationCollection);
		}
	});
					
})(SeptaSim, jQuery);

