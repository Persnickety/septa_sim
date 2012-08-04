<?
require_once( 'libs/lib.php');
connectDB();
$q = "SELECT stop_id, stop_lat, stop_lon
        FROM stops
        ORDER BY stop_id ASC;";
$stops_q = mysql_query($q);
$first = true;
print "[";
while($stop = mysql_fetch_object($stops_q)){
    if(!$first) print ","; else $first=false;
    print   "{ stop_id:".$stop->stop_id.",".
            "  stop_lat:".$stop->stop_lat.",".
            "  stop_lon:".$stop->stop_lon."}";
}
print "]";
exit;



