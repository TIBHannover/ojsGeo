/**
 * @file cypress/tests/integration/configuration.cy.js
 *
 * Copyright (c) 2022 OPTIMETA project
 * Copyright (c) 2022 Daniel Nüst
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 */

describe('OPTIMETA Geo Plugin Search', function () {

  var submission;
  var submission2;

  before(function () {
    submission = {
      id: 0,
      //section: 'Articles',
      prefix: '',
      title: 'It is beautiful in a secret place',
      subtitle: 'Or is it not?',
      abstract: 'The marker marks the spot.',
      timePeriod: '2022-08-08 - 2022-11-11',
      issue: '1',
      spatial: {
        type: 'marker',
        coords: [
          {
            x: 460,
            y: 80
          }
        ]
      }
    };
  });

  it('Finds a submission in the text-based search via the location name in the coverage field', function () {
    cy.login('aauthor');
    cy.get('a:contains("aauthor")').click();
    cy.get('a:contains("Dashboard")').click({ force: true });

    cy.createSubmissionAndPublish(submission);

    // go to journal index and check if there is a map
    cy.visit('/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Search")').click();
    
    cy.get('input#query').type('Sweden');
    cy.get('button[type="submit"]').click();
    cy.get('.pkp_structure_main').should('contain', 'It is beautiful in a secret place');
    cy.get('ul.search_results li').should('have.length', 1);

    cy.get('input#query').clear().type('Vaesterbotten');
    cy.get('button[type="submit"]').click();
    cy.get('.pkp_structure_main').should('contain', 'It is beautiful in a secret place');
    cy.get('ul.search_results li').should('have.length', 1);
  });

});