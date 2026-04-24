/**
 * @file cypress/tests/integration/configuration.cy.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 */

describe('geoMetadata Submission without Geonames', function () {

  var submission;
  var sub1start = '2021-01-01';
  var sub1end = '2021-12-31';

  before(function () {
    // Inject a single Point feature with no admin-unit bbox — gazetteer is
    // intentionally not configured for this spec, so in the real flow the
    // admin-unit resolution fails. The Point is reused by 22-article-view's
    // feature-count test (22.1), and the missing admin-unit bbox keeps the
    // article page's admin-layer assertion valid.
    const VANCOUVER = {
      spatial: {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          properties: { provenance: { description: 'geometric shape created by user (drawing)', id: 11 } },
          geometry: { type: 'Point', coordinates: [-123.11, 49.26] }
        }],
        administrativeUnits: [{
          name: 'Earth',
          geonameId: 6295630,
          bbox: 'not available',
          administrativeUnitSuborder: ['Earth'],
          provenance: { description: 'administrative unit created by user (accepting the suggestion of the geonames API , which was created on basis of a geometric shape input)', id: 23 }
        }],
        temporalProperties: {
          timePeriods: ['{' + sub1start + '..' + sub1end + '}'],
          provenance: { description: 'temporal properties created by user', id: 31 }
        }
      },
      adminUnit: [{
        name: 'Earth',
        geonameId: 6295630,
        bbox: 'not available',
        administrativeUnitSuborder: ['Earth'],
        provenance: { description: 'administrative unit created by user (accepting the suggestion of the geonames API , which was created on basis of a geometric shape input)', id: 23 }
      }]
    };
    submission = {
      id: 0,
      //section: 'Articles',
      prefix: '',
      title: 'Vancouver is cool',
      subtitle: 'Surely',
      abstract: 'The city of Vancouver is home.',
      timePeriod: sub1start + ' - ' + sub1end,
      issue: '1',
      directInject: VANCOUVER
    };
  });

  it('Has no map on the empty current issue page', function () {
    cy.visit('/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Current")').click();
    cy.get('.pkp_structure_main').should('not.contain', 'Times & Locations');
    cy.get('#mapdiv').should('not.exist');
  });

  it('Renders the issue map with Vancouver\'s geometry after publishing a paper', function () {
    cy.login('aauthor');
    cy.get('a:contains("aauthor")').click();
    cy.get('a:contains("Dashboard")').click({ force: true });

    cy.createSubmissionAndPublish(submission);

    // Vancouver is published with a Point feature but no resolved admin unit
    // (gazetteer not configured for spec 21). The plugin's option-(b) gate
    // renders the issue map section as soon as one article has features, so
    // the heading + mapdiv appear.
    cy.visit('/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Current")').click();
    cy.get('.pkp_structure_main').should('contain', 'Vancouver is cool');
    cy.get('.pkp_structure_main').should('contain', 'Times & Locations');
    cy.get('#mapdiv').should('exist');
  });

  it('Has empty administrative unit in submission form because Geonames is not configured, but show warning message', function() {
    cy.login('aauthor');
    cy.get('a:contains("aauthor")').click();
    cy.get('a:contains("Dashboard")').click({ force: true });

    cy.get('div#myQueue a:contains("New Submission")').click();
    cy.get('input[id^="checklist-"]').click({ multiple: true });
    cy.get('input[id="privacyConsent"]').click();
    cy.get('button.submitFormButton').click();
    cy.wait(1000);
    cy.get('button.submitFormButton').click();

    cy.toolbarButton('marker').click();
    cy.get('#mapdiv').click(260, 110);
    cy.wait(3000); // a bit longer for GitHub action
    cy.get('input[id^="coverage-"').should('have.value', '');

    cy.get('#submitStep3Form').should('contain', 'The gazetteer service is not available');
  });

  it('Manual updates in the administrative unit field update the coverage field', function() {
    cy.login('aauthor');
    cy.get('a:contains("aauthor")').click();
    cy.get('a:contains("Dashboard")').click({ force: true });

    cy.get('div#myQueue a:contains("New Submission")').click();
    cy.get('input[id^="checklist-"]').click({ multiple: true });
    cy.get('input[id="privacyConsent"]').click();
    cy.get('button.submitFormButton').click();
    cy.wait(1000);
    cy.get('button.submitFormButton').click();

    cy.get('#administrativeUnitInput > .tagit-new > .ui-widget-content').type('Canada{enter}');
    cy.wait(100);
    cy.get('input[id^="coverage-"').should('have.value', 'Canada');
  });

});