var map = L.map('mapdiv').setView([51.96, 7.59], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// FeatureGroup is to store editable layers
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// edit which geometrical forms are drawable 
var drawControl = new L.Control.Draw({
    draw: {
        polygon: {
            shapeOptions: {
                color: 'green'
            },
            allowIntersection: false,
            drawError: {
                color: 'orange',
                timeout: 1000
            },
            showArea: true,
            metric: false
        },
        marker: {
            shapeOptions: {
                color: 'yellow'
            },
        },
        rectangle: {
            shapeOptions: {
                color: 'red'
            },
            showArea: true,
            metric: false
        },
        polyline: {
            shapeOptions: {
                color: 'blue'
            },
        },
        circle: false,
        circlemarker: false
    },
    edit: {
        featureGroup: drawnItems,
        poly: {
            allowIntersections: false
        }
    }
});
map.addControl(drawControl);

/**
 * function which creates a valid geoJSON
 * @param {} allLayers 
 */
function createGeojson(allLayers) {

    var geojsonFeatures = [];

    for (var i = 0; i < allLayers.length; i++) {
        // there is a if-case because for Polygons in geojson there is a fürther "[...]" needed concerning the coordinates 
        if (allLayers[i][0] === 'Polygon') {
            var geojsonFeature = {
                "type": "Feature",
                "geometry": {
                    "type": allLayers[i][0],
                    "coordinates": [allLayers[i][1]]
                },
                "properties": {
                    "name": "TODO Administrative Unit" // TODO Here the administrative name could be implemented 
                }
            }
        }
        else {
            var geojsonFeature = {
                "type": "Feature",
                "geometry": {
                    "type": allLayers[i][0],
                    "coordinates": allLayers[i][1]
                },
                "properties": {
                    "name": "TODO Administrative Unit" // TODO Here the administrative name could be implemented 
                }
            }
        }
        geojsonFeatures.push(geojsonFeature);
    }

    console.log(geojsonFeatures);
    var geojson = {
        "type": "FeatureCollection",
        "features": geojsonFeatures
    };

    return geojson;
}

/**
 * function which takes the Leaflet layers from leaflet and creates a valid geoJSON from it. 
 * @param {} drawnItems 
 */
function createGeojsonFromLeafletOutput(drawnItems) {

    var leafletLayers = drawnItems._layers;
    var pureLayers = []; //one array with all layers ["type", coordinates]
    /*
    The different Items are stored in one array. In each array there is one leaflet item. 
    key: the name of the object key
    index: the ordinal position of the key within the object
    By "instanceof" is recognized which type of layer it is and correspondingly the type is added. 
    For each layer the type and the corresponding coordinates are stored.
    There is a need to invert the coordinates, because leaflet stores them wrong way around.  
    By the function 
                        Object.keys(obj).forEach(function(key,index) {
                        key: the name of the object key
                        index: the ordinal position of the key within the object });
    you can interate over an object. 
    */
    Object.keys(leafletLayers).forEach(function (key) {

        // marker 
        if (leafletLayers[key] instanceof L.Marker) {
            pureLayers.push(['Point', [leafletLayers[key]._latlng.lng, leafletLayers[key]._latlng.lat]]);
        }

        // polygon + rectangle (rectangle is a subclass of polygon but the name is the same in geoJSON)
        if (leafletLayers[key] instanceof L.Polygon) {
            var coordinates = [];

            Object.keys(leafletLayers[key]._latlngs[0]).forEach(function (key2) {
                coordinates.push([leafletLayers[key]._latlngs[0][key2].lng, leafletLayers[key]._latlngs[0][key2].lat]);
            });

            /*
            the first and last object object coordinates in a polygon must be the same, thats why the first element
            needs to be pushed again at the end because leaflet is not creating both  
            */
            coordinates.push([leafletLayers[key]._latlngs[0][0].lng, leafletLayers[key]._latlngs[0][0].lat]);
            pureLayers.push(['Polygon', coordinates]);
        }

        // polyline (polyline is a subclass of polygon but the name is the different in geoJSON)
        if ((leafletLayers[key] instanceof L.Polyline) && !(leafletLayers[key] instanceof L.Polygon)) {
            var coordinates = [];

            Object.keys(leafletLayers[key]._latlngs).forEach(function (key3) {
                coordinates.push([leafletLayers[key]._latlngs[key3].lng, leafletLayers[key]._latlngs[key3].lat]);
            });

            pureLayers.push(['LineString', coordinates]);
        }
    });
    var geojson = createGeojson(pureLayers);

    return geojson; 
}

/**
 * function to edit the layer(s) and update the db correspondingly with the geoJSON
 */
map.on('draw:created', function (e) {
    var type = e.layerType,
        layer = e.layer;

    if (type === 'marker') {
        // something specific concerning item 
    }

    drawnItems.addLayer(layer);

    geojson = createGeojsonFromLeafletOutput(drawnItems); 

    document.getElementById("spatialProperties").value = JSON.stringify(geojson);
});

/**
 * function to edit the layer(s) and update the db correspondingly with the geoJSON
 */
map.on('draw:edited', function (e) {

    geojson = createGeojsonFromLeafletOutput(drawnItems); 
    
    document.getElementById("spatialProperties").value = JSON.stringify(geojson);
});

/**
 * function to delete the layer(s) and update the db correspondingly with the geoJSON
 */
map.on('draw:deleted', function (e) {

    geojson = createGeojsonFromLeafletOutput(drawnItems); 
    
    document.getElementById("spatialProperties").value = JSON.stringify(geojson);
});

/**
 * function to load the daterangepicker and store the date in the db 
 */
$(function () {
    $('input[name="datetimes"]').daterangepicker({
        timePicker: true,
        startDate: moment().startOf('hour'),
        endDate: moment().startOf('hour').add(32, 'hour'),
        locale: {
            format: 'YYYY-MM-DD hh:mm A'
        }
    }, function (start, end, label) {
        var start = start.format('YYYY-MM-DD hh:mm A');
        var end = end.format('YYYY-MM-DD hh:mm A');
        console.log("A new date selection was made: " + start + ' to ' + end);

    });
});

