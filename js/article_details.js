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


var osmlayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    maxZoom: 18
}).addTo(map);

var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18
});

var baseLayers = {
    "OpenStreetMap": osmlayer,
    "Esri World Imagery": Esri_WorldImagery
};

// add two baseLayers (Open Street Map and Esri World Imagery) to the map 
L.control.layers(baseLayers).addTo(map);










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
        startDate: "2020-08-03 11:59 A",
        endDate: "2020-08-14 05:17 AM",
        locale: {
            format: 'YYYY-MM-DD hh:mm A'
        }
    }, function (start, end, label) {
        var start = temporalPropertiesStart;
        var end = temporalPropertiesEnd;
    });
});