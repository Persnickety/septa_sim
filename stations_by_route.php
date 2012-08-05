<?header('Content-type: application/json');
require_once( 'libs/lib.php');
connectDB();

$route_q = mysql_query("SELECT route_id FROM routes;");
print "{";
$first_route = true;
    
while ($route = mysql_fetch_array($route_q)){  //step through each route
    if($first_route) $first_route = false; else print ", ";
    print '"'.$route['route_id'].'":[';
    
    $representative_trip_q = mysql_query('SELECT trip_id, count(*) AS n, trips.route_id
                                            FROM stop_times
                                            LEFT JOIN trips USING(trip_id)
                                            GROUP BY trip_id
                                            HAVING n=( 
                                            	SELECT max(n) FROM (
                                            		SELECT trip_id, count(*) AS n
                                            		FROM stop_times
                                            		LEFT JOIN trips USING (trip_id)
                                            		WHERE trips.route_id = "'.$route['route_id'].'"
                                            		GROUP BY trip_id
                                            	) AS stop_counts_by_trip
                                            ) AND trips.route_id="'.$route['route_id'].'"
                                            LIMIT 1;');
    $trip = mysql_fetch_array($representative_trip_q);
    $stop_q = mysql_query('SELECT stop_id FROM stop_times WHERE trip_id="'.$trip['trip_id'].'" ORDER BY stop_sequence ASC;');
    $first_stop= true;
    while($stop = mysql_fetch_object($stop_q)){
        if($first_stop) $first_stop=false; else print ", ";
        print $stop->stop_id;
    }
        print "]";
}
print "}";






exit;



/*
$trip_q = mysql_query("SELECT trip_id FROM trips WHERE route_id = '".$route['route_id']."';");
while ($trip = mysql_fetch_array($trip_q)){  //step through every 
    print " &nbsp; ".$trip['trip_id']."<br>";
}
*/