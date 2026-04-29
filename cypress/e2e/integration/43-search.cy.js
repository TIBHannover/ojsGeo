/**
 * @file cypress/tests/integration/configuration.cy.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 */

describe('geoMetadata Search', function () {

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
    // Stub GeoNames so the marker draw resolves to a Swedish hierarchy
    // (Earth, Europe, Kingdom of Sweden, Vasterbotten). The coverage field
    // ends up containing those names, which the OJS search index then sees.
    cy.stubGeoNames({ coordHierarchyQueue: ['earthEuropeSweden'] });
    cy.openSubmissionsAs('aauthor');

    cy.createSubmissionAndPublish(submission);

    // go to journal index and check if there is a map
    cy.visit('/' + Cypress.env('contexts').primary.path + '/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Search")').click();
    
    cy.get('input#query').type('Sweden');
    cy.get('button[type="submit"]').click();
    cy.get('.pkp_structure_main').should('contain', 'It is beautiful in a secret place');
    // Use .at.least(1) — multiple seeded copies of the article accumulate when
    // the docker stack is reused across runs, but the test's assertion is that
    // the gazetteer-derived coverage flows into the OJS search index.
    cy.get('ul.search_results li').should('have.length.at.least', 1);

    cy.get('input#query').clear().type('Vaesterbotten');
    cy.get('button[type="submit"]').click();
    cy.get('.pkp_structure_main').should('contain', 'It is beautiful in a secret place');
    // Use .at.least(1) — multiple seeded copies of the article accumulate when
    // the docker stack is reused across runs, but the test's assertion is that
    // the gazetteer-derived coverage flows into the OJS search index.
    cy.get('ul.search_results li').should('have.length.at.least', 1);
  });

});