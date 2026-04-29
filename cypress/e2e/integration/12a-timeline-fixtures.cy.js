/**
 * @file cypress/e2e/integration/12a-timeline-fixtures.cy.js
 *
 * Copyright (c) 2026 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * Timeline-specific fixture articles for issue #74. Each exercises one branch of
 * the timeline strip:
 *   - BCE / deep-time renders via the expanded-year ISO bridge in toVisDate()
 *   - Multi-period rendering (forward-compat with #57)
 *   - Decadal modern range (typical span)
 *   - Zero-duration / single-day point item
 *
 * Numbered 12a so it sorts after 12-primary-fixtures (which seeds the spatial
 * variant fixtures) and before 13- — keeps the timeline fixtures grouped with
 * the other DB-seeded fixtures while leaving 12- untouched. Consumed by
 * 70-timeline.cy.js.
 */

describe('geoMetadata Timeline Fixtures', function () {

  before(function () {
    cy.task('dbDeleteSubmissionsByTitle', {
      contextPath: Cypress.env('contexts').primary.path,
      titles: [
        'Long-Span Holocene Catalogue',
        'Twin Field Campaigns',
        'Decadal Sensor Drift',
        'One-Day Workshop Notes',
      ],
    });
  });

  it('Seeds "Long-Span Holocene Catalogue" (BCE deep-time, no spatial)', function () {
    cy.publishSubmissionViaDb('primary', {
      title: 'Long-Span Holocene Catalogue',
      abstract: 'A deep-time temporal-only article spanning the early Holocene; renders the BCE expanded-year ISO path in the timeline strip.',
      givenName: 'Augusta',
      familyName: 'Author',
      geoMetadata: {
        temporal: '{-008000-01-01..-002000-12-31}',
      },
    });
  });

  it('Seeds "Twin Field Campaigns" (multi-period, two ranges)', function () {
    cy.publishSubmissionViaDb('primary', {
      title: 'Twin Field Campaigns',
      abstract: 'Two non-overlapping summer campaigns, three years apart; exercises multi-period rendering on the timeline.',
      givenName: 'Augusta',
      familyName: 'Author',
      geoMetadata: {
        temporal: '{2019-06-01..2019-08-31}{2022-06-01..2022-08-31}',
      },
    });
  });

  it('Seeds "Decadal Sensor Drift" (multi-decade modern range)', function () {
    cy.publishSubmissionViaDb('primary', {
      title: 'Decadal Sensor Drift',
      abstract: 'A 45-year observational range; exercises the typical modern-range bar in the timeline.',
      givenName: 'Augusta',
      familyName: 'Author',
      geoMetadata: {
        temporal: '{1980-01-01..2025-12-31}',
      },
    });
  });

  it('Seeds "One-Day Workshop Notes" (zero-duration / single-day item)', function () {
    cy.publishSubmissionViaDb('primary', {
      title: 'One-Day Workshop Notes',
      abstract: 'A single-day record; the timeline collapses zero-duration ranges to point markers.',
      givenName: 'Augusta',
      familyName: 'Author',
      geoMetadata: {
        temporal: '{2023-09-15..2023-09-15}',
      },
    });
  });

});
