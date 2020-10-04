/**
 * Script article_details.js which gets called in the geoOJSPlugin.inc.php. 
 * Is used to display spatio-temporal metadata in the article view. 
 */

// load spatial properties from article_details.tpl 
var spatialPropertiesDecoded = document.getElementById("spatialProperties").value;

// load temporal properties from article_details.tpl 
var temporalPropertiesDecoded = document.getElementById("temporalProperties").value;

// load temporal properties from article_details.tpl 
var administrativeUnitDecoded = document.getElementById("administrativeUnit").value;

// create map 
var map = L.map('mapdiv');

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
    "geometric shape(s)": drawnItems,
    "administrative unit": administrativeUnitsMap
};

// add layerControl to the map to the map 
L.control.layers(baseLayers, overlayMaps).addTo(map);

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

/*
If neither temporal nor spatial properties nor administrativeUnit information are available, the corresponding elements in the article_details.tpl are deleted 
and no geospatial metadata are displayed also the download of the geojson is not provided, because there is no data for the geojson. 
Otherwise, the display of the elements is initiated. 
*/
if (spatialPropertiesDecoded === "no data" && temporalPropertiesDecoded === "no data" && administrativeUnitDecoded === "no data") {
    document.getElementById("item spatial").remove();
    document.getElementById("item temporal").remove();
    document.getElementById("item geospatialmetadata").remove();
    document.getElementById("item administrativeUnit").remove();
    document.getElementById("item geospatialmetadatadownload").remove();
}
else {
    /*
    spatial properties
    If no spatial properties are available, the corresponding elements in the article_details.tpl are deleted 
    and no spatial metadata are displayed. Otherwise the map is created and the spatial properties are displayed. 
    */
    if (spatialPropertiesDecoded === "no data") {
        document.getElementById("item spatial").remove();
    }
    else {
        var spatialProperties = JSON.parse(spatialPropertiesDecoded);

        if (spatialProperties.features.length === 0) {
            document.getElementById("item spatial").remove();
        }
        else {
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

            drawnItems.addLayer(L.geoJSON(spatialProperties));
            map.fitBounds(drawnItems.getBounds());
        }
    }

    /*
    administrative unit
    The administrative unit is requested from the OJS database. 
    The available elements are displayed. If there is a corresponding bbox available, the bbox for the lowest level is displayed in the map. 
    */
    if (administrativeUnitDecoded === "no data") {
        document.getElementById("item administrativeUnit").remove();
    }
    else {
        var administrativeUnitEncoded = JSON.parse(administrativeUnitDecoded);

        var administrativeUnitsNameList = [];

        for (var i = 0; i < administrativeUnitEncoded.length; i++) {
            administrativeUnitsNameList.push(administrativeUnitEncoded[i].name);
        }

        document.getElementById("administrativeUnitDescription").innerHTML = administrativeUnitsNameList.join(', ');

        var spatialPropertiesEncoded = JSON.parse(spatialPropertiesDecoded);
        displayBboxOfAdministrativeUnitWithLowestCommonDenominatorOfASetOfAdministrativeUnitsGivenInAGeojson(spatialPropertiesEncoded);

        /*
        store administrative unit standarized in metadata of the article html head  
        */ 

        // store lowest administrative unit in metadata in the head of the html (https://dohmaindesigns.com/adding-geo-meta-tags-to-your-website/)
        $('head').append('<meta name="geo.placename" content="' + administrativeUnitsNameList[administrativeUnitsNameList.length - 1] + '">');

        var lowestAdministrativeUnit; 
        for (var i = 0; i < administrativeUnitEncoded.length; i++) {
            if (administrativeUnitEncoded[i].bbox !== 'not available') {
                lowestAdministrativeUnit = {
                    'name' : administrativeUnitEncoded[i].name,
                    'bbox' : administrativeUnitEncoded[i].bbox
                }
            }
        }

        // DCMI Box Encoding Scheme - https://www.dublincore.org/specifications/dublin-core/dcmi-box/2005-07-25/
        $('head').append('<meta name="DC.box" content=' +  '"name=' + lowestAdministrativeUnit.name + '; northlimit=' + lowestAdministrativeUnit.bbox.north + '; southlimit=' + lowestAdministrativeUnit.bbox.south + '; westlimit=' + lowestAdministrativeUnit.bbox.west + '; eastlimit=' + lowestAdministrativeUnit.bbox.east + '; projection=EPSG3857"/>');

        // ISO 19139 - https://boundingbox.klokantech.com/
        $('head').append('<meta name="ISO 19139" content="<gmd:EX_GeographicBoundingBox><gmd:westBoundLongitude><gco:Decimal>' + lowestAdministrativeUnit.bbox.west + '</gco:Decimal></gmd:westBoundLongitude><gmd:eastBoundLongitude><gco:Decimal>' + lowestAdministrativeUnit.bbox.east + '</gco:Decimal></gmd:eastBoundLongitude><gmd:southBoundLatitude><gco:Decimal>'+ lowestAdministrativeUnit.bbox.south + '</gco:Decimal></gmd:southBoundLatitude><gmd:northBoundLatitude><gco:Decimal>' + lowestAdministrativeUnit.bbox.north + '</gco:Decimal></gmd:northBoundLatitude></gmd:EX_GeographicBoundingBox>"/>');    
    }

    /*
    temporal properties
    If no temporal properties are available, the corresponding elements in the article_details.tpl are deleted 
    and no temporal metadata are displayed. Otherwise the map is created and the temporal properties are displayed. 
    */
    if (temporalPropertiesDecoded === "no data") {
        document.getElementById("item temporal").remove();
    }
    else {
        // display temporal properties in utc
        var temporalProperties = JSON.parse(temporalPropertiesDecoded);
        var utcStart = (new Date(temporalProperties[0])).toUTCString();
        var utcEnd = (new Date(temporalProperties[1])).toUTCString();

        document.getElementById("start").innerHTML = utcStart;
        document.getElementById("end").innerHTML = utcEnd;

        var isoStart = (new Date(temporalProperties[0])).toISOString();
        var isoEnd = (new Date(temporalProperties[1])).toISOString();

        // ISO 8601 - https://www.iso.org/iso-8601-date-and-time-format.html 
        $('head').append('<meta name="ISO 8601" content="' + isoStart + '/' + isoEnd + '">');    
    }
}

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

        // To ensure that only the lowest layer is displayed, the previous layers are deleted 
        administrativeUnitsMap.clearLayers();

        administrativeUnitsMap.addLayer(layer);

        // the map is fitted to the given layer 
        map.fitBounds(administrativeUnitsMap.getBounds());

        if (geojson.administrativeUnits === {}) {
            administrativeUnitsMap.clearLayers();
        }
    }
    else {
        administrativeUnitsMap.clearLayers();
    }
}

/**
 * Function which gets called if the corresponding button is pressed in the article view. 
 * If pressed, the geojson with the geospatial metadata gets downloaded, as long the geojson is available. 
 */
function downloadGeospatialMetadataAsGeoJSON() {
    var spatialProperties = JSON.parse(spatialPropertiesDecoded);
    downloadObjectAsJson(spatialProperties, "geospatialMetadata");
}

/**
 * Function to download an object as json. 
 * @param {*} exportObj to download
 * @param {*} exportName name of object
 */
function downloadObjectAsJson(exportObj, exportName) {
    //create download link, exectute it, remove it at the end
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}