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

    $agency_id = load_data($path);
    extra_processing($agency_id);
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
?>