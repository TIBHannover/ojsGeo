/**
 * js/journal.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 * 
 * @brief Display spatio-temporal metadata for a whole journal on a separate page.
 */

// Map setup runs only when #mapdiv is in the DOM (issue #74: the journal map
// can now be disabled while the timeline strip remains).
var map = null;
var articleLocations = null;
var articleLayersMap = new Map();
var articlePopupMap  = new Map();
var geoMetadata_overlapManager = null;
var geoMetadata_iconStyle          = (typeof L !== 'undefined') ? L.icon(geoMetadata_iconStyleConfig) : null;
var geoMetadata_iconStyleHighlight = (typeof L !== 'undefined') ? L.icon(geoMetadata_iconStyleHighlightConfig) : null;

if (document.getElementById('mapdiv')) {
    var mapView = "0, 0, 1".split(",");
    map = L.map('mapdiv', { zoomControl: false, worldCopyJump: true }).setView([mapView[0], mapView[1]], mapView[2]);

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
}

function highlightFeature(layer, feature) {
    if (feature && feature.geometry.type === 'Point' && layer.options.icon) {
        layer.setIcon(geoMetadata_iconStyleHighlight);
    } else {
        layer.setStyle(geoMetadata_mapLayerStyleHighlight);
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) layer.bringToFront();
    }
}
function resetHighlightFeature(layer, feature) {
    if (feature && feature.geometry.type === 'Point' && layer.options.icon) {
        layer.setIcon(geoMetadata_iconStyle);
    } else {
        layer.setStyle(geoMetadata_mapLayerStyle);
    }
}
function highlightArticleFeatures(articleId) {
    (articleLayersMap.get(articleId) || []).forEach(function (layer) {
        highlightFeature(layer, layer.feature);
    });
}
function resetHighlightArticleFeatures(articleId) {
    (articleLayersMap.get(articleId) || []).forEach(function (layer) {
        resetHighlightFeature(layer, layer.feature);
    });
}

if (map) {
    var overlayMaps = {
        [geoMetadata_layerName]: articleLocations,
    };
    L.control.layers(baseLayers, overlayMaps).addTo(map);
}

// load spatial data
$(function () {
    if (!map) return;
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

                articlePopupMap.set(submissionId, popupTemplate);
                if (!articleLayersMap.has(submissionId)) articleLayersMap.set(submissionId, []);

                let layer = L.geoJSON(spatialParsed, {
                    pointToLayer: (feature, latlng) => L.marker(latlng, { icon: geoMetadata_iconStyle }),
                    onEachFeature: (feature, layer) => {
                        if (!geoMetadata_overlapPicker) {
                            layer.bindPopup(`${popupTemplate}`);
                        }
                        feature.properties = feature.properties || {};
                        feature.properties.articleId = submissionId;
                        articleLayersMap.get(submissionId).push(layer);
                    },
                    style: geoMetadata_mapLayerStyle,
                    submissionId: submissionId
                });
                articleLocations.addLayer(layer);
                map.fitBounds(articleLocations.getBounds());
            }
        }
    });

    // Map-level hover sync (issues #83, #159). Replaces per-layer mouseover —
    // Leaflet only fires that on the topmost layer, so overlapping articles
    // were missed.
    if (geoMetadata_enableSyncedHighlight) {
        var hoverHighlightSet = new Set();

        function applyHoverHits(hits) {
            var nextIds = new Set(hits.map(function (h) { return h.articleId; }));
            hoverHighlightSet.forEach(function (id) {
                if (!nextIds.has(id)) resetHighlightArticleFeatures(id);
            });
            nextIds.forEach(function (id) {
                if (!hoverHighlightSet.has(id)) highlightArticleFeatures(id);
            });
            hoverHighlightSet = nextIds;
        }

        function clearHoverHighlights() {
            hoverHighlightSet.forEach(function (id) {
                resetHighlightArticleFeatures(id);
            });
            hoverHighlightSet = new Set();
        }

        map.on('mousemove', function (e) {
            applyHoverHits(geoMetadata_findOverlappingArticles(map, articleLayersMap, e.latlng));
        });
        map.on('mouseout', clearHoverHighlights);
    }

    if (geoMetadata_overlapPicker) {
        geoMetadata_overlapManager = geoMetadata_createOverlapManager(map, {
            articleLayersMap: articleLayersMap,
            getArticleMeta: function (id) {
                return { popupHtml: articlePopupMap.get(id), layers: articleLayersMap.get(id) || [] };
            },
            highlight:      highlightArticleFeatures,
            resetHighlight: resetHighlightArticleFeatures,
            i18n: {
                overlapPrevTitle: geoMetadata_overlapPrevTitle,
                overlapNextTitle: geoMetadata_overlapNextTitle,
                overlapCounter:   geoMetadata_overlapCounter
            }
        });
    }

    setTimeout(function () {
        L.control.geoMetadataResetView({ position: 'topleft', title: geoMetadata_resetViewTitle }).addTo(map);
    }, 0);
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

// Timeline strip (issue #74). Renders below the map only when #gm-timelinediv is in the
// DOM (i.e. the showJournalTimeline toggle is on). Reuses the same hidden-input data the
// map already consumes; filters out articles whose temporal field is empty.
$(function () {
    var container = document.getElementById('gm-timelinediv');
    if (!container || typeof vis === 'undefined') return;

    var data = JSON.parse($('.geoMetadata_data.publications')[0].value);
    var items = [];
    data.forEach(function (publication) {
        var ranges = window.geoMetadataTemporal.parseTimePeriods(publication.temporal);
        ranges.forEach(function (range, i) {
            var start = window.geoMetadataTemporal.toVisDate(range.start, false);
            var end   = window.geoMetadataTemporal.toVisDate(range.end, true);
            if (!start || !end) return;
            items.push({
                id: publication.submissionId + '-' + i,
                start: start,
                end: end,
                content: publication.title,
                title: publication.title + ' — ' + publication.authors + (publication.issue ? ' (' + publication.issue + ')' : ''),
                className: 'gm-timeline-item',
                _submissionId: publication.submissionId
            });
        });
    });

    if (items.length === 0) {
        container.style.display = 'none';
        return;
    }

    // Clamp panning to the data bounds. Lexicographic compare on expanded-year ISO
    // strings is wrong for BCE (more-negative year = earlier, but `-000500` sorts
    // before `-008000` as text). Compare on the parsed year number instead.
    function startYear(s) { return parseInt(String(s).replace(/^[+-]?0*/, '') || '0', 10) * (String(s).startsWith('-') ? -1 : 1); }
    var bounds = items.reduce(function (acc, it) {
        var sy = startYear(it.start), ey = startYear(it.end);
        return {
            min: acc.min === null || sy < acc.minY ? it.start : acc.min,
            minY: acc.minY === null || sy < acc.minY ? sy : acc.minY,
            max: acc.max === null || ey > acc.maxY ? it.end : acc.max,
            maxY: acc.maxY === null || ey > acc.maxY ? ey : acc.maxY
        };
    }, { min: null, minY: null, max: null, maxY: null });

    window.geoMetadata_journalTimelineItems = items;
    var timeline = new vis.Timeline(container, items, {
        cluster: {
            maxItems: typeof geoMetadata_timelineClusterMaxItems !== 'undefined'
                ? Number(geoMetadata_timelineClusterMaxItems) : 1,
            titleTemplate: '{count} articles'
        },
        zoomMin: 1000 * 60 * 60 * 24 * 2,
        min: bounds.min,
        max: bounds.max,
        stack: true,
        selectable: true,
        margin: { item: 6, axis: 8 }
    });
    timeline.on('select', function (e) {
        if (!e.items || !e.items.length) return;
        var item = items.find(function (it) { return it.id === e.items[0]; });
        if (item) window.location = geoMetadata_articleBaseUrl + '/' + item._submissionId;
    });

    // Hover sync from timeline → journal map (one-direction, issue #74). The
    // journal page has no article-summary list, so only the geometries are highlighted.
    // A hover on a cluster bubble highlights every member article's geometry.
    function itemById(id) { return items.find(function (it) { return it.id === id; }); }
    function memberSubmissionIds(itemId) {
        var leaf = itemById(itemId);
        if (leaf) return [leaf._submissionId];
        // vis-timeline cluster path: itemSet.clusters is an array of Cluster objects;
        // match on .id (vis-timeline assigns a UUID), read .data.uiItems for leaves.
        try {
            var clusters = timeline && timeline.itemSet && timeline.itemSet.clusters;
            if (!clusters || !clusters.length) return [];
            for (var i = 0; i < clusters.length; i++) {
                if (clusters[i].id !== itemId) continue;
                var ui = clusters[i].data && clusters[i].data.uiItems;
                if (!ui) return [];
                var ids = ui.map(function (u) {
                    var l = itemById(u.id);
                    return l ? l._submissionId : null;
                }).filter(function (x) { return x !== null && x !== undefined; });
                return Array.from(new Set(ids));
            }
            return [];
        } catch (err) { return []; }
    }
    timeline.on('itemover', function (e) {
        if (typeof highlightArticleFeatures !== 'function') return;
        memberSubmissionIds(e.item).forEach(highlightArticleFeatures);
    });
    timeline.on('itemout', function (e) {
        if (typeof resetHighlightArticleFeatures !== 'function') return;
        memberSubmissionIds(e.item).forEach(resetHighlightArticleFeatures);
    });
});

// Collapse / expand the timeline strip (issue #74).
$(function () {
    var section = document.getElementById('geoMetadata_journalTimeline');
    if (!section) return;
    var link = section.querySelector('.geoMetadata_timelineCollapseLink');
    var body = document.getElementById('geoMetadata_journalTimelineBody');
    if (!link || !body) return;
    link.addEventListener('click', function (e) {
        e.preventDefault();
        var collapsed = body.style.display === 'none';
        body.style.display = collapsed ? '' : 'none';
        link.setAttribute('aria-expanded', collapsed ? 'true' : 'false');
        link.querySelector('.geoMetadata_timelineCollapseIcon').innerHTML =
            collapsed ? '▼' : '▶';
        link.querySelector('.geoMetadata_timelineCollapseLabel').textContent =
            collapsed ? geoMetadata_timelineCollapseHideLabel : geoMetadata_timelineCollapseShowLabel;
    });
});
