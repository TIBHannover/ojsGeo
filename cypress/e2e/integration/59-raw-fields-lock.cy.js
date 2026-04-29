/**
 * @file cypress/e2e/integration/59-raw-fields-lock.cy.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * @brief DOM-level verification for the raw-data lock on the editor-side
 *        publication tab (refs #114): the three pkp-form textareas start
 *        read-only behind an "Enable editing" button when
 *        geoMetadata_workflow_protectRawFields is on (default), and are
 *        immediately editable when the toggle is off.
 *
 *        Must end with the toggle restored to ON so downstream editorial
 *        specs (33-submission-editorial.cy.js) see the shipped default.
 */

describe('geoMetadata Raw Fields Lock', function () {

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
    // Toggle can sit below the fixed-position modal's visible viewport, and the
    // checkbox's <label> briefly reports visibility:hidden mid-render.
    cy.get(toggleSelector(name)).scrollIntoView();
    if (checked) {
      cy.get(toggleSelector(name)).check({ force: true });
    } else {
      cy.get(toggleSelector(name)).uncheck({ force: true });
    }
    cy.get(submitBtnSelector).click();
    cy.wait(1000);
  };

  // Self-heal: guarantee the toggle starts ON (its shipped default) so test 1
  // sees the locked state even after aborted prior runs.
  const restoreLock = () => {
    setToggle('geoMetadata_workflow_protectRawFields', true);
    cy.logout();
  };
  before(restoreLock);
  after(restoreLock);

  const openLatestPublicationTab = () => {
    // Match the working Dashboard flow used by spec 33. Explicit logout drops
    // the admin session setToggle() leaves us in; 20s timeout tolerates slow
    // post-login hydration on first-navigation.
    cy.logout();
    cy.openSubmissionsAs('eeditor');
    cy.get('a:contains("View")').first().click();
    cy.get('div[role="tablist"]').find('button:contains("Publication")').click();
    cy.get('button[id^="timeLocation"]').click();
  };

  const rawTextareas = () =>
    cy.get('#geoMetadata_rawFields textarea');

  it('default: button is visible and textareas start read-only', function () {
    openLatestPublicationTab();
    cy.get('#geoMetadata_rawFields').should('have.class', 'geoMetadata_rawFields--locked');
    cy.get('#geoMetadata_rawFields_enable').should('be.visible');
    // pkp-form mounts asynchronously; wait for the textareas before asserting.
    rawTextareas().should('have.length.at.least', 3);
    rawTextareas().each(($t) => {
      expect($t.attr('readonly')).to.equal('readonly');
      expect($t.attr('aria-readonly')).to.equal('true');
    });
  });

  it('clicking Enable editing removes readonly and hides the button', function () {
    openLatestPublicationTab();
    rawTextareas().should('have.length.at.least', 3);
    cy.get('#geoMetadata_rawFields_enable').click();
    cy.get('#geoMetadata_rawFields').should('not.have.class', 'geoMetadata_rawFields--locked');
    cy.get('#geoMetadata_rawFields_enable').should('not.be.visible');
    rawTextareas().each(($t) => {
      expect($t.attr('readonly')).to.be.undefined;
      expect($t.attr('aria-readonly')).to.be.undefined;
    });
  });

  it('toggle off: no button, textareas immediately editable', function () {
    setToggle('geoMetadata_workflow_protectRawFields', false);
    openLatestPublicationTab();
    cy.get('#geoMetadata_rawFields_enable').should('not.exist');
    cy.get('#geoMetadata_rawFields').should('not.have.class', 'geoMetadata_rawFields--locked');
    rawTextareas().should('have.length.at.least', 3);
    rawTextareas().each(($t) => {
      expect($t.attr('readonly')).to.be.undefined;
    });
    setToggle('geoMetadata_workflow_protectRawFields', true);
  });

  it('button is back after toggle restored', function () {
    openLatestPublicationTab();
    cy.get('#geoMetadata_rawFields_enable').should('be.visible');
  });

});
