/**
 * @file cypress/e2e/integration/57-geocoder-toggle.cy.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 * @brief DOM-level verification for enableGeocoderSearch. When enabled, the
 *        Leaflet Control.Geocoder search box renders on every map context
 *        (article, submission). When disabled, the control is absent and no
 *        requests are sent to Nominatim.
 *
 *        Also verifies the privacy-snippet composer in the settings page adds
 *        the geocoder disclosure paragraph when enabled and drops it when
 *        disabled — testing the generalized [checkboxId, snippetId] walk
 *        introduced alongside this toggle.
 *
 *        Must end with the setting restored to ON so downstream specs that
 *        assume the geocoder is available continue to work.
 */

describe('geoMetadata Geocoder Toggle', function () {

  const checkboxSelector = 'form[id="geoMetadataSettings"] input[name="geoMetadata_enableGeocoderSearch"]';
  const submitBtnSelector = 'form[id="geoMetadataSettings"] button[id^="submitFormButton"]';

  const openSettings = () => {
    cy.login('admin', 'admin', Cypress.env('contextPath'));
    cy.get('nav[class="app__nav"] a:contains("Website")').click();
    cy.get('button[id="plugins-button"]').click();
    cy.get('tr[id="component-grid-settings-plugins-settingsplugingrid-category-generic-row-geometadataplugin"] a[class="show_extras"]').click();
    cy.get('a[id^="component-grid-settings-plugins-settingsplugingrid-category-generic-row-geometadataplugin-settings-button"]').click();
  };

  const setToggle = (checked) => {
    openSettings();
    if (checked) {
      cy.get(checkboxSelector).check();
    } else {
      cy.get(checkboxSelector).uncheck();
    }
    cy.get(submitBtnSelector).click();
    cy.wait(1000);
  };

  const visitHanover = () => {
    cy.visit('/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Archive")').click();
    cy.get('a:contains("Vol. 1 No. 2 (2022)")').click();
    cy.get('a:contains("Hanover is nice")').last().click();
  };

  it('setting exists in the Third-party services section and defaults to checked', function () {
    openSettings();
    cy.get(checkboxSelector).should('exist').and('be.checked');
  });

  it('geocoder search box renders on the article map by default', function () {
    visitHanover();
    cy.get('#mapdiv .leaflet-control-geocoder').should('exist');
  });

  it('geocoder search box is absent when the setting is turned off', function () {
    setToggle(false);
    visitHanover();
    cy.get('#mapdiv').should('exist');
    cy.get('#mapdiv .leaflet-control-geocoder').should('not.exist');
  });

  it('privacy snippet drops the geocoder paragraph when disabled', function () {
    openSettings();
    cy.get('#geoMetadata_privacySnippet').invoke('val').should('not.include', 'Nominatim');
  });

  it('privacy snippet updates live without save when the checkbox is toggled', function () {
    openSettings();
    cy.get('#geoMetadata_privacySnippet').invoke('val').should('not.include', 'Nominatim');
    cy.get(checkboxSelector).check();
    cy.get('#geoMetadata_privacySnippet').invoke('val').should('include', 'Nominatim');
    cy.get(checkboxSelector).uncheck();
    cy.get('#geoMetadata_privacySnippet').invoke('val').should('not.include', 'Nominatim');
  });

  it('geocoder search box is back after restoring the setting', function () {
    setToggle(true);
    visitHanover();
    cy.get('#mapdiv .leaflet-control-geocoder').should('exist');
    openSettings();
    cy.get('#geoMetadata_privacySnippet').invoke('val').should('include', 'Nominatim');
  });

});
