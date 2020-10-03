/**
 * Script submissionMetadataFormFields.js which gets called in the geoOJSPlugin.inc.php. 
 * Is used to enable input of spatio-temporal metadata during '3. Enter Metadata - Submit an Article'. 
 */

// Check if a corresponding username for the geonames API has been entered in the geoOJS plugin settings, otherwise trigger an alert with corresponding information. 
var usernameGeonames = document.getElementById("usernameGeonames").value;

if (usernameGeonames === "") {
    alert("You have to enter a valid usernames for the geonames API. Visit therefore https://www.geonames.org/login, register and enter the username in the geoOJS plug-in settings (Settings->Website->Plugins->Installed Plugins->geoOJS->blue arrow->Settings)!");
    usernameGeonames = "not available";
}
else {
    var testRequest = ajaxRequestGeonamesPlaceName("Münster");
    if (testRequest === undefined) {
        alert("Your username is not valid. Please check if it is correct in the geoOJS plug-in settings (Settings->Website->Plugins->Installed Plugins->geoOJS->blue arrow->Settings) or create a new account on https://www.geonames.org/login an update the username in the geoOJS plug-in settings!");
        usernameGeonames = "not available";
    }
    else if (testRequest.status !== undefined) {
        if (testRequest.status.value === 19) {
            alert("The limit of credits for your geonames account has been exceeded. Please use an other geonames account or wait until you got new credits!");
            usernameGeonames = "not available";
        }
    }
}

//load temporal properties which got already stored in database from submissionMetadataFormFields.tpl 
var temporalPropertiesFromDbDecoded = document.getElementById("temporalPropertiesFromDb").value;

//load spatial properties which got already stored in database from submissionMetadataFormFields.tpl 
var spatialPropertiesFromDbDecoded = document.getElementById("spatialPropertiesFromDb").value;

//load administrative Unit which got already stored in database from submissionMetadataFormFields.tpl 
var administrativeUnitFromDbDecoded = document.getElementById("administrativeUnitFromDb").value;



// Initialization of the map 
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
L.control.scale({ position: 'bottomright' }).addTo(map);

// FeatureGroup for the items drawn or inserted by the search
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// FeatureGroup for the administrativeUnits 
var administrativeUnitsMap = new L.FeatureGroup();
map.addLayer(administrativeUnitsMap);

var overlayMaps = {
    "administrative unit": administrativeUnitsMap,
    "geometric shape(s)": drawnItems
};

// add layerControl to the map to the map 
L.control.layers(baseLayers, overlayMaps).addTo(map);

// edit which geometrical forms are drawable 
var drawControl = new L.Control.Draw({
    draw: {
        polygon: {
            shapeOptions: {
                color: 'blue'
            },
            allowIntersection: true,
            drawError: {
                color: 'blue',
                timeout: 1000
            },
            showArea: true,
            metric: false
        },
        marker: {
            shapeOptions: {
                color: 'blue'
            },
        },
        rectangle: {
            shapeOptions: {
                color: 'blue'
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



// create initial geoJSON
createInitialGeojson();

/**
 * Function which creates the initial geoJSON. 
 * Either there is a geoJSON which gets loaded from the db and correspondingly displayed, otherwise there is an empty one created. 
 */
function createInitialGeojson() {

    var geojson;
    if (spatialPropertiesFromDbDecoded === 'no data' || spatialPropertiesFromDbDecoded === null || spatialPropertiesFromDbDecoded === undefined) {
        geojson = {
            "type": "FeatureCollection",
            "features": [],
            "administrativeUnits": {},
            "temporalProperties": {
                "unixDateRange": "not available",
                "provenance": {
                    "description": "not available",
                    "id": "not available"
                }
            }
        };
        document.getElementById("spatialProperties").value = JSON.stringify(geojson);
    }
    else {

        var spatialPropertiesFromDb = JSON.parse(spatialPropertiesFromDbDecoded);
        document.getElementById("spatialProperties").value = JSON.stringify(spatialPropertiesFromDb);

        if (spatialPropertiesFromDb.features.length !== 0) {
            var geojsonLayer = L.geoJson(spatialPropertiesFromDb);
            geojsonLayer.eachLayer(
                function (l) {
                    drawnItems.addLayer(l);
                });

            map.fitBounds(drawnItems.getBounds());
        }

        if (jQuery.isEmptyObject(spatialPropertiesFromDb.administrativeUnits) !== true) {
            displayBboxOfAdministrativeUnitWithLowestCommonDenominatorOfASetOfAdministrativeUnitsGivenInAGeojson(spatialPropertiesFromDb);
        }
    }
}




// tags for the administrative unit 

/**
 * Function enables tags for the administrative units. 
 * source: https://github.com/aehlke/tag-it 
 */
$(document).ready(function () {

    $("#administrativeUnitInput").tagit({
        allowSpaces: true,
        readOnly: false
    });
});

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
                    username: usernameGeonames,
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

/**
 * Function which stores if available in each tag its hierarchy concerning administrative units.
 */
$("#administrativeUnitInput").tagit({
    beforeTagAdded: function (event, ui) {

        if (document.getElementById("spatialProperties").value !== 'undefined') {

            var geojson = JSON.parse(document.getElementById("spatialProperties").value);
            var currentLabel = ui.tagLabel;

            if (jQuery.isEmptyObject(geojson.administrativeUnits) !== true) {
                for (var i = 0; i < geojson.administrativeUnits.length; i++) {
                    if (geojson.administrativeUnits[i].administrativeUnitSuborder !== 'not available') {
                        if (currentLabel === geojson.administrativeUnits[i].name) {
                            ui.tag[0].title = (geojson.administrativeUnits[i].administrativeUnitSuborder).join(', ');
                        }
                    }
                }
            }
        }
    }
});

/**
 * Function which triggers further processes when a tag is added. 
 * If the new tag is created by the geonames API after the creation of a geometric shape on the map, only the tag is created. 
 * Otherwise, if the tag is created by the user, it will be checked with the geonames API. 
 * If there is an entry, it will be suggested to the user, and for the administrative unit the bounding box and hierarchical structure of administrative units is stored if available. 
 * Otherwise, the user's input is displayed directly. 
 * If available the bounding box of the lowest common denominator concerning the administrative unit is displayed. 
 * Besides there is a check for validity concerning the entered tag by the user. It is checked if it is valid concerning administrative unit hierarchy and displayed geometric shape(s) in map.
 */
$("#administrativeUnitInput").tagit({
    // preprocessTag is triggered before each creation of a tag  
    preprocessTag: function (input) {
        var geojson;
        if (document.getElementById("spatialProperties").value === 'undefined') {
            return input;
        }
        else {
            geojson = JSON.parse(document.getElementById("spatialProperties").value);
        }
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

            if ((administrativeUnitRawAuthorInput.totalResultsCount !== 0) && (administrativeUnitRawAuthorInput.geonames[0].asciiName === input)) {
                var administrativeUnitAuthorInput = {
                    'name': administrativeUnitRawAuthorInput.geonames[0].asciiName,
                    'geonameId': administrativeUnitRawAuthorInput.geonames[0].geonameId,
                    'provenance': {
                        'description': 'administrative unit created by user (acceppting the suggestion of the geonames API, which was created on basis of a textual input)',
                        'id': 21
                    }
                }

                // store the bounding box in the administrativeUnit 
                var bbox = administrativeUnitRawAuthorInput.geonames[0].bbox;
                if (bbox !== undefined) {
                    delete bbox.accuracyLevel;
                    administrativeUnitAuthorInput.bbox = bbox;
                }
                else {
                    administrativeUnitAuthorInput.bbox = 'not available';
                }

                // store the administrativeUnitSuborder, so the parent hierarchical structure of administrative units in the administrative Unit 
                var administrativeUnitSuborder = getAdministrativeUnitSuborderForAdministrativeUnit(administrativeUnitAuthorInput.geonameId);
                administrativeUnitAuthorInput.administrativeUnitSuborder = administrativeUnitSuborder;
                administrativeUnit.push(administrativeUnitAuthorInput);

                // there is a proof if the input tag is valid, so if it fits in the current hierarchy of administrative units with the lowest common denominator  of administrative units and if it fits concerning the geometric shape(s) displayed in map
                var currentadministrativeUnitHierarchicalStructure;

                if (jQuery.isEmptyObject(geojson.administrativeUnits) !== true) {

                    for (var i = 0; i < geojson.administrativeUnits.length; i++) {
                        if (geojson.administrativeUnits[i].administrativeUnitSuborder !== undefined) {
                            currentadministrativeUnitHierarchicalStructure = geojson.administrativeUnits[i].administrativeUnitSuborder;
                        }
                    }

                    var inputTagIsValid = true;
                    for (var i = 0; i < currentadministrativeUnitHierarchicalStructure.length; i++) {

                        if (currentadministrativeUnitHierarchicalStructure[i] !== administrativeUnitSuborder[i]) {
                            inputTagIsValid = false;
                        }
                    }

                    if (inputTagIsValid === false && proofIfAllFeaturesAreInPolygon(geojson, administrativeUnitAuthorInput.bbox) === false) {
                        alert('Your Input ' + JSON.stringify(input) + ' with the superior administrative units ' + JSON.stringify(administrativeUnitSuborder) + ' is not valid! On the one hand you need to delete one or more of the tags which are already displayed, so that your input tag fits in the current hierarchy of administrative units, or adapt your input tag! On the other side you need to change the tag you want to add, so that it fits the geometric shape(s) in the map, or edit the geometric shape(s) in the map!');
                        return 'notValidTag';
                    }
                    if (inputTagIsValid === false) {
                        alert('Your Input ' + JSON.stringify(input) + ' with the superior administrative units ' + JSON.stringify(administrativeUnitSuborder) + ' is not valid! You need to delete one or more of the other tags which are already displayed, so that your input tag fits in the current hierarchy of administrative units, or adapt your input tag!');
                        return 'notValidTag';
                    }
                    if (proofIfAllFeaturesAreInPolygon(geojson, administrativeUnitAuthorInput.bbox) === false) {
                        alert('Your Input ' + JSON.stringify(input) + ' with the superior administrative units ' + JSON.stringify(administrativeUnitSuborder) + ' is not valid! You need to change the tag you want to add, so that it fits the geometric shape(s) in the map, or edit the geometric shape(s) in the map!');
                        return 'notValidTag';
                    }
                }
                else {
                    // In case no administrative unit is currently available, it must still be checked if the new input matches the geometric shapes in the map 
                    if (proofIfAllFeaturesAreInPolygon(geojson, administrativeUnitAuthorInput.bbox) === false) {
                        alert('Your Input ' + JSON.stringify(input) + ' with the superior administrative units ' + JSON.stringify(administrativeUnitSuborder) + ' is not valid! You need to change the tag you want to add, so that it fits the geometric shape(s) in the map, or edit the geometric shape(s) in the map!');
                        return 'notValidTag';
                    }
                }

                document.getElementById("administrativeUnit").value = JSON.stringify(administrativeUnit);
                input = administrativeUnitAuthorInput.name;

            }
            else {
                var administrativeUnitAuthorInput = {
                    'name': input,
                    'geonameId': 'not available',
                    'provenance': {
                        'description': 'administrative unit created by user (textual input, without suggestion of the geonames API)',
                        'id': 22
                    },
                    'administrativeUnitSuborder': 'not available',
                    'bbox': 'not available'
                }
                administrativeUnit.push(administrativeUnitAuthorInput);
                document.getElementById("administrativeUnit").value = JSON.stringify(administrativeUnit);
            }

            geojson.administrativeUnits = administrativeUnit;
            document.getElementById("spatialProperties").value = JSON.stringify(geojson);
        }

        displayBboxOfAdministrativeUnitWithLowestCommonDenominatorOfASetOfAdministrativeUnitsGivenInAGeojson(geojson);

        notValidTag();

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
        var geojson = JSON.parse(document.getElementById("spatialProperties").value);

        if (administrativeUnitRaw === 'no data') {
            administrativeUnitGeoJSON = {};
        }
        else {

            var administrativeUnit = JSON.parse(administrativeUnitRaw);

            // the corresponding element is removed 
            for (var i = 0; i < administrativeUnit.length; i++) {
                if (currentTag === administrativeUnit[i].name) {
                    // needs to be deleted twice, because im some cases otherwise the element does not get deleted  
                    administrativeUnit.splice(i, 1);
                    administrativeUnit.splice(i, 1);
                }
            }

            administrativeUnitGeoJSON = administrativeUnit;

            // If there is no more element this is indicated by 'no data', otherwise the geoJSON gets updated, if available 
            if (administrativeUnit.length === 0) {
                administrativeUnit = 'no data';
                document.getElementById("administrativeUnit").value = administrativeUnit;

                administrativeUnitGeoJSON = {};

            }
            else {
                document.getElementById("administrativeUnit").value = JSON.stringify(administrativeUnit);
            }
        }

        // the geojson is updated accordingly
        geojson.administrativeUnits = administrativeUnitGeoJSON;
        document.getElementById("spatialProperties").value = JSON.stringify(geojson);

        displayBboxOfAdministrativeUnitWithLowestCommonDenominatorOfASetOfAdministrativeUnitsGivenInAGeojson(geojson);

    }
});

/**
 * Function which illustrates the bounding box (if available) of an administrative unit with the lowest common denominator, 
 * for a given geojson with a number of administrative Units. 
 * @param {*} geojson 
 */
function displayBboxOfAdministrativeUnitWithLowestCommonDenominatorOfASetOfAdministrativeUnitsGivenInAGeojson(geojson) {

    // check for which of the units a bounding box is available 
    var bboxAvailable = [];
    for (var i = 0; i < geojson.administrativeUnits.length; i++) {
        if (geojson.administrativeUnits[i].bbox === 'not available') {
            bboxAvailable.push(false);
        }
        else {
            bboxAvailable.push(true);
        }
    }

    // defining of bounding box of the lowest common denominator 
    var bboxAdministrativeUnitLowestCommonDenominator;
    for (var i = 0; i < bboxAvailable.length; i++) {
        if (bboxAvailable[i] === true) {
            bboxAdministrativeUnitLowestCommonDenominator = geojson.administrativeUnits[i].bbox;
        }
    }

    // creation of the corresponding leaflet layer 
    if (bboxAdministrativeUnitLowestCommonDenominator !== undefined) {
        var layer = L.polygon([
            [bboxAdministrativeUnitLowestCommonDenominator.north, bboxAdministrativeUnitLowestCommonDenominator.west],
            [bboxAdministrativeUnitLowestCommonDenominator.south, bboxAdministrativeUnitLowestCommonDenominator.west],
            [bboxAdministrativeUnitLowestCommonDenominator.south, bboxAdministrativeUnitLowestCommonDenominator.east],
            [bboxAdministrativeUnitLowestCommonDenominator.north, bboxAdministrativeUnitLowestCommonDenominator.east],
        ]);

        layer.setStyle({
            color: 'black',
            fillOpacity: 0.5
        })

        // to ensure that only the lowest layer is displayed, the previous layers are deleted 
        administrativeUnitsMap.clearLayers();

        administrativeUnitsMap.addLayer(layer);

        map.fitBounds(administrativeUnitsMap.getBounds());

        highlightHTMLElement("mapdiv");

        if (geojson.administrativeUnits === {}) {
            administrativeUnitsMap.clearLayers();
        }
    }
    else {
        administrativeUnitsMap.clearLayers();
    }
}

/**
 * Function to proof if a given string is valid JSON.
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
 * Function which proofs if all Features of a given geojson are inside (not completly but touching) an other given Polygon. 
 * If all features are inside the function returns true, otherwise false. 
 * @param {*} geojson 
 * @param {*} givenPolygon 
 */
function proofIfAllFeaturesAreInPolygon(geojson, givenPolygon) {
    
    // In case there is no polygon, no check can be made if AllFeatures are in it, so the assumption is made that they are inside and therefore true is returned. 
    if (givenPolygon === 'not available') {
        return true; 
    }

    var allFeaturesInPolygon = [];

    // leaflet layer for the polygon 
    var polygon = L.polygon([
        [givenPolygon.north, givenPolygon.west],
        [givenPolygon.south, givenPolygon.west],
        [givenPolygon.south, givenPolygon.east],
        [givenPolygon.north, givenPolygon.east]
    ]).addTo(map);

    /*
    leaflet layer for the features
    by the function contains it is checked wether the feature is inside the polygon or not  
    */
    for (var i = 0; i < geojson.features.length; i++) {
        if (geojson.features[i].geometry.type === 'Point') {
            allFeaturesInPolygon.push(polygon.getBounds().contains(L.latLng(geojson.features[i].geometry.coordinates[1], geojson.features[i].geometry.coordinates[0])));
        }
        if (geojson.features[i].geometry.type === 'Polygon') {
            var array = [];
            for (var j = 0; j < geojson.features[i].geometry.coordinates[0].length; j++) {
                array.push([geojson.features[i].geometry.coordinates[0][j][1], geojson.features[i].geometry.coordinates[0][j][0]]);
            }
            array.push(array[0]);
            allFeaturesInPolygon.push(polygon.getBounds().contains(L.polygon([array]).getBounds()));
        }
        if (geojson.features[i].geometry.type === 'LineString') {
            var array = [];

            for (var k = 0; k < geojson.features[i].geometry.coordinates.length; k++) {
                array.push([geojson.features[i].geometry.coordinates[k][1], geojson.features[i].geometry.coordinates[k][0]]);
            }
            console.log(array);
            allFeaturesInPolygon.push(polygon.getBounds().contains(L.polyline(array).getBounds()));
        }
    }

    // polygon gets removed after check 
    map.removeLayer(polygon);

    for (var i = 0; i < allFeaturesInPolygon.length; i++) {
        if (allFeaturesInPolygon[i] === false) {
            return false;
        }
    }
    return true;
}

/**
 * Function to delete a tag, if it is not valid (do not fit in the current hierarchy of administrative units).
 */
function notValidTag() {
    var currentTags = $("#administrativeUnitInput").tagit("assignedTags");

    for (var i = 0; i < currentTags.length; i++) {
        if (currentTags[i] === "notValidTag") {
            $("#administrativeUnitInput").tagit("removeTagByLabel", "notValidTag");
        }
    }
}

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



/*
functions which all called in a cascade of functions by the function called 'storeCreatedGeoJSONAndAdministrativeUnitInHiddenForms' 
which is called on map change (draw:created, draw:edited, draw:deleted, search) 
*/
/**
 * Function which creates a feature for given array of layers. 
 * @param {} allLayers 
 */
function createFeaturesForGeoJSON(allLayers) {

    var geojsonFeatures = [];
    var geojson = JSON.parse(document.getElementById("spatialProperties").value);

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

    geojson.features = geojsonFeatures;

    return geojson;
}

/**
 * Function which takes the Leaflet layers from leaflet and creates a valid geoJSON from it. 
 * @param {} drawnItems 
 */
function updateGeojsonWithLeafletOutput(drawnItems) {

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
    var geojson = createFeaturesForGeoJSON(pureLayers);

    // if there are no geoJSON Features/ no spatial data available, there is 'no data' stored in database, otherwise the stringified geoJSON 
    if (geojson.features.length === 0) {
        geojson.features = [];
    }

    /*
    if there is a geojson object with features, the unix date range is stored in the geojson, 
    if it is available either from the current edit or from the database.
    */
    var temporalProperties = document.getElementById("temporalProperties").value;

    if (temporalProperties === 'no data') {
        geojson.temporalProperties.unixDateRange = 'not available';
        geojson.temporalProperties.provenance.description = 'not available';
        geojson.temporalProperties.provenance.id = 'not available';
    }
    else if (temporalProperties !== '') {
        geojson.temporalProperties.unixDateRange = temporalProperties;
        geojson.temporalProperties.provenance.description = "temporal properties created by user";
        geojson.temporalProperties.provenance.id = 31;

    }
    return geojson;
}

/**
 * Function that performs the Ajax request to the API Geonames for any placeName. 
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
            username: usernameGeonames,
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
 * Function that performs the Ajax request to the API Geonames for any latitude and longitude. 
 * https://www.geonames.org/ 
 * @param {*} lng 
 * @param {*} lat 
 */
function ajaxRequestGeonamesCoordinates(lng, lat) {

    var resultGeonames;
    var urlGeonames = 'http://api.geonames.org/hierarchyJSON?formatted=true&lat=' + lat + '&lng=' + lng + '&username=' + usernameGeonames + '&style=full&featureClass=P';
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
 * Function that performs the Ajax request to the API Geonames and returns for a given geonameId, the corresponding hierarchical administrative structure of its parent administrative units. 
 * https://www.geonames.org/ 
 * @param {*} id 
 */
function ajaxRequestGeonamesGeonameIdHierarchicalStructure(id) {

    var resultGeonames;
    $.ajax({
        url: "http://api.geonames.org/hierarchyJSON",
        async: false,
        data: {
            geonameId: id,
            formatted: true,
            username: usernameGeonames,
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
 * Function that returns for a given geonameId of a feature with an administrativeUnit, the corresponding hierarchical administrative structure of its parent administrative units. 
 * @param {*} geonameId 
 */
function getAdministrativeUnitSuborderForAdministrativeUnit(geonameId) {
    var resultAjaxRequestGeonamesGeonameId = ajaxRequestGeonamesGeonameIdHierarchicalStructure(geonameId);
    var administrativeUnitSuborder = [];
    for (var i = 0; i < resultAjaxRequestGeonamesGeonameId.geonames.length; i++) {
        administrativeUnitSuborder.push(resultAjaxRequestGeonamesGeonameId.geonames[i].asciiName);
    }
    return administrativeUnitSuborder;
}

/**
 * Function that performs the Ajax request to the API Geonames for any id and returns the boundingbox for the id if available. 
 * https://www.geonames.org/ 
 * @param {*} placeName 
 */
function ajaxRequestGeonamesGeonamesIdBbox(id) {

    var resultGeonames;
    $.ajax({
        url: "http://api.geonames.org/getJSON",
        async: false,
        data: {
            geonameId: id,
            formatted: true,
            username: usernameGeonames,
            style: "full",
            maxRows: 12,
        },
        success: function (result) {
            resultGeonames = result.bbox;
        }
    });
    return resultGeonames;
}

/**
 * Function to proof if all positions in an array are the same. 
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
 * Function which takes a two dimensional array. 
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
 * Function which returns for each feature an array with the administrative units that match at all points of the feature. 
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
 * Function to highlight an html Element. Designed to alert users that something has changed in html element. 
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
 * Function which adds all geometric shapes created by leaflet to a geojson.
 * In addition, further operations are done with the given geojson data.
 * - The lowest administrative unit that is valid for all features is calculated for the entire FeatureCollection.
 * - Bounding box and hierarchical structure of the parent administrative units is calculated for each administrative unit. 
 * - Provenance for each feature is calculated. 
 * These results are stored on the one hand as geoJSON with all results in a hidden form and 
 * on the other side the administrativeUnits are stored additionally seperated in a further hidden form.  
 * They are stored in hidden forms so that they can be queried in geoOJSPlugin.inc.php.  
 * @param {*} drawnItems 
 */
function storeCreatedGeoJSONAndAdministrativeUnitInHiddenForms(drawnItems) {

    geojson = updateGeojsonWithLeafletOutput(drawnItems);

    $("#administrativeUnitInput").tagit("removeAll");
    document.getElementById("administrativeUnit").value = 'no data';

    if (geojson.features.length !== 0) {
        var administrativeUnitsForAllFeatures = [];
        // for each geoJSON feature the administrative unit that matches is stored. 
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

                // calculate the hierarchical structure of the parent administrative units 
                var administrativeUnitSuborder = getAdministrativeUnitSuborderForAdministrativeUnit(administrativeUnitForAllFeatures[i].geonameId);

                var bbox = ajaxRequestGeonamesGeonamesIdBbox(administrativeUnitForAllFeatures[i].geonameId);

                if (bbox !== undefined) {
                    delete bbox.accuracyLevel;
                    administrativeUnitForAllFeatures[i].bbox = bbox;
                }
                else {
                    administrativeUnitForAllFeatures[i].bbox = 'not available';
                }

                administrativeUnitForAllFeatures[i].administrativeUnitSuborder = administrativeUnitSuborder;
                administrativeUnitForAllFeatures[i].provenance = {
                    'description': 'administrative unit created by user (acceppting the suggestion of the geonames API , which was created on basis of a geometric shape input)',
                    'id': 23
                };
            }
            document.getElementById("administrativeUnit").value = JSON.stringify(administrativeUnitForAllFeatures);

            // information concerning administrativeUnit in the geojson 
            geojson.administrativeUnits = administrativeUnitForAllFeatures;
            document.getElementById("spatialProperties").value = JSON.stringify(geojson);

            for (var i = 0; i < administrativeUnitForAllFeatures.length; i++) {
                // create for each administrativeUnit a tag 
                $("#administrativeUnitInput").tagit("createTag", administrativeUnitForAllFeatures[i].name);
            }
        }
    }
    else {
        geojson.administrativeUnits = {};
        document.getElementById("spatialProperties").value = JSON.stringify(geojson);
    }
    highlightHTMLElement("administrativeUnitInput");
}

/**
 * Function to create the layer(s) and update the db correspondingly with the geoJSON.
 */
map.on('draw:created', function (e) {
    var type = e.layerType,
        layer = e.layer;

    if (type === 'marker') {
        // something specific concerning item 
    }

    // this way information about the origin of the geometric shape is stored 
    layer.provenance = {
        "description": "geometric shape created by user (drawing)",
        "id": 11
    };

    drawnItems.addLayer(layer);

    storeCreatedGeoJSONAndAdministrativeUnitInHiddenForms(drawnItems);
});

/**
 * Function to edit the layer(s) and update the db correspondingly with the geoJSON.
 */
map.on('draw:edited', function (e) {

    var changedLayer = e.layers._layers;
    // this way information about the origin of the geometric shape is stored 
    Object.keys(changedLayer).forEach(function (key) {

        if (changedLayer[key].provenance.description === "geometric shape created by user (acceppting the suggestion of the leaflet-control-geocoder)") {
            drawnItems._layers[key].provenance = {
                "description": "geometric shape created by user (edited the suggestion of the leaflet-control-geocoder by drawing)",
                "id": 12
            };
        }
    });

    storeCreatedGeoJSONAndAdministrativeUnitInHiddenForms(drawnItems);
});

/**
 * Function to delete the layer(s) and update the db correspondingly with the geoJSON.
 */
map.on('draw:deleted', function (e) {
    storeCreatedGeoJSONAndAdministrativeUnitInHiddenForms(drawnItems);
});

/**
 * Add a search to the map. 
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
        layer.provenance = {
            "description": "geometric shape created by user (acceppting the suggestion of the leaflet-control-geocoder)",
            "id": 13
        };

        drawnItems.addLayer(layer);

        storeCreatedGeoJSONAndAdministrativeUnitInHiddenForms(drawnItems);
        highlightHTMLElement("mapdiv");
    })
    .addTo(map);



// Functions that allow the specification of time and space
/**
 * Function which changes hour system from 24 hours to 12 hours.
 * @param {*} hour 
 */
function changeHourSystemFrom24To12(hour) {
    if (hour >= 12) {
        hour = hour - 12;
    }
    return hour;
}

/**
 * Function which records am and pm for the corresponding times. 
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
 * Function to convert a UTC timestamp with AM/ PM to a Unix timestamp in milliseconds. 
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
 * Function to load the daterangepicker and store the date in the db.
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

            // the geojson is updated accordingly
            var geojson = JSON.parse(document.getElementById("spatialProperties").value);
            geojson.temporalProperties.unixDateRange = unixDaterange;
            geojson.temporalProperties.provenance.description = "temporal properties created by user";
            geojson.temporalProperties.provenance.id = 31;
            document.getElementById("spatialProperties").value = JSON.stringify(geojson);

        });

        $('input[name="datetimes"]').on('cancel.daterangepicker', function (ev, picker) {
            $(this).val('');
            document.getElementById("temporalProperties").value = 'no data';

            // the geojson is updated accordingly
            var geojson = JSON.parse(document.getElementById("spatialProperties").value);
            geojson.temporalProperties.unixDateRange = 'not available';
            geojson.temporalProperties.provenance.description = 'not available';
            geojson.temporalProperties.provenance.id = 'not available';
            document.getElementById("spatialProperties").value = JSON.stringify(geojson);

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

            // the geojson is updated accordingly
            var geojson = JSON.parse(document.getElementById("spatialProperties").value);
            geojson.temporalProperties.unixDateRange = unixDaterange;
            geojson.temporalProperties.provenance.description = "temporal properties created by user";
            geojson.temporalProperties.provenance.id = 31;
            document.getElementById("spatialProperties").value = JSON.stringify(geojson);

        });

        $('input[name="datetimes"]').on('cancel.daterangepicker', function (ev, picker) {
            $(this).val('');
            document.getElementById("temporalProperties").value = 'no data';

            // the geojson is updated accordingly
            var geojson = JSON.parse(document.getElementById("spatialProperties").value);
            geojson.temporalProperties.unixDateRange = 'not available';
            geojson.temporalProperties.provenance.description = 'not available';
            geojson.temporalProperties.provenance.id = 'not available';
            document.getElementById("spatialProperties").value = JSON.stringify(geojson);
        });
    }
});


