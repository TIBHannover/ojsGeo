/**
 * @file cypress/support/geonames-stubs.js
 *
 * Copyright (c) 2026 KOMET project, OPTIMETA project, Daniel Nüst
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * Stubs the GeoNames REST API the plugin calls from submission.js so specs
 * that depend on a working gazetteer (32-submission, 43-search, 72-…) don't
 * burn through the daily quota and don't flake when GeoNames is unreachable.
 *
 * The plugin uses `$.ajax({ async: false, ... })`. Cypress's cy.intercept()
 * is unreliable for synchronous XHRs (it can deadlock the test runner), so
 * this stubs the page's jQuery.ajax wrapper directly via a window:before:load
 * hook. The override runs synchronously, invokes `opts.success`/`opts.error`
 * before returning, and falls through to the real ajax for any URL that
 * doesn't match a GeoNames endpoint — so non-GeoNames XHRs are unaffected.
 *
 * Endpoints stubbed (matched by path under the configured base URL):
 *   /searchJSON?name_equals=…             — text search
 *   /hierarchyJSON?lat=…&lng=…           — coordinate → ancestry chain
 *   /hierarchyJSON?geonameId=…           — geonameId → ancestry chain
 *   /getJSON?geonameId=…                 — single record (used for bbox lookup)
 *   /countrySubdivisionJSON?lat=&lng=    — ISO 3166-2 subdivision
 *
 * Modes:
 *   'happy'    — return canonical fixture data (BC by default; switchable)
 *   'quota'    — return the GeoNames quota envelope on every endpoint
 *   'auth'     — invalid-credentials envelope
 *   'network'  — invoke opts.error to simulate a network failure
 */

const HIERARCHIES = {
    earthCanadaBC: {
        geonames: [
            { name: 'Earth',                     asciiName: 'Earth',                     geonameId: 6295630, fcl: 'L', fcode: 'AREA', countryCode: '' },
            { name: 'Canada',                    asciiName: 'Canada',                    geonameId: 6251999, fcl: 'A', fcode: 'PCLI', countryCode: 'CA' },
            { name: 'British Columbia',          asciiName: 'British Columbia',          geonameId: 5909050, fcl: 'A', fcode: 'ADM1', countryCode: 'CA' },
            { name: 'Cariboo Regional District', asciiName: 'Cariboo Regional District', geonameId: 5912018, fcl: 'A', fcode: 'ADM2', countryCode: 'CA' },
        ],
    },
    earthCanada: {
        geonames: [
            { name: 'Earth',  asciiName: 'Earth',  geonameId: 6295630, fcl: 'L', fcode: 'AREA', countryCode: '' },
            { name: 'Canada', asciiName: 'Canada', geonameId: 6251999, fcl: 'A', fcode: 'PCLI', countryCode: 'CA' },
        ],
    },
    earthEuropeSweden: {
        geonames: [
            { name: 'Earth',             asciiName: 'Earth',             geonameId: 6295630, fcl: 'L', fcode: 'AREA', countryCode: '' },
            { name: 'Europe',            asciiName: 'Europe',            geonameId: 6255148, fcl: 'L', fcode: 'CONT', countryCode: '' },
            { name: 'Kingdom of Sweden', asciiName: 'Kingdom of Sweden', geonameId: 2661886, fcl: 'A', fcode: 'PCLI', countryCode: 'SE' },
            { name: 'Vasterbotten',      asciiName: 'Vaesterbotten',     geonameId:  605407, fcl: 'A', fcode: 'ADM1', countryCode: 'SE' },
        ],
    },
};

const SEARCH_FIXTURES = {
    Sweden:        { totalResultsCount: 1, geonames: [HIERARCHIES.earthEuropeSweden.geonames[2]] },
    Vaesterbotten: { totalResultsCount: 1, geonames: [HIERARCHIES.earthEuropeSweden.geonames[3]] },
    'Münster':     { totalResultsCount: 1, geonames: [{ name: 'Münster', asciiName: 'Muenster', geonameId: 2867543, countryCode: 'DE' }] },
};

const ENVELOPES = {
    quota: { status: { value: 19, message: 'the daily limit of 20000 credits has been exceeded' } },
    auth:  { status: { value: 10, message: 'user does not exist' } },
};

const HIERARCHY_BY_GEONAME_ID = (() => {
    const m = new Map();
    for (const key of Object.keys(HIERARCHIES)) {
        for (const g of HIERARCHIES[key].geonames) m.set(g.geonameId, HIERARCHIES[key]);
    }
    return m;
})();

function urlPath(url, baseurl) {
    const i = url.indexOf('?');
    const noQuery = i >= 0 ? url.substring(0, i) : url;
    return noQuery.substring(baseurl.length);
}
function urlParam(url, name) {
    const i = url.indexOf('?');
    if (i < 0) return null;
    const params = url.substring(i + 1).split('&');
    for (const p of params) {
        const eq = p.indexOf('=');
        const k = eq >= 0 ? p.substring(0, eq) : p;
        if (k === name) return decodeURIComponent(eq >= 0 ? p.substring(eq + 1) : '');
    }
    return null;
}

function makeAjaxOverride(config, originalAjax) {
    const mode = config.mode || 'happy';
    const queue = (config.coordHierarchyQueue || ['earthCanadaBC']).slice();
    const baseurl = (config.baseurl || 'http://api.geonames.org').replace(/\/+$/, '');

    return function (opts) {
        if (typeof opts !== 'object' || !opts || typeof opts.url !== 'string') {
            return originalAjax.call(this, opts);
        }
        if (opts.url.indexOf(baseurl) !== 0) return originalAjax.call(this, opts);

        // Simulate an HTTP-layer failure.
        if (mode === 'network') {
            if (typeof opts.error === 'function') {
                opts.error({ status: 500, statusText: 'Internal Server Error' }, 'error', 'simulated network failure');
            }
            return undefined;
        }

        // Inline-error envelopes — handed straight to opts.success, which is
        // what GeoNames itself does on quota / auth failures.
        if (mode === 'quota' || mode === 'auth') {
            if (typeof opts.success === 'function') opts.success(ENVELOPES[mode]);
            return undefined;
        }

        const path = urlPath(opts.url, baseurl);
        const dataParam = (k) => (opts.data && opts.data[k] != null ? String(opts.data[k]) : urlParam(opts.url, k));
        let result = null;

        if (path === '/searchJSON') {
            const name = dataParam('name_equals') || '';
            result = SEARCH_FIXTURES[name] || { totalResultsCount: 0, geonames: [] };
        } else if (path === '/hierarchyJSON') {
            const gid = dataParam('geonameId');
            if (gid) {
                result = HIERARCHY_BY_GEONAME_ID.get(Number(gid)) || HIERARCHIES.earthCanadaBC;
            } else {
                const next = queue.length > 1 ? queue.shift() : queue[0];
                result = HIERARCHIES[next] || HIERARCHIES.earthCanadaBC;
            }
        } else if (path === '/getJSON') {
            result = {};
        } else if (path === '/countrySubdivisionJSON') {
            result = { countryCode: 'CA', codes: [{ type: 'ISO3166-2:CA', code: 'BC' }] };
        } else {
            // Unknown GeoNames endpoint — fall through.
            return originalAjax.call(this, opts);
        }

        if (typeof opts.success === 'function') opts.success(result);
        return undefined;
    };
}

function installOverride(win) {
    const config = Cypress.env('_geoNamesStubConfig');
    if (!config) return;
    if (!win.jQuery || !win.jQuery.ajax) return;
    // If a previous override was installed on this window, swap back to the
    // original before installing the new one — otherwise we'd nest overrides
    // and re-runs with a different config (e.g. spec 43 after spec 32) would
    // keep the older config's responses.
    const originalAjax = win.jQuery.ajax._geoNamesStubOriginal || win.jQuery.ajax;
    const override = makeAjaxOverride(config, originalAjax);
    override._geoNamesStub = true;
    override._geoNamesStubOriginal = originalAjax;
    win.jQuery.ajax = override;
}

// Install on every page load. The override is a no-op until the spec calls
// cy.stubGeoNames(); afterwards every subsequent page load will pick it up.
Cypress.on('window:before:load', (win) => {
    // jQuery is loaded by OJS into the page after window:before:load fires;
    // install when the load event runs, then poll for up to 5s in case
    // jQuery shows up after that.
    const deadline = Date.now() + 5000;
    const tryInstall = () => {
        if (!Cypress.env('_geoNamesStubConfig')) return;
        installOverride(win);
        if (win.jQuery && win.jQuery.ajax && win.jQuery.ajax._geoNamesStub) return;
        if (Date.now() > deadline) return;
        win.setTimeout(tryInstall, 50);
    };
    win.addEventListener('load', tryInstall);
    tryInstall();
});

Cypress.Commands.add('stubGeoNames', (opts = {}) => {
    Cypress.env('_geoNamesStubConfig', { ...opts, baseurl: opts.baseurl || Cypress.env('GEONAMES_BASEURL') });
    // Apply to the current window so the active page also picks it up.
    cy.window({ log: false }).then((win) => installOverride(win));
});

Cypress.Commands.add('clearGeoNamesStub', () => {
    Cypress.env('_geoNamesStubConfig', null);
});
