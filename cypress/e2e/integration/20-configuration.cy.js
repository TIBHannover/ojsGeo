/**
 * @file cypress/tests/integration/configuration.cy.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 */

describe('geoMetadata Configuration', function () {

  it('Disable geoMetadata', function () {
    cy.login('admin', 'admin', Cypress.env('contexts').primary.path);
    cy.get('nav[class="app__nav"] a:contains("Website")').click();
    cy.get('button[id="plugins-button"]').click();
    // Disable plugin if currently enabled. The success toast is too transient
    // to assert against reliably; verify the checkbox state instead.
    cy.get('input[id^="select-cell-geometadataplugin-enabled"]')
      .then($btn => {
        if ($btn.is(':checked')) {
          cy.get('input[id^="select-cell-geometadataplugin-enabled"]').click();
          cy.get('div[class*="pkp_modal_panel"] button[class*="pkpModalConfirmButton"]').click();
          cy.get('input[id^="select-cell-geometadataplugin-enabled"]').should('not.be.checked');
        }
      });
  });

  it('Enable geoMetadata', function () {
    cy.login('admin', 'admin', Cypress.env('contexts').primary.path);
    cy.get('nav[class="app__nav"] a:contains("Website")').click();
    cy.get('button[id="plugins-button"]').click();
    // Find and enable the plugin; assert the checkbox reflects enabled state
    // (the transient "has been enabled" toast disappears too quickly to
    // reliably catch with a retrying cy.get).
    cy.get('input[id^="select-cell-geometadataplugin-enabled"]').click();
    cy.get('input[id^="select-cell-geometadataplugin-enabled"]').should('be.checked');
  });

  it('Has a map in the third submissions step', function () {
    cy.login('admin', 'admin', Cypress.env('contexts').primary.path);

    cy.get('a:contains("Submissions")').click();
    cy.get('div#myQueue a:contains("New Submission")').click();
    cy.get('input[id^="checklist-"]').click({ multiple: true });
    cy.get('input[id="privacyConsent"]').click();
    cy.get('button.submitFormButton').click();
    cy.wait(2000);
    cy.get('button.submitFormButton').click();
    cy.get('#mapdiv').should('exist');

    cy.logout();
  });

  it('Has coverage input disabled with a hover message in the right language if the metadata field is enabled', function () {
    cy.login('admin', 'admin', Cypress.env('contexts').primary.path);

    cy.get('nav[class="app__nav"] a:contains("Workflow")').click();
    cy.get('button#metadata-button').click();
    // Idempotent: if the toggle is already on from a prior run, clicking
    // again disables it. Use .check() to force the on state.
    cy.get('input[aria-describedby^="metadataSettings-coverage"]').check();
    cy.get('input[value="request"]').check({ multiple: true });
    cy.get('div#metadata').find('button:contains("Save")').click();
    cy.wait(2000);
    
    cy.get('a:contains("Submissions")').click();
    cy.get('div#myQueue a:contains("New Submission")').click();
    cy.get('input[id^="checklist-"]').click({ multiple: true });
    cy.get('input[id="privacyConsent"]').click();
    cy.get('button.submitFormButton').click();
    cy.wait(2000);
    cy.get('button.submitFormButton').click();
    cy.get('input[id^="coverage-"]', { timeout: 20000 }).should('exist');
    cy.get('input[id^="coverage-"]').invoke('attr', 'disabled').should('eq', 'disabled');
    cy.get('input[id^="coverage-"]').invoke('attr', 'title').should('contain', 'field has been disabled');
    cy.get('input[id^="coverage-"]').should('have.value', '');
    
    cy.logout();
  });

  it('Configure geoMetadata - Map colors', function () {
    this.skip(); // TODO implement

    //cy.get('form[id="geoMetadataSettings"] input[name="geoMetadata_mapLayerStyle_color"]')
    //  .clear()
    //  .type('#00ff00');
    //cy.get('form[id="geoMetadataSettings"] input[name="geoMetadata_mapLayerStyle_colorHighlight"]')
    //  .clear()
    //  .type('#01ff01');
  });

  it('Configure Geo Plugin - Download sidebar', function () {
    // issue #55: checkbox in plugin settings that toggles the GeoJSON download sidebar
    // on article pages. Verifies the checkbox exists, can be toggled off and back on, and
    // that the state persists across save/reload. Must end in the "on" state so later
    // specs that rely on the sidebar being present are not affected.

    var openSettings = () => {
      cy.login('admin', 'admin', Cypress.env('contexts').primary.path);
      cy.get('nav[class="app__nav"] a:contains("Website")').click();
      cy.get('button[id="plugins-button"]').click();
      cy.get('tr[id="component-grid-settings-plugins-settingsplugingrid-category-generic-row-geometadataplugin"] a[class="show_extras"]').click();
      cy.get('a[id^="component-grid-settings-plugins-settingsplugingrid-category-generic-row-geometadataplugin-settings-button"]').click();
    };

    // 1. Open settings — checkbox should exist in the new "Frontend" section and default to checked.
    openSettings();
    cy.get('form[id="geoMetadataSettings"] input[name="geoMetadata_showDownloadSidebar"]')
      .should('exist')
      .should('be.checked');

    // 2. Uncheck, save.
    cy.get('form[id="geoMetadataSettings"] input[name="geoMetadata_showDownloadSidebar"]').uncheck();
    cy.get('form[id="geoMetadataSettings"] button[id^="submitFormButton"]').click();
    cy.wait(1000);

    // 3. Re-open settings — checkbox should persist as unchecked.
    openSettings();
    cy.get('form[id="geoMetadataSettings"] input[name="geoMetadata_showDownloadSidebar"]')
      .should('not.be.checked');

    // 4. Re-check, save — restores default state for subsequent specs.
    cy.get('form[id="geoMetadataSettings"] input[name="geoMetadata_showDownloadSidebar"]').check();
    cy.get('form[id="geoMetadataSettings"] button[id^="submitFormButton"]').click();
    cy.wait(1000);

    // 5. Confirm the "on" state is persisted.
    openSettings();
    cy.get('form[id="geoMetadataSettings"] input[name="geoMetadata_showDownloadSidebar"]')
      .should('be.checked');
  });

  it('persists every boolean toggle across save/reload', function () {
    // Walks the full set of plugin boolean toggles: asserts they default to
    // checked, then uncheck-save-reload-assert, then check-save-reload-assert.
    // Must end in the all-on state so downstream specs that rely on any
    // toggled feature continue to work. showDownloadSidebar is covered
    // separately above; every other boolean is included here.

    const toggles = [
      'geoMetadata_showArticleMap',
      'geoMetadata_showArticleTemporal',
      'geoMetadata_showArticleAdminUnit',
      'geoMetadata_showIssueMap',
      'geoMetadata_showJournalMap',
      'geoMetadata_submission_enableSpatial',
      'geoMetadata_submission_enableTemporal',
      'geoMetadata_submission_enableAdminUnit',
      'geoMetadata_workflow_enableSpatial',
      'geoMetadata_workflow_enableTemporal',
      'geoMetadata_workflow_enableAdminUnit',
      'geoMetadata_emitMetaDublinCore',
      'geoMetadata_emitMetaGeoNames',
      'geoMetadata_emitMetaGeoCoords',
      'geoMetadata_emitMetaISO19139',
      'geoMetadata_enableGeocoderSearch',
    ];

    const openSettings = () => {
      cy.login('admin', 'admin', Cypress.env('contexts').primary.path);
      cy.get('nav[class="app__nav"] a:contains("Website")').click();
      cy.get('button[id="plugins-button"]').click();
      cy.get('tr[id="component-grid-settings-plugins-settingsplugingrid-category-generic-row-geometadataplugin"] a[class="show_extras"]').click();
      cy.get('a[id^="component-grid-settings-plugins-settingsplugingrid-category-generic-row-geometadataplugin-settings-button"]').click();
      cy.get('form[id="geoMetadataSettings"]').should('exist');
    };

    const sel = (name) => `form[id="geoMetadataSettings"] input[name="${name}"]`;
    const save = () => {
      cy.get('form[id="geoMetadataSettings"] button[id^="submitFormButton"]').click();
      cy.wait(1000);
    };

    openSettings();
    toggles.forEach((name) => cy.get(sel(name)).should('exist').and('be.checked'));

    toggles.forEach((name) => cy.get(sel(name)).uncheck());
    save();

    openSettings();
    toggles.forEach((name) => cy.get(sel(name)).should('not.be.checked'));

    toggles.forEach((name) => cy.get(sel(name)).check());
    save();

    openSettings();
    toggles.forEach((name) => cy.get(sel(name)).should('be.checked'));
  });
});
