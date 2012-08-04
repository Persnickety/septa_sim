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
    print "OK  $service_id";
}


?>


