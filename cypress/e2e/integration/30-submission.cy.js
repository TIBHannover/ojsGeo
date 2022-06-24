/**
 * @file cypress/tests/integration/configuration.cy.js
 *
 * Copyright (c) 2022 OPTIMETA project
 * Copyright (c) 2022 Daniel Nüst
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 */

describe('OPTIMETA Geoplugin tests', function () {

  let submission;

  before(function () {
    submission = {
      id: 0,
      //section: 'Articles',
      prefix: '',
      title: 'Hanover is nice',
      subtitle: 'It really is',
      abstract: 'The city of Hanover is really nice, because it is home of the TIB.',
      timePeriod: '2022-01-01 - 2022-12-31',
    };

    cy.register({
      'username': 'aauthor',
      'givenName': 'Augusta',
      'familyName': 'Author',
      'affiliation': 'University of Research',
      'country': 'Germany',
    });
  });

  it('Has no map on the empty current issue page', function () {
    cy.visit('/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Current")').click();
    cy.get('.pkp_structure_main').should('not.contain', 'Times & locations');
  });

  it('Has a map on the current issue page after publishing a paper', function () {
    cy.login('aauthor');
    cy.get('a:contains("aauthor")').click();
    cy.get('a:contains("Dashboard")').click();

    cy.createSubmissionAndPublish(submission);

    // go to journal index and check if there is an empty map
    cy.visit('/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Current")').click();
    cy.get('.pkp_structure_main').should('contain', 'Times & locations');

    // TODO check there is a map!

    // go to issue page and repeat map check
    // TODO
  });

});