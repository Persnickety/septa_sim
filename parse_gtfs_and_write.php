<?

if(!$_POST || !array_key_exists('file', $_POST)){
    make_file_choice_page();
} else {
    // echo $_POST['file']; exit;

    require_once( 'libs/lib.php');
    connectDB();
    $path = realpath($_POST['file']);

    $files = array(
        'agencies' => array( //must be first so we can use ID in other tables
            "filename"   => "agency.txt",
            "req_fields" => array('agency_id', 'agency_name', 'agency_url', 'agency_timezone'),
            "opt_fields" => array()
        ),
        'stops' => array(
            "filename"   => "stops.txt",
            "req_fields" => array('stop_id', 'stop_name', 'stop_lat', 'stop_lon',                         'agency_id'),
            "opt_fields" => array()
        ),
        'routes' => array(
            "filename"   => "routes.txt",
            "req_fields" => array('route_id', 'route_short_name', 'route_long_name', 'route_type',       'agency_id'),
            "opt_fields" => array()            
        ),
        'trips' => array(
            "filename"   => "trips.txt",
            "req_fields" => array('trip_id', 'route_id', 'service_id',                                   'agency_id' ),
            "opt_fields" => array('block_id')
        ),
        'stop_times' => array(
            "filename"   => "stop_times.txt",
            "req_fields" => array('trip_id', 'arrival_time', 'departure_time', 'stop_id', 'stop_sequence', 'agency_id'),
            "opt_fields" => array()            
        ),
        'calendar' => array(
            "filename"  => "calendar.txt",
            "req_fields" => array('service_id', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'start_date', 'end_date',         'agency_id'),
            "opt_fields" => array()            
        )
    );

    // $agency_id = load_data($path);
    // extra_processing($agency_id);
    write_station_locations();
    // write_schedule();
    // write_stations_by_route();
    print "<br />done";
    
}
exit;


function make_file_choice_page(){
    $dirs = glob("gtfs/*", GLOB_ONLYDIR);
    echo "<h2>Choose a data set to load:</h2><form method='post'>\n";
    foreach ($dirs as $dir){
        echo "<p><input type='radio' name='file' value='$dir'/>$dir </p>\n";
    }
    echo "<input type='submit' value='Load into db'/></form>\n";
}

function load_data($path){
    global $files;
    $agency_id = null;  //get written when agency loads, then passed to every one after;
    foreach( $files as $table=>$file_data){
        print "<hr />filling table= $table <br />\n";
        $agency_id = apply_file($path."/".$file_data['filename'], $file_data['req_fields'], $file_data['opt_fields'],$table, $agency_id);
    }
    return $agency_id;
}

function apply_file($file_name, $req_fields, $opt_fields, $table, $agency_id){
    if(!file_exists($file_name)){
        print "not found: $file_name";
        exit;
    }
    $file = fopen($file_name, "r");
    $header_row = array_map("trim",fgetcsv($file));
    $header_mapping = array_flip($header_row);

    while($row = fgetcsv($file)){
        $pairs = ",";
        foreach($req_fields as $s){
            $val = trim(str_replace("'","",$row[ $header_mapping[ $s ] ])); 
            if ($s=="agency_id"){
                if($agency_id) $val = $agency_id; //we sent in a valid agency, so use it
                else $agency_id = $val; // we need a value in $agency_id to return
            } 
            $pairs .= $s."='$val', ";
        }
        foreach($opt_fields as $s){
            if(!array_key_exists($s, $header_mapping)) continue;
            $val = trim(str_replace("'","",$row[ $header_mapping[ $s ] ])); 
            $pairs .= $s."='$val', ";
        }
        $pairs= trim($pairs, " ,");
        $q = "INSERT $table SET $pairs ;";
        mysql_query($q);
        if(mysql_errno() ){ 
            if (mysql_errno() == 1062) print ".";
            else print mysql_errno().":".mysql_error()." $q<br />\n"; 
        }
        // print "$q <br />\n";
    }
    
    fclose($file);
    return $agency_id;
}

function extra_processing($agency_id){
    //prep to join stops on blocks, not trips
    $q = "UPDATE trips SET block_id=trip_id WHERE block_id is null;";  
    mysql_query($q);//blocks (optional) now always have something useful
    
    $q = "UPDATE stop_times s, trips t  
            SET s.block_id = t.block_id
            WHERE s.trip_id = t.trip_id;";
    mysql_query($q);    //stops can now always be joined using the (optional) block
    
    /*********
        mistake in GTFS file for June 2012 - missing stop_time for block_id 1071
    ********/
    mysql_query("INSERT INTO stop_times (agency_id, trip_id, block_id, stop_sequence, stop_id, arrival_time, departure_time) 
                    VALUES ('SEPTA', 'CYN_1071_V5', '1071', 1, '90005', '12:19:00', '12:19:00' )");
}

function write_station_locations(){
    print "<hr> writing station_locations.js<br>";
    $fh = fopen("UI/data/station_locations.js", "w" );
    fwrite($fh, "STATION_LOCATIONS= ");
    $q = "SELECT stop_id, stop_lat, stop_lon, stop_name
            FROM stops
            ORDER BY stop_id ASC;";
    $stops_q = mysql_query($q);
    $first = true;
    fwrite($fh, "[");
    while($stop = mysql_fetch_object($stops_q)){
        if(!$first) fwrite($fh,","); else $first=false;
        fwrite($fh, '{ "stop_id":'.$stop->stop_id.",".
                '  "stop_lat":'.$stop->stop_lat.",".
                '  "stop_lon":'.$stop->stop_lon.",".
                '  "stop_name":"'.$stop->stop_name.'"}'
            );
    }
    fwrite($fh,"]");
    fclose($fh);
    
}

function write_schedule(){
    $services_q = mysql_query("SELECT service_id FROM calendar GROUP BY service_id;");
    while($serv_obj = mysql_fetch_object($services_q)){
        $service_id = $serv_obj->service_id;
        print "<hr> writing schedule_{$service_id}.js<br>";
        
        $fh = fopen("UI/data/schedule_{$service_id}.js", "w" );
        fwrite($fh, "SCHEDULE_{$service_id} = ");
        $out = array();
    
        $trips_q = mysql_query("SELECT block_id 
                                FROM trips 
                                WHERE service_id='$service_id'
                                GROUP BY block_id
                                ORDER BY block_id ASC;"
                    );
        $n = -1;
        while ($trip = mysql_fetch_object($trips_q)){
            $b_id = 1*$trip->block_id;
        
            $q = "SELECT stop_times.trip_id, stop_id, FLOOR((TIME_TO_SEC(  LEFT( departure_time,6)   )-10800)/60) AS mins_since_3am
                    FROM stop_times
                    LEFT JOIN trips USING (block_id)
                    WHERE trips.block_id='$b_id' AND trips.service_id='$service_id'
                    ORDER BY stop_times.trip_id, stop_sequence ASC";

            $stop_time_q = mysql_query($q);
            $has_reached_suburban = false;
            $last_stop_id = null;
            $last_trip_id = null;
            while ($stop = mysql_fetch_object($stop_time_q)){
                if( $last_trip_id != $stop->trip_id){ //new object, reset our flags
                    $has_reached_suburban = false;
                    $last_stop_id = null;
                    $n++;           
                    $out[$n] = array();                             
                    $out[$n]['block_id'] = $b_id;
                    $out[$n]['trip_id'] = $stop->trip_id;
                    $out[$n]['schedule'] = array();    
                    $last_trip_id = $stop->trip_id;                
                }
                if($stop->stop_id == $last_stop_id) continue; //duplicates may exist at the overlap when changing trips within a block
                $has_reached_suburban = $has_reached_suburban || ($stop->stop_id == '90005');            
                $out[$n]['schedule'][]= array($stop->stop_id, 1*$stop->mins_since_3am, $has_reached_suburban?1:0);
                $last_stop_id = $stop->stop_id;
            } //loop every stop
            // if(!$has_reached_suburban) print "<span style='color:red'>$b_id</span> $q <br>".json_encode($out[$b_id])."<br>\n";
            // else print "$b_id ok<br>\n";
        } //loop every trip    
        fwrite($fh, json_encode($out));    
        fclose($fh);    
    }//services loop
}

function write_stations_by_route(){
    print "<hr> writing stations_by_route.js<br>";
    $fh = fopen("UI/data/stations_by_route.js", "w" );
    fwrite($fh, "STATIONS= ");
    
    $out = "";
    
    $route_q = mysql_query("SELECT route_id FROM routes;");
    $out.= "{";
    $first_route = true;

    while ($route = mysql_fetch_array($route_q)){  //step through each route
        if($first_route) $first_route = false; else $out.= ", ";
        $out.= '"'.$route['route_id'].'":[';

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
            if($first_stop) $first_stop=false; else $out.= ", ";
            $out.= $stop->stop_id;
        }
            $out.= "]";
    }
    $out.= "}";
    
    
    fwrite($fh, $out);
    fclose($fh);    
}

?>