/**
 * @file cypress/tests/integration/configuration.cy.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
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
    cy.login('admin', 'admin', Cypress.env('contexts').primary.path);
    cy.get('nav[class="app__nav"] a:contains("Website")').click();
    cy.get('button[id="plugins-button"]').click();

    // Open the settings form
    cy.get('tr[id="component-grid-settings-plugins-settingsplugingrid-category-generic-row-geometadataplugin"] a[class="show_extras"]').click();
    cy.get('a[id^="component-grid-settings-plugins-settingsplugingrid-category-generic-row-geometadataplugin-settings-button"]').click();

    // Assign the value directly instead of .type(): some observed cases
    // where the form persisted only the first character, likely a race
    // between typed-input events and OJS's form hydration.
    cy.get('form[id="geoMetadataSettings"] input[name="geoMetadata_geonames_username"]')
      .invoke('val', geonamesUsername).trigger('input').trigger('change');
    cy.get('form[id="geoMetadataSettings"] input[name="geoMetadata_geonames_baseurl"]')
      .invoke('val', geonamesBaseurl).trigger('input').trigger('change');

    // submit settings form
    cy.get('form[id="geoMetadataSettings"] button[id^="submitFormButton"]').click();
    cy.wait(1000);
  });

});
