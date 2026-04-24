/**
 * @file cypress/tests/integration/configuration.cy.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 */

describe('geoMetadata Configuration Geonames', function () {

  // Sourced from cypress/.env so rotating the account (when the old one
  // expires / gets throttled) is a one-liner. Fail fast here if either is
  // unset — otherwise downstream specs would cascade-fail on a silently
  // disabled gazetteer.
  const geonamesUsername = Cypress.env('GEONAMES_USERNAME');
  const geonamesBaseurl  = Cypress.env('GEONAMES_BASEURL');

  before(function () {
    expect(geonamesUsername, 'GEONAMES_USERNAME from cypress/.env').to.be.a('string').and.not.be.empty;
    expect(geonamesBaseurl,  'GEONAMES_BASEURL from cypress/.env').to.be.a('string').and.not.be.empty;
  });

  it('Configure geoMetadata - Geonames', function () {
    cy.login('admin', 'admin', Cypress.env('contextPath'));
    cy.get('nav[class="app__nav"] a:contains("Website")').click();
    cy.get('button[id="plugins-button"]').click();

    // Open the settings form
    cy.get('tr[id="component-grid-settings-plugins-settingsplugingrid-category-generic-row-geometadataplugin"] a[class="show_extras"]').click();
    cy.get('a[id^="component-grid-settings-plugins-settingsplugingrid-category-generic-row-geometadataplugin-settings-button"]').click();

    // Fill out settings form
    cy.get('form[id="geoMetadataSettings"] input[name="geoMetadata_geonames_username"]')
      .clear().invoke('val', '') // https://stackoverflow.com/a/61101054
      .type(geonamesUsername);
    cy.get('form[id="geoMetadataSettings"] input[name="geoMetadata_geonames_baseurl"]')
      .clear()
      .type(geonamesBaseurl);

    // submit settings form
    cy.get('form[id="geoMetadataSettings"] button[id^="submitFormButton"]').click();
    //cy.waitJQuery();
  });

});
