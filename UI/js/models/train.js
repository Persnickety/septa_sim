var SeptaSim = SeptaSim || {};

(function(S)
{
	var ARRIVAL_TIME = 1;
	var STOP_ID = 0;
	
	S.Train = Backbone.Model.extend({
										idAttribute: "trip_id",
										
										updatePosition: function(stationCollection, time){
															var schedule = this.get('schedule');
															
															var fromStationInfo, toStationInfo;
															
															fromStationInfo = schedule[0];
															
															for(var i=0; i<schedule.length; i++)
															{
//																console.log(time, schedule[i][ARRIVAL_TIME])
																if(schedule[i][ARRIVAL_TIME] >= time)
																{
																	toStationInfo = schedule[i];
																	break;
																}
																
																fromStationInfo = schedule[i];
															}

															if (toStationInfo == undefined ||
															    fromStationInfo == toStationInfo) {

															    this.set('active', false);
															    return;
													    };

//															console.log(fromStationInfo, toStationInfo);
															
															var timeInterval = (time - fromStationInfo[ARRIVAL_TIME]) / (toStationInfo[ARRIVAL_TIME] - fromStationInfo[ARRIVAL_TIME]);
															var fromStation = stationCollection.get(fromStationInfo[STOP_ID]);
															var toStation = stationCollection.get(toStationInfo[STOP_ID]);
															var newLocation = stationCollection.getInterpolatedLocation(fromStation, toStation, timeInterval);
															var outbound = (fromStationInfo[2] == 1);

															if (fromStationInfo[STOP_ID] == 90701) {
																this.set('trenton?', true, {silent: true});
															} else {
																this.set('trenton?', false, {silent: true});
															}
															
															var timeInSeconds = toStationInfo[ARRIVAL_TIME]*60;
															var timeObj = secondsToTime(timeInSeconds);
															var timeString = timeObj.h + ":" + timeObj.m + ":" + timeObj.s;
															
															this.set({
																'location': newLocation,
																'active': true,
																'outbound?': outbound,
																'routeName': this.id.substring(3),
																'nextStation': toStation.get('stop_name'),
																'arrivalTime': timeString
																});
														}, //end of updatePosition

										changeSchedule: function(stationID, incrementTimeBy) {
															
															var schedule = this.get('schedule');
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
																	schedule[i][ARRIVAL_TIME] += incrementTimeBy;
																}
															}
															
															this.set('schedule', schedule);
															
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
