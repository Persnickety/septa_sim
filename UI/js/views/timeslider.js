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
      $play.click(_.bind(this.toggleSimulation, this));

      this.toggleSimulation();
    },

    toggleSimulation: function() {
      var $play = $('#septa-play-button');

      if (!this.isStarted) {
        this.continueSimulation();
        $play.html('Pause');
      } else {
        this.pauseSimulation();
        $play.html('Play');
      }
    },

    continueSimulation: function() {
      this.isStarted = true;
      var $slider = $('#septa-time-slider');
      $slider.val(parseInt($slider.val()) + 1).change();
      this.simContinuationId = _.delay(_.bind(this.continueSimulation, this), 100);
    },

    pauseSimulation: function() {
      this.isStarted = false;
      clearTimeout(this.simContinuationId);
    },

    onSliderChange: function(evt) {
      var $slider = $(evt.target);
      var $display = $('#septa-time-display');
      this.trainCollection.currentTime = $slider.val();
      this.trainCollection.updateAllTrainPositions(this.stationCollection);

      var time = convertIntegerTimeIntoTimeObject($slider.val());
      var displayTime = time.h + ':' + zeroFill(time.m, 2)
      $display.html(displayTime);
    }
  });

})(SeptaSim, jQuery);
