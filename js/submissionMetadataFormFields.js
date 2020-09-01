//load temporal properties which got already stored in database from submissionMetadataFormFields.tpl 
var temporalPropertiesFromDbDecoded = document.getElementById("temporalPropertiesFromDb").value;

//load spatial properties which got already stored in database from submissionMetadataFormFields.tpl 
var spatialPropertiesFromDbDecoded = document.getElementById("spatialPropertiesFromDb").value;

//load administrative Unit which got already stored in database from submissionMetadataFormFields.tpl 
var administrativeUnitFromDbDecoded = document.getElementById("administrativeUnitFromDb").value;

/**
 * function to proof if a taken string is valid JSON
 * @param {} string
 */
function IsGivenStringJson(string) {
    try {
        JSON.parse(string);
    } catch (e) {
        return false;
    }
    return true;
}

/*
In case the user repeats the step "3. Enter Metadata" in the process "Submit to article" and comes back to this step to make changes again, 
the already entered data is read from the database, added to the template and loaded here from the template and gets displayed accordingly. 
 */
if (administrativeUnitFromDbDecoded !== 'no data') {
    if (IsGivenStringJson(administrativeUnitFromDbDecoded) === true) {
        var administrativeUnitFromDb = JSON.parse(administrativeUnitFromDbDecoded);

        document.getElementById("administrativeUnitInput").value = administrativeUnitFromDb.asciiName;

        // The form for saving in the database is updated accordingly 
        changedAdministrativeUnitByAuthor();
    }
    else {
        document.getElementById("administrativeUnitInput").value = administrativeUnitFromDbDecoded;

        // The form for saving in the database is updated accordingly 
        changedAdministrativeUnitByAuthor();
    }
}

var map = L.map('mapdiv').setView([51.96, 7.59], 13);

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

// FeatureGroup is to store editable layers
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

/*
In case the user repeats the step "3. Enter Metadata" in the process "Submit to article" and comes back to this step to make changes again, 
the already entered data is read from the database, added to the template and loaded here from the template and gets displayed accordingly. 
 */
if (spatialPropertiesFromDbDecoded !== 'no data') {
    var spatialPropertiesFromDb = JSON.parse(spatialPropertiesFromDbDecoded);

    var geojsonLayer = L.geoJson(spatialPropertiesFromDb);
    geojsonLayer.eachLayer(
        function (l) {
            drawnItems.addLayer(l);
        });
    storeCreatedGeoJSONAndAdministrativeUnitInHiddenForms(drawnItems);
    map.fitBounds(drawnItems.getBounds());
}

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
        // there is a if-case because for Polygons in geojson there is a further "[...]" needed concerning the coordinates 
        if (allLayers[i][0] === 'Polygon') {
            var geojsonFeature = {
                "type": "Feature",
                "geometry": {
                    "type": allLayers[i][0],
                    "coordinates": [allLayers[i][1]]
                }
            }
        }
        else {
            var geojsonFeature = {
                "type": "Feature",
                "geometry": {
                    "type": allLayers[i][0],
                    "coordinates": allLayers[i][1]
                }
            }
        }
        geojsonFeatures.push(geojsonFeature);
    }

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
 * function that performs the Ajax request to the API Geonames for any placeName. 
 * https://www.geonames.org/ 
 * @param {*} placeName 
 */
function ajaxRequestGeonamesPlaceName(placeName) {

    var resultGeonames;
    var urlGeonames = 'http://api.geonames.org/searchJSON?name_equals=' + placeName + '&maxRows=10&username=tnier01';
    $.ajax({
        url: urlGeonames,
        async: false,
        success: function (result) {
            resultGeonames = result;
        }
    });
    return resultGeonames;
}

/**
 * function that performs the Ajax request to the API Geonames for any latitude and longitude. 
 * https://www.geonames.org/ 
 * @param {*} lng 
 * @param {*} lat 
 */
function ajaxRequestGeonamesCoordinates(lng, lat) {
    /*
    https://www.geonames.org/export/ws-overview.html

    http://api.geonames.org/extendedFindNearby?lat=51.953152612307456&lng=7.614898681640625&username=tnier01
    http://api.geonames.org/countrySubdivisionJSON?lat=51.953152612307456&lng=7.614898681640625&username=tnier01
    http://api.geonames.org/searchJSON?lat=51.953152612307456&lng=7.614898681640625&maxRows=10&username=tnier01
    http://api.geonames.org/hierarchyJSON?formatted=true&lat=51.953152612307456&lng=7.614898681640625&username=tnier01&style=full 
     */

    var resultGeonames;
    var urlGeonames = 'http://api.geonames.org/hierarchyJSON?formatted=true&lat=' + lat + '&lng=' + lng + '&username=tnier01&style=full';
    $.ajax({
        url: urlGeonames,
        async: false,
        success: function (result) {
            resultGeonames = result;
        }
    });
    return resultGeonames;
}

/**
 * function to proof if all positions in an array are the same 
 * @param {*} el 
 * @param {*} index 
 * @param {*} arr 
 */
function isSameAnswer(el, index, arr) {
    // Do not test the first array element, as you have nothing to compare to
    if (index === 0) {
        return true;
    }
    else {
        //do each array element value match the value of the previous array element
        return (el.geonameId === arr[index - 1].geonameId);
    }
}

/**
 * function takes a two dimensional array. 
 * In this array are the hierarchical orders of administrative units respectively for a point or feature. 
 * The hierarchies of the points/ features are compared and the lowest match for all points/ features is returned.
 * @param {} features 
 */
function calculateDeepestHierarchicalCompliance(features) {
    // The number of hierarchy levels for the point/ feature with the fewest hierarchy levels is calculated  
    var numberOfAdministrativeUnits = 100;
    for (var l = 0; l < features.length; l++) {

        if (numberOfAdministrativeUnits > features[l].length) {
            numberOfAdministrativeUnits = features[l].length;
        }
    }

    /*
   It is checked which lowest level in the administrative hierarchy system is the same for all points/ features. 
   For this purpose, the hierarchical levels of the different points/ features are stored in an array and checked for equality (by the helpfunction isSameAnswer). 
   The lowest level at which there is a match is stored as the administrative unit. 
   */
    var administrativeUnit = [];
    for (var m = 0; m < numberOfAdministrativeUnits; m++) {
        var comparingUnits = [];

        for (var n = 0; n < features.length; n++) {
            comparingUnits.push(features[n][m]);
        }

        if (comparingUnits.every(isSameAnswer) === true) {

            administrativeUnit.push(comparingUnits[0]);
        }
    }
    return administrativeUnit;
}

/**
 * function which returns for each feature an array with the administrative units that match at all points of the feature. 
 * The administrative units are queried via the API geonames. 
 * @param {*} geojsonFeature 
 */
function getAdministrativeUnitFromGeonames(geojsonFeature) {

    var administrativeUnitsPerFeatureRaw = [];
    /*
    For each point of the GeoJSON feature the API Geonames is requested,
    to get the hierarchy of administrative units for each point. 
    The result is stored as array by the the variable administrativeUnitsPerFeatureRaw.
    For each hierarchy level the asciiName and the geonameId is stored. 
    A distinction is made between Point, LineString and Polygon, 
    because the coordinates are stored differently in the GeoJSON.  
    For the point can be saved directly, no comparison between different points of the feature is necessary, 
    because there is only one point. 
    */
    var geojsonFeatureCoordinates;
    if (geojsonFeature.geometry.type === 'Point') {
        var lng = geojsonFeature.geometry.coordinates[0];
        var lat = geojsonFeature.geometry.coordinates[1];

        var administrativeUnitRaw = ajaxRequestGeonamesCoordinates(lng, lat);

        var administrativeUnitsPerPoint = [];
        for (var k = 0; k < administrativeUnitRaw.geonames.length; k++) {
            var administrativeUnit = {
                'asciiName': administrativeUnitRaw.geonames[k].asciiName,
                'geonameId': administrativeUnitRaw.geonames[k].geonameId
            }
            administrativeUnitsPerPoint.push(administrativeUnit);
        }
        return administrativeUnitsPerPoint;
    }
    else if (geojsonFeature.geometry.type === 'LineString') {
        geojsonFeatureCoordinates = geojsonFeature.geometry.coordinates;
    }
    else if (geojsonFeature.geometry.type === 'Polygon') {
        geojsonFeatureCoordinates = geojsonFeature.geometry.coordinates[0];
    }

    for (var j = 0; j < geojsonFeatureCoordinates.length; j++) {

        var lng = geojsonFeatureCoordinates[j][0];
        var lat = geojsonFeatureCoordinates[j][1];

        var administrativeUnitRaw = ajaxRequestGeonamesCoordinates(lng, lat);
        var administrativeUnitsPerPoint = [];
        for (var k = 0; k < administrativeUnitRaw.geonames.length; k++) {
            var administrativeUnit = {
                'asciiName': administrativeUnitRaw.geonames[k].asciiName,
                'geonameId': administrativeUnitRaw.geonames[k].geonameId
            }
            administrativeUnitsPerPoint.push(administrativeUnit);
        }
        administrativeUnitsPerFeatureRaw.push(administrativeUnitsPerPoint);
    }

    // calculate the lowest hierarchical compliance for all points in the feature 
    var administrativeUnitPerFeature = calculateDeepestHierarchicalCompliance(administrativeUnitsPerFeatureRaw);

    return administrativeUnitPerFeature;
}

/**
 * function that first creates a geoJSON feature for all inputs on the map and a FeatureCollection in total. 
 * In addition, the lowest administrative unit that is valid for all features is calculated for the entire FeatureCollection. 
 * These two results are stored in hidden forms so that they can be queried in geoOJSPlugin.inc.php.  
 * @param {*} drawnItems 
 */
function storeCreatedGeoJSONAndAdministrativeUnitInHiddenForms(drawnItems) {

    geojson = createGeojsonFromLeafletOutput(drawnItems);

    var administrativeUnitsForAllFeatures = [];
    // For each geoJSON feature the administrative unit that matches is stored. 
    for (var i = 0; i < geojson.features.length; i++) {
        administrativeUnitsForAllFeatures.push(getAdministrativeUnitFromGeonames(geojson.features[i]));
    }

    var administrativeUnitForAllFeatures = calculateDeepestHierarchicalCompliance(administrativeUnitsForAllFeatures);
    // if an administrative unit exists, the lowest matching hierarchical level is proposed to the author in the div element 
    if (administrativeUnitForAllFeatures[administrativeUnitForAllFeatures.length - 1] !== undefined) {
        var lowestadministrativeUnitForAllFeatures = administrativeUnitForAllFeatures[administrativeUnitForAllFeatures.length - 1];
        document.getElementById("administrativeUnitInput").value = lowestadministrativeUnitForAllFeatures.asciiName;
        document.getElementById("administrativeUnit").value = JSON.stringify(lowestadministrativeUnitForAllFeatures);
    }
    else {
        document.getElementById("administrativeUnitInput").value = '';
        document.getElementById("administrativeUnit").value = '';
    }

    // if there are no geoJSON Features/ no spatial data available, there is '' stored in database, otherwise the stringified geoJSON 
    if (JSON.stringify(geojson) === '{"type":"FeatureCollection","features":[]}') {
        document.getElementById("spatialProperties").value = '';
    }
    else {
        document.getElementById("spatialProperties").value = JSON.stringify(geojson);
    }

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

    storeCreatedGeoJSONAndAdministrativeUnitInHiddenForms(drawnItems);
});

/**
 * function to edit the layer(s) and update the db correspondingly with the geoJSON
 */
map.on('draw:edited', function (e) {

    storeCreatedGeoJSONAndAdministrativeUnitInHiddenForms(drawnItems);
});

/**
 * function to delete the layer(s) and update the db correspondingly with the geoJSON
 */
map.on('draw:deleted', function (e) {

    storeCreatedGeoJSONAndAdministrativeUnitInHiddenForms(drawnItems);
});

/**
 * function which gets called if the author changes the coverage element himself. 
 * If the author changes the element, 
 * the input by the author is proofed by a further API request if there are corresponding entries in the APIs database, 
 * the first found is stored with name and geonameId in the database. 
 * Otherwise if there is no found by the API, the authorInput is used.
 */
function changedAdministrativeUnitByAuthor() {

    document.getElementById("administrativeUnit").value = '';

    var authorInput = document.getElementById("administrativeUnitInput").value;

    var administrativeUnitRaw = ajaxRequestGeonamesPlaceName(authorInput);

    if (administrativeUnitRaw.totalResultsCount !== 0 && (administrativeUnitRaw.geonames[0].toponymName === authorInput || administrativeUnitRaw.geonames[0].name === authorInput)) {

        var administrativeUnit = {
            'asciiName': administrativeUnitRaw.geonames[0].name,
            'geonameId': administrativeUnitRaw.geonames[0].geonameId
        }

        document.getElementById("administrativeUnit").value = JSON.stringify(administrativeUnit);
    }
    else {
        document.getElementById("administrativeUnit").value = authorInput;
    }
}

/**
 * add a search to the map 
 * When the user searches for a location, a bounding box with the corresponding administrative unit is automatically suggested. 
 * This can be edited or deleted and further elements can be added. 
 */
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
        ]);

        drawnItems.addLayer(poly);
        map.fitBounds(poly.getBounds());

        storeCreatedGeoJSONAndAdministrativeUnitInHiddenForms(drawnItems);
    })
    .addTo(map);

/**
 * function which changes hour system from 24 hours to 12 hours
 * @param {*} hour 
 */
function changeHourSystemFrom24To12(hour) {
    if (hour >= 12) {
        hour = hour - 12;
    }
    return hour;
}

/**
 * function which records am and pm for the corresponding times 
 * @param {*} amPm 
 */
function calculateAmPmFor24Time(amPm) {
    if (1 <= amPm && amPm <= 12) {
        amPm = 'AM';
    }
    else {
        amPm = 'PM';
    }
    return amPm;
}

/**
 * function to convert a UTC timestamp with AM/ PM to a Unix timestamp in milliseconds 
 * @param {*} UTCInAMPM 
 */
function UTCInAMPMToUnixTimestampMillisecond(UTCInAMPM) {

    var year = UTCInAMPM.substring(0, 4);
    var month = UTCInAMPM.substring(5, 7) - 1; // -1 because Date.UTC() starts with zero, localeTimeInAMPM not 
    var day = UTCInAMPM.substring(8, 10);
    var hour = parseInt(UTCInAMPM.substring(11, 13));
    var minute = UTCInAMPM.substring(14, 16);
    var second = UTCInAMPM.substring(17, 19);
    var amPm = UTCInAMPM.substring(20, 22);

    // add 12 if time is pm 
    if (amPm === 'PM') {
        hour = hour + 12;
    }

    return Date.UTC(year, month, day, hour, minute, second);
}

/**
 * function to load the daterangepicker and store the date in the db.
 * Furthermore data from db is loaded and displayed if available. 
 */
$(function () {

    /*
    In case the user repeats the step "3. Enter Metadata" in the process "Submit to article" and comes back to this step to make changes again, 
    the already entered data is read from the database, added to the template and loaded here from the template and gets displayed accordingly. 
    Otherwise, a current period is displayed initially as an example.
    */
    if (temporalPropertiesFromDbDecoded !== 'no data') {
        var temporalPropertiesFromDb = JSON.parse(temporalPropertiesFromDbDecoded);

        var utcStart = new Date(temporalPropertiesFromDb[0]);
        var utcStartStringified = JSON.stringify(utcStart);
        var utcEnd = new Date(temporalPropertiesFromDb[1]);
        var utcEndStringified = JSON.stringify(utcEnd);

        var yearStart = utcStartStringified.substring(1, 5);
        var monthStart = utcStartStringified.substring(6, 8);
        var dayStart = utcStartStringified.substring(9, 11);
        var hourStart = utcStartStringified.substring(12, 14);
        var minutesStart = utcStartStringified.substring(15, 17);
        var secondsStart = utcStartStringified.substring(18, 20);
        var amPmStart = utcStartStringified.substring(12, 14);

        var yearEnd = utcEndStringified.substring(1, 5);
        var monthEnd = utcEndStringified.substring(6, 8);
        var dayEnd = utcEndStringified.substring(9, 11);
        var hourEnd = utcEndStringified.substring(12, 14);
        var minutesEnd = utcEndStringified.substring(15, 17);
        var secondsEnd = utcEndStringified.substring(18, 20);
        var amPmEnd = utcEndStringified.substring(12, 14);

        hourStart = changeHourSystemFrom24To12(hourStart);
        hourEnd = changeHourSystemFrom24To12(hourEnd);

        amPmStart = calculateAmPmFor24Time(amPmStart);
        amPmEnd = calculateAmPmFor24Time(amPmEnd);

        $('input[name="datetimes"]').daterangepicker({
            timePicker: true,
            startDate: yearStart + '-' + monthStart + '-' + dayStart + ' ' + hourStart + ':' + minutesStart + ':' + secondsStart + ' ' + amPmStart,
            endDate: yearEnd + '-' + monthEnd + '-' + dayEnd + ' ' + hourEnd + ':' + minutesEnd + ':' + secondsEnd + ' ' + amPmEnd,
            locale: {
                format: 'YYYY-MM-DD hh:mm:ss A'
            }
        }, function (start, end, label) {
            var start = start.format('YYYY-MM-DD hh:mm:ss A');
            var end = end.format('YYYY-MM-DD hh:mm:ss A');

            var unixTimestampMillisecondStart = UTCInAMPMToUnixTimestampMillisecond(start);
            var unixTimestampMillisecondEnd = UTCInAMPMToUnixTimestampMillisecond(end);

            var unixDaterange = [unixTimestampMillisecondStart, unixTimestampMillisecondEnd];

            document.getElementById("temporalProperties").value = JSON.stringify(unixDaterange);
        });
    }
    else {
        $('input[name="datetimes"]').daterangepicker({
            timePicker: true,
            startDate: moment().startOf('hour'),
            endDate: moment().startOf('hour').add(32, 'hour'),
            locale: {
                format: 'YYYY-MM-DD hh:mm:ss A'
            }
        }, function (start, end, label) {
            var start = start.format('YYYY-MM-DD hh:mm:ss A');
            var end = end.format('YYYY-MM-DD hh:mm:ss A');

            var unixTimestampMillisecondStart = UTCInAMPMToUnixTimestampMillisecond(start);
            var unixTimestampMillisecondEnd = UTCInAMPMToUnixTimestampMillisecond(end);

            var unixDaterange = [unixTimestampMillisecondStart, unixTimestampMillisecondEnd];

            document.getElementById("temporalProperties").value = JSON.stringify(unixDaterange);
        });
    }
});


