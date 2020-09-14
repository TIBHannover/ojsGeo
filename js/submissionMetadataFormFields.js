//load temporal properties which got already stored in database from submissionMetadataFormFields.tpl 
var temporalPropertiesFromDbDecoded = document.getElementById("temporalPropertiesFromDb").value;

//load spatial properties which got already stored in database from submissionMetadataFormFields.tpl 
var spatialPropertiesFromDbDecoded = document.getElementById("spatialPropertiesFromDb").value;

//load administrative Unit which got already stored in database from submissionMetadataFormFields.tpl 
var administrativeUnitFromDbDecoded = document.getElementById("administrativeUnitFromDb").value;

/**
 * Function enables tags for the administrative units. 
 */
$(document).ready(function () {
    $("#administrativeUnitInput").tagit({
        allowSpaces: true,
        readOnly: false

    });
});

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

/**
 * Function that makes suggestions for the administrative units when the user enters the administrative unit himself.  
 */
$("#administrativeUnitInput").tagit({
    autocomplete: {
        source: function (request, response) {

            $.ajax({
                url: "http://api.geonames.org/searchJSON",
                data: {
                    name_startsWith: request.term,
                    username: 'tnier01',
                    featureClass: "A",
                    style: "full",
                    maxRows: 12,
                },
                success: function (data) {
                    response($.map(data.geonames, function (item) {
                        return {
                            label: item.asciiName + (item.adminName1 ? ", " + item.adminName1 : "") + ", " + item.countryName,
                            value: item.asciiName
                        }
                    }));
                }
            })
        },
        minLength: 2
    }
});

$("#administrativeUnitInput").tagit({
    beforeTagAdded: function (event, ui) {
        // do something special
        // console.log(ui.tag);
        // console.log(event);
        // console.log(ui);
        // ui.tag[0].title = "Hello";
    }
});

/**
 * If the new tag is created by the geonames API after the creation of a geometric shape on the map, only the tag is created. 
 * Otherwise, if the tag is created by the user, it will be checked with the geonames API. 
 * If there is an entry, it will be suggested to the user. Otherwise, the user's input is displayed directly. 
 */
$("#administrativeUnitInput").tagit({
    // preprocessTag is triggered before each creation of a tag  
    preprocessTag: function (input) {

        var administrativeUnitRaw = document.getElementById("administrativeUnit").value;

        var isThereAuthorInput = true;

        if (input === '') {
            isThereAuthorInput = false; 
        }

        // If there is no input through the API, the input is in any case from the user 
        if (administrativeUnitRaw === 'no data' && input !== '') {
            isThereAuthorInput = true;
            var administrativeUnit = [];
        }
        // It is checked if the input is done by the user or through the API. If it is done through the API, it must already be stored in the array administrativeUnit 
        else if (administrativeUnitRaw !== '' && administrativeUnitRaw !== null && administrativeUnitRaw !== undefined && input !== '') {
            var administrativeUnit = JSON.parse(administrativeUnitRaw);

            for (var i = 0; i < administrativeUnit.length; i++) {
                if (input === administrativeUnit[i].name) {
                    isThereAuthorInput = false;
                }
            }
        }

        // If the input comes from the user it is stored, either as an administrative unit if a entry in the geoname API exists and if not directly 
        if (isThereAuthorInput === true) {
            var administrativeUnitRawAuthorInput = ajaxRequestGeonamesPlaceName(input);
            var geojsonRaw = document.getElementById("spatialProperties").value;

            if ((administrativeUnitRawAuthorInput.totalResultsCount !== 0) && (administrativeUnitRawAuthorInput.geonames[0].asciiName === input)) {
                var administrativeUnitAuthorInput = {
                    'name': administrativeUnitRawAuthorInput.geonames[0].asciiName,
                    'geonameId': administrativeUnitRawAuthorInput.geonames[0].geonameId,
                    'provenance': 'administrative unit created by user (acceppting the suggestion of the geonames API, which was created on basis of a textual input)'
                }

                administrativeUnit.push(administrativeUnitAuthorInput);

                document.getElementById("administrativeUnit").value = JSON.stringify(administrativeUnit);

                input = administrativeUnitAuthorInput.name;

                /*
                If there is a bounding box for the found administrative unit in the API entry, 
                it will be displayed on the map. For this purpose the geoJSON is updated with respect to the geometry
                */
                if (administrativeUnitRawAuthorInput.geonames[0].bbox !== undefined) {

                    var layer = L.polygon([
                        [administrativeUnitRawAuthorInput.geonames[0].bbox.north, administrativeUnitRawAuthorInput.geonames[0].bbox.west],
                        [administrativeUnitRawAuthorInput.geonames[0].bbox.south, administrativeUnitRawAuthorInput.geonames[0].bbox.west],
                        [administrativeUnitRawAuthorInput.geonames[0].bbox.south, administrativeUnitRawAuthorInput.geonames[0].bbox.east],
                        [administrativeUnitRawAuthorInput.geonames[0].bbox.north, administrativeUnitRawAuthorInput.geonames[0].bbox.east],
                    ]);

                    // this way information about the origin of the geometric shape is stored 
                    layer.provenance = "geometric shape created by user (acceppting the suggestion of the tag)";

                    drawnItems.addLayer(layer);
                    map.fitBounds(drawnItems.getBounds());

                    var geojson = createGeojsonFromLeafletOutput(drawnItems);
                    document.getElementById("spatialProperties").value = JSON.stringify(geojson);

                    highlightHTMLElement("mapdiv");
                }
            }
            else {
                var administrativeUnitAuthorInput = {
                    'name': input,
                    'geonameId': 'not available',
                    'provenance': 'administrative unit created by user (textual input, without suggestion of the geonames API)'
                }
                administrativeUnit.push(administrativeUnitAuthorInput);
                document.getElementById("administrativeUnit").value = JSON.stringify(administrativeUnit);
            }

            // if the geojson exists, it is updated accordingly
            if (geojsonRaw !== '' && geojsonRaw !== 'no data') {
                var geojson = JSON.parse(geojsonRaw);
                geojson.administrativeUnits = administrativeUnit;
                document.getElementById("spatialProperties").value = JSON.stringify(geojson);
            }
        }
        return input;
    }
});

/**
 * Before a tag is deleted, the corresponding form in which the administrative units are stored is also updated for later storage in the database. 
 * The tag will be deleted in the form and later on in the database. 
 * The geoJSON will also be updated accordingly, if available. 
 */
$("#administrativeUnitInput").tagit({
    // beforeTagRemoved is always triggered before a tag is deleted 
    beforeTagRemoved: function (event, ui) {
        var currentTag = ui.tagLabel;
        var administrativeUnitRaw = document.getElementById("administrativeUnit").value;
        var administrativeUnitGeoJSON;

        if (administrativeUnitRaw === 'no data') {
            administrativeUnitGeoJSON = {
                'name': 'not available',
                'geonameId': 'not available',
                'provenance': 'not available'
            }
        }
        else {

            var administrativeUnit = JSON.parse(administrativeUnitRaw);
            var geojsonRaw = document.getElementById("spatialProperties").value;

            // the corresponding element is removed 
            for (var i = 0; i < administrativeUnit.length; i++) {
                if (currentTag === administrativeUnit[i].name) {
                    administrativeUnit.splice(i, 1);
                }
            }

            administrativeUnitGeoJSON = administrativeUnit;

            // If there is no more element this is indicated by 'no data', otherwise the geoJSON gets updated, if available 
            if (administrativeUnit.length === 0) {
                administrativeUnit = 'no data';
                document.getElementById("administrativeUnit").value = administrativeUnit;

                administrativeUnitGeoJSON = {
                    'name': 'not available',
                    'geonameId': 'not available',
                    'provenance': 'not available'
                }
            }
            else {
                document.getElementById("administrativeUnit").value = JSON.stringify(administrativeUnit);
            }
        }

        // if the geojson exists, it is updated accordingly
        if (geojsonRaw !== '' && geojsonRaw !== 'no data') {
            var geojson = JSON.parse(geojsonRaw);
            geojson.administrativeUnits = administrativeUnit;
            document.getElementById("spatialProperties").value = JSON.stringify(geojson);
        }
    }
});

/*
In case the user repeats the step "3. Enter Metadata" in the process "Submit to article" and comes back to this step to make changes again, 
the already entered data is read from the database, added to the template and loaded here from the template and gets displayed accordingly. 
 */
if (administrativeUnitFromDbDecoded !== 'no data') {
    var administrativeUnitFromDb = JSON.parse(administrativeUnitFromDbDecoded);

    // The form for saving in the database is updated accordingly 
    document.getElementById("administrativeUnit").value = JSON.stringify(administrativeUnitFromDb);

    // A corresponding tag is created for each entry in the database. 
    for (var i = 0; i < administrativeUnitFromDb.length; i++) {

        $("#administrativeUnitInput").tagit("createTag", administrativeUnitFromDb[i].name);
    }
}
else {
    document.getElementById("administrativeUnit").value = 'no data';

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

// add scale to the map 
L.control.scale().addTo(map);

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

    // the spatial properties are stored in the HTML element again 
    document.getElementById("spatialProperties").value = spatialPropertiesFromDbDecoded;

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
                "properties": {
                    "provenance": allLayers[i][2]
                },
                "geometry": {
                    "type": allLayers[i][0],
                    "coordinates": [allLayers[i][1]]
                }
            }
        }
        else {
            var geojsonFeature = {
                "type": "Feature",
                "properties": {
                    "provenance": allLayers[i][2]
                },
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
        "features": geojsonFeatures,
        "administrativeUnits": {
            /*"name": "not available",
            "provenance": "not available",
            "geonameId": "not available"*/
        },
        "temporalProperties": {
            "unixDateRange": "not available",
            "provenance": "not available"
        }
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

        var provenance = leafletLayers[key].provenance;

        // marker 
        if (leafletLayers[key] instanceof L.Marker) {
            pureLayers.push(['Point', [leafletLayers[key]._latlng.lng, leafletLayers[key]._latlng.lat], provenance]);
        }

        // polygon + rectangle (rectangle is a subclass of polygon but the name is the same in geoJSON)
        if (leafletLayers[key] instanceof L.Polygon) {
            var coordinates = [];

            Object.keys(leafletLayers[key]._latlngs[0]).forEach(function (key2) {
                coordinates.push([leafletLayers[key]._latlngs[0][key2].lng, leafletLayers[key]._latlngs[0][key2].lat]);
            });

            /*
            the first and last object coordinates in a polygon must be the same, thats why the first element
            needs to be pushed again at the end because leaflet is not creating both  
            */
            coordinates.push([leafletLayers[key]._latlngs[0][0].lng, leafletLayers[key]._latlngs[0][0].lat]);
            pureLayers.push(['Polygon', coordinates, provenance]);
        }

        // polyline (polyline is a subclass of polygon but the name is the different in geoJSON)
        if ((leafletLayers[key] instanceof L.Polyline) && !(leafletLayers[key] instanceof L.Polygon)) {
            var coordinates = [];

            Object.keys(leafletLayers[key]._latlngs).forEach(function (key3) {
                coordinates.push([leafletLayers[key]._latlngs[key3].lng, leafletLayers[key]._latlngs[key3].lat]);
            });

            pureLayers.push(['LineString', coordinates, provenance]);
        }
    });
    var geojson = createGeojson(pureLayers);

    // if there are no geoJSON Features/ no spatial data available, there is 'no data' stored in database, otherwise the stringified geoJSON 
    if (geojson.features.length === 0) {
        geojson = 'no data';
    }

    /*
    If there is a geojson object with features, the unix date range is stored in the geojson, 
    if it is available either from the current edit or from the database.
    */
    var temporalProperties = document.getElementById("temporalProperties").value;

    if (geojson !== 'no data') {
        if (temporalProperties === 'no data') {
            geojson.temporalProperties.unixDateRange = 'not available';
            geojson.temporalProperties.provenance = 'not available';
        }
        else if (temporalProperties !== '') {
            geojson.temporalProperties.unixDateRange = temporalProperties;
            geojson.temporalProperties.provenance = "temporal properties created by user";
        }
    }
    return geojson;
}

/**
 * function that performs the Ajax request to the API Geonames for any placeName. 
 * https://www.geonames.org/ 
 * @param {*} placeName 
 */
function ajaxRequestGeonamesPlaceName(placeName) {

    var resultGeonames;
    $.ajax({
        url: "http://api.geonames.org/searchJSON",
        async: false,
        data: {
            name_equals: placeName,
            username: 'tnier01',
            style: "full",
            maxRows: 12,
        },
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
                'name': administrativeUnitRaw.geonames[k].asciiName,
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
                'name': administrativeUnitRaw.geonames[k].asciiName,
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
 * function to highlight an html Element. Designed to alert users that something has changed in html element. 
 * @param {*} htmlElement the affected html element 
 */
function highlightHTMLElement(htmlElement) {
    document.getElementById(htmlElement).style.boxShadow = "0 0 5px rgba(81, 203, 238, 1)";
    document.getElementById(htmlElement).style.padding = "3px 0px 3px 3px";
    document.getElementById(htmlElement).style.margin = "5px 1px 3px 0px";
    document.getElementById(htmlElement).style.border = "1px solid rgba(81, 203, 238, 1)";

    setTimeout(() => {
        document.getElementById(htmlElement).style.boxShadow = "";
        document.getElementById(htmlElement).style.padding = "";
        document.getElementById(htmlElement).style.margin = "";
        document.getElementById(htmlElement).style.border = "";
    }, 3000);
}

/**
 * function that first creates a geoJSON feature for all inputs on the map and a FeatureCollection in total. 
 * In addition, the lowest administrative unit that is valid for all features is calculated for the entire FeatureCollection. 
 * These two results are stored in hidden forms so that they can be queried in geoOJSPlugin.inc.php.  
 * @param {*} drawnItems 
 */
function storeCreatedGeoJSONAndAdministrativeUnitInHiddenForms(drawnItems) {

    geojson = createGeojsonFromLeafletOutput(drawnItems);

    $("#administrativeUnitInput").tagit("removeAll");
    document.getElementById("administrativeUnit").value = 'no data';

    if (geojson !== 'no data') {
        var administrativeUnitsForAllFeatures = [];
        // For each geoJSON feature the administrative unit that matches is stored. 
        for (var i = 0; i < geojson.features.length; i++) {
            administrativeUnitsForAllFeatures.push(getAdministrativeUnitFromGeonames(geojson.features[i]));
        }

        var administrativeUnitForAllFeatures = calculateDeepestHierarchicalCompliance(administrativeUnitsForAllFeatures);


        // if an administrative unit exists, the lowest matching hierarchical level is proposed to the author in the div element 
        if (administrativeUnitForAllFeatures[administrativeUnitForAllFeatures.length - 1] !== undefined) {

            /*
            The array with the administrative units added via the API geonames must be available before the tags are created,
            so that the preprocessTag function can find out whether the tag is created by a direct geonames query based on the input of a geometric shape,
            or by the direct textual input of a user. 
            */
            for (var i = 0; i < administrativeUnitForAllFeatures.length; i++) {
                // store for each administrativeUnit the provenance 
                administrativeUnitForAllFeatures[i].provenance = "administrative unit created by user (acceppting the suggestion of the geonames API , which was created on basis of a geometric shape input)";
            }
            document.getElementById("administrativeUnit").value = JSON.stringify(administrativeUnitForAllFeatures);

            for (var i = 0; i < administrativeUnitForAllFeatures.length; i++) {
                // create for each administrativeUnit a tag 
                $("#administrativeUnitInput").tagit("createTag", administrativeUnitForAllFeatures[i].name);
            }




            highlightHTMLElement("administrativeUnitInput");

            // information concerning administrativeUnit in the geojson 
            geojson.administrativeUnits = administrativeUnitForAllFeatures;



















            /*;
            var administrativeUnitInfo = document.createElement('P');
            administrativeUnitInfo.innerHTML = "This is a paragraph.";
            document.getElementById("myDIV").appendChild(administrativeUnitInfo);     // Append <p> to <div> with id="myDIV" 
*/

        }
        else {
            document.getElementById("administrativeUnitInput").value = '';
            document.getElementById("administrativeUnit").value = '';
            geojson.administrativeUnit.provenance = 'not available';
            geojson.administrativeUnit.name = 'not available';
            geojson.administrativeUnit.geonameId = 'not available';

            highlightHTMLElement("administrativeUnitInput");
        }
        document.getElementById("spatialProperties").value = JSON.stringify(geojson);
    }
    else {
        // if there are no geoJSON Features/ no spatial data available, there is 'no data' stored in database, otherwise the stringified geoJSON is stored 
        document.getElementById("spatialProperties").value = geojson;
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

    // this way information about the origin of the geometric shape is stored 
    layer.provenance = "geometric shape created by user (drawing)";

    drawnItems.addLayer(layer);

    storeCreatedGeoJSONAndAdministrativeUnitInHiddenForms(drawnItems);
});

/**
 * function to edit the layer(s) and update the db correspondingly with the geoJSON
 */
map.on('draw:edited', function (e) {

    var changedLayer = e.layers._layers;
    // this way information about the origin of the geometric shape is stored 
    Object.keys(changedLayer).forEach(function (key) {

        if (changedLayer[key].provenance === "geometric shape created by user (acceppting the suggestion of the leaflet-control-geocoder)") {
            drawnItems._layers[key].provenance = "geometric shape created by user (edited the suggestion of the leaflet-control-geocoder by drawing)";
        }
    });

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
 * The geoJSON is adjusted accordingly. 
 */
function changedAdministrativeUnitByAuthor() {

    document.getElementById("administrativeUnit").value = '';

    var authorInput = document.getElementById("administrativeUnitInput").value;

    if (authorInput === '') {
        authorInput = 'not available'
    }

    var administrativeUnitRaw = ajaxRequestGeonamesPlaceName(authorInput);

    var geojsonRaw = document.getElementById("spatialProperties").value;

    if (administrativeUnitRaw.totalResultsCount !== 0 && (administrativeUnitRaw.geonames[0].toponymName === authorInput || administrativeUnitRaw.geonames[0].name === authorInput)) {

        var administrativeUnit = {
            'asciiName': administrativeUnitRaw.geonames[0].name,
            'geonameId': administrativeUnitRaw.geonames[0].geonameId
        }

        document.getElementById("administrativeUnit").value = JSON.stringify(administrativeUnit);

        // if the geojson exists, it is updated accordingly
        if (geojsonRaw !== '' && geojsonRaw !== 'no data') {
            var geojson = JSON.parse(geojsonRaw);
            geojson.administrativeUnit.name = administrativeUnit.asciiName;
            geojson.administrativeUnit.geonameId = administrativeUnit.geonameId;
            geojson.administrativeUnit.provenance = "administrative unit created by user (acceppting the suggestion of the geonames API, which was created on basis of a textual input)";
            document.getElementById("spatialProperties").value = JSON.stringify(geojson);
        }

    }
    else {
        document.getElementById("administrativeUnit").value = authorInput;

        // if the geojson exists, it is updated accordingly
        if (geojsonRaw !== '' && geojsonRaw !== 'no data') {
            var geojson = JSON.parse(geojsonRaw);
            geojson.administrativeUnit.name = authorInput;
            geojson.administrativeUnit.geonameId = 'not available';
            geojson.administrativeUnit.provenance = "administrative unit created by user (textual input, without suggestion of the geonames API)";
            document.getElementById("spatialProperties").value = JSON.stringify(geojson);
        }
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
        var layer = L.polygon([
            bbox.getSouthEast(),
            bbox.getNorthEast(),
            bbox.getNorthWest(),
            bbox.getSouthWest()
        ]);

        // this way information about the origin of the geometric shape is stored 
        layer.provenance = "geometric shape created by user (acceppting the suggestion of the leaflet-control-geocoder)";

        drawnItems.addLayer(layer);
        map.fitBounds(drawnItems.getBounds());

        storeCreatedGeoJSONAndAdministrativeUnitInHiddenForms(drawnItems);
        highlightHTMLElement("mapdiv");
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
    Otherwise, the field is empty.
    */
    if (temporalPropertiesFromDbDecoded !== 'no data') {
        var temporalPropertiesFromDb = JSON.parse(temporalPropertiesFromDbDecoded);

        // the temporal properties loaded from db are stored in the HTML element again 
        document.getElementById("temporalProperties").value = temporalPropertiesFromDbDecoded;

        // unix date range is converted in dates and displayed 
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
            timePicker24Hour: true,
            timePickerSeconds: true,
            startDate: yearStart + '-' + monthStart + '-' + dayStart + ' ' + hourStart + ':' + minutesStart + ':' + secondsStart + ' ' + amPmStart,
            endDate: yearEnd + '-' + monthEnd + '-' + dayEnd + ' ' + hourEnd + ':' + minutesEnd + ':' + secondsEnd + ' ' + amPmEnd,
            locale: {
                cancelLabel: 'Clear',
                format: 'YYYY-MM-DD hh:mm:ss A'
            }
        });

        $('input[name="datetimes"]').on('apply.daterangepicker', function (ev, picker) {
            $(this).val(picker.startDate.format('YYYY-MM-DD hh:mm:ss A') + ' - ' + picker.endDate.format('YYYY-MM-DD hh:mm:ss A'));
            var start = picker.startDate.format('YYYY-MM-DD hh:mm:ss A');
            var end = picker.endDate.format('YYYY-MM-DD hh:mm:ss A');

            var unixTimestampMillisecondStart = UTCInAMPMToUnixTimestampMillisecond(start);
            var unixTimestampMillisecondEnd = UTCInAMPMToUnixTimestampMillisecond(end);

            var unixDaterange = [unixTimestampMillisecondStart, unixTimestampMillisecondEnd];

            document.getElementById("temporalProperties").value = JSON.stringify(unixDaterange);

            // if the geojson exists, it is updated accordingly
            var geojsonRaw = document.getElementById("spatialProperties").value;
            if (geojsonRaw !== '' && geojsonRaw !== 'no data') {
                var geojson = JSON.parse(geojsonRaw);
                geojson.temporalProperties.unixDateRange = unixDaterange;
                geojson.temporalProperties.provenance = "temporal properties created by user";
                document.getElementById("spatialProperties").value = JSON.stringify(geojson);
            }
        });

        $('input[name="datetimes"]').on('cancel.daterangepicker', function (ev, picker) {
            $(this).val('');
            document.getElementById("temporalProperties").value = 'no data';

            // if the geojson exists, it is updated accordingly
            var geojsonRaw = document.getElementById("spatialProperties").value;
            if (geojsonRaw !== '' && geojsonRaw !== 'no data') {
                var geojson = JSON.parse(geojsonRaw);
                geojson.temporalProperties.unixDateRange = 'not available';
                geojson.temporalProperties.provenance = 'not available';
                document.getElementById("spatialProperties").value = JSON.stringify(geojson);
            }
        });
    }
    else {

        $('input[name="datetimes"]').daterangepicker({
            autoUpdateInput: false,
            timePicker: true,
            timePicker24Hour: true,
            timePickerSeconds: true,
            locale: {
                cancelLabel: 'Clear',
                format: 'YYYY-MM-DD hh:mm:ss A'
            }
        });

        $('input[name="datetimes"]').on('apply.daterangepicker', function (ev, picker) {
            $(this).val(picker.startDate.format('YYYY-MM-DD hh:mm:ss A') + ' - ' + picker.endDate.format('YYYY-MM-DD hh:mm:ss A'));
            var start = picker.startDate.format('YYYY-MM-DD hh:mm:ss A');
            var end = picker.endDate.format('YYYY-MM-DD hh:mm:ss A');

            var unixTimestampMillisecondStart = UTCInAMPMToUnixTimestampMillisecond(start);
            var unixTimestampMillisecondEnd = UTCInAMPMToUnixTimestampMillisecond(end);

            var unixDaterange = [unixTimestampMillisecondStart, unixTimestampMillisecondEnd];

            document.getElementById("temporalProperties").value = JSON.stringify(unixDaterange);

            // if the geojson exists, it is updated accordingly
            var geojsonRaw = document.getElementById("spatialProperties").value;
            if (geojsonRaw !== '' && geojsonRaw !== 'no data') {
                var geojson = JSON.parse(geojsonRaw);
                geojson.temporalProperties.unixDateRange = unixDaterange;
                geojson.temporalProperties.provenance = "temporal properties created by user";
                document.getElementById("spatialProperties").value = JSON.stringify(geojson);
            }
        });

        $('input[name="datetimes"]').on('cancel.daterangepicker', function (ev, picker) {
            $(this).val('');
            document.getElementById("temporalProperties").value = 'no data';

            // if the geojson exists, it is updated accordingly
            var geojsonRaw = document.getElementById("spatialProperties").value;
            if (geojsonRaw !== '' && geojsonRaw !== 'no data') {
                var geojson = JSON.parse(geojsonRaw);
                geojson.temporalProperties.unixDateRange = 'not available';
                geojson.temporalProperties.provenance = 'not available';
                document.getElementById("spatialProperties").value = JSON.stringify(geojson);
            }
        });
    }
});


