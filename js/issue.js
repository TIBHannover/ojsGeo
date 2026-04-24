/**
 * js/issue.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * @brief Display spatio-temporal metadata in the issue view.
 */

var geoMetadata_issueMapEnabled = !!document.getElementById('mapdiv');
var map, articleLocations, iconStyle, iconStyleHighlight;

if (geoMetadata_issueMapEnabled) {
    var mapView = "0, 0, 1".split(",");
    map = L.map('mapdiv', { zoomControl: false, worldCopyJump: true }).setView([mapView[0], mapView[1]], mapView[2]);

    // translated zoom control (issue #151)
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

    articleLocations = new L.FeatureGroup();
    map.addLayer(articleLocations);

    var overlayMaps = {
        [geoMetadata_layerName]: articleLocations,
    };

    L.control.layers(baseLayers, overlayMaps).addTo(map);

    iconStyle = L.icon({
        iconUrl: geoMetadata_markerBaseUrl + 'marker-icon-2x-blue.png',
        shadowUrl: geoMetadata_markerBaseUrl + 'marker-shadow.png'
    });
    iconStyleHighlight = L.icon({
        iconUrl: geoMetadata_markerBaseUrl + 'marker-icon-2x-red.png',
        shadowUrl: geoMetadata_markerBaseUrl + 'marker-shadow.png'
    });
}

// highlighting features based on https://leafletjs.com/examples/choropleth/
function highlightFeature(layer, feature) {
    if (feature && feature.geometry.type === "Point" && layer.options.icon) { // only setIcon on a layer that already has one
        layer.setIcon(iconStyleHighlight);
    } else {
        layer.setStyle(geoMetadata_mapLayerStyleHighlight);
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
    }
}

function resetHighlightFeature(layer, feature) {
    if (feature && feature.geometry.type === "Point" && layer.options.icon) {
        layer.setIcon(iconStyle);
    } else {
        layer.setStyle(geoMetadata_mapLayerStyleHighlight);
        // layer.resetStyle(); // e's layers is a geoJSON layer, so maybe access that function here somehow?
        layer.setStyle(geoMetadata_mapLayerStyle);
    }
}

function highlightArticleFeatures(articleId) {
    let layers = articleLayersMap.get(articleId) || [];
    layers.forEach(layer => {
        highlightFeature(layer, layer.feature);
    });
}

function resetHighlightArticleFeatures(articleId) {
    let layers = articleLayersMap.get(articleId) || [];
    layers.forEach(layer => {
        resetHighlightFeature(layer, layer.feature);
    });
}

function highlightArticle(id) {
    $('#' + id).parent().closest('div').addClass('geoMetadata_title_hover');
}

function resetHighlightArticle(id) {
    $('#' + id).parent().closest('div').removeClass('geoMetadata_title_hover');
}

var articleLayersMap = new Map();

// load spatial data
$(function () {
    if (!geoMetadata_issueMapEnabled) {
        return;
    }

    // load properties for each article from issue_details.tpl
    var spatialInputs = $('.geoMetadata_data.spatial').toArray().map(input => {
        if (input.value === "no data") {
            return { features: [] };
        }
        else {
            let geojson = JSON.parse(input.value);
            return (geojson);
        }
    });
    var articleIdInputs = $('.geoMetadata_data.articleId').toArray().map(input => {
        return (input.value);
    });
    var popupInputs = $('.geoMetadata_data.popup').toArray().map(input => {
        return (input.value);
    });

    var spatialInputsAvailable = false;

    spatialInputs.forEach((spatialProperty, index) => {
        let articleId = articleIdInputs[index];
        var features = [];

        if(spatialProperty.features.length !== 0) {
            spatialInputsAvailable = true;
            spatialProperty.features = geoMetadata_prepareFeaturesForDisplay(spatialProperty.features);

            // Array to store all layers for this article
            if (!articleLayersMap.has(articleId)) {
                articleLayersMap.set(articleId, []);
            }

            let layer = L.geoJSON(spatialProperty, {
                onEachFeature: (feature, layer) => {
                    layer.bindPopup(popupInputs[index]);
                    feature.properties['articleId'] = articleId;

                    // Store layer reference for this article
                    articleLayersMap.get(articleId).push(layer);

                    layer.on({
                        mouseover: (e) => {
                            highlightArticleFeatures(articleId);
                            highlightArticle(feature.properties.articleId);
                        },
                        mouseout: (e) => {
                            resetHighlightArticleFeatures(articleId);
                            resetHighlightArticle(feature.properties.articleId);
                        }
                    });
                    features.push(feature);
                },
                style: geoMetadata_mapLayerStyle
            });

            articleLocations.addLayer(layer);
            map.fitBounds(articleLocations.getBounds());

            // add event listener to article div for highlighting the related layer
            let articleDiv = $('#' + articleId).parent().closest('div');
            articleDiv.hover(
                (e) => {
                    highlightArticleFeatures(articleId);
                },
                (e) => {
                    resetHighlightArticleFeatures(articleId);
                }
            );
        }
    });

    if (!spatialInputsAvailable) {
        $("#mapdiv").hide();
    }
});

// aggregate time periods across articles and render the appropriate sentence
$(function () {
    var rangeEl = document.getElementById('geoMetadata_issueTemporalRange');
    var singleEl = document.getElementById('geoMetadata_issueTemporalSingle');
    if (!rangeEl || !singleEl) {
        return;
    }

    var rawValues = $('.geoMetadata_data.temporal').toArray().map(function (input) {
        return input.value;
    });
    var aggregate = window.geoMetadataTemporal.aggregateRange(rawValues);
    if (!aggregate) {
        return;
    }

    var fromYear = window.geoMetadataTemporal.yearOf(aggregate.minStart);
    var toYear = window.geoMetadataTemporal.yearOf(aggregate.maxEnd);

    if (fromYear === toYear) {
        document.getElementById('geoMetadata_issueTemporalYear').textContent = fromYear;
        singleEl.style.display = '';
    } else {
        document.getElementById('geoMetadata_issueTemporalFrom').textContent = fromYear;
        document.getElementById('geoMetadata_issueTemporalTo').textContent = toYear;
        rangeEl.style.display = '';
    }
});
