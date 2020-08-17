//load spatial properties from .tpl 
var spatialProperties = JSON.parse(document.getElementById("spatialProperties").value);
var lngFirstCoordinateGeojson;
var latFirstCoordinateGeojson;

/*
Depending on the object type, the geoJSON object is structured slightly differently, 
so that the coordinates are at different locations and must be queried differently. 
*/
if (spatialProperties.features[0].geometry.type === 'Polygon') {
    lngFirstCoordinateGeojson = spatialProperties.features[0].geometry.coordinates[0][0][0];
    latFirstCoordinateGeojson = spatialProperties.features[0].geometry.coordinates[0][0][1];
}
else if (spatialProperties.features[0].geometry.type === 'LineString') {
    lngFirstCoordinateGeojson = spatialProperties.features[0].geometry.coordinates[0][0];
    latFirstCoordinateGeojson = spatialProperties.features[0].geometry.coordinates[0][1];
}
else if (spatialProperties.features[0].geometry.type === 'Point') {
    lngFirstCoordinateGeojson = spatialProperties.features[0].geometry.coordinates[0];
    latFirstCoordinateGeojson = spatialProperties.features[0].geometry.coordinates[1];
}


// set focus of the map on the first coordinate of the geojson (var spatialProperites)
var map = L.map('mapdiv').setView([latFirstCoordinateGeojson, lngFirstCoordinateGeojson], 10); // TODO auf den Ort der Untersuchung setzen 
L.geoJSON(spatialProperties).addTo(map);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// add a search to the map 
var geocoder = L.Control.geocoder({
    defaultMarkGeocode: false
})
    .on('markgeocode', function (e) {
        var bbox = e.geocode.bbox;
        var poly = L.polygon([
            bbox.getSouthEast(),
            bbox.getNorthEast(),
            bbox.getNorthWest(),
            bbox.getSouthWest()
        ])/*.addTo(map);*/
        map.fitBounds(poly.getBounds());
    })
    .addTo(map);

// load temporal properties from .tpl 
var temporalProperties = document.getElementById("temporalProperties").value;
console.log(temporalProperties);
var temporalPropertiesStart = temporalProperties.substring(0, 19);
var temporalPropertiesEnd = temporalProperties.substring(22, 41);
console.log(temporalPropertiesStart);
console.log(temporalPropertiesEnd);

// show the temporal properties in a calendar format 
$(function () {
    $('input[name="datetimes"]').daterangepicker({
        timePicker: false,
        autoApply: true,
        autoUpdateInput: true,
        startDate: temporalProperties,
        endDate: temporalPropertiesEnd,
        locale: {
            format: 'YYYY-MM-DD hh:mm A'
        }
    }, function (start, end, label) {
        var start = temporalPropertiesStart;
        var end = temporalPropertiesEnd;
    });
});