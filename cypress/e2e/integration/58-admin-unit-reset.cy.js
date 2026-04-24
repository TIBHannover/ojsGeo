/**
 * @file cypress/tests/integration/58-admin-unit-reset.cy.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 * Regression for issue #112: admin-unit hidden state must be coherent with
 * the feature set after every Leaflet event, and author-typed tags must
 * survive draw/edit/delete cycles (with a visible notice).
 */

// testIsolation off: tests chain on a single open submission form, each
// reusing the map state left by the previous one.
describe('geoMetadata admin-unit reset on submission form', { testIsolation: false }, function () {

  const NOTICE = '.geoMetadata-manual-admin-unit-notice';

  before(function () {
    cy.login('aauthor');
    cy.get('a:contains("aauthor")').click();
    cy.get('a:contains("Dashboard")').click({ force: true });

    cy.get('div#myQueue a:contains("New Submission")').click();
    cy.get('input[id^="checklist-"]').click({ multiple: true });
    cy.get('input[id="privacyConsent"]').click();
    cy.get('button.submitFormButton').click();
    cy.wait(1000);
    cy.get('button.submitFormButton').click();
    cy.wait(2000);
  });

  it('clears the administrativeUnit textarea to "no data" when all features are removed', function () {
    cy.toolbarButton('marker').click();
    cy.get('#mapdiv').click(260, 110);
    cy.wait(3000);
    cy.get('#administrativeUnitInput li.tagit-choice').its('length').should('be.gt', 0);
    cy.get('textarea[name="geoMetadata::administrativeUnit"]').invoke('val')
      .should('not.eq', 'no data');

    cy.window().then(({ map, drawnItems }) => {
      const layers = {};
      drawnItems.eachLayer((l) => { layers[l._leaflet_id] = l; });
      drawnItems.clearLayers();
      map.fire('draw:deleted', { layers: { _layers: layers } });
    });
    cy.wait(2000);

    cy.get('#administrativeUnitInput li.tagit-choice').should('have.length', 0);
    cy.get('textarea[name="geoMetadata::administrativeUnit"]').invoke('val')
      .should('eq', 'no data');
    cy.get(NOTICE).should('not.be.visible');
  });

  it('does not carry over stale admin-unit tags when a new feature is drawn after a clear', function () {
    cy.toolbarButton('marker').click();
    cy.get('#mapdiv').click(400, 380);
    cy.wait(3000);
    cy.get('textarea[name="geoMetadata::administrativeUnit"]').invoke('val')
      .should('not.eq', 'no data');
    cy.get('#administrativeUnitInput li.tagit-choice').its('length').should('be.gt', 0);
  });

  it('preserves a manually typed admin-unit tag across a map edit and shows the notice', function () {
    cy.get('#administrativeUnitInput > .tagit-new > .ui-widget-content').type('Hanover{enter}');
    cy.wait(500);
    cy.get('#administrativeUnitInput').contains('Hanover');
    cy.get(NOTICE).should('be.visible');

    cy.toolbarButton('marker').click();
    cy.get('#mapdiv').click(450, 260);
    cy.wait(3000);

    cy.get('#administrativeUnitInput').contains('Hanover');
    cy.get(NOTICE).should('be.visible');
  });

  it('hides the notice when the last manually typed tag is removed', function () {
    cy.get('#administrativeUnitInput li.tagit-choice')
      .contains('Hanover')
      .parent()
      .find('.tagit-close')
      .click();
    cy.wait(300);
    cy.get('#administrativeUnitInput').should('not.contain', 'Hanover');
    cy.get(NOTICE).should('not.be.visible');
  });

});

// Editor-side coverage: publication tab uses the same JS but a different
// template. Uses directInject to pre-populate a submission with Hanover
// admin-unit state so the bug surfaces on the timeLocation tab.
describe('geoMetadata admin-unit reset on publication tab', { testIsolation: false }, function () {

  const NOTICE = '.geoMetadata-manual-admin-unit-notice';
  const sub1start = '2022-01-01';
  const sub1end = '2022-12-31';

  const HANOVER_ADMIN_UNITS = [
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
    const submission = {
      id: 0,
      prefix: '',
      title: 'Regression #112 publication tab',
      subtitle: '',
      abstract: 'Editor-side admin-unit reset regression.',
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
          administrativeUnits: HANOVER_ADMIN_UNITS,
          temporalProperties: {
            timePeriods: ['{' + sub1start + '..' + sub1end + '}'],
            provenance: { description: 'temporal properties created by user', id: 31 }
          }
        },
        adminUnit: HANOVER_ADMIN_UNITS
      }
    };

    cy.login('aauthor');
    cy.get('a:contains("aauthor")').click();
    cy.get('a:contains("Dashboard")').click({ force: true });
    cy.createSubmission(submission);
    cy.logout();

    cy.login('eeditor');
    cy.get('a:contains("eeditor"):visible').click();
    cy.get('a:contains("Dashboard")').click({ force: true });
    cy.get('a:contains("View")').first().click();
    cy.get('div[role="tablist"]').find('button:contains("Publication")').click();
    cy.get('button[id^="timeLocation"]').click();
    cy.wait(2000);
  });

  it('removing an intermediate auto-derived tag freezes the remaining tags and blocks re-derivation', function () {
    cy.get('#administrativeUnitInput li.tagit-choice').should('have.length', 3);

    cy.get('#administrativeUnitInput li.tagit-choice')
      .contains('Europe')
      .parent()
      .find('.tagit-close')
      .click();
    cy.wait(500);
    cy.get(NOTICE).should('be.visible');
    cy.get('#administrativeUnitInput').should('not.contain', 'Europe');
    cy.get('#administrativeUnitInput').contains('Earth');
    cy.get('#administrativeUnitInput').contains('Federal Republic of Germany');

    cy.toolbarButton('marker').click();
    cy.get('#mapdiv').click(700, 200);
    cy.wait(3000);

    cy.get(NOTICE).should('be.visible');
    cy.get('#administrativeUnitInput').should('not.contain', 'Europe');
    cy.get('#administrativeUnitInput').contains('Earth');
    cy.get('#administrativeUnitInput').contains('Federal Republic of Germany');
    cy.get('textarea[name="geoMetadata::administrativeUnit"]').invoke('val')
      .should('not.include', '"Europe"');
  });

  it('preserves a manually typed admin-unit tag across a map edit and shows the notice', function () {
    cy.get('#administrativeUnitInput > .tagit-new > .ui-widget-content').type('ManuallyAdded{enter}');
    cy.wait(500);
    cy.get('#administrativeUnitInput').contains('ManuallyAdded');
    cy.get(NOTICE).should('be.visible');

    cy.window().then(({ map, drawnItems }) => {
      const layers = {};
      drawnItems.eachLayer((l) => { layers[l._leaflet_id] = l; });
      drawnItems.clearLayers();
      map.fire('draw:deleted', { layers: { _layers: layers } });
    });
    cy.wait(2000);

    cy.get('#administrativeUnitInput').contains('ManuallyAdded');
    cy.get(NOTICE).should('be.visible');
    cy.get('textarea[name="geoMetadata::administrativeUnit"]').invoke('val')
      .should('include', 'ManuallyAdded');
  });

});
