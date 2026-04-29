/**
 * @file cypress/tests/integration/configuration.cy.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 */

// testIsolation off: tests 1→4 chain on the same open publication tab
// (map interactions, time-period edits, tag removals). Tests 5+ handle their
// own login and navigation, so they still work under shared-state mode.
describe('geoMetadata Production Editing', { testIsolation: false }, function () {

  var submission;
  var sub1start = '2022-01-01';
  var sub1end = '2022-12-31';

  // Same directInject pattern as spec 32's Hanover — pixel-click drawing
  // at zoom-1 (0,0) cannot reach the Federal Republic of Germany admin unit
  // this spec's assertions rely on.
  const ADMIN_UNITS = [
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

  before(function () {
    // Idempotent: drop prior copies before re-creating; otherwise the
    // accumulated UI-published submissions pollute spec 66's overlap-picker
    // pagination assertions.
    cy.task('dbDeleteSubmissionsByTitle', {
      contextPath: Cypress.env('contexts').primary.path,
      titles: ['Editors saves the day'],
    });

    submission = {
      id: 0,
      //section: 'Articles',
      prefix: '',
      title: 'Editors saves the day',
      subtitle: 'Nothing without her!',
      abstract: 'The publicatin process needs editors.',
      timePeriod: sub1start + ' - ' + sub1end,
      issue: '1',
      directInject: {
        spatial: {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            properties: { provenance: { description: 'geometric shape created by user (drawing)', id: 11 } },
            geometry: { type: 'LineString', coordinates: [[8.43, 52.37], [9.73, 52.40]] }
          }],
          administrativeUnits: ADMIN_UNITS,
          temporalProperties: {
            timePeriods: ['{' + sub1start + '..' + sub1end + '}'],
            provenance: { description: 'temporal properties created by user', id: 31 }
          }
        },
        adminUnit: ADMIN_UNITS
      }
    };

    cy.openSubmissionsAs('aauthor');
    cy.createSubmission(submission);
    cy.logout();
  });

  it('Can inspect the spatio-temporal metadata as editor', function () {
    cy.openSubmissionsAs('eeditor');
    cy.get('a:contains("View")').first().click(); // click latest submission

    cy.get('div[role="tablist"]').find('button:contains("Publication")').click();

    // the coverage metadata field is disabled but with correct content
    cy.get('button[id^="metadata"]').click();
    cy.get('input[id^="metadata-coverage-"]').invoke('attr', 'disabled').should('eq', 'disabled');
    cy.get('input[id^="metadata-coverage-"]').invoke('attr', 'title').should('contain', 'field has been disabled');
    cy.get('input[id^="metadata-coverage-"]').should('have.value', 'Earth, Europe, Federal Republic of Germany');

    // time & location tab
    cy.get('button[id^="timeLocation"]').click();
    cy.get('#mapdiv').should('exist');
    cy.get('textarea').should('have.length', 3); // three text areas for raw input

    // check metadata is loaded correctly
    cy.get('textarea[name="geoMetadata::timePeriods"]').invoke('val') // .should('contain') does not work
      .then($value => {
        expect($value).to.equal('{' + sub1start + '..' + sub1end + '}');
      });
    cy.get('textarea[name="geoMetadata::administrativeUnit"]').invoke('val')
      .then($value => {
        expect($value).to.include('["Earth","Europe","Federal Republic of Germany"]');
      });
    cy.get('#administrativeUnitInput').contains("Federal Republic of Germany");
    cy.get('#administrativeUnitInput li.tagit-choice').should('have.length', 3);
  });

  it('Updates raw data when interacting with time period', function () {
    // Plain-text temporal input commits on blur now (no daterangepicker).
    cy.get('input[name=datetimes]').clear().type('2022-09-02 - 2022-10-03').blur();
    cy.get('textarea[name="geoMetadata::timePeriods"]').invoke('val')
      .then($value => {
        expect($value).to.equal('{2022-09-02..2022-10-03}');
      });
  });

  it('Updates raw data and coverage field in Metadata tab when interacting with map', function () {
    // Real interactive flow: editor draws a marker → gazetteer resolves
    // → stored spatialProperties gains a Point → admin-unit tagit shrinks
    // to the common hierarchy → coverage field reflects it.
    //
    // Pixel (700, 200) on the editor's publication-tab map at zoom 1 /
    // centre (0,0) lands in East Asia, far from the existing Hanover
    // LineString in Germany.
    //
    // {force:true} is needed because the publication tab lays the map in a
    // scroll container where the element centre can be off-screen; the
    // click reaches Leaflet at the requested offset either way.
    cy.get('#mapdiv').scrollIntoView();
    cy.toolbarButton('marker').click();
    cy.wait(500);
    cy.get('#mapdiv').click(700, 200, { force: true });
    cy.wait(3000);
    cy.get('textarea[name="geoMetadata::spatialProperties"]').invoke('val')
      .then(($value) => { expect($value).to.include('{"type":"Point","coordinates":['); });
    cy.get('textarea[name="geoMetadata::administrativeUnit"]').invoke('val')
      .then(($value) => { expect($value).to.not.include('Federal Republic of Germany'); });
    cy.get('input[id^="metadata-coverage-"]').invoke('val')
      .should('match', /^Earth(, [^,]+)*$/);
  });

  it('Updates raw data and coverage field when an administrative unit tag is removed', function () {
    // Test 3 added a Point in East Asia; tags are now [Earth, Europe] (the
    // common-hierarchy collapse). Remove the Europe tag (second in tagit)
    // to leave just Earth.
    cy.get('#administrativeUnitInput li.tagit-choice[title*="Europe"] .tagit-close').click();
    cy.get('textarea[name="geoMetadata::administrativeUnit"]').invoke('val')
      .then(($value) => { expect($value).to.not.include('"Europe"'); });
    cy.get('input[id^="metadata-coverage-"]').invoke('val')
      .should('match', /^Earth$|^$/);
  });

});

// Tests that each login as a different user — separate describe with default
// testIsolation (true) so each test starts with a clean browser session.
describe('geoMetadata Production Editing — per-user flows', function () {

  var submission;
  var sub1start = '2022-01-01';
  var sub1end = '2022-12-31';

  before(function () {
    submission = { issue: '1' };
  });

  it('Author can see but not edit time & location in publication tab', function () {
    cy.openSubmissionsAs('aauthor');
    cy.get('a:contains("View")').first().click(); // click latest submission

    cy.get('div[role="tablist"]').find('button:contains("Publication")').click();
    cy.get('input[id^="metadata-coverage-"]').should('have.value', 'Earth, Europe, Federal Republic of Germany');
    cy.get('button[id^="timeLocation"]').click();
    cy.get('#mapdiv').should('exist');
    cy.get('textarea').should('have.length', 3); // three text areas for raw input

    // check metadata is loaded correctly
    cy.get('textarea[name="geoMetadata::timePeriods"]').invoke('val') // .should('contain') does not work
      .then($value => {
        expect($value).to.equal('{' + sub1start + '..' + sub1end + '}');
      });
    cy.get('textarea[name="geoMetadata::administrativeUnit"]').invoke('val')
      .then($value => {
        expect($value).to.include('["Earth","Europe","Federal Republic of Germany"]');
      });
    cy.get('#administrativeUnitInput').contains("Federal Republic of Germany");
    cy.get('#administrativeUnitInput li.tagit-choice').should('have.length', 3);

    cy.intercept({
      method: 'POST',
      url: '*',
      times: 1
    }).as('post');
    cy.get('div#timeLocation button[label="Save"]').click();
    cy.wait('@post').its('response.statusCode').should('eq', 403);

    cy.logout();
  });

  it('Has updated information on preview page', function () {
    cy.openSubmissionsAs('eeditor');
    cy.get('a:contains("View")').first().click(); // click latest submission

    cy.get('div[role="tablist"]').find('button:contains("Publication")').click();
    cy.get('button[id^="timeLocation"]').click();

    // make actual changes
    cy.get('input[name=datetimes]').clear().type('2022-10-10 - 2022-11-11').blur();
    cy.get('#mapdiv').scrollIntoView();
    cy.get('#mapdiv a.leaflet-draw-draw-marker').should('be.visible');
    cy.toolbarButton('marker').click();
    // Pixel (700, 200) at zoom 1 / centre (0,0) lands far outside Germany —
    // the common admin hierarchy across the existing Hanover LineString and
    // this new Point collapses to just "Earth".
    cy.wait(500);
    cy.get('#mapdiv').click(700, 200, { force: true });
    // Wait for gazetteer → admin-unit update to remove Germany from the
    // tagit list before we hit Save (otherwise the Save persists the stale
    // pre-click admin-unit state).
    cy.get('#administrativeUnitInput li.tagit-choice', { timeout: 15000 })
      .should('not.contain', 'Federal Republic of Germany');

    cy.get('div#timeLocation button[label="Save"]').click();
    cy.intercept({
      method: 'POST',
      url: '*',
      times: 1
    }).as('post');
    cy.get('div#timeLocation button[label="Save"]').click();
    cy.wait('@post').its('response.statusCode').should('eq', 200);

    cy.get('button#workflow-button').click();
    cy.get('a[id^="accept-button"]').click();
    cy.get('input[id^="skipEmail-skip"]').click();
    cy.get('form[id="promote"] button:contains("Next:")').click();
    cy.get('input[id^="select"]').click();
    cy.get('button:contains("Record Editorial Decision")').click();
    cy.wait(5000);

    cy.get('a:contains("Preview"):visible').click();
    cy.get('#geoMetadata_span_start').should('contain', '2022-10-10');
    cy.get('#geoMetadata_span_end').should('contain', '2022-11-11');
    // DC.Coverage is the deepest common admin unit across Hanover's Germany
    // LineString and the new marker. The editor's publication-tab map is
    // auto-zoomed to the existing Hanover geometry, so pixel (700, 200)
    // still lands in Europe (outside Germany) — common hierarchy collapses
    // to [Earth, Europe].
    cy.get('meta[name="DC.Coverage"]').should('have.attr', 'content').and('equal', 'Earth, Europe');
    cy.get('meta[name="DC.SpatialCoverage"]').should('have.attr', 'content').and('contain', '{"type":"Point","coordinates":[');

    cy.logout();
  });

  it('Can save time & location in publication tab as editor', function () {
    cy.openSubmissionsAs('eeditor');
    cy.get('a:contains("View")').first().click(); // click latest submission

    cy.get('div[role="tablist"]').find('button:contains("Publication")').click();
    cy.get('button[id^="timeLocation"]').click();

    // make actual changes
    cy.get('input[name=datetimes]').clear().type('2022-09-08 - 2022-09-08').blur();
    cy.toolbarButton('marker').click();
    cy.get('#mapdiv').click(220, 220);
    cy.wait(4000); // needs to query GeoNames etc.

    cy.get('div#timeLocation button[label="Save"]').click();
    cy.intercept({
      method: 'POST',
      url: '*',
      times: 1
    }).as('post');
    cy.get('div#timeLocation button[label="Save"]').click();
    cy.wait('@post').its('response.statusCode').should('eq', 200);

    cy.logout();
  });

  it('Contains correct data on article page after publication', function () {
    cy.openSubmissionsAs('eeditor');
    cy.get('a:contains("View")').first().click(); // click latest submission
    cy.wait(2000);

    cy.promoteFileToFinalDraft();

    cy.get('a[id^="sendToProduction-button"]').click();
    cy.get('input[id^="skipEmail-skip"]').click();
    cy.get('form[id="promote"] button:contains("Next:")').click();
    cy.get('input[id^="select"]').click();
    cy.get('button:contains("Record Editorial Decision")').click();
    cy.wait(2000);
    cy.get('div[id="production"]')
      .find('button:contains("Schedule For Publication")').click();
    cy.get('button[id="issue-button"]').click();
    cy.get('button:contains("Assign to Issue")').click();
    cy.get('select[id^="assignToIssue"]').select(submission.issue);
    cy.get('div[id^="assign"]').
      find('button:contains("Save")').click();
    cy.wait(1000);
    cy.get('button:contains("Schedule For Publication")');
    cy.get('button:contains("Publish"), div[class="pkpFormPages"] button:contains("Schedule For Publication")').click();
    cy.wait(3000); // Vue publish form posts asynchronously; wait so the issue
                   // TOC has the article by the time we navigate there.

    cy.get('.pkpWorkflow__identificationId').then(id => {
      cy.visit('/' + Cypress.env('contexts').primary.path + '/');
      cy.get('a#article-' + id.text()).click();
      cy.wait(500);

      // check correct data is on the publication page
      cy.get('#geoMetadata_span_start').should('contain', '2022-09-08');
      cy.get('#geoMetadata_span_end').should('contain', '2022-09-08');
      cy.get('meta[name="DC.Coverage"]').should('have.attr', 'content').and('equal', 'Earth, Europe');
      cy.get('meta[name="DC.SpatialCoverage"]').should('have.attr', 'content').and('contain', '{"type":"Point","coordinates":['); // cypress takes are of decoding
    });

    cy.logout();
  });

  it('After publication editor cannot edit time & location metadata', function () {
    cy.openSubmissionsAs('eeditor');
    cy.get('button:contains("Archives")').click({ force: true });
    cy.wait(5000);
    //cy.get('li[class="listPanel__item"]').first().find('span:contains("View")').click({multiple: true, force: true}); // view latest archived submission
    cy.get('#archive > .submissionsListPanel > .listPanel > .listPanel__body > .listPanel__items > .listPanel__itemsList > :nth-child(1) > .listPanel__item--submission > .listPanel__itemSummary > .listPanel__itemActions > .pkpButton').click();
    cy.get('div[role="tablist"]').find('button:contains("Publication")').click();
    cy.get('button[id^="timeLocation"]').click();

    cy.intercept({
      method: 'POST',
      url: '*',
      times: 1
    }).as('post');
    cy.get('div#timeLocation button[label="Save"]').click();
    cy.wait('@post').its('response.statusCode').should('eq', 403);

    cy.logout();
  });

});