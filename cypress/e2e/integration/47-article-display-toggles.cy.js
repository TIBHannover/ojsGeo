/**
 * @file cypress/e2e/integration/47-article-display-toggles.cy.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * @brief DOM-level verification for the three per-journal article-display
 *        toggles: showArticleMap (interactive Leaflet map + spatial heading +
 *        map privacy notice), showArticleTemporal (ISO 8601 time-period line),
 *        showArticleAdminUnit (administrative-unit name list).
 *
 *        Settings-form persistence is covered by 20-configuration.cy.js; this
 *        spec focuses on the rendered article page. Exercises the Hanover
 *        article (has spatial + admin-unit data) so all three blocks render by
 *        default.
 *
 *        Must end with every setting restored to ON so subsequent specs see
 *        the default state.
 */

describe('geoMetadata Article Display Toggles', function () {

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

  const visitHanover = () => {
    cy.visit('/' + Cypress.env('contexts').primary.path + '/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Archive")').click();
    cy.get('a:contains("Vol. 1 No. 2 (2022)")').click();
    cy.openArticleByTitle('Hanover is nice');
  };

  it('shows map, temporal, and admin-unit blocks by default', function () {
    visitHanover();
    cy.get('#geoMetadata_article_temporal').should('exist');
    cy.get('#geoMetadata_article_spatial').should('exist');
    cy.get('#mapdiv').should('exist');
    cy.get('#geoMetadata_article_administrativeUnit').should('exist');
  });

  it('hides the map block when showArticleMap is off', function () {
    setToggle('geoMetadata_showArticleMap', false);
    visitHanover();
    cy.get('#mapdiv').should('not.exist');
    cy.get('#geoMetadata_article_spatial').should('not.exist');
    // Siblings must still render:
    cy.get('#geoMetadata_article_temporal').should('exist');
    cy.get('#geoMetadata_article_administrativeUnit').should('exist');
    setToggle('geoMetadata_showArticleMap', true);
  });

  it('hides the temporal block when showArticleTemporal is off', function () {
    setToggle('geoMetadata_showArticleTemporal', false);
    visitHanover();
    cy.get('#geoMetadata_article_temporal').should('not.exist');
    cy.get('#mapdiv').should('exist');
    cy.get('#geoMetadata_article_administrativeUnit').should('exist');
    setToggle('geoMetadata_showArticleTemporal', true);
  });

  it('hides the administrative-unit block when showArticleAdminUnit is off', function () {
    setToggle('geoMetadata_showArticleAdminUnit', false);
    visitHanover();
    cy.get('#geoMetadata_article_administrativeUnit').should('not.exist');
    cy.get('#mapdiv').should('exist');
    cy.get('#geoMetadata_article_temporal').should('exist');
    setToggle('geoMetadata_showArticleAdminUnit', true);
  });

  it('suppresses the whole geoMetadata section when all three toggles are off', function () {
    setToggle('geoMetadata_showArticleMap', false);
    setToggle('geoMetadata_showArticleTemporal', false);
    setToggle('geoMetadata_showArticleAdminUnit', false);
    visitHanover();
    cy.get('#geoMetadata_article_geospatialmetadata').should('not.exist');
    setToggle('geoMetadata_showArticleMap', true);
    setToggle('geoMetadata_showArticleTemporal', true);
    setToggle('geoMetadata_showArticleAdminUnit', true);
  });

  it('all three blocks are back after restore', function () {
    visitHanover();
    cy.get('#geoMetadata_article_temporal').should('exist');
    cy.get('#mapdiv').should('exist');
    cy.get('#geoMetadata_article_administrativeUnit').should('exist');
  });

});
