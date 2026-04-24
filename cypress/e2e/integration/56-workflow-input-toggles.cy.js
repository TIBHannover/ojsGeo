/**
 * @file cypress/e2e/integration/56-workflow-input-toggles.cy.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 * @brief DOM-level verification for the three editor-side publication-tab
 *        toggles: workflow_enableSpatial (#mapdiv), workflow_enableTemporal
 *        (#geoMetadata-temporal + input[name=datetimes]), and
 *        workflow_enableAdminUnit (#administrativeUnitInput).
 *
 *        Uses an existing submission ("Hanover is nice" or the latest) reached
 *        via the editor dashboard, not the author-side submission form — the
 *        publication tab has different markup (pkpFormField classes, the
 *        temporal input carries a different id).
 *
 *        Must end with every toggle restored to ON so downstream editorial
 *        specs (33-submission-editorial.cy.js) keep the tab layout stable.
 */

describe('geoMetadata Workflow Input Toggles', function () {

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

  const openLatestPublicationTab = () => {
    cy.login('admin', 'admin', Cypress.env('contextPath'));
    cy.get('a:contains("Submissions")').click();
    cy.get('a:contains("View")').first().click();
    cy.get('div[role="tablist"]').find('button:contains("Publication")').click();
    cy.get('button[id^="timeLocation"]').click();
  };

  it('all three blocks are present by default', function () {
    openLatestPublicationTab();
    cy.get('#mapdiv').should('exist');
    cy.get('#geoMetadata-temporal').should('exist');
    cy.get('#administrativeUnitInput').should('exist');
  });

  it('workflow_enableSpatial off removes the map block', function () {
    setToggle('geoMetadata_workflow_enableSpatial', false);
    openLatestPublicationTab();
    cy.get('#mapdiv').should('not.exist');
    cy.get('#geoMetadata-temporal').should('exist');
    cy.get('#administrativeUnitInput').should('exist');
    setToggle('geoMetadata_workflow_enableSpatial', true);
  });

  it('workflow_enableTemporal off removes the date-range block', function () {
    setToggle('geoMetadata_workflow_enableTemporal', false);
    openLatestPublicationTab();
    cy.get('#geoMetadata-temporal').should('not.exist');
    cy.get('#mapdiv').should('exist');
    cy.get('#administrativeUnitInput').should('exist');
    setToggle('geoMetadata_workflow_enableTemporal', true);
  });

  it('workflow_enableAdminUnit off removes the GeoNames tagit block', function () {
    setToggle('geoMetadata_workflow_enableAdminUnit', false);
    openLatestPublicationTab();
    cy.get('#administrativeUnitInput').should('not.exist');
    cy.get('#mapdiv').should('exist');
    cy.get('#geoMetadata-temporal').should('exist');
    setToggle('geoMetadata_workflow_enableAdminUnit', true);
  });

  it('all three blocks are back after restore', function () {
    openLatestPublicationTab();
    cy.get('#mapdiv').should('exist');
    cy.get('#geoMetadata-temporal').should('exist');
    cy.get('#administrativeUnitInput').should('exist');
  });

});
