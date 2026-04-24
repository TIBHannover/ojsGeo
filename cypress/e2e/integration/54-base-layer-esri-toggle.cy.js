/**
 * @file cypress/tests/integration/54-base-layer-esri-toggle.cy.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 * @brief Issue #124: plugin setting `geoMetadata_showEsriBaseLayer` toggles the
 *        Esri World Imagery base layer in the Leaflet layer control. Must end
 *        with the setting restored to ON so subsequent specs keep the default.
 */

describe('geoMetadata Esri Base Layer Toggle', function () {

  const checkboxSelector = 'form[id="geoMetadataSettings"] input[name="geoMetadata_showEsriBaseLayer"]';
  const submitBtnSelector = 'form[id="geoMetadataSettings"] button[id^="submitFormButton"]';
  const baseLayerInputs = '#mapdiv .leaflet-control-layers-base input[type="radio"]';
  const baseLayerPanel = '#mapdiv .leaflet-control-layers-base';

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
    cy.contains('form[id="geoMetadataSettings"]', 'Third-party services').should('exist');
  });

  it('shows both OpenStreetMap and Esri World Imagery base layers by default', function () {
    visitHanover();
    cy.get('#mapdiv').should('exist');
    cy.get(baseLayerInputs).should('have.length', 2);
    cy.get(baseLayerPanel).should('contain.text', 'Esri World Imagery');
  });

  it('shows only OpenStreetMap when the setting is turned off', function () {
    setToggle(false);
    visitHanover();
    cy.get('#mapdiv').should('exist');
    cy.get(baseLayerInputs).should('have.length', 1);
    cy.get(baseLayerPanel).should('not.contain.text', 'Esri');
  });

  it('restores both base layers when the setting is turned back on', function () {
    setToggle(true);
    visitHanover();
    cy.get(baseLayerInputs).should('have.length', 2);
    cy.get(baseLayerPanel).should('contain.text', 'Esri World Imagery');
  });

  it('privacy snippet on the settings page drops the Esri paragraph when Esri is off, restores it when on', function () {
    setToggle(false);
    openSettings();
    cy.get('#geoMetadata_privacySnippet').invoke('val').should('not.include', 'Esri');

    setToggle(true);
    openSettings();
    cy.get('#geoMetadata_privacySnippet').invoke('val').should('include', 'Esri');
  });

  it('privacy snippet updates live when the checkbox is toggled without saving', function () {
    openSettings();
    cy.get('#geoMetadata_privacySnippet').invoke('val').should('include', 'Esri');
    cy.get(checkboxSelector).uncheck();
    cy.get('#geoMetadata_privacySnippet').invoke('val').should('not.include', 'Esri');
    cy.get(checkboxSelector).check();
    cy.get('#geoMetadata_privacySnippet').invoke('val').should('include', 'Esri');
  });

});
