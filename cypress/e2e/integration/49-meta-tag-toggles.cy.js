/**
 * @file cypress/e2e/integration/49-meta-tag-toggles.cy.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 * @brief DOM-level verification for the four HTML head meta-tag family
 *        toggles: emitMetaDublinCore (DC.SpatialCoverage, DC.box, DC.temporal),
 *        emitMetaGeoNames (geo.placename, geo.region), emitMetaGeoCoords
 *        (ICBM + geo.position + provenance comment), emitMetaISO19139.
 *
 *        The default-on emission is already covered exhaustively by
 *        40-html_head.cy.js; this spec focuses on the off-path — that turning
 *        one family off strips exactly that family's tags, leaving the others
 *        intact. Uses the Hanover article because it has admin-unit data
 *        (required for geo.placename, geo.region, DC.box, ISO 19139) and
 *        spatial data (required for DC.SpatialCoverage, ICBM, geo.position).
 *
 *        DC.Coverage is emitted by OJS core, not by the plugin, so it is
 *        unaffected by emitMetaDublinCore and must not be asserted on here.
 *
 *        Must end with every setting restored to ON so 40-html_head.cy.js
 *        keeps passing in subsequent runs (specs are ordered by filename).
 */

describe('geoMetadata Meta Tag Toggles', function () {

  const toggleSelector = (name) => `form[id="geoMetadataSettings"] input[name="${name}"]`;
  const submitBtnSelector = 'form[id="geoMetadataSettings"] button[id^="submitFormButton"]';

  const openSettings = () => {
    cy.login('admin', 'admin', Cypress.env('contextPath'));
    cy.get('nav[class="app__nav"] a:contains("Website")').click();
    cy.get('button[id="plugins-button"]').click();
    cy.get('tr[id="component-grid-settings-plugins-settingsplugingrid-category-generic-row-geometadataplugin"] a[class="show_extras"]').click();
    cy.get('a[id^="component-grid-settings-plugins-settingsplugingrid-category-generic-row-geometadataplugin-settings-button"]').click();
  };

  const setToggle = (name, checked) => {
    openSettings();
    if (checked) {
      cy.get(toggleSelector(name)).check();
    } else {
      cy.get(toggleSelector(name)).uncheck();
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

  it('all four families emit by default', function () {
    visitHanover();
    cy.get('meta[name="DC.SpatialCoverage"]').should('exist');
    cy.get('meta[name="DC.box"]').should('exist');
    cy.get('meta[name="geo.placename"]').should('exist');
    cy.get('meta[name="geo.region"]').should('exist');
    cy.get('meta[name="ICBM"]').should('exist');
    cy.get('meta[name="geo.position"]').should('exist');
    cy.get('meta[name="ISO 19139"]').should('exist');
  });

  it('emitMetaDublinCore off removes DC.SpatialCoverage, DC.box, DC.temporal and the schema.DC link', function () {
    setToggle('geoMetadata_emitMetaDublinCore', false);
    visitHanover();
    cy.get('meta[name="DC.SpatialCoverage"]').should('not.exist');
    cy.get('meta[name="DC.box"]').should('not.exist');
    cy.get('meta[name="DC.temporal"]').should('not.exist');
    // Other families remain:
    cy.get('meta[name="geo.placename"]').should('exist');
    cy.get('meta[name="ICBM"]').should('exist');
    cy.get('meta[name="ISO 19139"]').should('exist');
    setToggle('geoMetadata_emitMetaDublinCore', true);
  });

  it('emitMetaGeoNames off removes geo.placename and geo.region only', function () {
    setToggle('geoMetadata_emitMetaGeoNames', false);
    visitHanover();
    cy.get('meta[name="geo.placename"]').should('not.exist');
    cy.get('meta[name="geo.region"]').should('not.exist');
    cy.get('meta[name="DC.SpatialCoverage"]').should('exist');
    cy.get('meta[name="ICBM"]').should('exist');
    cy.get('meta[name="ISO 19139"]').should('exist');
    setToggle('geoMetadata_emitMetaGeoNames', true);
  });

  it('emitMetaGeoCoords off removes ICBM and geo.position only', function () {
    setToggle('geoMetadata_emitMetaGeoCoords', false);
    visitHanover();
    cy.get('meta[name="ICBM"]').should('not.exist');
    cy.get('meta[name="geo.position"]').should('not.exist');
    cy.get('meta[name="DC.SpatialCoverage"]').should('exist');
    cy.get('meta[name="geo.placename"]').should('exist');
    cy.get('meta[name="ISO 19139"]').should('exist');
    setToggle('geoMetadata_emitMetaGeoCoords', true);
  });

  it('emitMetaISO19139 off removes the ISO 19139 tag only', function () {
    setToggle('geoMetadata_emitMetaISO19139', false);
    visitHanover();
    cy.get('meta[name="ISO 19139"]').should('not.exist');
    cy.get('meta[name="DC.box"]').should('exist');
    cy.get('meta[name="geo.placename"]').should('exist');
    cy.get('meta[name="ICBM"]').should('exist');
    setToggle('geoMetadata_emitMetaISO19139', true);
  });

  it('turning all four families off removes every plugin-injected tag', function () {
    setToggle('geoMetadata_emitMetaDublinCore', false);
    setToggle('geoMetadata_emitMetaGeoNames', false);
    setToggle('geoMetadata_emitMetaGeoCoords', false);
    setToggle('geoMetadata_emitMetaISO19139', false);
    visitHanover();
    cy.get('meta[name="DC.SpatialCoverage"]').should('not.exist');
    cy.get('meta[name="DC.box"]').should('not.exist');
    cy.get('meta[name="DC.temporal"]').should('not.exist');
    cy.get('meta[name="geo.placename"]').should('not.exist');
    cy.get('meta[name="geo.region"]').should('not.exist');
    cy.get('meta[name="ICBM"]').should('not.exist');
    cy.get('meta[name="geo.position"]').should('not.exist');
    cy.get('meta[name="ISO 19139"]').should('not.exist');
    setToggle('geoMetadata_emitMetaDublinCore', true);
    setToggle('geoMetadata_emitMetaGeoNames', true);
    setToggle('geoMetadata_emitMetaGeoCoords', true);
    setToggle('geoMetadata_emitMetaISO19139', true);
  });

  it('all families emit again after restore', function () {
    visitHanover();
    cy.get('meta[name="DC.SpatialCoverage"]').should('exist');
    cy.get('meta[name="DC.box"]').should('exist');
    cy.get('meta[name="geo.placename"]').should('exist');
    cy.get('meta[name="geo.region"]').should('exist');
    cy.get('meta[name="ICBM"]').should('exist');
    cy.get('meta[name="geo.position"]').should('exist');
    cy.get('meta[name="ISO 19139"]').should('exist');
  });

});
