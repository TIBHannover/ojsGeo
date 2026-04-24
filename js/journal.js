/**
 * js/journal.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 * 
 * @brief Display spatio-temporal metadata for a whole journal on a separate page.
 */

var mapView = "0, 0, 1".split(",");
var map = L.map('mapdiv', { zoomControl: false, worldCopyJump: true }).setView([mapView[0], mapView[1]], mapView[2]);

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

// add fullscreen control
L.control.fullscreen({
    position: 'topleft',
    title: geoMetadata_fullscreenTitle,
    titleCancel: geoMetadata_fullscreenTitleCancel
}).addTo(map);

// FeatureGroup for the geospatial extent of articles
var articleLocations = new L.FeatureGroup();
map.addLayer(articleLocations);

var overlayMaps = {
    [geoMetadata_layerName]: articleLocations,
};

// add layerControl to the map to the map 
L.control.layers(baseLayers, overlayMaps).addTo(map);

// load spatial data
$(function () {
    // load properties for each article from issue_map.tpl
    var data = JSON.parse($('.geoMetadata_data.publications')[0].value);
    
    data.forEach((publication, index) => {
        let submissionId = publication['submissionId'];
        
        if (publication['spatial'] != null) {
            let spatialParsed = JSON.parse(publication['spatial']);

            if(spatialParsed.features.length !== 0) {
                spatialParsed.features = geoMetadata_prepareFeaturesForDisplay(spatialParsed.features);
                let articleTitle = publication['title'];
                let articleAuthors = publication['authors'];
                let articleIssue = publication['issue'];
                let articleTemporal = publication ['temporal'];
                let articleAdministrativeUnit = publication['coverage'];

                // popup content roughly based on issue_details.tpl
                let popupTemplate = `<h2 class="title">
                    <a id="submission-${submissionId}" class="geoMetadata_journal_maplink" href="${geoMetadata_articleBaseUrl}/${submissionId}">${articleTitle}</a>
                    </h2>
                    <br/>
                    <div class="authors">
                        ${articleAuthors}
                    </div>
                    <div class="authors">
                        ${articleIssue}
                    </div>`

                let ranges = window.geoMetadataTemporal.parseTimePeriods(articleTemporal);
                if (ranges.length > 0) {
                    let popupTemporal = `<br/>
                    <div class="authors">
                        <i class="fa fa-calendar pkpIcon--inline"></i>
                        <i>${ranges[0].start} – ${ranges[0].end}</i>
                    </div>`

                    popupTemplate = popupTemplate.concat(popupTemporal);
                }

                if (articleAdministrativeUnit !== "no data" && articleAdministrativeUnit !== null) {
                    let popupAdministrativeUnit = `<br/>
                    <div class="authors"> 
                        <i class="fa fa-map-marker pkpIcon--inline"></i>
                        <i>${articleAdministrativeUnit}</i>
                    </div>`

                    popupTemplate = popupTemplate.concat(popupAdministrativeUnit);
                }

                let layer = L.geoJSON(spatialParsed, {
                    onEachFeature: (feature, layer) => {
                        layer.bindPopup(`${popupTemplate}`);
                    },
                    style: geoMetadata_mapLayerStyle,
                    submissionId: submissionId
                });
                articleLocations.addLayer(layer);
                map.fitBounds(articleLocations.getBounds());
            }
        }
        // TODO load temporal properties and add them to a timeline
    });
});

// aggregate time periods across publications and render the appropriate sentence
$(function () {
    var rangeEl = document.getElementById('geoMetadata_journalTemporalRange');
    var singleEl = document.getElementById('geoMetadata_journalTemporalSingle');
    if (!rangeEl || !singleEl) return;

    var data = JSON.parse($('.geoMetadata_data.publications')[0].value);
    var rawValues = data.map(function (p) { return p.temporal; });
    var aggregate = window.geoMetadataTemporal.aggregateRange(rawValues);
    if (!aggregate) return;

    var fromYear = window.geoMetadataTemporal.yearOf(aggregate.minStart);
    var toYear = window.geoMetadataTemporal.yearOf(aggregate.maxEnd);

    if (fromYear === toYear) {
        document.getElementById('geoMetadata_journalTemporalYear').textContent = fromYear;
        singleEl.style.display = '';
    } else {
        document.getElementById('geoMetadata_journalTemporalFrom').textContent = fromYear;
        document.getElementById('geoMetadata_journalTemporalTo').textContent = toYear;
        rangeEl.style.display = '';
    }
});
