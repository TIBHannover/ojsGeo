/**
 * @file cypress/tests/integration/35-publication-versioning.cy.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * Issue #102: editing geo metadata on a new publication version must not
 * disturb the previous version's stored data. v1 is created with directInject
 * + cy.createSubmissionAndPublish; v2 is created from the publication tab UI,
 * inherits v1 (asserted), is edited via UI (temporal type + marker click +
 * tagit removal), and re-published. Final assertions cover three URLs:
 * /article/view/{id} (default → v2), /version/{v2} (→ v2), /version/{v1}
 * (→ v1, the regression guard).
 */

// testIsolation off: the spec runs as one chained editor session — author
// submission → editor publish v1 → editor creates v2 → edits → publishes v2 →
// public-page assertions. Each step depends on the prior step's session/state.
describe('geoMetadata Publication Versioning', { testIsolation: false }, function () {

  const v1Start = '2020-01-01';
  const v1End   = '2020-12-31';

  const v2Start = '2024-06-01';
  const v2End   = '2024-06-30';

  // v1 admin-unit hierarchy (Earth → Europe → Germany), matched to the
  // LineString in the directInject feature collection. Same shape as spec 33.
  const V1_ADMIN_UNITS = [
    {
      name: 'Earth',
      geonameId: 6295630,
      bbox: 'not available',
      administrativeUnitSuborder: ['Earth'],
      provenance: { description: 'administrative unit created by user (accepting the suggestion of the geonames API , which was created on basis of a geometric shape input)', id: 23 }
    },
    {
      name: 'Europe',
      geonameId: 6255148,
      bbox: { north: 80.76416015625, south: 27.6377894797159, east: 41.73303985595703, west: -24.532675386662543 },
      administrativeUnitSuborder: ['Earth', 'Europe'],
      provenance: { description: 'administrative unit created by user (accepting the suggestion of the geonames API , which was created on basis of a geometric shape input)', id: 23 }
    },
    {
      name: 'Federal Republic of Germany',
      geonameId: 2921044,
      bbox: { north: 55.058383600807, south: 47.2701236047, east: 15.041815651616, west: 5.8663152683722 },
      administrativeUnitSuborder: ['Earth', 'Europe', 'Federal Republic of Germany'],
      isoCountryCode: 'DE',
      isoSubdivisionCode: 'TH',
      provenance: { description: 'administrative unit created by user (accepting the suggestion of the geonames API , which was created on basis of a geometric shape input)', id: 23 }
    }
  ];

  let submission;
  let v1PublicationId;
  let v2PublicationId;

  before(function () {
    submission = {
      id: 0,
      prefix: '',
      title: 'Time-traveling article',
      subtitle: 'Now and then',
      abstract: 'A research article whose recorded geometries change between versions.',
      timePeriod: v1Start + ' - ' + v1End,
      issue: '1',
      directInject: {
        spatial: {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            properties: { provenance: { description: 'geometric shape created by user (drawing)', id: 11 } },
            geometry: { type: 'LineString', coordinates: [[8.43, 52.37], [9.73, 52.40]] }
          }],
          administrativeUnits: V1_ADMIN_UNITS,
          temporalProperties: {
            timePeriods: ['{' + v1Start + '..' + v1End + '}'],
            provenance: { description: 'temporal properties created by user', id: 31 }
          }
        },
        adminUnit: V1_ADMIN_UNITS
      }
    };
  });

  it('Author submits and editor publishes v1', function () {
    cy.openSubmissionsAs('aauthor');
    cy.createSubmissionAndPublish(submission);
    cy.wait(2000);
    cy.logout();
  });

  it('v1 metadata renders on the public article page', function () {
    cy.visit('/index.php/' + Cypress.env('contexts').primary.path + '/article/view/' + submission.id);
    cy.get('#geoMetadata_span_start').should('contain', v1Start);
    cy.get('#geoMetadata_span_end').should('contain', v1End);
    cy.get('meta[name="DC.Coverage"]').should('have.attr', 'content')
      .and('equal', 'Earth, Europe, Federal Republic of Germany');
    cy.get('meta[name="DC.SpatialCoverage"]').should('have.attr', 'content')
      .and('contain', '"LineString","coordinates":[[8.43');
  });

  it('Editor opens the publication tab and creates a new version', function () {
    cy.openSubmissionsAs('eeditor');
    cy.get('button:contains("Archives")').click({ force: true });
    cy.wait(2000);
    cy.contains('Time-traveling article').parents('.listPanel__item--submission')
      .find('.pkpButton:contains("View")').first().click({ force: true });

    cy.get('div[role="tablist"]').find('button:contains("Publication")').click();

    // Capture v1's publication id from the publications API while only one
    // exists. Cypress reuses the editor's session cookie automatically.
    cy.request('/index.php/' + Cypress.env('contexts').primary.path
      + '/api/v1/submissions/' + submission.id + '/publications')
      .then(({ body }) => {
        expect(body.items).to.have.length(1);
        v1PublicationId = body.items[0].id;
      });

    // The Create New Version button is rendered by templates/workflow/workflow.tpl
    // (ref="createVersion") with the locale label "Create New Version".
    // Clicking opens a Vue modal (class "modal__footer") with Yes/No buttons —
    // not the legacy .pkpModalConfirmButton jQuery widget.
    cy.get('button:contains("Create New Version")').click();
    cy.get('.modal__footer button:contains("Yes")').click();
    cy.wait(2000);

    // After the prompt resolves, a second publication exists; capture v2.
    cy.request('/index.php/' + Cypress.env('contexts').primary.path
      + '/api/v1/submissions/' + submission.id + '/publications')
      .then(({ body }) => {
        expect(body.items).to.have.length(2);
        const sorted = body.items.slice().sort((a, b) => a.version - b.version);
        expect(sorted[0].id).to.equal(v1PublicationId);
        v2PublicationId = sorted[1].id;
      });

    // The geoMetadata pkp-form's $action is computed server-side from
    // getLatestPublication() at template render. Without a reload it still
    // targets v1's API endpoint — and v1 is published, so a save would 403.
    cy.reload();
    cy.get('div[role="tablist"]').find('button:contains("Publication")').click();
  });

  it('v2 inherits v1 metadata in the publication tab', function () {
    cy.get('button[id^="timeLocation"]').click();
    cy.get('textarea[name="geoMetadata::timePeriods"]').invoke('val')
      .then(val => expect(val).to.equal('{' + v1Start + '..' + v1End + '}'));
    cy.get('textarea[name="geoMetadata::administrativeUnit"]').invoke('val')
      .then(val => expect(val).to.include('Federal Republic of Germany'));
    cy.get('#administrativeUnitInput li.tagit-choice').should('have.length', 3);
  });

  it('Editor edits v2 metadata: temporal + spatial + admin unit', function () {
    // Temporal — plain-text input commits on blur.
    cy.get('input[name=datetimes]').clear().type(v2Start + ' - ' + v2End).blur();

    // Spatial — drawing a marker adds a Point to the inherited LineString.
    // The pixel position need not be deterministic; the v2 assertions only
    // require that "Point" appears in the stored GeoJSON.
    cy.get('#mapdiv').scrollIntoView();
    cy.toolbarButton('marker').click();
    cy.wait(500);
    cy.get('#mapdiv').click(700, 200, { force: true });
    cy.wait(4000); // gazetteer round-trip

    // Admin unit — drawing a Point far from Germany causes the gazetteer to
    // collapse the common admin hierarchy, dropping Germany automatically.
    // No manual chip removal needed; just verify the divergence from v1.
    cy.get('#administrativeUnitInput li.tagit-choice', { timeout: 15000 })
      .should('not.contain', 'Federal Republic of Germany');
    cy.get('textarea[name="geoMetadata::administrativeUnit"]').invoke('val')
      .then(val => expect(val).to.not.include('Federal Republic of Germany'));

    // Save twice — first click flushes pending state, second triggers POST.
    cy.get('div#timeLocation button[label="Save"]').click();
    cy.intercept({ method: 'POST', url: '*', times: 1 }).as('post');
    cy.get('div#timeLocation button[label="Save"]').click();
    cy.wait('@post').its('response.statusCode').should('eq', 200);
  });

  it('Editor publishes v2', function () {
    // v2 inherits v1's issueId, so the publication-header button calls
    // openPublish() directly — no Assign-to-Issue step. The button label is
    // "Publish" when the parent submission is already published, otherwise
    // "Schedule For Publication"; match either.
    cy.get('.pkpPublication__header button.pkpButton')
      .filter(':contains("Publish"), :contains("Schedule For Publication")')
      .first()
      .click();
    cy.wait(2000);
    cy.get('div[class="pkpFormPages"] button:contains("Publish"), div[class="pkpFormPages"] button:contains("Schedule For Publication")')
      .click();
    cy.wait(3000);
    cy.logout();
  });

  it('Default article URL shows v2 metadata', function () {
    cy.visit('/index.php/' + Cypress.env('contexts').primary.path + '/article/view/' + submission.id);
    cy.get('#geoMetadata_span_start').should('contain', v2Start);
    cy.get('#geoMetadata_span_end').should('contain', v2End);
    cy.get('meta[name="DC.Coverage"]').should('have.attr', 'content')
      .and('not.contain', 'Federal Republic of Germany');
    cy.get('meta[name="DC.SpatialCoverage"]').should('have.attr', 'content')
      .and('contain', '"Point"');
  });

  it('/version/{v2} URL shows v2 metadata', function () {
    cy.visit('/index.php/' + Cypress.env('contexts').primary.path
      + '/article/view/' + submission.id + '/version/' + v2PublicationId);
    cy.get('#geoMetadata_span_start').should('contain', v2Start);
    cy.get('#geoMetadata_span_end').should('contain', v2End);
    cy.get('meta[name="DC.SpatialCoverage"]').should('have.attr', 'content')
      .and('contain', '"Point"');
  });

  // The regression guard for issue #102: v1's stored metadata must remain
  // identical to what we asserted before v2 was ever created.
  it('/version/{v1} URL still shows the original v1 metadata', function () {
    cy.visit('/index.php/' + Cypress.env('contexts').primary.path
      + '/article/view/' + submission.id + '/version/' + v1PublicationId);
    cy.get('#geoMetadata_span_start').should('contain', v1Start);
    cy.get('#geoMetadata_span_end').should('contain', v1End);
    cy.get('meta[name="DC.Coverage"]').should('have.attr', 'content')
      .and('equal', 'Earth, Europe, Federal Republic of Germany');
    cy.get('meta[name="DC.SpatialCoverage"]').should('have.attr', 'content')
      .and('contain', '"LineString","coordinates":[[8.43');
    cy.get('meta[name="DC.SpatialCoverage"]').should('have.attr', 'content')
      .and('not.contain', '"Point"');
  });

});
