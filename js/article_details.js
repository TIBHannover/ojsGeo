//load spatial properties from .tpl 
var spatialPropertiesDecoded = document.getElementById("spatialProperties").value;

// load temporal properties from .tpl 
var temporalPropertiesDecoded = document.getElementById("temporalProperties").value;

/*
If neither temporal nor spatial properties are available, the corresponding elements in the article_details.tpl are deleted 
and no geospatial metadata are displayed.  
*/
if (spatialPropertiesDecoded === "no data" && temporalPropertiesDecoded === "no data") {
    document.getElementById("item spatial").innerHTML = null;
    document.getElementById("item temporal").innerHTML = null;
    document.getElementById("item geospatialmetadata").innerHTML = null;
}

/*
spatial properties
If no spatial properties are available, the corresponding elements in the article_details.tpl are deleted 
and no spatial metadata are displayed. Otherwise the map is created and the spatial properties are displayed. 
*/
if (spatialPropertiesDecoded === "no data") {
    document.getElementById("item spatial").innerHTML = null;
}
else {
    var spatialProperties = JSON.parse(spatialPropertiesDecoded);
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
    L.geoJSON(spatialProperties).addTo(map); // TODO je nach Art des geoJSON Farbe ändern 


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
}

/*
temporal properties
If no temporal properties are available, the corresponding elements in the article_details.tpl are deleted 
and no temporal metadata are displayed. Otherwise the map is created and the temporal properties are displayed. 
*/
if (temporalPropertiesDecoded === "no data") {
    document.getElementById("item temporal").innerHTML = null;
}
else {
    // display temporal properties in utc
    var temporalProperties = JSON.parse(temporalPropertiesDecoded);
    var utcStart = new Date(temporalProperties[0]);
    var utcEnd = new Date(temporalProperties[1]);

    document.getElementById("start").innerHTML = utcStart;
    document.getElementById("end").innerHTML = utcEnd;
}
