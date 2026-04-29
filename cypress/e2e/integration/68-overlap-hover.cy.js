/**
 * @file cypress/e2e/integration/68-overlap-hover.cy.js
 *
 * Copyright (c) 2026 KOMET project, OPTIMETA project, Daniel Nüst
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * @brief Multi-article TOC highlight on overlap hover (issue #159).
 *
 * Leaflet only fires per-layer mouseover on the topmost layer at the cursor,
 * so when geometries overlap, only one TOC entry was lit. The fix is a
 * map-level mousemove handler that calls geoMetadata_findOverlappingArticles
 * on every move and diffs against a Set of currently-highlighted articleIds.
 *
 * To exercise the >2-hit branch deterministically, three overlapping
 * articles must exist on the issue map: 'Hanover is nice' (spec 21
 * LineString), 'Lower Saxony details' (spec 12 Polygon), and 'Hanover micro'
 * (spec 12 small Polygon). All three contain HANOVER_LINE_START, so a single
 * mousemove there must light up three TOC entries.
 *
 * Depends on:
 *   - spec 12 (Lower Saxony details — Polygon [8.0–9.0, 52.0–52.7])
 *   - spec 12 (Hanover micro — Polygon [8.40–8.50, 52.30–52.45])
 *   - spec 21 (Hanover is nice — LineString [[8.43, 52.37], [9.73, 52.40]])
 */

const HANOVER_LINE_START = { lng: 8.43,  lat: 52.37 };
const SAXONY_ONLY        = { lng: 8.20,  lat: 52.10 };  // inside Lower Saxony only — south-west of Hanover micro and well off the line
const FAR_AWAY           = { lng: -30,   lat: -30   };

const visitVol1No2 = () => {
  cy.visit('/' + Cypress.env('contexts').primary.path + '/');
  cy.get('nav[class="pkp_site_nav_menu"] a:contains("Archive")').click();
  cy.get('a:contains("Vol. 1 No. 2 (2022)")').click();
  cy.get('#mapdiv').should('exist');
  cy.window().its('map').should('exist');
  // articleLayersMap is populated asynchronously after issue.js attaches the
  // article layers; firing mousemove before it settles produces zero hits.
  cy.wait(3000);
  // Pin a zoom where the test latlngs are pixel-distinct. Hit-testing is in
  // pixel space (matches the visible stroke / icon footprint), so at world-fit
  // zoom an off-line latlng can fall inside the visible stroke of a far-away
  // line and produce a false positive.
  cy.window().then((win) => win.map.setView(win.L.latLng(52.4, 8.7), 8, { animate: false }));
};

describe('geoMetadata Overlap Hover Highlight - issue map', function () {

  beforeEach(visitVol1No2);

  it('lights up all three overlapping TOC entries on a 3-hit hover', function () {
    cy.window().then((win) => {
      win.map.fire('mousemove', { latlng: win.L.latLng(HANOVER_LINE_START.lat, HANOVER_LINE_START.lng) });
    });
    cy.contains('.obj_article_summary', 'Hanover is nice').should('have.class', 'geoMetadata_title_hover');
    cy.contains('.obj_article_summary', 'Lower Saxony details').should('have.class', 'geoMetadata_title_hover');
    cy.contains('.obj_article_summary', 'Hanover micro').should('have.class', 'geoMetadata_title_hover');
  });

  it('lights up only the matching TOC entry on a 1-hit hover', function () {
    cy.window().then((win) => {
      win.map.fire('mousemove', { latlng: win.L.latLng(SAXONY_ONLY.lat, SAXONY_ONLY.lng) });
    });
    cy.contains('.obj_article_summary', 'Lower Saxony details').should('have.class', 'geoMetadata_title_hover');
    cy.contains('.obj_article_summary', 'Hanover is nice').should('not.have.class', 'geoMetadata_title_hover');
    cy.contains('.obj_article_summary', 'Hanover micro').should('not.have.class', 'geoMetadata_title_hover');
  });

  it('leaves every entry cold on a 0-hit hover', function () {
    cy.window().then((win) => {
      win.map.fire('mousemove', { latlng: win.L.latLng(FAR_AWAY.lat, FAR_AWAY.lng) });
    });
    cy.contains('.obj_article_summary', 'Hanover is nice').should('not.have.class', 'geoMetadata_title_hover');
    cy.contains('.obj_article_summary', 'Lower Saxony details').should('not.have.class', 'geoMetadata_title_hover');
    cy.contains('.obj_article_summary', 'Hanover micro').should('not.have.class', 'geoMetadata_title_hover');
  });

  it('clears every TOC highlight on map mouseout', function () {
    cy.window().then((win) => {
      win.map.fire('mousemove', { latlng: win.L.latLng(HANOVER_LINE_START.lat, HANOVER_LINE_START.lng) });
    });
    cy.contains('.obj_article_summary', 'Hanover is nice').should('have.class', 'geoMetadata_title_hover');

    cy.window().then((win) => {
      win.map.fire('mouseout');
    });
    cy.contains('.obj_article_summary', 'Hanover is nice').should('not.have.class', 'geoMetadata_title_hover');
    cy.contains('.obj_article_summary', 'Lower Saxony details').should('not.have.class', 'geoMetadata_title_hover');
    cy.contains('.obj_article_summary', 'Hanover micro').should('not.have.class', 'geoMetadata_title_hover');
  });
});

describe('geoMetadata Overlap Hover Highlight - toggle off', function () {

  const toggleSelector = 'form[id="geoMetadataSettings"] input[name="geoMetadata_enableSyncedHighlight"]';
  const submitBtn = 'form[id="geoMetadataSettings"] button[id^="submitFormButton"]';

  const openSettings = () => {
    cy.login('admin', 'admin', Cypress.env('contexts').primary.path);
    cy.get('nav[class="app__nav"] a:contains("Website")').click();
    cy.get('button[id="plugins-button"]').click();
    cy.get('tr[id="component-grid-settings-plugins-settingsplugingrid-category-generic-row-geometadataplugin"] a[class="show_extras"]').click();
    cy.get('a[id^="component-grid-settings-plugins-settingsplugingrid-category-generic-row-geometadataplugin-settings-button"]').click();
  };

  const setToggle = (checked) => {
    openSettings();
    if (checked) cy.get(toggleSelector).check();
    else         cy.get(toggleSelector).uncheck();
    cy.get(submitBtn).click();
    cy.wait(1000);
  };

  it('does not light up any TOC entry when the synced-highlight toggle is off', function () {
    setToggle(false);
    visitVol1No2();
    cy.window().then((win) => {
      expect(win.eval('geoMetadata_enableSyncedHighlight'), 'sync disabled').to.be.false;
      win.map.fire('mousemove', { latlng: win.L.latLng(HANOVER_LINE_START.lat, HANOVER_LINE_START.lng) });
    });
    cy.contains('.obj_article_summary', 'Hanover is nice').should('not.have.class', 'geoMetadata_title_hover');
    cy.contains('.obj_article_summary', 'Lower Saxony details').should('not.have.class', 'geoMetadata_title_hover');
    cy.contains('.obj_article_summary', 'Hanover micro').should('not.have.class', 'geoMetadata_title_hover');
  });

  it('restores multi-highlight when the toggle is re-enabled', function () {
    setToggle(true);
    visitVol1No2();
    cy.window().then((win) => {
      expect(win.eval('geoMetadata_enableSyncedHighlight'), 'sync re-enabled').to.be.true;
      win.map.fire('mousemove', { latlng: win.L.latLng(HANOVER_LINE_START.lat, HANOVER_LINE_START.lng) });
    });
    cy.contains('.obj_article_summary', 'Hanover is nice').should('have.class', 'geoMetadata_title_hover');
    cy.contains('.obj_article_summary', 'Lower Saxony details').should('have.class', 'geoMetadata_title_hover');
    cy.contains('.obj_article_summary', 'Hanover micro').should('have.class', 'geoMetadata_title_hover');
  });
});
