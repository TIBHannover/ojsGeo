/**
 * @file cypress/tests/integration/53-privacy-notice.cy.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 * @brief Issue #124: the short "map data privacy" notice must render under every
 *        rendered map in the reader's UI locale. Depends on 50-locales.cy.js
 *        having enabled de_DE as a UI locale earlier in the run.
 */

describe('geoMetadata Map Privacy Notice', function () {

  const noticeSelector = 'p.geoMetadata_privacyNotice';

  const enText = 'Map tiles are loaded from third-party servers. See the journal\'s privacy policy for details.';
  const deText = 'Kartenkacheln werden von Drittanbieter-Servern geladen. Einzelheiten finden Sie in der Datenschutzerklärung des Journals.';

  // Navigate entirely by URL — both the "Archive" nav label and the issue's
  // "Vol. 1 No. 2 (2022)" volume/number text are localized (German: "Bd. 1
  // Nr. 2 (2022)"), so we jump straight to the issue view and pick the
  // article by title (titles are not translated).
  const visitHanover = () => {
    cy.visit('/' + Cypress.env('contextPath') + '/issue/view/1');
    cy.get('a:contains("Hanover is nice")').last().click();
  };

  it('shows the English privacy notice under the article map by default', function () {
    visitHanover();
    cy.get('#mapdiv').should('exist');
    cy.get(noticeSelector).should('be.visible').and('contain.text', enText);
  });

  it('shows the English privacy notice on the journal map page by default', function () {
    cy.visit('/' + Cypress.env('contextPath') + '/map');
    cy.get('#mapdiv').should('exist');
    cy.get(noticeSelector).should('be.visible').and('contain.text', enText);
  });

  it('switches the notice text when the UI locale is German', function () {
    // URL-direct locale switch — more deterministic than the user-menu
    // dropdown (which races the session cookie write against cy.visit).
    cy.login('aauthor');
    cy.visit('/index.php/index/user/setLocale/de_DE');

    visitHanover();
    cy.get(noticeSelector).should('be.visible').and('contain.text', deText);

    cy.visit('/index.php/index/user/setLocale/en_US');
    cy.logout();
  });

});
