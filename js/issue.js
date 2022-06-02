/**
 * 
 * js/issue.js
 *
 * Copyright (c) 2022 OPTIMETA project
 * Copyright (c) 2022 Daniel Nüst
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 * 
 * @brief Display spatio-temporal metadata in the issue view. 
 */

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

// FeatureGroup for the geospatial extent of articles
var articleLocations = new L.FeatureGroup();
map.addLayer(articleLocations);

var overlayMaps = {
    [optimetageo_layerName]: articleLocations,
};

// add layerControl to the map to the map 
L.control.layers(baseLayers, overlayMaps).addTo(map);

// highlighting features based on https://leafletjs.com/examples/choropleth/
function highlightFeature(layer) {
    layer.setStyle(optimetageo_mapLayerStyleHighlight);

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}

function highlightArticle(id) {
    $('#' + id).parent().closest('div').addClass('optimetageo_title_hover');
}

function resetHighlightFeature(layer) {
    // layer.resetStyle(); // e's layers is a geoJSON layer, so maybe access that function here somehow?
    layer.setStyle(optimetageo_mapLayerStyle);
}

function resetHighlightArticle(id) {
    $('#' + id).parent().closest('div').removeClass('optimetageo_title_hover');
}

var articleLayerMap = new Map();

// load spatial data
$(function () {
    // load properties for each article from issue_map.tpl
    var spatialInputs = $('.optimeta_data.spatial').toArray().map(input => {
        let geojson = JSON.parse(input.value);
        return (geojson);
    });
    var articleIdInputs = $('.optimeta_data.articleId').toArray().map(input => {
        return (input.value);
    });
    var popupInputs = $('.optimeta_data.popup').toArray().map(input => {
        return (input.value);
    });
    //var tooltipInputs = $('.optimeta_data.tooltip').toArray().map(input => {
    //    return(input.value);
    //});

    spatialInputs.forEach((spatialProperty, index) => {
        let articleId = articleIdInputs[index];
        let layer = L.geoJSON(spatialProperty, {
            onEachFeature: (feature, layer) => {
                layer.bindPopup(popupInputs[index]);
                //layer.bindTooltip(tooltipInputs[index]);
                layer.on({
                    mouseover: function(e) {
                        highlightFeature(e.target);
                        highlightArticle(e.target.options.articleId);
                    },
                    mouseout: function(e) {
                        resetHighlightFeature(e.target);
                        resetHighlightArticle(e.target.options.articleId);
                    }
                });
            },
            style: optimetageo_mapLayerStyle,
            articleId: articleId
        });
        articleLocations.addLayer(layer);
        map.fitBounds(articleLocations.getBounds());

        // add event listener to article div for highlighting the related layer
        articleLayerMap.set(articleId, layer);
        let articleDiv = $('#' + layer.options.articleId).parent().closest('div');
        articleDiv.hover(
            () => {
                let layer = articleLayerMap.get(articleId);
                highlightFeature(layer);
                console.log(articleId + ' enter');
            },
            () => {
                let layer = articleLayerMap.get(articleId);
                resetHighlightFeature(layer);
                console.log(articleId + ' leave');
            });
    });

    /*
    var administrativeUnitDecoded = document.getElementById("optimeta_administrativeUnit").value;
    var administrativeUnitEncoded = JSON.parse(administrativeUnitDecoded);

    var administrativeUnitsNameList = [];

    for (var i = 0; i < administrativeUnitEncoded.length; i++) {
        administrativeUnitsNameList.push(administrativeUnitEncoded[i].name);
    }

    document.getElementById("administrativeUnit").innerHTML = administrativeUnitsNameList.join(', ');

    var spatialPropertiesEncoded = JSON.parse(spatialPropertiesDecoded);
    displayBboxOfAdministrativeUnitWithLowestCommonDenominatorOfASetOfAdministrativeUnitsGivenInAGeojson(spatialPropertiesEncoded);
    */
});

/*
$(function () {
    // load temporal properties from article_details.tpl 
    var temporalPropertiesDecoded = document.getElementById("optimeta_temporal").value;

});
*/
