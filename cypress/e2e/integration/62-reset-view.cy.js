/**
 * @file cypress/e2e/integration/62-reset-view.cy.js
 *
 * Copyright (c) 2026 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * @brief Reset-view button appears next to the fullscreen control on every
 *        map (article, issue, journal, submission) and snaps the map back
 *        to the view it was at once the plugin's init handler finished.
 */

describe('geoMetadata Reset View Button', function () {

  const resetBtn = '.leaflet-control-geoMetadataResetView';

  // map.panBy takes a pixel offset; 400,200 is well outside the original
  // viewport's feature bounds on every test fixture, so the centre shift
  // after panning is unambiguous.
  const panOffset = [400, 200];
  const tolerance = 0.5; // degrees; centre must return within this of origin

  const captureCentre = () => cy.window().then((win) => win.map.getCenter());

  // Reads the snapshot the control will reset to. Using this rather than
  // capturing the centre at an arbitrary moment removes timing assumptions
  // about when the post-init fitBounds chain settles — the control and the
  // assertion now agree on the same source of truth by construction.
  const captureControlSnapshot = () => cy.window().then((win) => {
    const ctrl = win.map._geoMetadataResetView;
    expect(ctrl, 'reset-view control instance exposed on map').to.exist;
    return { lat: ctrl._initialCenter.lat, lng: ctrl._initialCenter.lng };
  });

  const assertResetLandsBackAtOrigin = () => {
    cy.get(resetBtn, { timeout: 20000 }).should('exist').and('have.attr', 'title', 'Reset view');
    // Wait past the control's hard-cap freeze window so the snapshot is stable.
    cy.wait(3000);
    let origin;
    captureControlSnapshot().then((c) => { origin = c; });
    // animate:false keeps the centre update synchronous so the next getCenter()
    // is guaranteed to reflect the pan.
    cy.window().then((win) => win.map.panBy(panOffset, { animate: false }));
    captureCentre().then((after) => {
      // Sanity: the pan actually moved the centre (otherwise the test is a no-op).
      expect(Math.abs(after.lat - origin.lat) + Math.abs(after.lng - origin.lng)).to.be.greaterThan(tolerance);
    });
    cy.get(resetBtn).click();
    captureCentre().then((restored) => {
      expect(Math.abs(restored.lat - origin.lat), 'lat returned').to.be.lessThan(tolerance);
      expect(Math.abs(restored.lng - origin.lng), 'lng returned').to.be.lessThan(tolerance);
    });
  };

  it('on the issue page', function () {
    cy.visit('/' + Cypress.env('contexts').primary.path + '/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Archive")').click();
    cy.get('a:contains("Vol. 1 No. 2 (2022)")').click();
    cy.get('#mapdiv', { timeout: 20000 }).should('be.visible');
    assertResetLandsBackAtOrigin();
  });

  it('on the article page', function () {
    cy.visit('/' + Cypress.env('contexts').primary.path + '/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Archive")').click();
    cy.get('a:contains("Vol. 1 No. 2 (2022)")').click();
    cy.openArticleByTitle('Hanover is nice');
    cy.get('#mapdiv', { timeout: 20000 }).should('be.visible');
    assertResetLandsBackAtOrigin();
  });

  it('on the journal map page', function () {
    cy.visit('/' + Cypress.env('contexts').primary.path + '/map');
    cy.get('#mapdiv', { timeout: 20000 }).should('be.visible');
    assertResetLandsBackAtOrigin();
  });

  it('on the submission map', function () {
    cy.openSubmissionsAs('aauthor');
    cy.get('div#myQueue a:contains("New Submission")').click();
    cy.get('input[id^="checklist-"]').click({ multiple: true });
    cy.get('input[id="privacyConsent"]').click();
    cy.get('button.submitFormButton').click();
    cy.wait(1000);
    cy.get('button.submitFormButton').click();
    cy.wait(2000);
    cy.get('#mapdiv', { timeout: 20000 }).should('be.visible');
    assertResetLandsBackAtOrigin();
  });

});
