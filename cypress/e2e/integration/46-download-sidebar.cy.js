/**
 * @file cypress/tests/integration/46-download-sidebar.cy.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 * @brief DOM-level verification for issue #55: the plugin setting
 *        `geoMetadata_showDownloadSidebar` actually hides/shows the GeoJSON
 *        download section on the article page. Uses "Hanover is nice" because
 *        it has spatial data (and is the same article other article-page specs
 *        rely on). Settings-form persistence is covered separately by
 *        20-configuration.cy.js; this spec focuses on the rendered output.
 *
 *        Must end with the setting restored to "on" so subsequent specs that
 *        assume the default behavior keep passing.
 */

describe('geoMetadata Download Sidebar Toggle', function () {

  const downloadSectionSelector = '#geoMetadata_article_spatial_download';
  const checkboxSelector = 'form[id="geoMetadataSettings"] input[name="geoMetadata_showDownloadSidebar"]';
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

  it('shows the GeoJSON download section by default', function () {
    visitHanover();
    cy.get(downloadSectionSelector)
      .should('exist')
      .and('be.visible')
      .within(() => {
        cy.get('a.obj_galley_link.geoJSON').should('contain.text', 'GeoJSON');
      });
  });

  it('hides the GeoJSON download section when the setting is turned off', function () {
    setToggle(false);
    visitHanover();
    cy.get(downloadSectionSelector).should('not.exist');

    // Regression guard: the plugin's styles.css defines the .tooltip rules used by
    // the tooltip spans in article_details.tpl. It used to be pulled in via an inline
    // <link> inside the gated download partial, so disabling the sidebar stripped the
    // tooltip styles too. The stylesheet is now loaded globally in register(); assert
    // it is still present when the sidebar is off.
    cy.get('head link[rel="stylesheet"]')
      .filter('[href*="plugins/generic/geoMetadata/css/styles.css"]')
      .should('have.length.at.least', 1);
    cy.get('#geoMetadata_article_temporal span.tooltip').should('exist');
  });

  it('restores the GeoJSON download section when the setting is turned back on', function () {
    setToggle(true);
    visitHanover();
    cy.get(downloadSectionSelector)
      .should('exist')
      .and('be.visible');
  });

  // Stub downloadObjectAsJson to capture the payload the browser would write.
  it('downloaded GeoJSON carries exact ISO 3166-1 + ISO 3166-2 codes (issue #88)', function () {
    visitHanover();
    cy.window().then((win) => {
      cy.stub(win, 'downloadObjectAsJson').as('downloadStub');
    });
    cy.get('a.obj_galley_link.geoJSON').click();
    cy.get('@downloadStub').should('have.been.calledOnce');
    cy.get('@downloadStub').invoke('getCall', 0).then((call) => {
      const exportObj = call.args[0];
      const exportName = call.args[1];
      expect(exportName, 'download filename').to.equal('geospatialMetadata');
      expect(exportObj.administrativeUnits, 'administrativeUnits array').to.be.an('array').and.not.be.empty;
      const mostSpecific = exportObj.administrativeUnits[exportObj.administrativeUnits.length - 1];
      expect(mostSpecific.isoCountryCode,     'isoCountryCode').to.equal('DE');
      expect(mostSpecific.isoSubdivisionCode, 'isoSubdivisionCode').to.equal('TH');
    });
  });

});
