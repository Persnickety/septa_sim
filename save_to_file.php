<?
if(!$_POST || !array_key_exists('service_id', $_POST) || !array_key_exists('deltas', $_POST)) {
    echo $_POST?"P":"NP";
    echo array_key_exists('service_id',$_POST)?"s":"Ns";
    
    echo "Bad arguments.  Post service_id and deltas.";
    echo $_POST['service_id'];
    exit;
}

require_once( 'libs/lib.php');
connectDB();
$service_id = mysql_real_escape_string($_POST['service_id']);
$deltas =stripcslashes(   urldecode($_POST['deltas'])); 


// store_deltas($service_id, $deltas);
write_stop_times($service_id, $deltas);
exit;

function store_deltas($service_id, $deltas){
    mysql_query("TRUNCATE table deltas;");
    $d_arr = null;
    preg_match_all('/\["([^"]+)","([^"]+)",(\d+)\]/', $deltas, $d_arr, PREG_SET_ORDER);
    foreach($d_arr as $n=>$d){
        $q = 'INSERT INTO deltas SET 
                service_id="'.$service_id.'", 
                trip_id="'.mysql_real_escape_string($d[1]).'", 
                stop_id="'.mysql_real_escape_string($d[2]).'", 
                minutes='.$d[3].';';
        mysql_query($q);
    }
}

function write_stop_times($service_id, $deltas){
    header('Content-Type: text/plain');
    header("Content-Disposition: attachment; filename=\"stop_times_{$service_id}.txt\"");
    print "trip_id, arrival_time, departure_time, stop_id, stop_sequence, pickup_type, drop_off_type\n";
    
    
    $q = "SELECT s.*, SEC_TO_TIME(TIME_TO_SEC(s.arrival_time)+minutes*60) AS new_arrival, SEC_TO_TIME(TIME_TO_SEC(s.departure_time)+minutes*60) AS new_departure
            FROM stop_times s
            LEFT JOIN trips t USING (trip_id)
            LEFT JOIN deltas d ON (d.trip_id = s.trip_id AND d.stop_id = s.stop_id AND d.service_id='$service_id')
            WHERE t.service_id = '$service_id';";
    // print $q;
    $st_q = mysql_query($q);
    if(mysql_errno()) {print mysql_error(); exit;}
    while($st = mysql_fetch_array($st_q)){
        print   $st['trip_id'].",".
                ($st['new_arrival']?$st['new_arrival']:$st['arrival_time']).",".
                ($st['new_departure']?$st['new_departure']:$st['departure_time']).",".
                $st['stop_id'].",".
                $st['stop_sequence'].",".
                $st['pickup_type'].",".
                $st['drop_off_type'].
                "\n";
        
        
    }
    exit;
}


?>