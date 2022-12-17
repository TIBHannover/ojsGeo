/**
 * @file cypress/tests/integration/configuration.cy.js
 *
 * Copyright (c) 2022 OPTIMETA project
 * Copyright (c) 2022 Daniel Nüst
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 */

describe('OPTIMETA Geo Plugin Configuration', function () {

  it('Disable OPTIMETA Geo Plugin', function () {
    cy.login('admin', 'admin', Cypress.env('contextPath'));
    cy.get('nav[class="app__nav"] a:contains("Website")').click();
    cy.get('button[id="plugins-button"]').click();
    // disable plugin if enabled
    cy.get('input[id^="select-cell-optimetageoplugin-enabled"]')
      .then($btn => {
        if ($btn.attr('checked') === 'checked') {
          cy.get('input[id^="select-cell-optimetageoplugin-enabled"]').click();
          cy.get('div[class*="pkp_modal_panel"] button[class*="pkpModalConfirmButton"]').click();
          cy.get('div:contains(\'The plugin "OPTIMETA Geo Plugin" has been disabled.\')');
        }
      });
  });

  it('Enable OPTIMETA Geo Plugin', function () {
    cy.login('admin', 'admin', Cypress.env('contextPath'));
    cy.get('nav[class="app__nav"] a:contains("Website")').click();
    cy.get('button[id="plugins-button"]').click();
    // Find and enable the plugin
    cy.get('input[id^="select-cell-optimetageoplugin-enabled"]').click();
    cy.get('div:contains(\'The plugin "OPTIMETA Geo Plugin" has been enabled.\')');
  });

  it('Has a map in the third submissions step', function () {
    cy.login('admin', 'admin', Cypress.env('contextPath'));

    cy.get('a:contains("Submissions")').click();
    cy.get('div#myQueue a:contains("New Submission")').click();
    cy.get('input[id^="checklist-"]').click({ multiple: true });
    cy.get('input[id="privacyConsent"]').click();
    cy.get('button.submitFormButton').click();
    cy.wait(2000);
    cy.get('button.submitFormButton').click();
    cy.get('#mapdiv').should('exist');

    cy.logout();
  });

  it('Has coverage input disabled with a hover message in the right language if the metadata field is enabled', function () {
    cy.login('admin', 'admin', Cypress.env('contextPath'));

    cy.get('nav[class="app__nav"] a:contains("Workflow")').click();
    cy.get('button#metadata-button').click();
    cy.get('input[aria-describedby^="metadataSettings-coverage"]').click();
    cy.get('input[value="request"]').click({ multiple: true });
    cy.get('div#metadata').find('button:contains("Save")').click();
    cy.wait(2000);
    
    cy.get('a:contains("Submissions")').click();
    cy.get('div#myQueue a:contains("New Submission")').click();
    cy.get('input[id^="checklist-"]').click({ multiple: true });
    cy.get('input[id="privacyConsent"]').click();
    cy.get('button.submitFormButton').click();
    cy.wait(2000);
    cy.get('button.submitFormButton').click();
    cy.get('input[id^="coverage-"').should('exist');
    cy.get('input[id^="coverage-"').invoke('attr', 'disabled').should('eq', 'disabled');
    cy.get('input[id^="coverage-"').invoke('attr', 'title').should('contain', 'field has been disabled');
    cy.get('input[id^="coverage-"').should('have.value', '');
    
    cy.logout();
  });

  it('Configure OPTIMETA Geo Plugin - Map colors', function () {
    this.skip(); // TODO implement

    //cy.get('form[id="optimetaGeoSettings"] input[name="optimetaGeo_mapLayerStyle_color"]')
    //  .clear()
    //  .type('#00ff00');
    //cy.get('form[id="optimetaGeoSettings"] input[name="optimetaGeo_mapLayerStyle_colorHighlight"]')
    //  .clear()
    //  .type('#01ff01');
  });

  it('Configure Geo Plugin - Download sidebar', function () {
    this.skip(); // TODO implement
  });
});
