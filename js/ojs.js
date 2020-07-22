const lat = 51.96;
const lon = 7.59;
const start_latlng = [lat, lon];

var map = L.map("mapdiv", { drawControl: false }).setView(start_latlng, 13);

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

    console.log(layer._latlngs); // coordinates of the layer 
    console.log(layer._leaflet_id); // id of layer 
    drawnItems.addLayer(layer);
    console.log(drawnItems); // TODO store FeatureClass with all layers in DB 
});

/**
 * function to edit the layer and store it in db 
 */
map.on('draw:edited', function (e) {
    var layers = e.layers;
    var countOfEditedLayers = 0;
    layers.eachLayer(function (layer) {
        countOfEditedLayers++;
    });

    console.log(drawnItems); // TODO store FeatureClaas with all layers and overrite old storage in DB 
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
        console.log("A new date selection was made: " + start + ' to ' + end); // TODO store Date in DB and overrite old storage in DB 
    });
});

