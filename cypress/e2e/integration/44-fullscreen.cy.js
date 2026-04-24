/**
 * @file cypress/tests/integration/44-fullscreen.cy.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 * @brief Verifies the Leaflet fullscreen control added to every map by the plugin
 *        (see issue #61). Covers: button presence on current-issue / archive-issue /
 *        article-details / journal-map pages, localized title in en_US, and the
 *        enter-exit toggle cycle (button class, title attribute, window.map._isFullscreen).
 */

describe('geoMetadata Fullscreen Control', function () {

  const fsBtnSelector = '#mapdiv a.leaflet-control-zoom-fullscreen';
  const titleEnter = 'View fullscreen';
  const titleExit = 'Exit fullscreen';

  const expectButton = (title) => {
    cy.get(fsBtnSelector)
      .should('exist')
      .and('be.visible')
      .and('have.attr', 'title', title);
  };

  it('renders the fullscreen button on the current-issue map', function () {
    cy.visit('/');
    cy.get('#mapdiv').should('exist');
    expectButton(titleEnter);
  });

  it('renders the fullscreen button on an archive-issue map', function () {
    cy.visit('/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Archive")').click();
    cy.get('a:contains("Vol. 1 No. 2 (2022)")').click();

    cy.get('#mapdiv').should('exist');
    expectButton(titleEnter);
  });

  it('renders the fullscreen button on an article details page', function () {
    cy.visit('/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Archive")').click();
    cy.get('a:contains("Vol. 1 No. 2 (2022)")').click();
    cy.get('a:contains("Hanover is nice")').last().click();

    cy.get('#mapdiv').should('exist');
    expectButton(titleEnter);
  });

  it('toggles fullscreen state and updates the button title when clicked', function () {
    cy.visit('/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Archive")').click();
    cy.get('a:contains("Vol. 1 No. 2 (2022)")').click();
    cy.get('a:contains("Hanover is nice")').last().click();

    cy.get('#mapdiv').should('exist');
    cy.get(fsBtnSelector).as('fsBtn');

    // initial state: not fullscreen, title says "View fullscreen"
    cy.get('@fsBtn')
      .should('not.have.class', 'leaflet-fullscreen-on')
      .and('have.attr', 'title', titleEnter);

    // enter fullscreen
    cy.get('@fsBtn').click();
    cy.get('@fsBtn')
      .should('have.class', 'leaflet-fullscreen-on')
      .and('have.attr', 'title', titleExit);
    cy.window().then((win) => {
      expect(win.map._isFullscreen, 'map._isFullscreen after enter').to.be.true;
    });

    // exit fullscreen
    cy.get('@fsBtn').click();
    cy.get('@fsBtn')
      .should('not.have.class', 'leaflet-fullscreen-on')
      .and('have.attr', 'title', titleEnter);
    cy.window().then((win) => {
      expect(win.map._isFullscreen, 'map._isFullscreen after exit').to.be.false;
    });
  });

  it('renders the fullscreen button on the journal map page', function () {
    // Reach the journal map by URL — the primary-nav "Map" menu item is an
    // optional manual OJS setup step (README §3) not automated in CI.
    cy.visit('/' + Cypress.env('contextPath') + '/map');
    cy.get('#mapdiv').should('exist');
    expectButton(titleEnter);
  });

});
