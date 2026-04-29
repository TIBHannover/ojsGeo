/**
 * @file cypress/e2e/integration/66-overlap-popup.cy.js
 *
 * Copyright (c) 2026 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * @brief Multi-article overlap picker (issue #81). Covers:
 *   - pure helpers (point-in-polygon, point-on-line, point-on-marker)
 *   - issue map: zero, single, and multi-article hit branches
 *   - paginated popup wrap-around prev/next
 *   - icon-click on the issue TOC bypasses the picker
 *   - toggle-off restores the legacy bindPopup behaviour
 *
 * Depends on the Lower Saxony details polygon seeded in spec 38.
 */

const HANOVER_LINE_START = { lng: 8.43,  lat: 52.37 };  // start of Hanover LineString
const SAXONY_INSIDE_ONLY = { lng: 8.50,  lat: 52.50 };  // inside Lower Saxony polygon, off Hanover line
const FAR_AWAY           = { lng: -30,   lat: -30   };  // South Atlantic, no seeded geometry

const visitVol1No2 = () => {
  cy.visit('/' + Cypress.env('contexts').primary.path + '/');
  cy.get('nav[class="pkp_site_nav_menu"] a:contains("Archive")').click();
  cy.get('a:contains("Vol. 1 No. 2 (2022)")').click();
  cy.get('#mapdiv').should('exist');
  cy.window().its('map').should('exist');
  // articleLayersMap is populated asynchronously after issue.js finishes
  // attaching all article layers (and the timeline-feature additions made
  // it more deferred). Wait for layers to settle before tests poke the
  // overlap helper.
  cy.wait(3000);
  // Pin a zoom where the test latlngs are pixel-distinct. Hit-testing is in
  // pixel space (matches the visible stroke / icon footprint).
  cy.window().then((win) => win.map.setView(win.L.latLng(52.4, 8.7), 8, { animate: false }));
};

describe('geoMetadata Overlap Picker - pure helpers', function () {

  beforeEach(visitVol1No2);

  it('pointInPolygon returns true inside, false outside', function () {
    cy.window().then((win) => {
      const square = [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]];
      expect(win.geoMetadata_pointInPolygon(win.L.latLng(5, 5),    square), 'centre').to.be.true;
      expect(win.geoMetadata_pointInPolygon(win.L.latLng(15, 15),  square), 'outside').to.be.false;
      expect(win.geoMetadata_pointInPolygon(win.L.latLng(-1, 5),   square), 'south of').to.be.false;
    });
  });

  it('pointInPolygon respects holes', function () {
    cy.window().then((win) => {
      const polygonWithHole = [
        [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]],
        [[3, 3], [7, 3], [7, 7], [3, 7], [3, 3]]
      ];
      expect(win.geoMetadata_pointInPolygon(win.L.latLng(5, 5),  polygonWithHole), 'in hole').to.be.false;
      expect(win.geoMetadata_pointInPolygon(win.L.latLng(1, 1),  polygonWithHole), 'in outer').to.be.true;
    });
  });

  it('pointOnMarker uses pixel tolerance', function () {
    cy.window().then((win) => {
      const map = win.map;
      // Pin zoom — pixel tolerance is zoom-dependent. At very low zoom 1 deg
      // collapses to a few pixels, making the "far" assertion below ambiguous.
      map.setView(win.L.latLng(52.37, 8.43), 4, { animate: false });
      const marker = win.L.latLng(52.37, 8.43);
      expect(win.geoMetadata_pointOnMarker(map, marker, [8.43, 52.37]), 'centre').to.be.true;
      // 1 deg lng at 52° lat is roughly 68 km, way more than 10 px at zoom 4
      expect(win.geoMetadata_pointOnMarker(map, win.L.latLng(52.37, 9.43), [8.43, 52.37]), 'far').to.be.false;
    });
  });
});

describe('geoMetadata Overlap Picker - issue map', function () {

  beforeEach(visitVol1No2);

  it('finds zero articles when clicking far from any geometry', function () {
    cy.window().then((win) => {
      const hits = win.geoMetadata_findOverlappingArticles(
        win.map, win.articleLayersMap, win.L.latLng(FAR_AWAY.lat, FAR_AWAY.lng)
      );
      expect(hits, 'no overlapping articles').to.have.length(0);
    });
  });

  it('finds Hanover and Lower Saxony details at the LineString start', function () {
    cy.window().then((win) => {
      const hits = win.geoMetadata_findOverlappingArticles(
        win.map, win.articleLayersMap, win.L.latLng(HANOVER_LINE_START.lat, HANOVER_LINE_START.lng)
      );
      const ids = hits.map(h => h.articleId);
      expect(ids, 'overlap includes Hanover').to.satisfy(arr =>
        arr.some(id => win.articlePopupMap.get(id).includes('Hanover is nice')));
      expect(ids, 'overlap includes Lower Saxony details').to.satisfy(arr =>
        arr.some(id => win.articlePopupMap.get(id).includes('Lower Saxony details')));
    });
  });

  it('opens a paginated popup with wrap-around prev/next on overlap click', function () {
    cy.window().then((win) => {
      win.map.fire('click', {
        latlng: win.L.latLng(HANOVER_LINE_START.lat, HANOVER_LINE_START.lng),
        originalEvent: { defaultPrevented: false }
      });
    });
    cy.get('.geoMetadata_overlap_header').should('be.visible');
    cy.get('.geoMetadata_overlap_counter').invoke('text').should('match', /^1 of \d+ articles$/);

    // capture the article currently shown, advance, expect a different one
    cy.get('.geoMetadata_overlap_body').invoke('text').then((firstText) => {
      cy.get('.geoMetadata_overlap_next').click();
      cy.get('.geoMetadata_overlap_counter').invoke('text').should('match', /^2 of \d+ articles$/);
      cy.get('.geoMetadata_overlap_body').invoke('text').should('not.equal', firstText);
    });

    // wrap-around: prev from page 1 should go to last page
    cy.get('.geoMetadata_overlap_counter').invoke('text').then((counterText) => {
      const total = parseInt(counterText.match(/of (\d+)/)[1], 10);
      // step back to page 1
      cy.get('.geoMetadata_overlap_prev').click();
      cy.get('.geoMetadata_overlap_counter').should('contain', `1 of ${total}`);
      // wrap to page N
      cy.get('.geoMetadata_overlap_prev').click();
      cy.get('.geoMetadata_overlap_counter').should('contain', `${total} of ${total}`);
    });
  });

  it('opens a single-article popup (no overlap header) when only one article matches', function () {
    cy.window().then((win) => {
      win.map.fire('click', {
        latlng: win.L.latLng(SAXONY_INSIDE_ONLY.lat, SAXONY_INSIDE_ONLY.lng),
        originalEvent: { defaultPrevented: false }
      });
    });
    cy.get('.leaflet-popup').should('be.visible');
    cy.get('.geoMetadata_overlap_header').should('not.exist');
    cy.get('.leaflet-popup').should('contain', 'Lower Saxony details');
  });

  it('opens no popup when clicking far from every geometry', function () {
    cy.window().then((win) => {
      win.map.closePopup();
      win.map.fire('click', {
        latlng: win.L.latLng(FAR_AWAY.lat, FAR_AWAY.lng),
        originalEvent: { defaultPrevented: false }
      });
    });
    cy.get('.leaflet-popup').should('not.exist');
  });

  it('issue-TOC icon click bypasses the picker even when the article overlaps another', function () {
    // Hanover's LineString lies inside Lower Saxony details' polygon — the icon
    // must still open Hanover's popup directly, not the picker chrome.
    cy.contains('.obj_article_summary', 'Hanover is nice')
      .find('a.geoMetadata_issue_mapIcon')
      .click();
    cy.get('.leaflet-popup').should('be.visible');
    cy.get('.geoMetadata_overlap_header').should('not.exist');
    cy.get('.leaflet-popup').should('contain', 'Hanover is nice');
  });
});

describe('geoMetadata Overlap Picker - toggle off', function () {

  const toggleSelector = (name) => `form[id="geoMetadataSettings"] input[name="${name}"]`;
  const submitBtnSelector = 'form[id="geoMetadataSettings"] button[id^="submitFormButton"]';

  const openSettings = () => {
    cy.login('admin', 'admin', Cypress.env('contexts').primary.path);
    cy.get('nav[class="app__nav"] a:contains("Website")').click();
    cy.get('button[id="plugins-button"]').click();
    cy.get('tr[id="component-grid-settings-plugins-settingsplugingrid-category-generic-row-geometadataplugin"] a[class="show_extras"]').click();
    cy.get('a[id^="component-grid-settings-plugins-settingsplugingrid-category-generic-row-geometadataplugin-settings-button"]').click();
  };

  const setToggle = (name, checked) => {
    openSettings();
    if (checked) cy.get(toggleSelector(name)).check();
    else         cy.get(toggleSelector(name)).uncheck();
    cy.get(submitBtnSelector).click();
    cy.wait(1000);
  };

  it('falls back to per-layer bindPopup when the picker is disabled', function () {
    setToggle('geoMetadata_overlapPicker', false);
    visitVol1No2();
    cy.window().then((win) => {
      // geoMetadata_overlapPicker is a script-scoped const in _map_js_globals.tpl,
      // so it is not a property of window — read it via win.eval.
      expect(win.eval('geoMetadata_overlapPicker'), 'picker disabled').to.be.false;
      expect(win.geoMetadata_overlapManager, 'no manager instantiated').to.be.null;
    });
    cy.window().then((win) => {
      win.map.fire('click', {
        latlng: win.L.latLng(HANOVER_LINE_START.lat, HANOVER_LINE_START.lng),
        originalEvent: { defaultPrevented: false }
      });
    });
    cy.get('.geoMetadata_overlap_header').should('not.exist');
  });

  it('restores the picker when the toggle is re-enabled', function () {
    setToggle('geoMetadata_overlapPicker', true);
    visitVol1No2();
    cy.window().then((win) => {
      expect(win.eval('geoMetadata_overlapPicker'), 'picker re-enabled').to.be.true;
    });
  });
});
