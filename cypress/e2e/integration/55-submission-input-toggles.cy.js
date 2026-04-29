/**
 * @file cypress/e2e/integration/55-submission-input-toggles.cy.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * @brief DOM-level verification for the three author-side submission-input
 *        toggles: submission_enableSpatial (map + drawing widget),
 *        submission_enableTemporal (daterangepicker), submission_enableAdminUnit
 *        (GeoNames tagit widget).
 *
 *        Navigates to step 3 "Enter Metadata" of a fresh submission for each
 *        assertion (each click-through creates a throwaway submission; cypress
 *        does not clean up between tests, and that is consistent with
 *        20-configuration.cy.js).
 *
 *        Must end with every toggle restored to ON so downstream submission
 *        specs (32-submission.cy.js, 33-submission-editorial.cy.js, etc.)
 *        keep their usual form layout.
 */

describe('geoMetadata Submission Input Toggles', function () {

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
    if (checked) {
      cy.get(toggleSelector(name)).check();
    } else {
      cy.get(toggleSelector(name)).uncheck();
    }
    cy.get(submitBtnSelector).click();
    cy.wait(1000);
  };

  const visitSubmissionStep3 = () => {
    cy.login('admin', 'admin', Cypress.env('contexts').primary.path);
    cy.get('a:contains("Submissions")').click();
    cy.get('div#myQueue a:contains("New Submission")').click();
    cy.get('input[id^="checklist-"]').click({ multiple: true });
    cy.get('input[id="privacyConsent"]').click();
    cy.get('button.submitFormButton').click();
    cy.wait(2000);
    cy.get('button.submitFormButton').click();
  };

  it('all three blocks are present by default', function () {
    visitSubmissionStep3();
    cy.get('#mapdiv').should('exist');
    cy.get('#timePeriodsWithDatepicker').should('exist');
    cy.get('#administrativeUnitInput').should('exist');
  });

  it('submission_enableSpatial off removes the map block', function () {
    setToggle('geoMetadata_submission_enableSpatial', false);
    visitSubmissionStep3();
    cy.get('#mapdiv').should('not.exist');
    cy.get('#spatialProperties').should('not.exist');
    cy.get('#timePeriodsWithDatepicker').should('exist');
    cy.get('#administrativeUnitInput').should('exist');
    setToggle('geoMetadata_submission_enableSpatial', true);
  });

  it('submission_enableTemporal off removes the daterangepicker block', function () {
    setToggle('geoMetadata_submission_enableTemporal', false);
    visitSubmissionStep3();
    cy.get('#timePeriodsWithDatepicker').should('not.exist');
    cy.get('#timePeriods').should('not.exist');
    cy.get('#mapdiv').should('exist');
    cy.get('#administrativeUnitInput').should('exist');
    setToggle('geoMetadata_submission_enableTemporal', true);
  });

  it('submission_enableAdminUnit off removes the GeoNames tagit block', function () {
    setToggle('geoMetadata_submission_enableAdminUnit', false);
    visitSubmissionStep3();
    cy.get('#administrativeUnitInput').should('not.exist');
    cy.get('#administrativeUnit').should('not.exist');
    cy.get('#mapdiv').should('exist');
    cy.get('#timePeriodsWithDatepicker').should('exist');
    setToggle('geoMetadata_submission_enableAdminUnit', true);
  });

  it('all three blocks are back after restore', function () {
    visitSubmissionStep3();
    cy.get('#mapdiv').should('exist');
    cy.get('#timePeriodsWithDatepicker').should('exist');
    cy.get('#administrativeUnitInput').should('exist');
  });

});
