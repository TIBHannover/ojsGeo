/**
 * @file cypress/e2e/integration/60-empty-state-roundtrip.cy.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * @brief Verifies that the administrativeUnit empty-state is stored as the
 *        canonical '[]' JSON literal and survives a save/reload round trip
 *        (refs #154). Uses the editor-side publication tab because that is
 *        where an editor is most likely to clear stored data in practice.
 */

describe('geoMetadata Admin-Unit Empty State Roundtrip', function () {

  const openLatestPublicationTab = () => {
    // Editor Dashboard flow (matches the working pattern in spec 33 / 56) —
    // `a:contains("Submissions")` isn't reliably visible on the admin landing
    // page and the first "View" link can sit inside a hidden dashboard tab.
    cy.logout();
    cy.openSubmissionsAs('eeditor');
    cy.get('a:contains("View"):visible').first().click();
    cy.get('div[role="tablist"]').find('button:contains("Publication")').click();
    cy.get('button[id^="timeLocation"]').click();
  };

  it('clearing all features writes "[]" to the admin-unit textarea and persists across reload', function () {
    openLatestPublicationTab();
    cy.get('#mapdiv').should('be.visible');

    // Clear any existing features so the admin-unit textarea lands on the empty state.
    cy.window().then((win) => {
      if (win.drawnItems) {
        const layers = {};
        win.drawnItems.eachLayer((l) => { layers[l._leaflet_id] = l; });
        win.drawnItems.clearLayers();
        if (win.map) win.map.fire('draw:deleted', { layers: { _layers: layers } });
      }
    });
    cy.wait(1500);

    cy.get('textarea[name="geoMetadata::administrativeUnit"]').invoke('val').should('eq', '[]');

    // Save the publication tab (raw-data form's Save lives inside the pkp-form).
    cy.get('div#timeLocation button[label="Save"]').click();
    cy.wait(500);
    cy.intercept({ method: 'POST', url: '*', times: 1 }).as('post60');
    cy.get('div#timeLocation button[label="Save"]').click();
    cy.wait('@post60').its('response.statusCode').should('eq', 200);
    cy.wait(2000);

    // Reload and verify persistence.
    cy.reload();
    cy.get('button[id^="timeLocation"]').click();
    cy.wait(1500);
    cy.get('textarea[name="geoMetadata::administrativeUnit"]').invoke('val').should('eq', '[]');
  });

});
