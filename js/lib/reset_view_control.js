/**
 * js/lib/reset_view_control.js
 *
 * Copyright (c) 2026 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * @brief Leaflet control that snapshots the map's {center, zoom} ONCE the map
 *        has settled into its post-init view, and restores that view on click.
 *
 *        Plugin maps fire several fitBounds() calls during their init phase
 *        (one per article layer added on the issue/journal map, the admin-unit
 *        overlay attach, the timeline-feature sync). The control therefore
 *        listens for `moveend` for a short post-onAdd window and updates the
 *        snapshot on every settle within that window — so the captured view
 *        is the POST-ASYNC-FITBOUNDS view, not the very first paint.
 *
 *        After the window closes (and on any user-driven pan/zoom in the
 *        meantime), the snapshot is frozen. Call sites can also defer onAdd
 *        with a setTimeout(0) for the same reason; both belt and braces.
 */

L.Control.GeoMetadataResetView = L.Control.extend({
    options: {
        position: 'topleft',
        title: 'Reset view',
        // Tracking window (ms) during which moveend events refresh the
        // snapshot. Long enough to absorb async fitBounds calls from layer
        // hydration; short enough that a quick user pan is still captured
        // as their intent rather than overwritten.
        captureWindowMs: 2500
    },
    onAdd: function (map) {
        var self = this;
        self._initialCenter = map.getCenter();
        self._initialZoom   = map.getZoom();
        self._captureFrozen = false;
        map._geoMetadataResetView = self;

        // Snapshot strategy: refresh on every moveend until 500 ms elapse
        // with no moveend (the map has gone quiet), or until captureWindowMs
        // hard-cap, whichever comes first. That converges on the
        // post-async-fitBounds view without overwriting it on later
        // user-initiated panning.
        var quietTimer = null;
        function refreshSnapshot() {
            if (self._captureFrozen) return;
            self._initialCenter = map.getCenter();
            self._initialZoom   = map.getZoom();
            clearTimeout(quietTimer);
            quietTimer = setTimeout(freezeSnapshot, 500);
        }
        function freezeSnapshot() {
            self._captureFrozen = true;
            clearTimeout(quietTimer);
            map.off('moveend', refreshSnapshot);
        }
        map.on('moveend', refreshSnapshot);
        // Hard cap: even if moveend keeps firing, lock the snapshot after
        // the window so a user that pans early can't keep moving it.
        setTimeout(freezeSnapshot, self.options.captureWindowMs);

        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        var link      = L.DomUtil.create('a', 'leaflet-control-geoMetadataResetView', container);
        link.href  = '#';
        link.title = self.options.title;
        link.setAttribute('aria-label', self.options.title);
        link.innerHTML = '<i class="fa fa-home" aria-hidden="true"></i>';
        L.DomEvent.on(link, 'click', function (e) {
            L.DomEvent.preventDefault(e);
            L.DomEvent.stopPropagation(e);
            // The user has explicitly opted into the saved view — freeze
            // future moveend updates so a user pan after this doesn't
            // overwrite the snapshot.
            freezeSnapshot();
            map.setView(self._initialCenter, self._initialZoom, { animate: false });
        });
        L.DomEvent.disableClickPropagation(container);
        return container;
    }
});

L.control.geoMetadataResetView = function (opts) {
    return new L.Control.GeoMetadataResetView(opts);
};
