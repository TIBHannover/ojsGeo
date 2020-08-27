/*
// Create a request variable and assign a new XMLHttpRequest object to it.
var request = new XMLHttpRequest()

// Open a new connection, using the GET request on the URL endpoint
request.open('GET', 'http://api.geonames.org/countrySubdivisionJSON?lat=47.03&lng=10.2&username=tnier01', true)

request.onload = function () {
    console.log(request); 
  // Begin accessing JSON data here
}

// Send request
request.send()
*/


$.ajax({
    url: "http://api.geonames.org/countrySubdivisionJSON?lat=47.03&lng=10.2&username=tnier01", success: function (result) {
        console.log(result);
        //$("#div1").html(result);
    }
});