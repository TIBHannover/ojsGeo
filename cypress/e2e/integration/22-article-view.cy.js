/**
 * @file cypress/tests/integration/html_head.cy.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 */

describe('geoMetadata Article View', function () {

  it('The article page has the paper\'s geometry and no administrative unit on the map', function () {
    cy.visit('/' + Cypress.env('contexts').primary.path + '/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Archive")').click();
    cy.get('a:contains("Vol. 1 No. 2 (2022)")').click();
    cy.get('a:contains("Vancouver")').first().click();

    cy.get('.pkp_structure_main').should('contain', 'Time and Location');
    cy.get('#mapdiv').should('exist');

    cy.mapHasFeatures(1);

    cy.window().wait(200).then(({ map }) => {
      var foundAdminLayerBasedOnColor = false;
      map.eachLayer(function (layer) {
        if (layer.options.hasOwnProperty('color') && layer.options.color === 'black') {
          foundAdminLayerBasedOnColor = true;
        }
      });
      expect(foundAdminLayerBasedOnColor).to.be.false;
    });
  });

  it('The article page has the time period in a text', function () {
    cy.visit('/' + Cypress.env('contexts').primary.path + '/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Archive")').click();
    cy.get('a:contains("Vol. 1 No. 2 (2022)")').click();
    // Target the specific Vancouver article seeded by 21-submission. Other
    // specs create more "Vancouver …" submissions whose temporals differ.
    cy.openArticleByTitle('Vancouver is cool');

    cy.get('#geoMetadata_article_temporal').contains('from 2021-01-01');
    cy.get('#geoMetadata_article_temporal').contains('to 2021-12-31');
  });

  it('The article page has the administrative unit in a text when added manually during submission', function () {
    cy.openSubmissionsAs('aauthor');

    var submission = {
      id: 0,
      //section: 'Articles',
      prefix: '',
      title: 'Vancouver is hot',
      subtitle: 'Surely',
      abstract: 'The city of Vancouver is home.',
      timePeriod: '2021-12-30 - 2021-12-31',
      issue: '1',
      adminUnit: 'Earth, Canada, BC'
    };

    cy.createSubmissionAndPublish(submission);

    cy.visit('/' + Cypress.env('contexts').primary.path + '/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Archive")').click();
    cy.get('a:contains("Vol. 1 No. 2 (2022)")').click();
    cy.openArticleByTitle('Vancouver is hot');

    cy.get('#geoMetadata_article_administrativeUnit').should('contain', 'Earth, Canada, BC');
  });

});