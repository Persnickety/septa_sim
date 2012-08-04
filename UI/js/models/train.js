SeptaSim = SeptaSim || {}

(function(S)
{
	S.Train = Backbone.Model.extend({
										idAttribute: "blockid"
										
										updatePosition: function(stationCollection, time){
															var schedule = this.get('Schedule');
															
															var fromStationInfo, toStationInfo;
															
															fromStationInfo = schedule[0];
															
															for(var i=0; i<schedule.length; i++)
															{
																if(schedule[i].arrival_time >= time)
																{
																	toStationInfo = schedule[i];
																	break;
																}
																
																fromStationInfo = schedule[i];
															}
															
															var timeInterval = (time - fromStationInfo.arrival_time) / (toStationInfo.arrival_time - fromStationInfo.arrival_time);
															
															var newLocation = stationCollection.getInterpolatedLocation(fromStation, toStation, timeInterval);
															
															this.set('location', newLocation);
														}, //end of updatePosition

										changeSchedule: function(stationID, incrementTimeBy) {
															
															var schedule = this.get('Schedule');
															var foundStop = false;
															for(var i=0; i<schedule.length; i++)
															{
																if(schedule[i].stop_id == stationID)
																{
																	foundStop = true;
																}
																
																//if found the stop you want to update the arrival time for, then update the arrival time for all following stops
																if(foundStop)
																{
																	schedule[i].arrival_time += incrementTimeBy;
																}
															}
															
															this.set('Schedule', schedule);
															
														} //end of changeSchedule

									});
					
						
				
	S.TrainCollection = Backbone.Collection.extend({
					url: ''
					currentTime: 0
					model: S.Train
					updateAllTrainPositions : function(stationCollection) {
					}
				});

	
})(SeptaSim);