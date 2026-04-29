/**
 * @file cypress/e2e/integration/45-map-controls-i18n.cy.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * @brief Verifies the en_US strings wired into the non-fullscreen Leaflet controls
 *        added by the plugin via the shared `_map_js_globals.tpl` partial:
 *
 *          - L.control.zoom   — zoomInTitle / zoomOutTitle            (issue #151)
 *          - L.Control.geocoder — placeholder / buttonTitle            (issue #151)
 *          - L.control.layers overlay names — articleLayerName / adminLayerName
 *          - L.drawLocal (prepared client-side as `geoMetadata_drawLocal`) — issue #111
 *
 *        Localised assertions for these strings live in 52-fullscreen-locales.cy.js
 *        (zoom) and are kept out of this spec intentionally: this one only proves
 *        the controls pick up the Smarty-injected strings in the default locale.
 *        Its main protective value is the `afterEach` no-JS-errors guard below —
 *        any future Smarty-escape regression in `_map_js_globals.tpl` (e.g. an
 *        apostrophe in a new translation closing the JS string literal) fails here
 *        with a precise error rather than a downstream "button not found" timeout.
 */

describe('geoMetadata Map Controls — en_US strings + no JS errors on map pages', function () {

  // Per-test page-error collector. Scoped to this spec so the existing permissive
  // Cypress.on('uncaught:exception') -> return false handler in support/e2e.js
  // (kept for unrelated OJS noise) stays in place everywhere else.
  beforeEach(() => {
    cy.on('window:before:load', (win) => {
      win.__mapPageErrors = [];
      win.addEventListener('error',            (e) => win.__mapPageErrors.push(`error: ${e.message}`));
      win.addEventListener('unhandledrejection', (e) => win.__mapPageErrors.push(`unhandled: ${e.reason}`));
    });
  });

  afterEach(() => {
    cy.window().then((win) => {
      expect(win.__mapPageErrors || [], 'no uncaught page errors on the map page').to.deep.equal([]);
    });
  });

  it('zoom control on the current-issue map has English tooltip titles', function () {
    cy.visit('/' + Cypress.env('contexts').primary.path + '/');
    cy.get('#mapdiv').should('exist');
    cy.get('a.leaflet-control-zoom-in').should('have.attr', 'title', 'Zoom in');
    cy.get('a.leaflet-control-zoom-out').should('have.attr', 'title', 'Zoom out');
  });

  it('article details page: zoom, geocoder and overlay layer names are localized', function () {
    cy.visit('/' + Cypress.env('contexts').primary.path + '/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Archive")').click();
    cy.get('a:contains("Vol. 1 No. 2 (2022)")').click();
    cy.openArticleByTitle('Hanover is nice');

    cy.get('#mapdiv').should('exist');

    // Zoom control (issue #151)
    cy.get('#mapdiv a.leaflet-control-zoom-in').should('have.attr', 'title', 'Zoom in');
    cy.get('#mapdiv a.leaflet-control-zoom-out').should('have.attr', 'title', 'Zoom out');

    // Geocoder control (issue #151). leaflet-control-geocoder renders a collapsed
    // icon + an input that becomes visible on click; the attrs are set regardless
    // of the expanded/collapsed state. Library v3 sets `iconLabel` as the
    // button's aria-label, not title.
    cy.get('#mapdiv .leaflet-control-geocoder').should('exist');
    cy.get('#mapdiv .leaflet-control-geocoder-icon')
      .should('have.attr', 'aria-label', 'Search on the map');
    cy.get('#mapdiv .leaflet-control-geocoder-form input')
      .should('have.attr', 'placeholder', 'Search');

    // Layer switcher overlays — article_details.js uses articleLayerName +
    // adminLayerName from the locale file (plugins.generic.geoMetadata.map.*).
    cy.get('#mapdiv .leaflet-control-layers-overlays label')
      .should('contain', 'Articles')
      .and('contain', 'Administrative Units');
  });

  it('geoMetadata_drawLocal parses cleanly and contains every nested string', function () {
    // The whole point of this assertion: if any translation in
    // `_map_js_globals.tpl` contained an unescaped apostrophe, the entire
    // <script> would have failed to parse and none of the `geoMetadata_*`
    // consts would exist. Reading them back from the running page via
    // `win.eval` proves the Smarty `|escape:'javascript'` chain is intact.
    // (Top-level `const`s don't attach to window, so plain `win.X` returns
    // undefined — use eval.)
    cy.visit('/' + Cypress.env('contexts').primary.path + '/');
    cy.window().then((win) => {
      const typeofDrawLocal = win.eval('typeof geoMetadata_drawLocal');
      expect(typeofDrawLocal, 'geoMetadata_drawLocal is defined').to.equal('object');

      const dl = win.eval('geoMetadata_drawLocal');
      expect(dl.draw.toolbar.buttons.polyline,      'draw.polyline button title').to.be.a('string').and.not.empty;
      expect(dl.draw.toolbar.buttons.polygon,       'draw.polygon button title').to.be.a('string').and.not.empty;
      expect(dl.draw.toolbar.buttons.rectangle,     'draw.rectangle button title').to.be.a('string').and.not.empty;
      expect(dl.draw.toolbar.buttons.marker,        'draw.marker button title').to.be.a('string').and.not.empty;
      expect(dl.edit.toolbar.actions.cancel.title,  'edit.cancelTitle').to.be.a('string').and.not.empty;
      expect(dl.edit.toolbar.buttons.edit,          'edit.edit button').to.be.a('string').and.not.empty;
      expect(dl.edit.toolbar.buttons.remove,        'edit.remove button').to.be.a('string').and.not.empty;

      // Spot-check the zoom/geocoder consts the JS files consume
      expect(win.eval('geoMetadata_zoomInTitle'),          'zoomInTitle').to.equal('Zoom in');
      expect(win.eval('geoMetadata_zoomOutTitle'),         'zoomOutTitle').to.equal('Zoom out');
      expect(win.eval('geoMetadata_geocoderPlaceholder'),  'geocoderPlaceholder').to.equal('Search');
      expect(win.eval('geoMetadata_geocoderButtonTitle'),  'geocoderButtonTitle').to.equal('Search on the map');
    });
  });

});
