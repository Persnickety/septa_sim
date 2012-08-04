<?

if ($_GET && array_key_exists('service_id', $_GET)){
    require_once( 'libs/lib.php');
    connectDB();
    send_data(mysql_real_escape_string($_GET['service_id']));
} else{
?>    
  
    <h2> Select a service</h2>
        <form method="GET">
            <select name='service_id'>
                <option value='S1'>Weekdays</option>
                <option value='S2'>Saturday</option>
                <option value='S3'>Sunday/Holiday</option>
                <option value='S4'>Friday (late train stuff)</option>    
            </select>
            <input type = "submit" />
        </form>
<?    
}
exit;

function send_data($service_id){
    // print "OK  $service_id <br>\n";
    $out = array();
    
    $trips_q = mysql_query("SELECT block_id 
                            FROM trips 
                            WHERE service_id='$service_id'
                            GROUP BY block_id
                            ORDER BY block_id ASC;"
                );
    while ($trip = mysql_fetch_object($trips_q)){
        $b_id = $trip->block_id;
        $out[$b_id] = array();
            
        $q = "SELECT stop_id, TIME_TO_SEC(departure_time)-10800 AS secs_since_3am
                FROM stop_times
                LEFT JOIN trips USING (block_id)
                WHERE trips.block_id='$b_id' AND trips.service_id='$service_id'
                ORDER BY stop_sequence ASC";

        $stop_time_q = mysql_query($q);
        $has_reached_suburban = false;
        $last_stop_id=null;
        while ($stop = mysql_fetch_object($stop_time_q)){
            if($stop->stop_id == $last_stop_id) continue; //duplicates may exist at the overlap when changing trips within a block
            $has_reached_suburban = $has_reached_suburban || ($stop->stop_id == '90005');            
            $out[$b_id][]= array($stop->stop_id, $stop->secs_since_3am, $has_reached_suburban?1:0);
            $last_stop_id = $stop->stop_id;
        } //loop every stop
        // if(!$has_reached_suburban) print "<span style='color:red'>$b_id</span> $q <br>".json_encode($out[$b_id])."<br>\n";
        // else print "$b_id ok<br>\n";
    } //loop every trip    
    print json_encode($out);
}

