/**
 * @file cypress/e2e/integration/56-workflow-input-toggles.cy.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
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
    cy.login('admin', 'admin', Cypress.env('contexts').primary.path);
    cy.get('nav[class="app__nav"] a:contains("Website")').click();
    cy.get('button[id="plugins-button"]').click();
    cy.get('tr[id="component-grid-settings-plugins-settingsplugingrid-category-generic-row-geometadataplugin"] a[class="show_extras"]').click();
    cy.get('a[id^="component-grid-settings-plugins-settingsplugingrid-category-generic-row-geometadataplugin-settings-button"]').click();
  };

  const setToggle = (name, checked) => {
    openSettings();
    // workflow_* toggles sit low in the settings form and are often clipped
    // by the fixed-position modal overflow, so scroll them into view first.
    cy.get(toggleSelector(name)).scrollIntoView();
    if (checked) {
      cy.get(toggleSelector(name)).check();
    } else {
      cy.get(toggleSelector(name)).uncheck();
    }
    cy.get(submitBtnSelector).click();
    cy.wait(1000);
  };

  // Guarantee all three workflow toggles start ON so test 1 ("all three blocks
  // are present by default") and subsequent per-toggle tests see a valid tab
  // layout, even if a previous aborted run left some of them OFF.
  const restoreAllToggles = () => {
    openSettings();
    ['geoMetadata_workflow_enableSpatial',
     'geoMetadata_workflow_enableTemporal',
     'geoMetadata_workflow_enableAdminUnit'].forEach((name) => {
      // {force: true}: the checkbox's label sometimes reports
      // visibility:hidden mid-render; we only need the final checked state.
      cy.get(toggleSelector(name)).scrollIntoView().check({ force: true });
    });
    cy.get(submitBtnSelector).click();
    cy.wait(1000);
    // Drop the admin session so the first test's cy.login('eeditor') lands on
    // the editor dashboard rather than re-using the admin-backend context.
    cy.logout();
  };

  before(restoreAllToggles);
  after(restoreAllToggles);

  const openLatestPublicationTab = () => {
    // Explicit logout first so we drop the admin session setToggle() leaves us
    // in. Use the Archives tab — the publication-tab markup is identical for
    // published and in-flight submissions, and Archives is reliably populated
    // by the DB-seeded fixtures (12-primary-fixtures, 12a-timeline-fixtures)
    // independent of which prior specs have published things during the run.
    cy.logout();
    cy.openSubmissionsAs('eeditor');
    cy.get('button[id="archive-button"]').click();
    cy.get('a:contains("View"):visible').first().click();
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
