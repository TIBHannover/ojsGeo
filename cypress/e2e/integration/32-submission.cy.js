/**
 * @file cypress/tests/integration/configuration.cy.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 */

// testIsolation off: tests 2→3→4 deliberately chain — marker click, zoom-out,
// second marker, tag removal — on a single open submission form.
describe('geoMetadata Submission', { testIsolation: false }, function () {

  var submission;
  var submission2;
  var sub1start = '2022-01-01';
  var sub1end = '2022-12-31';

  // Hanover is published via directInject rather than pixel clicks — the
  // downstream specs (33-submission-editorial, 40-html_head) assert on exact
  // GeoNames-sourced values that pixel-click drawing at the default zoom-1
  // (0,0) map view cannot reach. Values below are authoritative GeoNames
  // output for Federal Republic of Germany (geonameId 2921044); change only
  // if you change the assertions that consume them.
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
  const HANOVER_GEOJSON = {
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
  };

  before(function () {
    submission = {
      id: 0,
      //section: 'Articles',
      prefix: '',
      title: 'Hanover is nice',
      subtitle: 'It really is',
      abstract: 'The city of Hanover is really nice, because it is home of the TIB.',
      timePeriod: sub1start + ' - ' + sub1end,
      issue: '1',
      directInject: {
        spatial:   HANOVER_GEOJSON,
        adminUnit: HANOVER_ADMIN_UNITS
      }
    };

    submission2 = {
      id: 0,
      //section: 'Articles',
      prefix: '',
      title: 'Münster will be nice',
      subtitle: 'Most likely',
      abstract: 'The city of Münster will be really nice when it is time.',
      timePeriod: '2022-02-02 - 2022-12-12',
      issue: '2'
    };
  });

  it('Has a map on the current issue page after publishing a paper', function () {
    cy.login('aauthor');
    cy.get('a:contains("aauthor")').click();
    cy.get('a:contains("Dashboard")').click({ force: true });

    cy.createSubmissionAndPublish(submission);

    // go to journal index and check if there is a map
    cy.visit('/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Current")').click();
    cy.get('.pkp_structure_main').should('contain', 'Hanover is nice');
    cy.get('.pkp_structure_main').should('contain', 'Augusta Author');
    cy.get('.pkp_structure_main').should('contain', 'Times & Locations');
    cy.get('#mapdiv').should('exist');
  });

  it('Has the content of the administrative unit field inserted into the coverage field', function() {
    // testIsolation: false carries over the eeditor session left open by
    // test 1's publish workflow — log out first so the aauthor login lands on
    // the author's dashboard (otherwise OJS re-uses the editor session).
    cy.logout();
    cy.login('aauthor');
    cy.get('a:contains("aauthor")').click();
    cy.get('a:contains("Dashboard")').click({ force: true });

    cy.get('div#myQueue a:contains("New Submission")').click();
    cy.get('input[id^="checklist-"]').click({ multiple: true });
    cy.get('input[id="privacyConsent"]').click();
    cy.get('button.submitFormButton').click();
    cy.wait(1000);
    cy.get('button.submitFormButton').click();

    // Leaflet.Draw toolbar i18n (issue #111). The Draw control reads its labels from
    // L.drawLocal, which submission.js deep-merges from geoMetadata_drawLocal just before
    // `new L.Control.Draw()`. Assert the four draw buttons + the two edit buttons carry the
    // English strings from locale/en_US/locale.po → proves the full escape-aware pipeline
    // survived from PHP → Smarty → <script> → L.drawLocal. Localised variants are covered
    // indirectly by 52-fullscreen-locales.cy.js (zoom tooltips share the same pipeline).
    cy.get('#mapdiv a.leaflet-draw-draw-polyline').should('have.attr', 'title', 'Draw a polyline');
    cy.get('#mapdiv a.leaflet-draw-draw-polygon').should('have.attr', 'title', 'Draw a polygon');
    cy.get('#mapdiv a.leaflet-draw-draw-rectangle').should('have.attr', 'title', 'Draw a rectangle');
    cy.get('#mapdiv a.leaflet-draw-draw-marker').should('have.attr', 'title', 'Draw a marker');
    cy.get('#mapdiv a.leaflet-draw-edit-edit').should('exist');
    cy.get('#mapdiv a.leaflet-draw-edit-remove').should('exist');

    // Layer switcher overlay names — submission.js uses the new overlay.* translation keys
    // (issue #111). The layer-control labels are the only place these surface.
    cy.get('#mapdiv .leaflet-control-layers-overlays label')
      .should('contain', 'Administrative unit')
      .and('contain', 'Geometric shape(s)');

    // Real interactive flow: draw a marker → gazetteer resolves →
    // admin-unit tagit fills in → coverage field updates. This is the
    // end-to-end pipeline that makes the "draw something + we figure out
    // where you are" UX work — keep it as interaction coverage.
    cy.toolbarButton('marker').click();
    cy.get('#mapdiv').click(260, 110);
    cy.wait(3000); // a bit longer for GitHub action
    // Pixel (260,110) at default zoom falls on the BC coast; depending on
    // sub-pixel click position either North Coast or Cariboo Regional
    // District resolves. Match the stable prefix.
    cy.get('input[id^="coverage-"')
      .invoke('val')
      .should('match', /^Earth, Canada, British Columbia, .+ Regional District$/);
    cy.get('a.leaflet-control-zoom-out').click().click().click().click().click().click().click().click().click().click().click();
    cy.wait(1000);
  });

  it('Updates the coverage field on interaction with the map', function () {
    // Second marker collapses the common admin hierarchy.
    cy.toolbarButton('marker').click();
    cy.get('#mapdiv').click(400, 380);
    cy.wait(2000);
    cy.get('input[id^="coverage-"').invoke('val')
      .should('match', /^Earth, Canada, British Columbia$|^Earth, Canada$|^Earth$/);
  });

  it('Updates the coverage field on interaction with the administrative unit field', function () {
    // Remove the most-specific tag; coverage should shorten by one level.
    cy.get('#administrativeUnitInput li.tagit-choice').last().find('.tagit-close').click();
    cy.get('input[id^="coverage-"').invoke('val')
      .should('match', /^Earth(, .+)?$/);
  });

});