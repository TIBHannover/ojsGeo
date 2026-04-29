/**
 * @file cypress/tests/integration/html_head.cy.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 */

describe('geoMetadata Time Periods', function () {

  it('has the time period for the article on the article page', function () {    
    cy.visit('/' + Cypress.env('contexts').primary.path + '/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Archive")').click();
    cy.get('a:contains("Vol. 1 No. 2 (2022)")').click();
    cy.openArticleByTitle('Hanover is nice');
    cy.get('#geoMetadata_span_start').should('contain', '2022-01-01');
    cy.get('#geoMetadata_span_end').should('contain', '2022-12-31');
  });

});