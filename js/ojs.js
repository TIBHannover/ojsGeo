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
    var my_variable_name = "<?php echo $php_string; ?>";

    console.log(JSON.parse(my_variable_name));

    var test = document.getElementById('spatialProperties').value;
    console.log(test);
    
    document.getElementById("spatialProperties").value = JSON.stringify(test) + "test";

