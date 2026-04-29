/**
 * @file cypress/e2e/integration/12-primary-fixtures.cy.js
 *
 * Copyright (c) 2026 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * Seeds the primary journal's variant fixture articles via direct DB write
 * (cy.publishSubmissionViaDb / cy.task('dbInsertPublishedSubmission')). Pure
 * fixture creation — no UI behaviour is exercised here. Each article is the
 * minimal record downstream specs need to read; their assertions live in the
 * specs that use them.
 *
 * The "happy path" submission (UI wizard → editorial workflow → publish) is
 * covered by 21-submission (Vancouver, no Geonames) and 32-submission
 * (Hanover, with Geonames). 33-submission-editorial covers the editor side.
 * Everything else is consumer-only, so DB-seeding here saves the per-article
 * ~50–60 s the UI walk would cost.
 *
 * Articles seeded:
 *   - "Timeless Isle"           — Polygon, no temporal, Earth (#106 / #92)
 *   - "Atlas of Saxony"         — no features, Saxony admin (#87, #88)
 *   - "Outside of nowhere"      — no geoMetadata at all (#158)
 *   - "Lower Saxony details"    — Polygon overlapping Hanover (#81)
 *   - "Wellington to Chatham …" — MultiLineString crossing the dateline (#60)
 */

describe('geoMetadata Primary-Journal Fixtures', function () {

  const EARTH = {
    name: 'Earth',
    geonameId: 6295630,
    bbox: 'not available',
    administrativeUnitSuborder: ['Earth'],
    provenance: { description: 'administrative unit created by user (accepting the suggestion of the geonames API , which was created on basis of a geometric shape input)', id: 23 }
  };

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
    provenance: { description: 'Direct test injection (12-primary-fixtures.cy.js)', id: 99 }
  };

  const NZ_ADMIN_UNITS = [
    {
      name: 'Earth',
      geonameId: 6295630,
      bbox: 'not available',
      administrativeUnitSuborder: ['Earth'],
      provenance: { description: 'administrative unit created by user (accepting the suggestion of the geonames API , which was created on basis of a geometric shape input)', id: 23 }
    },
    {
      name: 'New Zealand',
      geonameId: 2186224,
      bbox: { north: -29.231115, south: -52.619442, east: -175.830215, west: 165.869141 },
      administrativeUnitSuborder: ['Earth', 'New Zealand'],
      isoCountryCode: 'NZ',
      provenance: { description: 'administrative unit created by user (accepting the suggestion of the geonames API , which was created on basis of a geometric shape input)', id: 23 }
    }
  ];

  // Pre-split MultiLineString from Wellington Harbour to Waitangi (Chatham
  // Islands). Both points are NZ territory but the Chathams sit east of 180°,
  // so any direct route crosses the antimeridian. The PHP splitter is
  // idempotent so this already-split form survives round-trips unchanged.
  const WELLINGTON_SPATIAL = {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: { provenance: { description: 'geometric shape created by user (drawing)', id: 11 } },
      geometry: {
        type: 'MultiLineString',
        coordinates: [
          [[174.78, -41.29], [180, -42.89]],
          [[-180, -42.89], [-176.55, -43.95]]
        ]
      }
    }],
    administrativeUnits: NZ_ADMIN_UNITS,
    temporalProperties: {
      timePeriods: ['{2023-01-01..2023-12-31}'],
      provenance: { description: 'temporal properties created by user', id: 31 }
    }
  };

  // Idempotent re-runs against a non-fresh OJS stack: drop any prior copies
  // of the fixture titles before reseeding. Without this, every cypress run
  // adds another copy of every fixture and downstream specs that count
  // matches by title (e.g. 66's single-article popup) break.
  before(function () {
    cy.task('dbDeleteSubmissionsByTitle', {
      contextPath: Cypress.env('contexts').primary.path,
      titles: [
        'Timeless Isle',
        'Atlas of Saxony',
        'Outside of nowhere',
        'Lower Saxony details',
        'Wellington to Chatham Islands ferry across the dateline',
        'Hanover micro',
      ],
    });
  });

  it('Seeds "Timeless Isle" (Polygon, no temporal, Earth)', function () {
    cy.publishSubmissionViaDb('primary', {
      title: 'Timeless Isle',
      abstract: 'This article has spatial metadata but no temporal metadata.',
      givenName: 'Augusta',
      familyName: 'Author',
      geoMetadata: {
        spatial: {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            properties: { provenance: { description: 'geometric shape created by user (drawing)', id: 11 } },
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [-100.0, 0.0], [-99.0, 0.0], [-99.0, 1.0], [-100.0, 1.0], [-100.0, 0.0]
              ]]
            }
          }],
          administrativeUnits: [EARTH],
          temporalProperties: {
            timePeriods: [],
            provenance: { description: 'not available', id: 'not available' }
          }
        },
        adminUnit: [EARTH],
      },
    });
  });

  it('Seeds "Atlas of Saxony" (no features, Saxony admin only)', function () {
    cy.publishSubmissionViaDb('primary', {
      title: 'Atlas of Saxony',
      abstract: 'Spatial metadata is supplied via the administrative unit only; no features drawn.',
      givenName: 'Augusta',
      familyName: 'Author',
      geoMetadata: {
        spatial: {
          type: 'FeatureCollection',
          features: [],
          administrativeUnits: [SAXONY],
          temporalProperties: {
            timePeriods: [],
            provenance: { description: 'not available', id: 'not available' }
          }
        },
        adminUnit: [SAXONY],
      },
    });
  });

  it('Seeds "Outside of nowhere" (no geoMetadata at all)', function () {
    cy.publishSubmissionViaDb('primary', {
      title: 'Outside of nowhere',
      abstract: 'No spatial, temporal, or administrative-unit information.',
      givenName: 'Augusta',
      familyName: 'Author',
    });
  });

  it('Seeds "Lower Saxony details" (Polygon overlapping Hanover)', function () {
    cy.publishSubmissionViaDb('primary', {
      title: 'Lower Saxony details',
      abstract: 'Polygon centred on the Hanover area, used to exercise the overlap picker.',
      givenName: 'Augusta',
      familyName: 'Author',
      geoMetadata: {
        spatial: {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            properties: { provenance: { description: 'Direct test injection (12-primary-fixtures.cy.js)', id: 99 } },
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [8.0, 52.0], [9.0, 52.0], [9.0, 52.7], [8.0, 52.7], [8.0, 52.0]
              ]]
            }
          }],
          administrativeUnits: [],
          temporalProperties: {
            timePeriods: [],
            provenance: { description: 'not available', id: 'not available' }
          }
        },
        adminUnit: [],
      },
    });
  });

  it('Seeds "Wellington to Chatham Islands ferry across the dateline"', function () {
    cy.publishSubmissionViaDb('primary', {
      title: 'Wellington to Chatham Islands ferry across the dateline',
      abstract: 'A NZ inter-island route from Wellington Harbour to the Chatham Islands; the path crosses the International Date Line.',
      givenName: 'Augusta',
      familyName: 'Author',
      geoMetadata: {
        spatial: WELLINGTON_SPATIAL,
        temporal: '{2023-01-01..2023-12-31}',
        adminUnit: NZ_ADMIN_UNITS,
      },
    });
  });

  // Small polygon nested inside Lower Saxony details and covering the start
  // of the Hanover LineString endpoint. Spec 68-overlap-hover needs all three
  // (Hanover is nice / Lower Saxony details / Hanover micro) to overlap at
  // HANOVER_LINE_START so its 3-hit hover branch can fire.
  it('Seeds "Hanover micro" (Polygon, 3-way overlap fixture)', function () {
    cy.publishSubmissionViaDb('primary', {
      title: 'Hanover micro',
      abstract: 'Small polygon used to exercise the 3-way overlap branch of the map-level hover-highlight handler.',
      givenName: 'Augusta',
      familyName: 'Author',
      geoMetadata: {
        spatial: {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            properties: { provenance: { description: 'Direct test injection (12-primary-fixtures.cy.js)', id: 99 } },
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [8.40, 52.30], [8.50, 52.30], [8.50, 52.45], [8.40, 52.45], [8.40, 52.30]
              ]]
            }
          }],
          administrativeUnits: [],
          temporalProperties: {
            timePeriods: [],
            provenance: { description: 'not available', id: 'not available' }
          }
        },
        adminUnit: [],
      },
    });
  });

});
