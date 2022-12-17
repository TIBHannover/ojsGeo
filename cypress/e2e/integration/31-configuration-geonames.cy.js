/**
 * @file cypress/tests/integration/configuration.cy.js
 *
 * Copyright (c) 2022 OPTIMETA project
 * Copyright (c) 2022 Daniel Nüst
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 */

describe('OPTIMETA Geo Plugin Configuration Geonames', function () {

  it('Configure OPTIMETA Geo Plugin - Geonames', function () {
    cy.login('admin', 'admin', Cypress.env('contextPath'));
    cy.get('nav[class="app__nav"] a:contains("Website")').click();
    cy.get('button[id="plugins-button"]').click();

    // Open the settings form
    cy.get('tr[id="component-grid-settings-plugins-settingsplugingrid-category-generic-row-optimetageoplugin"] a[class="show_extras"]').click();
    cy.get('a[id^="component-grid-settings-plugins-settingsplugingrid-category-generic-row-optimetageoplugin-settings-button"]').click();

    // Fill out settings form
    cy.get('form[id="optimetaGeoSettings"] input[name="optimetaGeo_geonames_username"]')
      .clear().invoke('val', '') // https://stackoverflow.com/a/61101054
      .type('optimeta_geo');
    cy.get('form[id="optimetaGeoSettings"] input[name="optimetaGeo_geonames_baseurl"]')
      .clear()
      .type('http://api.geonames.org');

    // submit settings form
    cy.get('form[id="optimetaGeoSettings"] button[id^="submitFormButton"]').click();
    //cy.waitJQuery();
  });

});
