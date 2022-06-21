/**
 * @file cypress/tests/integration/configuration.spec.js
 *
 * Copyright (c) 2022 OPTIMETA project
 * Copyright (c) 2022 Daniel Nüst
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 */

describe('OPTIMETA Geoplugin tests', function () {

  it('Disable Geoplugin', function () {
    cy.login('admin', 'admin', 'publicknowledge');
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
    cy.login('admin', 'admin', 'publicknowledge');
    cy.get('nav[class="app__nav"] a:contains("Website")').click();
    cy.get('button[id="plugins-button"]').click();
    // Find and enable the plugin
    cy.get('input[id^="select-cell-optimetageoplugin-enabled"]').click();
    cy.get('div:contains(\'The plugin "OPTIMETA Geo Plugin" has been enabled.\')');
    cy.waitJQuery();

    // submit settings form
    cy.get('form[id="optimetaGeoSettings"] button[id^="submitFormButton"]').click();
    cy.waitJQuery();

    // go to journal index
    cy.get('a[class="app__contextTitle"]').click();
    cy.get('div[class*="page_index_journal"]:contains("Times & locations")');
  });

  it('Configure Geoplugin - Geonames', function () {
    cy.login('admin', 'admin', 'publicknowledge');
    cy.get('nav[class="app__nav"] a:contains("Website")').click();
    cy.get('button[id="plugins-button"]').click();

    // Open the settings form
    cy.get('tr[id="component-grid-settings-plugins-settingsplugingrid-category-generic-row-optimetageoplugin"] a[class="show_extras"]').click();
    cy.get('a[id^="component-grid-settings-plugins-settingsplugingrid-category-category-generic-row-optimetageoplugin-settings-button"]').click();

    // Fill out settings form
    cy.get('form[id="optimetaGeoSettings"] input[name="optimetaGeo_geonames_username"]')
      .clear()
      .type('optimeta_geo');
    cy.get('form[id="optimetaGeoSettings"] input[name="optimetaGeo_geonames_baseurl"]')
      .clear()
      .type('http://api.geonames.org');

    // submit settings form
    cy.get('form[id="twitterSettings"] button[id^="submitFormButton"]').click();
    cy.waitJQuery();

    // TODO go to submission page and draw on the map, check if both coverage fields change
  });

  it('Configure Geoplugin - Map colors', function () {
    // TODO
    
    //cy.get('form[id="optimetaGeoSettings"] input[name="optimetaGeo_mapLayerStyle_color"]')
    //  .clear()
    //  .type('#00ff00');
    //cy.get('form[id="optimetaGeoSettings"] input[name="optimetaGeo_mapLayerStyle_colorHighlight"]')
    //  .clear()
    //  .type('#01ff01');
  });

  it('Configure Geoplugin - Download sidebar', function () {
    // TODO
  });
});