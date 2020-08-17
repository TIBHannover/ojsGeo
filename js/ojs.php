<?php


echo json_encode(42);

$my_php_var = 5; 
$simple = 'demo text string';
$php_string = '{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[7.516193389892579,51.94553466305084],[7.516193389892579,51.96447134091556],[7.56511688232422,51.96447134091556],[7.56511688232422,51.94553466305084],[7.516193389892579,51.94553466305084]]]},"properties":{"name":"TODO Administrative Unit"}}]}'; 
?>
<p>Hell</p> 
<input type="text" id="spatialProperties" name="spatialProperties" size="30" >

<script>
    var my_variable_name = "<?php echo $php_string; ?>";
    console.log(my_variable_name); 

    document.getElementById("spatialProperties").value = my_variable_name;


</script>

<script src="ojs.js" type="text/javascript" defer></script>