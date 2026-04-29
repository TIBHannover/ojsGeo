/**
 * @file cypress/e2e/integration/11-second-journal.cy.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * Issue #99 — bring up a second journal so 64-multi-journal-isolation can
 * verify per-context settings + content isolation. Configured structurally
 * identical to the primary; the only difference is the journal identity.
 *
 * Seeds three published articles in the secondary, all via direct DB write
 * (cy.publishSubmissionViaDb). The original plan (#99 Q5) called for one
 * full UI submission via cy.createSubmissionAndPublish so the editorial
 * pipeline gets exercised on the secondary too — but the helper assumes a
 * page with a "Make a New Submission" link, and aauthor (with Author role on
 * both journals after enrollment) can't be reliably routed to the secondary's
 * version of that page without modifying the helper. Trade: lose end-to-end
 * UI publish coverage on the secondary; keep the isolation goal intact.
 *
 * Three fixtures cover the relevant branches:
 *   1. with spatial + admin unit (full happy path on the journal map)
 *   2. with spatial only (no admin-unit branch)
 *   3. no geoMetadata at all (no-geometadata branch / icon-absent assertion)
 */

describe('geoMetadata Second Journal', function () {

  const secondaryPath = Cypress.env('contexts').secondary.path;

  it('Creates the secondary journal', function () {
    cy.createContext('secondary');
  });

  it('Enables geoMetadata in the secondary', function () {
    cy.login('admin', 'admin', secondaryPath);
    cy.get('nav[class="app__nav"] a:contains("Website")').click();
    cy.get('button[id="plugins-button"]').click();
    cy.get('input[id^="select-cell-geometadataplugin-enabled"]').click();
    cy.get('input[id^="select-cell-geometadataplugin-enabled"]').should('be.checked');
  });

  it('Creates issues in the secondary', function () {
    cy.createIssues('secondary');
  });

  it('Enrolls eeditor as Manager on the secondary', function () {
    // 16 = ROLE_ID_MANAGER for eeditor (mirrors the editorial authority that
    // lets cy.createSubmissionAndPublish drive the publish flow as eeditor).
    //
    // aauthor is intentionally NOT enrolled on the secondary: every primary-
    // journal spec uses `cy.login('aauthor') + Dashboard click`, which lands
    // on the site dashboard (not a journal dashboard) when aauthor has roles
    // on >1 journal — breaking the "Make a New Submission" navigation chain.
    // The secondary's articles are seeded via DB write below, which doesn't
    // need an enrolled author user, so aauthor staying single-journal is the
    // simplest way to keep the multi-journal cypress run stable.
    cy.enrollUserInContext('secondary', 'eeditor', 16);
  });

  it('Seeds three published articles via direct DB write', function () {
    // Same title as the primary's "Hanover is nice" — the isolation spec
    // asserts disjoint publication ids despite the title collision.
    cy.publishSubmissionViaDb('secondary', {
      title: 'Hanover is nice',
      abstract: 'The city of Hanover is really nice, because it is home of the TIB.',
      givenName: 'Augusta',
      familyName: 'Author',
      geoMetadata: {
        spatial: {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            properties: { provenance: { description: 'geometric shape created by user (drawing)', id: 11 } },
            geometry: { type: 'LineString', coordinates: [[8.43, 52.37], [9.73, 52.40]] }
          }],
        },
        temporal: '{2022-01-01..2022-12-31}',
        adminUnit: [{
          name: 'Federal Republic of Germany',
          geonameId: 2921044,
          bbox: { north: 55.058383600807, south: 47.2701236047, east: 15.041815651616, west: 5.8663152683722 },
          administrativeUnitSuborder: ['Earth', 'Europe', 'Federal Republic of Germany'],
          isoCountryCode: 'DE',
          isoSubdivisionCode: 'TH',
          provenance: { description: 'administrative unit created by user', id: 23 }
        }],
      },
    }).then((result) => {
      expect(result.publicationId).to.be.a('number');
    });

    cy.publishSubmissionViaDb('secondary', {
      title: 'Atlas of Bavaria',
      abstract: 'A spatial-only article in the secondary journal.',
      givenName: 'Carla',
      familyName: 'Cartographer',
      geoMetadata: {
        spatial: {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            properties: { provenance: { description: 'geometric shape created by user (drawing)', id: 11 } },
            geometry: { type: 'Point', coordinates: [11.58, 48.14] }
          }],
        },
        temporal: '{2024-01-01..2024-12-31}',
      },
    }).then((result) => {
      expect(result.publicationId).to.be.a('number');
    });

    cy.publishSubmissionViaDb('secondary', {
      title: 'Reflections on Cartography',
      abstract: 'A no-geometadata article in the secondary journal.',
      givenName: 'Mark',
      familyName: 'Mapper',
    }).then((result) => {
      expect(result.publicationId).to.be.a('number');
    });
  });

});
