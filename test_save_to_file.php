<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /> 
    <script src='UI/libs/jquery.min.js'></script>
    <script type="text/javascript" charset="utf-8">
        $(init);
        function init(){
                        
            var deltas = [ ["trip1", "stop1", 1], ["trip2", "stop2", 2], ["trip3", "stop3", 3]];
            
            $("#myform").submit(function(){
               $("#service_id").val("S1");
               $("#deltas").val(JSON.stringify(deltas)); 
            });

            
        };
    </script>  
</head>
<body>
    <form action="save_to_file.php" id="myform" method="post">
        <input type='hidden' id='service_id' name='service_id' />
        <input  type='hidden' id='deltas' name='deltas' />
        <input type='submit' id='test' />    
    </form>
</body>
</html>