/**
 * @file cypress/e2e/integration/24-antimeridian.cy.js
 *
 * Copyright (c) 2026 KOMET project, OPTIMETA project, Daniel Nüst
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * Covers issue #60: geometries crossing the antimeridian.
 * - PHP splitter rewrites stored spatialProperties as Multi* on write
 * - admin-unit bbox overlay emits two rectangles when east<west
 * - JS normalizeLng keeps raw Leaflet out-of-range lngs in (-180, 180]
 * - UI note alerts users to the "flipped preview until save" quirk
 *
 * The Wellington fixture is DB-seeded (the splitter is idempotent on already-
 * split input, so the seed shape matches what the editorial path would
 * produce). Tests 4–6 still need a live submission form, so they walk the
 * wizard.
 */

// testIsolation off: the fixture seeded in `before` is the input for tests 1–3.
// Tests 4–6 open a fresh submission form (independent of the fixture).
describe('geoMetadata Antimeridian', { testIsolation: false }, function () {

  const primaryPath = Cypress.env('contexts').primary.path;

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
  // idempotent so this already-split form passes through unchanged on save.
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

  // Wellington fixture is seeded by 12-primary-fixtures.cy.js. NZ_ADMIN_UNITS
  // and WELLINGTON_SPATIAL are kept here as the test-2 reference data.

  it('Stores an antimeridian-crossing geometry as a single MultiLineString feature', function () {
    cy.login('eeditor', undefined, primaryPath);
    cy.visit('index.php/' + primaryPath + '/submissions');
    // Wellington is DB-seeded by 12-primary-fixtures (status=PUBLISHED), so
    // it lives in Archives, not the editor's My-Queue / Active list. Pick
    // the row by title.
    cy.get('button[id="archive-button"]').click();
    cy.contains('.listPanel__item--submission', 'Wellington to Chatham Islands ferry across the dateline')
      .find('a:contains("View")').first().click({ force: true });
    cy.get('div[role="tablist"]').find('button:contains("Publication")').click();
    cy.get('button[id^="timeLocation"]').click();

    cy.get('textarea[name="geoMetadata::spatialProperties"]').invoke('val').then(($v) => {
      const parsed = JSON.parse($v);
      expect(parsed.features).to.have.lengthOf(1);
      expect(parsed.features[0].geometry.type).to.equal('MultiLineString');
      expect(parsed.features[0].geometry.coordinates).to.have.lengthOf(2);
      parsed.features[0].geometry.coordinates.forEach((line) => {
        line.forEach(([lng]) => {
          expect(lng).to.be.within(-180, 180);
        });
      });
    });
  });

  it('Renders a MultiLineString across the dateline on the published article page', function () {
    cy.visit('index.php/' + primaryPath + '/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Archive")').click();
    cy.get('a:contains("Vol. 1 No. 2 (2022)")').click();
    cy.openArticleByTitle('Wellington to Chatham Islands ferry across the dateline');

    cy.get('.pkp_structure_main').should('contain', 'Time and Location');
    cy.get('#mapdiv').should('exist');

    cy.window().wait(500).then((win) => {
      const features = [];
      win.map.eachLayer((layer) => { if (layer.feature) features.push(layer.feature); });
      const multi = features.find((f) => f.geometry && f.geometry.type === 'MultiLineString');
      expect(multi, 'MultiLineString feature on Wellington article map').to.exist;
      expect(multi.geometry.coordinates).to.have.lengthOf(2);
    });
  });

  it('worldCopyJump is enabled on editing + view maps', function () {
    cy.window().then((win) => {
      expect(win.map.options.worldCopyJump, 'article view map worldCopyJump').to.equal(true);
    });
  });

  it('Shows the UI note about antimeridian splitting on the submission form', function () {
    cy.logout();
    cy.login('aauthor', undefined, primaryPath);
    cy.visit('index.php/' + primaryPath + '/submissions');

    cy.get('div#myQueue a:contains("New Submission")').click();
    cy.get('input[id^="checklist-"]').click({ multiple: true });
    cy.get('input[id="privacyConsent"]').click();
    cy.get('button.submitFormButton').click();
    cy.wait(1000);
    cy.get('button.submitFormButton').click();

    cy.get('.geoMetadata_antimeridian_note')
      .should('be.visible')
      .and('contain', 'antimeridian');
  });

  it('Normalizes Leaflet out-of-range lngs into (-180, 180] in the hidden form value', function () {
    // submission.js wraps raw _latlng.lng through geoMetadata_normalizeLng.
    // Directly poke a Point into drawnItems at lng=190 (simulating a Leaflet
    // drag past the dateline on worldCopyJump) and re-run the serializer.
    cy.window().then((win) => {
      const lng = 190;
      const latlng = win.L.latLng(-20, lng);
      const marker = win.L.marker(latlng);
      win.drawnItems.addLayer(marker);
      win.storeCreatedGeoJSONAndAdministrativeUnitInHiddenForms(win.drawnItems);
    });
    cy.get('textarea[name="geoMetadata::spatialProperties"]').invoke('val').then(($v) => {
      const parsed = JSON.parse($v);
      const pt = parsed.features.find((f) => f.geometry && f.geometry.type === 'Point');
      expect(pt, 'Point feature present after injection').to.exist;
      expect(pt.geometry.coordinates[0]).to.be.within(-180, 180);
      expect(pt.geometry.coordinates[0]).to.equal(-170);
    });
  });

  it('Admin-unit bbox with east<west renders two overlay polygons on the submission form', function () {
    cy.fixture('spatial/nz-adminunit-bbox.json').then((nz) => {
      cy.window().then((win) => {
        const geojson = {
          administrativeUnits: [{
            name: nz.geonames[0].name,
            geonameId: nz.geonames[0].geonameId,
            bbox: nz.geonames[0].bbox
          }]
        };
        win.displayBboxOfAdministrativeUnitWithLowestCommonDenominatorOfASetOfAdministrativeUnitsGivenInAGeojson(geojson);
      });
    });
    cy.wait(300);
    cy.window().then((win) => {
      const polys = [];
      win.administrativeUnitsMap.eachLayer((l) => { if (l instanceof win.L.Polygon) polys.push(l); });
      expect(polys, 'two overlay polygons for crossing bbox').to.have.lengthOf(2);
      const lngs = polys.flatMap((p) => p.getLatLngs()[0].map((ll) => ll.lng));
      expect(Math.max(...lngs)).to.equal(180);
      expect(Math.min(...lngs)).to.equal(-180);
    });
  });

});
