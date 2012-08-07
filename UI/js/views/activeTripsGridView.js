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
      this.render();
    },

    onTripSelect: function() {
      this.render();
    },
    
    events : {
      'click' : 'onTripRowClick',
      'click .add-time' : 'onAddTime',
      'click .subtract-time' : 'onSubtractTime'
    },

    onAddTime: function() {
      this.model.changeSchedule(this.model.toStation.id, 1);
      return false;  // Keep event from bubbling up.
    },

    onSubtractTime: function() {
      this.model.changeSchedule(this.model.toStation.id, -1);
      return false;  // Keep event from bubbling up.
    },

    onTripRowClick : function() {
      if (!this.model.selected) {
        this.model.select();
      } else {
        this.model.deselect();
      }
    },
    
    tagName: 'tr',
    
    render: function() {
      var is_active = this.model.active;
      
      if (is_active) {
        var routeName = this.model.get('routeName');
        var tripID = this.model.id;
        var nextStation = this.model.get('nextStation');
        var arrivalTime = this.model.get('arrivalTime');
      
        var $el = this.$el;
        $el.empty();
        $el.append('<td><div>'+ routeName +'</div></td>');
        $el.append('<td><div>'+ tripID +'</div></td>');
        $el.append('<td><div>'+ nextStation +'</div></td>');
        $el.append('<td><div>'+ arrivalTime +'</div></td>');
        $el.append('<td><div><button class="add-time">+</button></div></td><td><div><button class="subtract-time">&ndash;</button></div></td>');

        if (this.model.selected) {
          $el.find('td').css({'background-color': 'yellow'});
        }

        // Show the element if it's active but not visible.
        if (!this.visible) {
          this.visible = true;
          $el.appendTo(this.options.parentView.$el);
          $el.find('td > div').hide().slideDown();
          this.delegateEvents(this.events);
        }
        
      } else {
        var $el = this.$el;
        var self = this;

        // Hide the element if it's not active, and it's visible.
        if (this.visible) {
          this.visible = false;
//          $el.remove();
          $el.find('td > div').slideUp(function() { $el.remove(); });
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
      
      var $table = $('<table class="table table-striped table-condensed"><tr><th>Route</th><th>Trip</th><th>Next Station</th><th colspan=3>Arrival Time</th></tr></table>');
      
      this.trainCollection.each(function(train) {
        
        var view = new S.ActiveTripView({
          model: train,
          parentView: self
        });
        
        allTripsViews[train] = view;
        
//        $table.append(view.$el);
      });
      
      this.allTripsViews = allTripsViews;
      
      $('#train-schedule').html($table);
      this.$el = $table;
      
    } //end of render
    
  });
          
})(SeptaSim, jQuery);

