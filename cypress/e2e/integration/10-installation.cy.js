/**
 * @file cypress/tests/integration/10-installation.cy.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 * Based on file cypress/tests/data/10-Installation.spec.js
 */

describe('geoMetadata Installation', function () {

  it('Installs the software', function () {
    cy.install();
  });

  it('Adds a journal', function () {
    cy.createContext();
  });

  it('Adds issues to the journal', function () {
    cy.createIssues();
  });

  it('Adds test users', function () {
    cy.register({
      'username': 'aauthor',
      'givenName': 'Augusta',
      'familyName': 'Author',
      'affiliation': 'University of Research',
      'country': 'Germany',
    });
    cy.logout();

    let editor = {
      'username': 'eeditor',
      'givenName': 'Edd',
      'familyName': 'Editor',
      'country': 'Germany',
      'affiliation': 'University of Science',
      'roles': ['Journal editor']
    }

    // Log in at the journal level so the user menu's Dashboard link stays inside the journal context —
    // a site-level login (cy.login without context) sometimes drops the session when following Dashboard,
    // landing on /login?source=... instead of the dashboard's Users & Roles sidebar.
    cy.login('admin', 'admin', Cypress.env('contextPath'));
    cy.visit('index.php/' + Cypress.env('contextPath') + '/management/settings/access');
    cy.createUser(editor);
  });

});
