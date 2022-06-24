/**
 * @file cypress/tests/integration/configuration.cy.js
 *
 * Copyright (c) 2022 OPTIMETA project
 * Copyright (c) 2022 Daniel Nüst
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 */

describe('OPTIMETA Geoplugin tests', function () {

  it('Disable Geoplugin', function () {
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

  it('Enable Geoplugin', function () {
    cy.login('admin', 'admin', Cypress.env('contextPath'));
    cy.get('nav[class="app__nav"] a:contains("Website")').click();
    cy.get('button[id="plugins-button"]').click();
    // Find and enable the plugin
    cy.get('input[id^="select-cell-optimetageoplugin-enabled"]').click();
    cy.get('div:contains(\'The plugin "OPTIMETA Geo Plugin" has been enabled.\')');
  });

  it('Configure Geoplugin - Geonames', function () {
    cy.login('admin', 'admin', Cypress.env('contextPath'));
    cy.get('nav[class="app__nav"] a:contains("Website")').click();
    cy.get('button[id="plugins-button"]').click();

    // Open the settings form
    cy.get('tr[id="component-grid-settings-plugins-settingsplugingrid-category-generic-row-optimetageoplugin"] a[class="show_extras"]').click();
    cy.get('a[id^="component-grid-settings-plugins-settingsplugingrid-category-generic-row-optimetageoplugin-settings-button"]').click();

    // Fill out settings form
    cy.get('form[id="optimetaGeoSettings"] input[name="optimetaGeo_geonames_username"]')
      .clear()
      .type('optimeta_geo');
    cy.get('form[id="optimetaGeoSettings"] input[name="optimetaGeo_geonames_baseurl"]')
      .clear()
      .type('http://api.geonames.org');

    // submit settings form
    cy.get('form[id="optimetaGeoSettings"] button[id^="submitFormButton"]').click();
    cy.waitJQuery();
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
  });

  it('Has a map in the final metadata check before publication', function () {
    // TODO implement test
  });

  it('Configure Geoplugin - Map colors', function () {
    // TODO implement

    //cy.get('form[id="optimetaGeoSettings"] input[name="optimetaGeo_mapLayerStyle_color"]')
    //  .clear()
    //  .type('#00ff00');
    //cy.get('form[id="optimetaGeoSettings"] input[name="optimetaGeo_mapLayerStyle_colorHighlight"]')
    //  .clear()
    //  .type('#01ff01');
  });

  it('Configure Geoplugin - Download sidebar', function () {
    // TODO implement
  });
});
