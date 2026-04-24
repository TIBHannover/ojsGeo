/**
 * @file cypress/e2e/integration/36-submission-saxony.cy.js
 *
 * Copyright (c) 2026 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 * @brief Publishes "Atlas of Saxony" — test record with directly-injected
 *        spatial metadata (empty feature list + Saxony admin unit) so other
 *        specs can assert exact centroid / ISO-code values.
 */

// Authoritative values from GeoNames getJSON?geonameId=2842566 and
// countrySubdivisionJSON.
const SAXONY = {
  name: 'Saxony',
  geonameId: 2842566,
  bbox: {
    north: 51.68497371576,
    south: 50.1715349646215,
    east:  15.0418145091711,
    west:  11.8714625753928
  },
  administrativeUnitSuborder: ['Earth', 'Europe', 'Germany', 'Saxony'],
  isoCountryCode:     'DE',
  isoSubdivisionCode: 'SN',
  provenance: {
    description: 'Direct test injection (36-submission-saxony.cy.js)',
    id: 99
  }
};

describe('geoMetadata Submission With No Drawn Geometry (Saxony fallback)', function () {

  var submission;

  before(function () {
    submission = {
      id: 0,
      prefix: '',
      title: 'Atlas of Saxony',
      subtitle: 'A test record with no drawn geometry',
      abstract: 'Spatial metadata is supplied via the administrative unit only; no features drawn.',
      issue: '1',
      directInject: {
        spatial: {
          type: 'FeatureCollection',
          features: [],
          administrativeUnits: [SAXONY],
          temporalProperties: {
            timePeriods: [],
            provenance: { description: 'not available', id: 'not available' }
          }
        },
        adminUnit: [SAXONY]
      }
    };
  });

  it('Publishes an article whose only spatial metadata is an admin unit', function () {
    cy.login('aauthor');
    cy.get('a:contains("aauthor")').click();
    cy.get('a:contains("Dashboard")').click({ force: true });

    cy.createSubmissionAndPublish(submission);

    cy.visit('/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Archive")').click();
    cy.get('a:contains("Vol. 1 No. 2 (2022)")').click();
    cy.get('.pkp_structure_main').should('contain', 'Atlas of Saxony');
  });

});
