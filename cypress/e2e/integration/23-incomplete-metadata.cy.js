/**
 * @file cypress/tests/integration/configuration.cy.js
 *
 * Copyright (c) 2022 OPTIMETA project
 * Copyright (c) 2022 Daniel Nüst
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 */

describe('OPTIMETA Geo Plugin Submission with incomplete Metadata', function () {

  beforeEach(() => {
    cy.login('aauthor');
    cy.get('a:contains("aauthor")').click();
    cy.get('a:contains("Dashboard")').click({ force: true });
  });

  it('Has no information on time period if it is missing', function () {
    var submission = {
      title: 'Vancouver has no time',
      subtitle: 'No no no',
      abstract: 'The city of Vancouver is timeless.',
      issue: '1',
      timePeriod: null
    };

    cy.createSubmissionAndPublish(submission);

    // go to journal index and check there is no map
    cy.visit('/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Current")').click();
    cy.get('a:contains("Vancouver has no time")').last().click();

    cy.get('#optimeta_article_temporal').should('not.be.visible');
    cy.get('#optimeta_article_spatial_download').should('be.visible');
    cy.get('#mapdiv').should('be.visible');
    cy.get('#optimeta_article_administrativeUnit').should('not.be.visible');
  });

  it('Has no information on location if it is missing', function () {
    var submission = {
      title: 'Vancouver has no place',
      subtitle: 'No no no',
      abstract: 'The city of Vancouver is lost.',
      issue: '1',
      timePeriod: '2000-02-20 - 2000-02-22',
      spatial: null
    };

    cy.createSubmissionAndPublish(submission);

    // go to journal index and check there is no map
    cy.visit('/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Current")').click();
    cy.get('a:contains("Vancouver has no place")').last().click();

    cy.get('.pkp_structure_main').should('contain', 'Time and location');
    cy.get('.pkp_structure_main').should('contain', '2000-02-22');
    cy.get('#optimeta_article_spatial').should('not.be.visible');
    cy.get('#optimeta_article_spatial_download').should('not.be.visible');
    cy.get('#mapdiv').should('not.be.visible');
    cy.get('#optimeta_article_administrativeUnit').should('not.be.visible');
  });

  it('Has only administrative unit', function () {
    var submission = {
      title: 'Vancouver has a region',
      subtitle: 'No no no',
      abstract: 'The city of Vancouver is part of something.',
      issue: '1',
      timePeriod: null,
      spatial: null,
      adminUnit: 'Oh Canada{enter}'
    };

    cy.createSubmissionAndPublish(submission);

    // go to journal index and check there is no map
    cy.visit('/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Current")').click();
    cy.get('a:contains("Vancouver has a region")').last().click();
    
    cy.get('.pkp_structure_main').should('contain', 'Oh Canada');
    cy.get('#optimeta_article_temporal').should('not.be.visible');
    cy.get('#optimeta_article_spatial').should('not.be.visible');
    cy.get('#optimeta_article_spatial_download').should('not.be.visible');
    cy.get('#mapdiv').should('not.be.visible');
  });

  it('Has no Time and location and no geodata download if all geospatial metadata is missing', function () {
    var submission = {
      title: 'Vancouver has nothing',
      subtitle: 'No no no',
      abstract: 'The city of Vancouver is gone.',
      issue: '1',
      timePeriod: null,
      spatial: null
    };

    cy.createSubmissionAndPublish(submission);

    // go to journal index and check there is no map
    cy.visit('/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Current")').click();
    cy.get('a:contains("Vancouver has nothing")').last().click();
    
    cy.get('#optimeta_article_geospatialmetadata').should('not.be.visible');
    cy.get('#optimeta_article_temporal').should('not.be.visible');
    cy.get('#optimeta_article_spatial').should('not.be.visible');
    cy.get('#optimeta_article_spatial_download').should('not.be.visible');
    cy.get('#mapdiv').should('not.be.visible');
    cy.get('#optimeta_article_administrativeUnit').should('not.be.visible');
  });

});