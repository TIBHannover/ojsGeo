/**
 * @file cypress/tests/integration/10-installation.cy.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
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
    // OJS 3.3's register form only exposes a Reviewer checkbox; even though
    // the Author user-group has permit_self_registration=1, the form does not
    // grant Author. Without it, aauthor is Reader-only and 32-submission's
    // "Make a New Submission" link is hidden. 65536 = ROLE_ID_AUTHOR.
    cy.enrollUserInContext('primary', 'aauthor', 65536);
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
    cy.login('admin', 'admin', Cypress.env('contexts').primary.path);
    cy.visit('index.php/' + Cypress.env('contexts').primary.path + '/management/settings/access');
    cy.createUser(editor);
  });

});
