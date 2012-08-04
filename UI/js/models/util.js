SeptaSim = SeptaSim || {}

function getBearing(lat1, lon1, lat2, lon2)
{
var dLon = toRad((lon2-lon1));
var y = Math.sin(dLon) * Math.cos(lat2);
var x = Math.cos(lat1)*Math.sin(lat2) -
        Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
var brng = Math.atan2(y, x).toDeg();
}

function toRad(degree) {
    return degree * Math.PI / 180;
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
	var R = 6371; // km
	var d = getDistance(fromLat, fromLon, toLat, toLon) * timeInterval;
	
	var brng = getBearing(fromLat, fromLon, toLat, toLon);
	
	var lat2 = Math.asin( Math.sin(fromLat)*Math.cos(d/R) + 
              Math.cos(fromLat)*Math.sin(d/R)*Math.cos(brng) );

	var lon2 = lon1 + Math.atan2(Math.sin(brng)*Math.sin(d/R)*Math.cos(fromLat), 
                     Math.cos(d/R)-Math.sin(fromLat)*Math.sin(lat2));
					 
	return { lat: lat2, lon: lon2 };
}