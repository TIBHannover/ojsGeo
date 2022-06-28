/**
 * @file cypress/tests/integration/configuration.cy.js
 *
 * Copyright (c) 2022 OPTIMETA project
 * Copyright (c) 2022 Daniel Nüst
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 */

describe('OPTIMETA Geoplugin tests', function () {

  var submission;
  var submission2;

  before(function () {
    submission = {
      id: 0,
      //section: 'Articles',
      prefix: '',
      title: 'Hanover is nice',
      subtitle: 'It really is',
      abstract: 'The city of Hanover is really nice, because it is home of the TIB.',
      timePeriod: '2022-01-01 - 2022-12-31',
      issue: '1'
    };

    submission2 = {
      id: 0,
      //section: 'Articles',
      prefix: '',
      title: 'Münster will be nice',
      subtitle: 'Most likely',
      abstract: 'The city of Münster will be really nice when it is time.',
      timePeriod: '2022-02-02 - 2022-12-12',
      issue: '2'
    };
  });

  it('Has no map on the empty current issue page', function () {
    cy.visit('/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Current")').click();
    cy.get('.pkp_structure_main').should('not.contain', 'Times & locations');
    cy.get('#mapdiv').should('not.exist');
  });

  it('Has a map on the current issue page after publishing a paper', function () {
    cy.login('aauthor');
    cy.get('a:contains("aauthor")').click();
    cy.get('a:contains("Dashboard")').click({ force: true });

    cy.createSubmissionAndPublish(submission);

    // go to journal index and check if there is a map
    cy.visit('/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Current")').click();
    cy.get('.pkp_structure_main').should('contain', 'Hanover is nice');
    cy.get('.pkp_structure_main').should('contain', 'Augusta Author');
    cy.get('.pkp_structure_main').should('contain', 'Times & locations');
    cy.get('#mapdiv').should('exist');
  });

});