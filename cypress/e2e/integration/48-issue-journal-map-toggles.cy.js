/**
 * @file cypress/e2e/integration/48-issue-journal-map-toggles.cy.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 * @brief DOM-level verification for the two aggregate-map toggles:
 *        showIssueMap gates the map block on issue table-of-contents pages,
 *        showJournalMap gates the entire /map route on the journal.
 *
 *        Both default to ON. The settings-form persistence check is covered in
 *        20-configuration.cy.js; this spec focuses on rendered output.
 *
 *        Must end with both settings restored to ON so downstream specs
 *        (41-maps.cy.js and 43-search.cy.js) keep the issue/journal maps
 *        available.
 */

describe('geoMetadata Issue + Journal Map Toggles', function () {

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

  const visitIssue = () => {
    cy.visit('/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Archive")').click();
    cy.get('a:contains("Vol. 1 No. 2 (2022)")').click();
  };

  const journalMapUrl = () => '/' + Cypress.env('contextPath') + '/map';

  it('issue TOC map is present by default', function () {
    visitIssue();
    cy.get('.pkp_structure_main').should('contain', 'Times & Locations');
    cy.get('#mapdiv').should('exist');
  });

  it('issue TOC map is absent when showIssueMap is off', function () {
    setToggle('geoMetadata_showIssueMap', false);
    visitIssue();
    cy.get('#mapdiv').should('not.exist');
    cy.get('.pkp_structure_main').should('not.contain', 'Times & Locations');
    setToggle('geoMetadata_showIssueMap', true);
  });

  it('issue TOC map returns after restoring showIssueMap', function () {
    visitIssue();
    cy.get('#mapdiv').should('exist');
  });

  it('journal /map route serves the map page by default', function () {
    cy.request({ url: journalMapUrl(), failOnStatusCode: false })
      .its('status').should('eq', 200);
    cy.visit(journalMapUrl());
    cy.get('#mapdiv').should('exist');
  });

  it('journal /map route returns 404 when showJournalMap is off', function () {
    setToggle('geoMetadata_showJournalMap', false);
    cy.request({ url: journalMapUrl(), failOnStatusCode: false })
      .its('status').should('eq', 404);
    setToggle('geoMetadata_showJournalMap', true);
  });

  it('journal /map route is back after restoring showJournalMap', function () {
    cy.request({ url: journalMapUrl(), failOnStatusCode: false })
      .its('status').should('eq', 200);
  });

});
