{**
 * templates/frontend/_map_js_globals.tpl
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * @brief Shared JS globals for every map rendered by the plugin.
 *
 * Include once per page that renders a #mapdiv, BEFORE the main plugin JS.
 * Centralises all `const geoMetadata_*` declarations so translations and
 * style constants live in a single place (was duplicated across 5 templates).
 *
 * Template-specific variables (e.g. $geoMetadata_markerBaseUrl,
 * $geoMetadata_articleBaseUrl) stay in the calling template because they
 * are populated from per-request Smarty context, not from {translate}.
 *
 * Translations come in via `$geoMetadata_i18n` (assigned in GeoMetadataPlugin::display).
 * Each value is piped through |escape:'javascript' so a translation containing a
 * literal apostrophe (e.g. fr_FR "Annuler l'édition, …") cannot close the surrounding
 * JS string literal. We cannot chain modifiers off `{translate key="…"}` directly
 * because `{translate}` is a Smarty function tag, not a variable — the modifier would
 * bind to the `key` parameter instead of the output.
 *}
<script type="text/javascript">
// Antimeridian helpers (issue #60). Split happens PHP-side on save; these run on
// the read path to keep legacy pre-fix single-Polygon / single-LineString records
// rendering correctly, and on the write path to keep Leaflet's post-drag lngs
// (which may exceed ±180) in range before the hidden form is submitted.
function geoMetadata_normalizeLng(lng) {
    if (lng >= -180 && lng <= 180) return lng;
    var x = ((lng + 180) % 360 + 360) % 360;
    if (x === 0) x = 360;
    return x - 180;
}
function geoMetadata_splitLine(coords) {
    if (!Array.isArray(coords) || coords.length < 2) {
        if (coords && coords[0] !== undefined) {
            coords[0][0] = geoMetadata_normalizeLng(coords[0][0]);
        }
        return [coords];
    }
    var pts = coords.map(function (p) { return [geoMetadata_normalizeLng(p[0]), p[1]]; });
    var parts = [];
    var current = [pts[0]];
    for (var i = 1; i < pts.length; i++) {
        var a = pts[i - 1], b = pts[i];
        var dLng = b[0] - a[0];
        if (Math.abs(dLng) > 180) {
            var lngSign = a[0] >= 0 ? 180 : -180;
            var unwrappedB = b[0] + (dLng > 0 ? -360 : 360);
            var span = unwrappedB - a[0];
            var frac = span === 0 ? 0.5 : (lngSign - a[0]) / span;
            var lat = a[1] + (b[1] - a[1]) * frac;
            current.push([lngSign, lat]);
            parts.push(current);
            current = [[-lngSign, lat], b];
        } else {
            current.push(b);
        }
    }
    parts.push(current);
    return parts;
}
function geoMetadata_splitRings(polyCoords) {
    if (!polyCoords || !polyCoords[0]) return null;
    var parts = geoMetadata_splitLine(polyCoords[0]);
    if (parts.length === 1) return [parts[0]];
    if (parts.length < 3 || parts.length % 2 === 0) return null;
    var head = parts[0];
    var tail = parts[parts.length - 1];
    var merged = tail.concat(head.slice(1));
    merged.push(merged[0]);
    var rings = [merged];
    for (var i = 1; i < parts.length - 1; i++) {
        var r = parts[i];
        r.push(r[0]);
        rings.push(r);
    }
    return rings;
}
function geoMetadata_splitLegacyPolygonForDisplay(feature) {
    if (!feature || !feature.geometry) return feature;
    var g = feature.geometry;
    if (g.type === 'Point' && Array.isArray(g.coordinates)) {
        g.coordinates[0] = geoMetadata_normalizeLng(g.coordinates[0]);
    } else if (g.type === 'LineString') {
        var parts = geoMetadata_splitLine(g.coordinates);
        if (parts.length > 1) {
            g.type = 'MultiLineString';
            g.coordinates = parts;
        } else {
            g.coordinates = parts[0];
        }
    } else if (g.type === 'Polygon') {
        var rings = geoMetadata_splitRings(g.coordinates);
        if (rings !== null && rings.length > 1) {
            g.type = 'MultiPolygon';
            g.coordinates = rings.map(function (r) { return [r]; });
        }
    }
    return feature;
}

// Split Multi* geometries have parts sitting at lng~180 and lng~-180. Leaflet
// renders each part at its raw longitude, so the two halves appear at opposite
// edges of the world map with ~340° of empty world between them. For display,
// shift negative longitudes by +360 on features that clearly straddle ±180
// (i.e. have vertices exactly on both +180 and -180 — the splitter's signature)
// so the combined shape renders as a single contiguous region crossing the
// dateline. Stored GeoJSON is untouched (mutation is in-memory before L.geoJSON).
function geoMetadata_unwrapForDisplay(feature) {
    if (!feature || !feature.geometry) return feature;
    var g = feature.geometry;
    if (g.type !== 'MultiPolygon' && g.type !== 'MultiLineString') return feature;
    var hasPos180 = false, hasNeg180 = false;
    (function walk(a) {
        for (var i = 0; i < a.length; i++) {
            var it = a[i];
            if (Array.isArray(it) && typeof it[0] === 'number') {
                if (it[0] === 180) hasPos180 = true;
                else if (it[0] === -180) hasNeg180 = true;
            } else if (Array.isArray(it)) {
                walk(it);
            }
        }
    })(g.coordinates);
    if (!hasPos180 || !hasNeg180) return feature;
    g.coordinates = (function unwrap(a) {
        return a.map(function (it) {
            if (Array.isArray(it) && typeof it[0] === 'number') {
                return [it[0] < 0 ? it[0] + 360 : it[0], it[1]];
            }
            return unwrap(it);
        });
    })(g.coordinates);
    return feature;
}

function geoMetadata_prepareFeaturesForDisplay(features) {
    return features.map(geoMetadata_splitLegacyPolygonForDisplay).map(geoMetadata_unwrapForDisplay);
}

// map style (shared by article_details.js, issue.js, journal.js)
const geoMetadata_mapLayerStyle = {
    weight: 5,
    color: '#1E6292',
    dashArray: '',
    fillOpacity: 0.6
};
const geoMetadata_mapLayerStyleHighlight = {
    weight: 5,
    color: 'red',
    dashArray: '',
    fillOpacity: 0.6
};

// issue #124: base-layer toggle from plugin settings
const geoMetadata_showEsriBaseLayer = {if $geoMetadata_showEsriBaseLayer}true{else}false{/if};
const geoMetadata_showGeocoder      = {if $geoMetadata_showGeocoder}true{else}false{/if};

// layer switcher labels
const geoMetadata_articleLayerName = '{$geoMetadata_i18n.articleLayerName|escape:'javascript'}';
const geoMetadata_layerName        = geoMetadata_articleLayerName; // legacy alias used by issue.js / journal.js
const geoMetadata_adminLayerName   = '{$geoMetadata_i18n.adminLayerName|escape:'javascript'}';
const geoMetadata_overlayGeometry  = '{$geoMetadata_i18n.overlayGeometry|escape:'javascript'}';
const geoMetadata_overlayAdminUnit = '{$geoMetadata_i18n.overlayAdminUnit|escape:'javascript'}';

// fullscreen control (issue #61)
const geoMetadata_fullscreenTitle       = '{$geoMetadata_i18n.fullscreenTitle|escape:'javascript'}';
const geoMetadata_fullscreenTitleCancel = '{$geoMetadata_i18n.fullscreenTitleCancel|escape:'javascript'}';

// zoom control tooltips (issue #151)
const geoMetadata_zoomInTitle  = '{$geoMetadata_i18n.zoomInTitle|escape:'javascript'}';
const geoMetadata_zoomOutTitle = '{$geoMetadata_i18n.zoomOutTitle|escape:'javascript'}';

// geocoder (issue #151)
const geoMetadata_geocoderPlaceholder = '{$geoMetadata_i18n.geocoderPlaceholder|escape:'javascript'}';
const geoMetadata_geocoderError       = '{$geoMetadata_i18n.geocoderError|escape:'javascript'}';
const geoMetadata_geocoderButtonTitle = '{$geoMetadata_i18n.geocoderButtonTitle|escape:'javascript'}';

// Leaflet.Draw toolbar (issue #111) — deep-merged into L.drawLocal at runtime
const geoMetadata_drawLocal = {
    draw: {
        toolbar: {
            actions: {
                title: '{$geoMetadata_i18n.drawActionCancelTitle|escape:'javascript'}',
                text:  '{$geoMetadata_i18n.drawActionCancel|escape:'javascript'}'
            },
            finish: {
                title: '{$geoMetadata_i18n.drawFinishTitle|escape:'javascript'}',
                text:  '{$geoMetadata_i18n.drawFinish|escape:'javascript'}'
            },
            undo: {
                title: '{$geoMetadata_i18n.drawUndoTitle|escape:'javascript'}',
                text:  '{$geoMetadata_i18n.drawUndo|escape:'javascript'}'
            },
            buttons: {
                polyline:  '{$geoMetadata_i18n.drawPolyline|escape:'javascript'}',
                polygon:   '{$geoMetadata_i18n.drawPolygon|escape:'javascript'}',
                rectangle: '{$geoMetadata_i18n.drawRectangle|escape:'javascript'}',
                marker:    '{$geoMetadata_i18n.drawMarker|escape:'javascript'}'
            }
        },
        handlers: {
            marker:    { tooltip: { start: '{$geoMetadata_i18n.drawMarkerTipStart|escape:'javascript'}' } },
            polygon:   { tooltip: {
                start: '{$geoMetadata_i18n.drawPolygonTipStart|escape:'javascript'}',
                cont:  '{$geoMetadata_i18n.drawPolygonTipCont|escape:'javascript'}',
                end:   '{$geoMetadata_i18n.drawPolygonTipEnd|escape:'javascript'}'
            } },
            polyline:  { tooltip: {
                start: '{$geoMetadata_i18n.drawPolylineTipStart|escape:'javascript'}',
                cont:  '{$geoMetadata_i18n.drawPolylineTipCont|escape:'javascript'}',
                end:   '{$geoMetadata_i18n.drawPolylineTipEnd|escape:'javascript'}'
            } },
            rectangle: { tooltip: { start: '{$geoMetadata_i18n.drawRectangleTipStart|escape:'javascript'}' } },
            simpleshape: { tooltip: { end: '{$geoMetadata_i18n.drawSimpleshapeTipEnd|escape:'javascript'}' } }
        }
    },
    edit: {
        toolbar: {
            actions: {
                save: {
                    title: '{$geoMetadata_i18n.editSaveTitle|escape:'javascript'}',
                    text:  '{$geoMetadata_i18n.editSave|escape:'javascript'}'
                },
                cancel: {
                    title: '{$geoMetadata_i18n.editCancelTitle|escape:'javascript'}',
                    text:  '{$geoMetadata_i18n.editCancel|escape:'javascript'}'
                },
                clearAll: {
                    title: '{$geoMetadata_i18n.editClearAllTitle|escape:'javascript'}',
                    text:  '{$geoMetadata_i18n.editClearAll|escape:'javascript'}'
                }
            },
            buttons: {
                edit:           '{$geoMetadata_i18n.editEdit|escape:'javascript'}',
                editDisabled:   '{$geoMetadata_i18n.editEditDisabled|escape:'javascript'}',
                remove:         '{$geoMetadata_i18n.editRemove|escape:'javascript'}',
                removeDisabled: '{$geoMetadata_i18n.editRemoveDisabled|escape:'javascript'}'
            }
        },
        handlers: {
            edit:   { tooltip: {
                text:    '{$geoMetadata_i18n.editHandlerText|escape:'javascript'}',
                subtext: '{$geoMetadata_i18n.editHandlerSubtext|escape:'javascript'}'
            } },
            remove: { tooltip: { text: '{$geoMetadata_i18n.editRemoveHandlerText|escape:'javascript'}' } }
        }
    }
};
</script>
