/**
 * 
 * js/journal.js
 *
 * Copyright (c) 2022 OPTIMETA project
 * Copyright (c) 2022 Daniel Nüst
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 * 
 * @brief Display spatio-temporal metadata for a whole journal on a separate page.
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

L.control.scale({ position: 'bottomright' }).addTo(map);

// FeatureGroup for the geospatial extent of articles
var articleLocations = new L.FeatureGroup();
map.addLayer(articleLocations);

var overlayMaps = {
    [optimetageo_layerName]: articleLocations,
};

// add layerControl to the map to the map 
L.control.layers(baseLayers, overlayMaps).addTo(map);

// load spatial data
$(function () {
    // load properties for each article from issue_map.tpl
    var data = JSON.parse($('.optimeta_data.publications')[0].value);

    data.forEach((publication, index) => {
        let articleId = publication['id'];
        let spatialParsed = JSON.parse(publication['spatial']);

        let articleTitle = publication['title'];
        let articleAuthors = publication['authors'];
        let articleIssue = publication['issue'];
        // popup content roughly based on issue_details.tpl
        const popupTemplate = `<h2 class="title">
            <a id="article-${articleId}" href="${optimetageo_articleBaseUrl}/${articleId}">${articleTitle}</a>
            </h2>
            <br/>
            <div class="authors">
                ${articleAuthors}
            </div>
            <div class="authors">
                ${articleIssue}
            </div>`

        let layer = L.geoJSON(spatialParsed, {
            onEachFeature: (feature, layer) => {
                layer.bindPopup(`${popupTemplate}`);
            },
            style: optimetageo_mapLayerStyle,
            articleId: articleId
        });
        articleLocations.addLayer(layer);
        map.fitBounds(articleLocations.getBounds());

        // TODO load temporal properties and add them to a timeline
    });
});
