/**
 * @file cypress/tests/integration/configuration.cy.js
 *
 * Copyright (c) 2022 OPTIMETA project
 * Copyright (c) 2022 Daniel Nüst
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 */

describe('OPTIMETA Geoplugin Theme tests', function () {

    it('Disable theme', function () {
    cy.login('admin', 'admin', Cypress.env('contextPath'));
    cy.get('nav[class="app__nav"] a:contains("Website")').click();
    cy.get('button[id="plugins-button"]').click();
    // disable plugin if enabled
    cy.get('input[id^="select-cell-optimetageochildthemeplugin-enabled"]')
      .then($btn => {
        if ($btn.attr('checked') === 'checked') {
          cy.get('input[id^="select-cell-optimetageochildthemeplugin-enabled"]').click();
          cy.get('div[class*="pkp_modal_panel"] button[class*="pkpModalConfirmButton"]').click();
          cy.get('div:contains(\'The plugin "OPTIMETA Geo Theme" has been disabled.\')');
        }
      });
  });

  it('Enable theme', function () {
    cy.login('admin', 'admin', Cypress.env('contextPath'));
    cy.get('nav[class="app__nav"] a:contains("Website")').click();
    cy.get('button[id="plugins-button"]').click();
    
    // Find and enable the plugin
    cy.get('input[id^="select-cell-optimetageochildthemeplugin-enabled"]').click();
    cy.get('div:contains(\'The plugin "OPTIMETA Geo Theme" has been enabled.\')');
  });

  it('Configure theme', function () {
    cy.login('admin', 'admin', Cypress.env('contextPath'));
    cy.get('nav[class="app__nav"] a:contains("Website")').click();
    
    // Fill out settings form
    cy.get('select[id^="theme-themePluginPath"]').select('optimetaGeoTheme');
    cy.get('input[id^="theme-parentName"]')
      .clear()
      .type('defaultthemeplugin');
 
    cy.get('input[name="mapPage"]').check();

    cy.get('button').contains('Save').click();
    cy.waitJQuery();
    
    cy.get('select[id^="theme-themePluginPath"]').should('have.value', 'optimetaGeoTheme');
    cy.get('input[id^="theme-parentName"]').should('have.value', 'defaultthemeplugin');
    cy.get('input[name="mapPage"]').should('be.checked');
  });

});