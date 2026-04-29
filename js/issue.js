/**
 * js/issue.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * @brief Display spatio-temporal metadata in the issue view.
 */

var geoMetadata_issueMapEnabled = !!document.getElementById('mapdiv');
var map, articleLocations, geoMetadata_iconStyle, geoMetadata_iconStyleHighlight;

if (geoMetadata_issueMapEnabled) {
    // Seed view; fitBounds() below overrides it once articles load.
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

    geoMetadata_iconStyle          = L.icon(geoMetadata_iconStyleConfig);
    geoMetadata_iconStyleHighlight = L.icon(geoMetadata_iconStyleHighlightConfig);
}

// highlighting features based on https://leafletjs.com/examples/choropleth/
function highlightFeature(layer, feature) {
    if (feature && feature.geometry.type === "Point" && layer.options.icon) { // only setIcon on a layer that already has one
        layer.setIcon(geoMetadata_iconStyleHighlight);
    } else {
        layer.setStyle(geoMetadata_mapLayerStyleHighlight);
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
    }
}

function resetHighlightFeature(layer, feature) {
    if (feature && feature.geometry.type === "Point" && layer.options.icon) {
        layer.setIcon(geoMetadata_iconStyle);
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

// Resolve the article-summary wrapper for a given articleId via the shared
// theme resolver (js/lib/theme_resolvers.js); cache DOM refs in articleWrapperMap
// so we don't re-walk on every hover event.
var articleWrapperMap = new Map();
function geoMetadata_wrapperFor(articleId) {
    if (articleWrapperMap.has(articleId)) return articleWrapperMap.get(articleId);
    var input = document.querySelector('.geoMetadata_data.articleId[value="' + articleId + '"]');
    var resolved = typeof geoMetadata_resolveArticleAnchor === 'function'
        ? geoMetadata_resolveArticleAnchor(input)
        : null;
    articleWrapperMap.set(articleId, resolved);
    return resolved;
}

function highlightArticle(articleId) {
    var r = geoMetadata_wrapperFor(articleId);
    if (r) r.wrapper.classList.add('geoMetadata_title_hover');
}

function resetHighlightArticle(articleId) {
    var r = geoMetadata_wrapperFor(articleId);
    if (r) r.wrapper.classList.remove('geoMetadata_title_hover');
}

// Remembers which icon opened the currently-visible popup so focus can return
// there when the popup closes (Esc / outside click / programmatic close).
var geoMetadata_lastPopupOpener = null;

function geoMetadata_openArticlePopup(articleId) {
    var layers = articleLayersMap.get(articleId) || [];
    if (!layers.length) return;
    var mapEl = document.getElementById('mapdiv');
    if (mapEl && mapEl.scrollIntoView) mapEl.scrollIntoView({ block: 'center' });
    if (geoMetadata_overlapManager) {
        geoMetadata_overlapManager.openArticle(articleId);
    } else {
        // openPopup after the scroll kicks off; Leaflet positions the popup at render
        // time, so the map's new viewport is already the reference.
        layers[0].openPopup();
    }
}

function geoMetadata_injectIcon(articleIdInput) {
    var resolved = geoMetadata_resolveArticleAnchor(articleIdInput);
    if (!resolved) return null;
    var articleId = articleIdInput.value;
    var title     = articleIdInput.getAttribute('data-title') || '';
    var srLabel   = articleIdInput.getAttribute('data-sr-label') || '';

    var link = document.createElement('a');
    link.className = 'geoMetadata_issue_mapIcon';
    link.href = '#mapdiv';
    link.setAttribute('data-article-id', articleId);
    link.setAttribute('aria-label', geoMetadata_issueMapIconAria);
    link.setAttribute('title', geoMetadata_issueMapIconAria);

    var iconEl = document.createElement('i');
    iconEl.className = 'fa fa-map';
    iconEl.setAttribute('aria-hidden', 'true');
    link.appendChild(iconEl);

    if (srLabel) {
        var sr = document.createElement('span');
        sr.className = 'pkp_screen_reader';
        sr.textContent = srLabel;
        link.appendChild(sr);
    }

    resolved.titleAnchor.insertAdjacentElement('afterend', link);
    return link;
}

var articleLayersMap = new Map();
var articlePopupMap = new Map();
var geoMetadata_overlapManager = null;

// load spatial data
$(function () {
    if (!geoMetadata_issueMapEnabled) {
        return;
    }

    // load properties for each article from issue_details.tpl
    var spatialInputs = $('.geoMetadata_data.spatial').toArray().map(input => {
        if (!input.value) return { features: [] };
        try { return JSON.parse(input.value); }
        catch (e) { return { features: [] }; }
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

            articlePopupMap.set(articleId, popupInputs[index]);

            let layer = L.geoJSON(spatialProperty, {
                pointToLayer: (feature, latlng) => L.marker(latlng, { icon: geoMetadata_iconStyle }),
                onEachFeature: (feature, layer) => {
                    if (!geoMetadata_overlapPicker) {
                        layer.bindPopup(popupInputs[index]);
                    }
                    feature.properties['articleId'] = articleId;

                    // Store layer reference for this article
                    articleLayersMap.get(articleId).push(layer);

                    features.push(feature);
                },
                style: geoMetadata_mapLayerStyle
            });

            articleLocations.addLayer(layer);
            map.fitBounds(articleLocations.getBounds());

            if (geoMetadata_showIssueMapIcon) {
                let input = document.querySelector('.geoMetadata_data.articleId[value="' + articleId + '"]');
                let link  = input ? geoMetadata_injectIcon(input) : null;
                if (link) {
                    // First on-geometry latlng for the article — used to fan
                    // out the icon-hover highlight to overlapping articles via
                    // the map mousemove path (the bounds centre would miss for
                    // irregular polylines / non-convex polygons).
                    var firstLatLngOf = function (latlngs) {
                        while (Array.isArray(latlngs) && latlngs.length) {
                            if (latlngs[0] && typeof latlngs[0].lat === 'number') return latlngs[0];
                            latlngs = latlngs[0];
                        }
                        return null;
                    };
                    var centroidFor = function () {
                        var layers = articleLayersMap.get(articleId) || [];
                        for (var i = 0; i < layers.length; i++) {
                            var layer = layers[i];
                            if (layer.getLatLng) return layer.getLatLng();
                            if (layer.getLatLngs) {
                                var ll = firstLatLngOf(layer.getLatLngs());
                                if (ll) return ll;
                            }
                        }
                        return null;
                    };
                    link.addEventListener('mouseenter', () => {
                        highlightArticleFeatures(articleId);
                        highlightArticle(articleId);
                        if (geoMetadata_enableSyncedHighlight) {
                            var ll = centroidFor();
                            if (ll) map.fire('mousemove', { latlng: ll });
                        }
                    });
                    link.addEventListener('mouseleave', () => {
                        resetHighlightArticleFeatures(articleId);
                        resetHighlightArticle(articleId);
                        if (geoMetadata_enableSyncedHighlight) map.fire('mouseout');
                    });
                    link.addEventListener('focus', () => {
                        highlightArticleFeatures(articleId);
                        highlightArticle(articleId);
                        if (geoMetadata_enableSyncedHighlight) {
                            var ll = centroidFor();
                            if (ll) map.fire('mousemove', { latlng: ll });
                        }
                    });
                    link.addEventListener('blur', () => {
                        resetHighlightArticleFeatures(articleId);
                        resetHighlightArticle(articleId);
                        if (geoMetadata_enableSyncedHighlight) map.fire('mouseout');
                    });
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        geoMetadata_lastPopupOpener = link;
                        geoMetadata_openArticlePopup(articleId);
                    });
                }
            }
        }
    });

    // Return focus to the icon that opened the popup when the popup closes.
    map.on('popupclose', function () {
        if (geoMetadata_lastPopupOpener) {
            var opener = geoMetadata_lastPopupOpener;
            geoMetadata_lastPopupOpener = null;
            opener.focus();
        }
    });

    if (!spatialInputsAvailable) {
        $("#mapdiv").hide();
        return;
    }

    // Map-level hover sync (issues #83, #159). Replaces per-layer mouseover —
    // Leaflet only fires that on the topmost layer, so overlapping articles
    // were missed. We resolve every overlapping article at the cursor with
    // geoMetadata_findOverlappingArticles and diff against the previously-lit
    // set so each tick only flips the delta.
    if (geoMetadata_enableSyncedHighlight) {
        var hoverHighlightSet = new Set();

        function applyHoverHits(hits) {
            var nextIds = new Set(hits.map(function (h) { return h.articleId; }));
            hoverHighlightSet.forEach(function (id) {
                if (!nextIds.has(id)) {
                    resetHighlightArticleFeatures(id);
                    resetHighlightArticle(id);
                }
            });
            nextIds.forEach(function (id) {
                if (!hoverHighlightSet.has(id)) {
                    highlightArticleFeatures(id);
                    highlightArticle(id);
                }
            });
            hoverHighlightSet = nextIds;
        }

        function clearHoverHighlights() {
            hoverHighlightSet.forEach(function (id) {
                resetHighlightArticleFeatures(id);
                resetHighlightArticle(id);
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

// Timeline strip on the issue TOC (issue #74). Reuses the per-article hidden inputs
// (.geoMetadata_data.temporal / .articleId / .popup) that issue_details.tpl already
// emits for the map and the temporal-coverage summary above.
$(function () {
    var container = document.getElementById('gm-issue-timelinediv');
    if (!container || typeof vis === 'undefined') return;

    var temporalInputs = $('.geoMetadata_data.temporal').toArray();
    var articleIdInputs = $('.geoMetadata_data.articleId').toArray();
    var popupInputs    = $('.geoMetadata_data.popup').toArray();

    function extractUrl(popupHtml) {
        if (!popupHtml) return null;
        var m = /href=["']([^"']+)["']/.exec(popupHtml);
        return m ? m[1] : null;
    }

    var items = [];
    temporalInputs.forEach(function (input, index) {
        var ranges = window.geoMetadataTemporal.parseTimePeriods(input.value);
        if (!ranges.length) return;
        var articleIdInput = articleIdInputs[index];
        if (!articleIdInput) return;
        var articleId = articleIdInput.value;
        var title = articleIdInput.getAttribute('data-title') || articleId;
        var url = extractUrl(popupInputs[index] ? popupInputs[index].value : null);

        ranges.forEach(function (range, i) {
            var start = window.geoMetadataTemporal.toVisDate(range.start, false);
            var end   = window.geoMetadataTemporal.toVisDate(range.end, true);
            if (!start || !end) return;
            items.push({
                id: articleId + '-' + i,
                start: start,
                end: end,
                content: title,
                title: title,
                className: 'gm-timeline-item',
                _url: url,
                _articleId: articleId
            });
        });
    });

    if (items.length === 0) {
        container.style.display = 'none';
        return;
    }

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
        if (item && item._url) window.location = item._url;
    });

    // Hover sync from timeline → article list + map (one-direction, issue #74).
    // A hover on a cluster bubble highlights every member article in both views.
    function itemById(id) { return items.find(function (it) { return it.id === id; }); }
    function memberArticleIds(itemId) {
        var leaf = itemById(itemId);
        if (leaf) return [leaf._articleId];
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
                    return l ? l._articleId : null;
                }).filter(function (x) { return !!x; });
                return Array.from(new Set(ids));
            }
            return [];
        } catch (err) { return []; }
    }
    timeline.on('itemover', function (e) {
        memberArticleIds(e.item).forEach(function (aid) {
            if (typeof highlightArticle === 'function') highlightArticle(aid);
            if (typeof highlightArticleFeatures === 'function') highlightArticleFeatures(aid);
        });
    });
    timeline.on('itemout', function (e) {
        memberArticleIds(e.item).forEach(function (aid) {
            if (typeof resetHighlightArticle === 'function') resetHighlightArticle(aid);
            if (typeof resetHighlightArticleFeatures === 'function') resetHighlightArticleFeatures(aid);
        });
    });
});

// Collapse / expand the timeline strip on the issue page (issue #74).
$(function () {
    var section = document.getElementById('geoMetadata_issueTimeline');
    if (!section) return;
    var link = section.querySelector('.geoMetadata_timelineCollapseLink');
    var body = document.getElementById('geoMetadata_issueTimelineBody');
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
