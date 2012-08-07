var SeptaSim = SeptaSim || {};

(function(S)
{
  var ARRIVAL_TIME = 1;
  var STOP_ID = 0;
  
  S.Train = Backbone.Model.extend({
    idAttribute: "trip_id",

    select: function() {
      this.selected = true;
      this.trigger('select');
    },

    deselect: function() {
      this.selected = false;
      this.trigger('select');
    },

    activate: function(options) {
      this.active = true;

      options = options || {};
      if (!options.silent)
        this.trigger('change');
    },

    deactivate: function(options) {
      this.active = false;

      options = options || {};
      if (!options.silent)
        this.trigger('change');
    },

    // Get the stations that the train should be between according to its
    // schedule.
    getBoundingStationsInfo: function(stationCollection, time) {
      var schedule = this.get('schedule'),
          fromStationInfo, toStationInfo;
      
      fromStationInfo = schedule[0];
      
      for(var i=0; i<schedule.length; i++)
      {
        if(schedule[i][ARRIVAL_TIME] >= time)
        {
          toStationInfo = schedule[i];
          break;
        }
        
        fromStationInfo = schedule[i];
      }

      return [fromStationInfo, toStationInfo];
    },
    
    updatePosition: function(stationCollection, time) {
      var schedule = this.get('schedule'),
          boundingStationsInfo = this.getBoundingStationsInfo(stationCollection, time),
          fromStationInfo = boundingStationsInfo[0],
          toStationInfo = boundingStationsInfo[1];

      if (toStationInfo == undefined ||
          fromStationInfo == toStationInfo) {
        this.deactivate();
        return;
      };

      var interpolationFactor = (time - fromStationInfo[ARRIVAL_TIME]) / (toStationInfo[ARRIVAL_TIME] - fromStationInfo[ARRIVAL_TIME]);
      var fromStation = stationCollection.get(fromStationInfo[STOP_ID]);
      var toStation = stationCollection.get(toStationInfo[STOP_ID]);
      var outbound = (fromStationInfo[2] == 1);
      var routeName = this.id.substring(0,3);

      var timeInMins = toStationInfo[ARRIVAL_TIME]*1;
      var timeObj = convertIntegerTimeIntoTimeObject(timeInMins);
      var timeString = timeObj.h + ":" + zeroFill(timeObj.m, 2);

      this.fromStation = fromStation;
      this.toStation = toStation;
      this.interpolationFactor = interpolationFactor;
      this.routeName = routeName;
      
      this.set({
        'outbound?': outbound,
        'routeName': routeName,
        'nextStation': toStation.get('stop_name'),
        'arrivalTime': timeString
        }, {silent: true});

      this.activate();
    }, //end of updatePosition

    changeSchedule: function(stationID, incrementTimeBy) {
      var schedule = this.get('schedule');
      var foundStop = false;
      for(var i=0; i<schedule.length; i++)
      {
        if(schedule[i][STOP_ID] == stationID)
        {
          foundStop = true;
        }
        
        //if found the stop you want to update the arrival time for, then update the arrival time for all following stops
        if(foundStop)
        {
          schedule[i][ARRIVAL_TIME] += incrementTimeBy;
        }
      }

      this.updatePosition(stationCollection, this.collection.currentTime);
      this.set({'schedule': schedule});
      
    } //end of changeSchedule

  });
          
            
        
  S.TrainCollection = Backbone.Collection.extend({
    url: '',
    currentTime: 0,
    model: S.Train,
    updateAllTrainPositions : function(stationCollection) {
      var time = this.currentTime;
      this.each(function(train) {
        train.updatePosition(stationCollection, time);
      })
    }
  });

  
})(SeptaSim);
