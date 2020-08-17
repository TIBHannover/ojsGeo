<?php
$my_php_var = 5; 
$simple = 'demo text string';
echo '{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[7.516193389892579,51.94553466305084],[7.516193389892579,51.96447134091556],[7.56511688232422,51.96447134091556],[7.56511688232422,51.94553466305084],[7.516193389892579,51.94553466305084]]]},"properties":{"name":"TODO Administrative Unit"}}]}'; 
?>

<script>
    function reqListener () {
      console.log(this.responseText);
    }

    var oReq = new XMLHttpRequest(); // New request object
    oReq.onload = function() {
        // This is where you handle what to do with the response.
        // The actual data is found on this.responseText
        alert(this.responseText); // Will alert: 42
    };
    oReq.open("get", "get-data.php", true);
    //                               ^ Don't block the rest of the execution.
    //                                 Don't wait until the request finishes to
    //                                 continue.
    oReq.send();
</script>

