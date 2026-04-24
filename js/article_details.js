/**
 * js/article_details.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 * 
 * @brief Display spatio-temporal metadata in the article view.
 */

// Map is skipped entirely when the admin has disabled the article map block;
// #mapdiv is then absent from the DOM and L.map() would throw.
var geoMetadata_mapEnabled = !!document.getElementById('mapdiv');
var map, drawnItems, administrativeUnitsMap;

// Build admin-unit overlay layers from a {north, south, east, west} bbox,
// emitting two rectangles when east < west (antimeridian-crossing; see issue #60).
function bboxToLeafletLayers(bbox, styleOpts) {
    var layers = L.featureGroup();
    var bounds;
    if (bbox.east >= bbox.west) {
        L.polygon([[bbox.north, bbox.west], [bbox.south, bbox.west], [bbox.south, bbox.east], [bbox.north, bbox.east]], styleOpts).addTo(layers);
        bounds = L.latLngBounds([bbox.south, bbox.west], [bbox.north, bbox.east]);
    } else {
        L.polygon([[bbox.north, bbox.west], [bbox.south, bbox.west], [bbox.south, 180], [bbox.north, 180]], styleOpts).addTo(layers);
        L.polygon([[bbox.north, -180], [bbox.south, -180], [bbox.south, bbox.east], [bbox.north, bbox.east]], styleOpts).addTo(layers);
        bounds = L.latLngBounds([bbox.south, bbox.west], [bbox.north, bbox.east + 360]);
    }
    return { layers: layers, bounds: bounds };
}

if (geoMetadata_mapEnabled) {
    map = L.map('mapdiv', { zoomControl: false, worldCopyJump: true });

    L.control.zoom({
        zoomInTitle:  geoMetadata_zoomInTitle,
        zoomOutTitle: geoMetadata_zoomOutTitle
    }).addTo(map);

    var osmlayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
        maxZoom: 18
    }).addTo(map);

    var baseLayers = {
        "OpenStreetMap": osmlayer
    };
    if (geoMetadata_showEsriBaseLayer) {
        baseLayers["Esri World Imagery"] = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
            maxZoom: 18
        });
    }

    L.control.scale({ position: 'bottomright' }).addTo(map);

    L.control.fullscreen({
        position: 'topleft',
        title: geoMetadata_fullscreenTitle,
        titleCancel: geoMetadata_fullscreenTitleCancel
    }).addTo(map);

    drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    administrativeUnitsMap = new L.FeatureGroup();
    map.addLayer(administrativeUnitsMap);

    var overlayMaps = {
        [geoMetadata_articleLayerName]: drawnItems,
        [geoMetadata_adminLayerName]: administrativeUnitsMap
    };

    L.control.layers(baseLayers, overlayMaps).addTo(map);

    if (geoMetadata_showGeocoder) {
        L.Control.geocoder({
            defaultMarkGeocode: false,
            placeholder:  geoMetadata_geocoderPlaceholder,
            errorMessage: geoMetadata_geocoderError,
            iconLabel:    geoMetadata_geocoderButtonTitle
        })
            .on('markgeocode', function (e) {
                var bbox = e.geocode.bbox;
                var poly = L.polygon([
                    bbox.getSouthEast(),
                    bbox.getNorthEast(),
                    bbox.getNorthWest(),
                    bbox.getSouthWest()
                ]);
                map.fitBounds(poly.getBounds());
            })
            .addTo(map);
    }
}

$(function () {
    // load spatial properties from article_details.tpl 
    var spatialProperties = document.getElementById("geoMetadata_spatial").value;
    let spatialPropertiesParsed = JSON.parse(spatialProperties);

    // load temporal properties from article_details.tpl 
    var temporalProperties = document.getElementById("geoMetadata_temporal").value;

    // load temporal properties from article_details.tpl 
    var administrativeUnit = document.getElementById("geoMetadata_administrativeUnit").value;

    /*
    If neither temporal nor spatial properties nor administrativeUnit information are available, the corresponding elements in the article_details.tpl are deleted 
    and no geospatial metadata are displayed also the download of the geojson is not provided, because there is no data for the geojson. 
    Otherwise, the display of the elements is initiated. 
    */
    if (spatialPropertiesParsed.features.length === 0 && temporalProperties === "no data" && administrativeUnit === "no data") {
        $("#geoMetadata_article_geospatialmetadata").hide();
    }

    /*
    spatial properties
    If no spatial properties are available, the corresponding elements in the article_details.tpl are deleted 
    and no spatial metadata are displayed. Otherwise the map is created and the spatial properties are displayed. 
    */
    if (spatialPropertiesParsed.features.length === 0) {
        $("#geoMetadata_article_spatial").hide();
        $("#geoMetadata_article_spatial_download").hide();
        $("#mapdiv").hide();
    }
    else if (geoMetadata_mapEnabled) {
        /*
        Depending on the object type, the geoJSON object is structured slightly differently,
        so that the coordinates are at different locations and must be queried differently.
        */
        if (spatialPropertiesParsed.features[0].geometry.type === 'Polygon') {
            lngFirstCoordinateGeojson = spatialPropertiesParsed.features[0].geometry.coordinates[0][0][0];
            latFirstCoordinateGeojson = spatialPropertiesParsed.features[0].geometry.coordinates[0][0][1];
        }
        else if (spatialPropertiesParsed.features[0].geometry.type === 'LineString') {
            lngFirstCoordinateGeojson = spatialPropertiesParsed.features[0].geometry.coordinates[0][0];
            latFirstCoordinateGeojson = spatialPropertiesParsed.features[0].geometry.coordinates[0][1];
        }
        else if (spatialPropertiesParsed.features[0].geometry.type === 'Point') {
            lngFirstCoordinateGeojson = spatialPropertiesParsed.features[0].geometry.coordinates[0];
            latFirstCoordinateGeojson = spatialPropertiesParsed.features[0].geometry.coordinates[1];
        }

        spatialPropertiesParsed.features = geoMetadata_prepareFeaturesForDisplay(spatialPropertiesParsed.features);
        let layer = L.geoJSON(spatialPropertiesParsed);
        layer.setStyle(geoMetadata_mapLayerStyle);
        drawnItems.addLayer(layer);
        map.fitBounds(drawnItems.getBounds());
    }

    /*
    administrative unit
    The administrative unit is requested from the OJS database. 
    The available elements are displayed. If there is a corresponding bbox available, the bbox for the lowest level is displayed in the map
    */
    if (administrativeUnit === "no data") {
        $("#geoMetadata_article_administrativeUnit").hide();
    }
    else {
        var administrativeUnitEncoded = JSON.parse(administrativeUnit);

        var administrativeUnitsNameList = [];

        for (var i = 0; i < administrativeUnitEncoded.length; i++) {
            administrativeUnitsNameList.push(administrativeUnitEncoded[i].name);
        }

        $("#geoMetadata_span_admnistrativeUnit").html(administrativeUnitsNameList.join(', '));

        if (geoMetadata_mapEnabled) {
            let spatialPropertiesParsed = JSON.parse(spatialProperties);
            displayBboxOfAdministrativeUnitWithLowestCommonDenominatorOfASetOfAdministrativeUnitsGivenInAGeojson(spatialPropertiesParsed);
        }
    }

    /*
    temporal properties
    If no temporal properties are available, the corresponding elements in the article_details.tpl are deleted 
    and no temporal metadata are displayed. Otherwise the map is created and the temporal properties are displayed. 
    */
    if (temporalProperties === "no data") {
        $("#geoMetadata_article_temporal").hide();
    }
    else {
        let ranges = window.geoMetadataTemporal.parseTimePeriods(temporalProperties);
        if (ranges.length === 0) {
            $("#geoMetadata_article_temporal").hide();
        } else {
            $("#geoMetadata_span_start").text(ranges[0].start);
            $("#geoMetadata_span_end").text(ranges[0].end);
        }
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
        var helper = bboxToLeafletLayers(bboxAdministrativeUnitLowestCommonDenominator, { color: 'black', fillOpacity: 0.15 });

        administrativeUnitsMap.clearLayers();
        helper.layers.eachLayer(function (l) { administrativeUnitsMap.addLayer(l); });
        map.fitBounds(helper.bounds, { padding: [20, 20] });
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
    let spatialProperties = document.getElementById("geoMetadata_spatial").value;

    downloadObjectAsJson(JSON.parse(spatialProperties), "geospatialMetadata");
}

/**
 * Function to download an object as JSON
 *  
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
