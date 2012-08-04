<?

//db info
if(isset($_SERVER['APP_NAME'])){ //prod settings
} else {
	define("DBHOST", '127.0.0.1');
	define("DBNAME", 'septa_sim');
	define("DBUSER", 'root');
	define("DBPASS", 'root');
	// define("DBPORT", '3306');
	define('DBSOCK', '');
}








function connectDB() {
	global $DBH;
	if($DBH) return;

	if(DBSOCK) $DBH = mysql_connect(DBHOST.":".DBSOCK, DBUSER, DBPASS) or die ('Error connecting to mysql'. mysql_error());
	else $DBH = mysql_connect(DBHOST, DBUSER, DBPASS) or die ('Error connecting to mysql'. mysql_error());
	
	mysql_selectdb(DBNAME);	
}




function d($s){
    if(is_array($s) || is_object($s)){ print "<pre>"; print_r($s); print "</pre>\n"; return;}
    print $s."<br />\n";
}



/*

INSERT stops (line_id, direction, train, station, time) VALUES
('PAO',0,9597,'Temple University','5:32am '),	('PAO',0,9597,'Market East Station','5:38am '),	('PAO',0,9597,'Suburban Station','5:43am '),	('PAO',0,9597,'30th Street Station','5:47am '),	('PAO',0,9597,'Overbrook','5:56am '),	('PAO',0,9597,'Merion','—'),	('PAO',0,9597,'Narberth','—'),	('PAO',0,9597,'Wynnewood','—'),	('PAO',0,9597,'Ardmore','6:00am '),	('PAO',0,9597,'Haverford','6:02am '),	('PAO',0,9597,'Bryn Mawr','6:04am '),	('PAO',0,9597,'Rosemont','6:05am '),	('PAO',0,9597,'Villanova','6:07am '),	('PAO',0,9597,'Radnor (STN*)','6:09am '),	('PAO',0,9597,'St Davids','6:11am '),	('PAO',0,9597,'Wayne','6:13am '),	('PAO',0,9597,'Strafford','6:15am '),	('PAO',0,9597,'Devon','6:17am '),	('PAO',0,9597,'Berwyn','6:19am '),	('PAO',0,9597,'Daylesford','—'),	('PAO',0,9597,' Paoli (Rt 204, 205, 206)','6:22am '),	('PAO',0,9597,'Malvern','6:25am '),	('PAO',0,9597,'Exton','6:31am '),	('PAO',0,9597,'Whitford','6:33am '),	('PAO',0,9597,'Downingtown','6:38am '),	('PAO',0,9597,'Thorndale','6:43am ')

INSERT stops (line_id, direction, train, station, time) VALUES
('PAO',0,501,'Temple University','6:02am '),	('PAO',0,501,'Market East Station','6:08am '),	('PAO',0,501,'Suburban Station','6:13am '),	('PAO',0,501,'30th Street Station','6:17am '),	('PAO',0,501,'Overbrook','6:27am '),	('PAO',0,501,'Merion','6:29am '),	('PAO',0,501,'Narberth','6:31am '),	('PAO',0,501,'Wynnewood','6:32am '),	('PAO',0,501,'Ardmore','6:34am '),	('PAO',0,501,'Haverford','6:36am '),	('PAO',0,501,'Bryn Mawr','6:38am '),	('PAO',0,501,'Rosemont','6:40am '),	('PAO',0,501,'Villanova','6:42am '),	('PAO',0,501,'Radnor (STN*)','6:44am '),	('PAO',0,501,'St Davids','6:46am '),	('PAO',0,501,'Wayne','6:48am '),	('PAO',0,501,'Strafford','6:50am '),	('PAO',0,501,'Devon','6:52am '),	('PAO',0,501,'Berwyn','6:54am '),	('PAO',0,501,'Daylesford','6:56am '),	('PAO',0,501,' Paoli (Rt 204, 205, 206)','7:01am '),	('PAO',0,501,'Malvern','—'),	('PAO',0,501,'Exton','—'),	('PAO',0,501,'Whitford','—'),	('PAO',0,501,'Downingtown','—'),	('PAO',0,501,'Thorndale','—');


*/

?>