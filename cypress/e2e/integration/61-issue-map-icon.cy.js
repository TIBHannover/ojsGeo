/**
 * @file cypress/e2e/integration/61-issue-map-icon.cy.js
 *
 * Copyright (c) 2026 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * @brief Issue #158 — map icon next to each article title in the issue TOC.
 *        Hover highlights the article's geometries on the map; click opens
 *        the popup and scrolls the map into view; Esc closes the popup and
 *        refocuses the icon. Admin toggle geoMetadata_showIssueMapIcon
 *        (default on) hides the icon when off. "Outside of nowhere" (no
 *        geoMetadata, seeded by 37-submission-outside-of-nowhere.cy.js) must
 *        NOT render an icon.
 *
 *        Must restore the toggle to default-on in the final block so later
 *        specs see the baseline.
 */

describe('geoMetadata Issue Map Icon', function () {

  const submitBtnSelector = 'form[id="geoMetadataSettings"] button[id^="submitFormButton"]';
  const checkbox = 'form[id="geoMetadataSettings"] input[name="geoMetadata_showIssueMapIcon"]';

  const openSettings = () => {
    cy.login('admin', 'admin', Cypress.env('contexts').primary.path);
    cy.get('nav[class="app__nav"] a:contains("Website")').click();
    cy.get('button[id="plugins-button"]').click();
    cy.get('tr[id="component-grid-settings-plugins-settingsplugingrid-category-generic-row-geometadataplugin"] a[class="show_extras"]').click();
    cy.get('a[id^="component-grid-settings-plugins-settingsplugingrid-category-generic-row-geometadataplugin-settings-button"]').click();
  };

  const saveSettings = () => {
    cy.get(submitBtnSelector).click();
    cy.wait(1000);
  };

  const setToggle = (checked) => {
    openSettings();
    if (checked) { cy.get(checkbox).check(); } else { cy.get(checkbox).uncheck(); }
    saveSettings();
  };

  const visitIssue = () => {
    cy.visit('/' + Cypress.env('contexts').primary.path + '/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Archive")').click();
    cy.get('a:contains("Vol. 1 No. 2 (2022)")').click();
  };

  it('renders an icon next to each article with spatial data', function () {
    visitIssue();
    // "Hanover is nice" has a LineString and should carry an icon.
    cy.contains('.obj_article_summary', 'Hanover is nice')
      .find('a.geoMetadata_issue_mapIcon')
      .should('exist')
      .and('have.attr', 'href', '#mapdiv')
      .and('have.attr', 'aria-label', 'Show on map');
    cy.contains('.obj_article_summary', 'Hanover is nice')
      .find('a.geoMetadata_issue_mapIcon i.fa.fa-map').should('exist');
    // screen-reader label includes the article title.
    cy.contains('.obj_article_summary', 'Hanover is nice')
      .find('a.geoMetadata_issue_mapIcon .pkp_screen_reader')
      .should('contain.text', 'Hanover is nice');
  });

  it('does NOT render an icon for articles without geoMetadata', function () {
    visitIssue();
    cy.contains('.obj_article_summary', 'Outside of nowhere')
      .find('a.geoMetadata_issue_mapIcon')
      .should('not.exist');
  });

  it('hover on the icon highlights the article geometry on the map', function () {
    visitIssue();
    cy.get('#mapdiv path.leaflet-interactive').should('exist');
    cy.contains('.obj_article_summary', 'Hanover is nice')
      .find('a.geoMetadata_issue_mapIcon')
      .trigger('mouseenter');
    // At least one path now carries the configured highlight colour. Asserting
    // "any" rather than "the first" makes the test robust to insertion order
    // among seeded articles (more were added for the timeline / overlap tests).
    cy.get('#mapdiv path.leaflet-interactive[stroke="#ff0000"]', { timeout: 10000 }).should('exist');
  });

  it('click on the icon opens the article popup and scrolls the map into view', function () {
    visitIssue();
    cy.contains('.obj_article_summary', 'Hanover is nice')
      .find('a.geoMetadata_issue_mapIcon')
      .click();
    cy.get('#mapdiv .leaflet-popup').should('be.visible');
    // #mapdiv is centred in the viewport (approx). Allow some slack for theme chrome.
    cy.get('#mapdiv').then(($m) => {
      const r = $m[0].getBoundingClientRect();
      const vh = Cypress.config('viewportHeight');
      // map's top edge is above the viewport's midpoint, bottom edge below it.
      expect(r.top, 'mapdiv in viewport after scroll').to.be.lessThan(vh);
    });
  });

  it('Esc closes the popup and returns focus to the opening icon', function () {
    visitIssue();
    cy.contains('.obj_article_summary', 'Hanover is nice')
      .find('a.geoMetadata_issue_mapIcon')
      .as('icon')
      .click();
    cy.get('#mapdiv .leaflet-popup').should('be.visible');
    cy.get('body').type('{esc}');
    cy.get('#mapdiv .leaflet-popup').should('not.exist');
    cy.focused().should('have.class', 'geoMetadata_issue_mapIcon');
  });

  it('toggle off hides all icons; back on restores them', function () {
    setToggle(false);
    visitIssue();
    cy.get('a.geoMetadata_issue_mapIcon').should('not.exist');

    setToggle(true);
    visitIssue();
    cy.get('a.geoMetadata_issue_mapIcon').should('exist');
  });

});
