SeptaSim = SeptaSim || {}

function toRad(degree) {
    return degree * Math.PI / 180;
  }
  
function toDeg(radian) {
    return radian * 180 / Math.PI;
  }

// Return Bearing (degrees)
function getBearing(lat1, lon1, lat2, lon2)
{
		var DEG_PER_RAD = (180.0/Math.PI);
    var dLon = lon2 - lon1;
    var y = Math.sin(dLon) * Math.cos(lat2);
    var x = Math.cos(lat1)*Math.sin(lat2)-Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
    return DEG_PER_RAD*Math.atan2(y, x);

//		var dLon = toRad((lon2-lon1));
//		var y = Math.sin(dLon) * Math.cos(lat2);
//		var x = Math.cos(lat1)*Math.sin(lat2) -
//				    Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
//		var brng = toDeg(Math.atan2(y, x));
//		return brng;
}

function getDistance(fromLat, fromLon, toLat, toLon)
{
	var R = 6371; // km
	var dLat = toRad((toLat-fromLat));
	var dLon = toRad((toLon-fromLon));
	var fromLat = toRad(fromLat);
	var toLat = toRad(toLat);

	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(fromLat) * Math.cos(toLat); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c;

	return d;
}

function getInterpolatedLocation(fromLat, fromLon, toLat, toLon, timeInterval)
{
//	var R = 6371; // km
//	var d = getDistance(fromLat, fromLon, toLat, toLon) * timeInterval;
//	
//	var brng = getBearing(fromLat, fromLon, toLat, toLon);
//	
//	var lat2 = Math.asin( Math.sin(fromLat)*Math.cos(d/R) + 
//              Math.cos(fromLat)*Math.sin(d/R)*Math.cos(brng) );

//	var lon2 = fromLon + Math.atan2(Math.sin(brng)*Math.sin(d/R)*Math.cos(fromLat), 
//                     Math.cos(d/R)-Math.sin(fromLat)*Math.sin(lat2));

	var lat2 = (toLat - fromLat) * timeInterval + fromLat;
	var lon2 = (toLon - fromLon) * timeInterval + fromLon;
	return { lat: lat2, lon: lon2 };
}

/**
 * Convert number of seconds into time object
 *
 * @param integer secs Number of seconds to convert
 * @return object
 */
function convertIntegerTimeIntoTimeObject(time)
{
	var secs = (time*1/60 + 3)*60*60
	var hours = Math.floor(secs / (60 * 60));
	
	var divisor_for_minutes = secs % (60 * 60);
	var minutes = Math.floor(divisor_for_minutes / 60);

	var divisor_for_seconds = divisor_for_minutes % 60;
	var seconds = Math.ceil(divisor_for_seconds);
	
	var obj = {
		"h": hours,
		"m": minutes,
		"s": seconds
	};
	return obj;
}

function zeroFill( number, width )
{
  width -= number.toString().length;
  if ( width > 0 )
  {
    return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
  }
  return number + ""; // always return a string
}
