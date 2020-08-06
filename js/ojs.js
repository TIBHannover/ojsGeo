
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
 * function to create the layer and store it in db 
 */
map.on('draw:created', function (e) {
    var type = e.layerType,
        layer = e.layer;

    if (type === 'marker') {
        // something specific concerning item 
    }

    drawnItems.addLayer(layer);

    var leafletLayers = drawnItems._layers;
    var pureLayers = [];
    /*
    The different Items are stored in one array. In each array there is one leaflet item. 
    key: the name of the object key
    index: the ordinal position of the key within the object
    By "instanceof" is recognized which type of layer it is and correspondingly the type is added.  
    */
    Object.keys(leafletLayers).forEach(function (key, index) {

        if (leafletLayers[key] instanceof L.Marker) {
            pureLayers.push(['Point', leafletLayers[key]._latlng]);
        }

        if (leafletLayers[key] instanceof L.Polygon) {
            pureLayers.push(['Polygon', leafletLayers[key]._latlngs[0]]);
        }

        if ((leafletLayers[key] instanceof L.Polyline) && !(leafletLayers[key] instanceof L.Polygon)) {
            pureLayers.push(['LineString', leafletLayers[key]._latlngs]);
        }
    });

    console.log(pureLayers);
    document.getElementById("spatialProperties").value = JSON.stringify(pureLayers);
});

/**
 * function to edit the layer and store it in db 
 */
map.on('draw:edited', function (e) {
    
    var leafletLayers = drawnItems._layers;
    var pureLayers = [];
    /*
    The different Items are stored in one array. In each array there is one leaflet item. 
    key: the name of the object key
    index: the ordinal position of the key within the object 
    By "instanceof" is recognized which type of layer it is and correspondingly the type is added. 
    */
    Object.keys(leafletLayers).forEach(function (key, index) {

        if (leafletLayers[key] instanceof L.Marker) {
            pureLayers.push(['Point', leafletLayers[key]._latlng]);
        }

        if (leafletLayers[key] instanceof L.Polygon) {
            pureLayers.push(['Polygon', leafletLayers[key]._latlngs[0]]);
        }

        if ((leafletLayers[key] instanceof L.Polyline) && !(leafletLayers[key] instanceof L.Polygon)) {
            pureLayers.push(['LineString', leafletLayers[key]._latlngs]);
        }
    });

    console.log(pureLayers);
    document.getElementById("spatialProperties").value = JSON.stringify(pureLayers);
});

/**
 * function to delete a layer and update the db correspondingly 
 */
map.on('draw:deleted', function (e) {
    
    var leafletLayers = drawnItems._layers;
    var pureLayers = [];
    /*
    The different Items are stored in one array. In each array there is one leaflet item. 
    key: the name of the object key
    index: the ordinal position of the key within the object 
    By "instanceof" is recognized which type of layer it is and correspondingly the type is added. 
    */
    Object.keys(leafletLayers).forEach(function (key, index) {

        if (leafletLayers[key] instanceof L.Marker) {
            pureLayers.push(['Point', leafletLayers[key]._latlng]);
        }

        if (leafletLayers[key] instanceof L.Polygon) {
            pureLayers.push(['Polygon', leafletLayers[key]._latlngs[0]]);
        }

        if ((leafletLayers[key] instanceof L.Polyline) && !(leafletLayers[key] instanceof L.Polygon)) {
            pureLayers.push(['LineString', leafletLayers[key]._latlngs]);
        }
    });

    console.log(pureLayers);
    document.getElementById("spatialProperties").value = JSON.stringify(pureLayers);
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

