/**
 * @file cypress/e2e/integration/23-incomplete-metadata.cy.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * Asserts that the article page degrades cleanly for the four corners of
 * incomplete-metadata combinations: missing temporal / missing spatial /
 * admin unit only / all missing. Each fixture is DB-seeded — UI submission
 * adds nothing to what the assertions need.
 */

describe('geoMetadata Submission with incomplete Metadata', function () {

  const primaryPath = Cypress.env('contexts').primary.path;

  // Captured submissionIds from the seed step; used by tests to build the
  // public article URL directly (avoids ambiguity with map-popup links that
  // also match "Vancouver has …" text on the issue page).
  const ids = {};

  before(function () {
    // 1. spatial only (Point) — no temporal, no admin unit
    cy.publishSubmissionViaDb('primary', {
      title: 'Vancouver has no time',
      abstract: 'The city of Vancouver is timeless.',
      givenName: 'Augusta',
      familyName: 'Author',
      geoMetadata: {
        spatial: {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            properties: { provenance: { description: 'geometric shape created by user (drawing)', id: 11 } },
            geometry: { type: 'Point', coordinates: [-123.11, 49.26] }
          }],
          administrativeUnits: [],
          temporalProperties: {
            timePeriods: [],
            provenance: { description: 'not available', id: 'not available' }
          }
        },
        adminUnit: [],
      },
    }).then(({ submissionId }) => { ids.noTime = submissionId; });

    // 2. temporal only — no spatial, no admin unit
    cy.publishSubmissionViaDb('primary', {
      title: 'Vancouver has no place',
      abstract: 'The city of Vancouver is lost.',
      givenName: 'Augusta',
      familyName: 'Author',
      geoMetadata: {
        temporal: '{2000-02-20..2000-02-22}',
      },
    }).then(({ submissionId }) => { ids.noPlace = submissionId; });

    // 3. admin unit only — no spatial, no temporal
    cy.publishSubmissionViaDb('primary', {
      title: 'Vancouver has a region',
      abstract: 'The city of Vancouver is part of something.',
      givenName: 'Augusta',
      familyName: 'Author',
      geoMetadata: {
        adminUnit: [{
          name: 'Oh Canada',
          geonameId: null,
          bbox: 'not available',
          administrativeUnitSuborder: ['Oh Canada'],
          provenance: { description: 'manual entry', id: 99 },
        }],
      },
    }).then(({ submissionId }) => { ids.region = submissionId; });

    // 4. nothing at all
    cy.publishSubmissionViaDb('primary', {
      title: 'Vancouver has nothing',
      abstract: 'The city of Vancouver is gone.',
      givenName: 'Augusta',
      familyName: 'Author',
    }).then(({ submissionId }) => { ids.nothing = submissionId; });
  });

  const openArticle = (id) => {
    cy.visit('index.php/' + primaryPath + '/article/view/' + id);
  };

  it('Has no information on time period if it is missing', function () {
    openArticle(ids.noTime);

    cy.get('#geoMetadata_article_temporal').should('not.be.visible');
    cy.get('#geoMetadata_article_spatial_download').should('be.visible');
    cy.get('#mapdiv').should('be.visible');
    cy.get('#geoMetadata_article_administrativeUnit').should('not.be.visible');
  });

  it('Has no information on location if it is missing', function () {
    openArticle(ids.noPlace);

    cy.get('.pkp_structure_main').should('contain', 'Time and Location');
    cy.get('.pkp_structure_main').should('contain', '2000-02-22');
    cy.get('#geoMetadata_article_spatial').should('not.be.visible');
    cy.get('#geoMetadata_article_spatial_download').should('not.be.visible');
    cy.get('#mapdiv').should('not.be.visible');
    cy.get('#geoMetadata_article_administrativeUnit').should('not.be.visible');
  });

  it('Has only administrative unit', function () {
    openArticle(ids.region);

    cy.get('.pkp_structure_main').should('contain', 'Oh Canada');
    cy.get('#geoMetadata_article_temporal').should('not.be.visible');
    cy.get('#geoMetadata_article_spatial').should('not.be.visible');
    cy.get('#geoMetadata_article_spatial_download').should('not.be.visible');
    cy.get('#mapdiv').should('not.be.visible');
  });

  it('Has no Time and Location and no geodata download if all geospatial metadata is missing', function () {
    openArticle(ids.nothing);

    cy.get('#geoMetadata_article_geospatialmetadata').should('not.be.visible');
    cy.get('#geoMetadata_article_temporal').should('not.be.visible');
    cy.get('#geoMetadata_article_spatial').should('not.be.visible');
    cy.get('#geoMetadata_article_spatial_download').should('not.be.visible');
    cy.get('#mapdiv').should('not.be.visible');
    cy.get('#geoMetadata_article_administrativeUnit').should('not.be.visible');
  });

});
