/**
 * @file cypress/tests/integration/configuration.cy.js
 *
 * Copyright (c) 2022 OPTIMETA project
 * Copyright (c) 2022 Daniel Nüst
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 */

describe('OPTIMETA Geo Plugin Submission without Geonames', function () {

  var submission;
  var sub1start = '2021-01-01';
  var sub1end = '2021-12-31';

  before(function () {
    submission = {
      id: 0,
      //section: 'Articles',
      prefix: '',
      title: 'Vancouver is cool',
      subtitle: 'Surely',
      abstract: 'The city of Vancouver is home.',
      timePeriod: sub1start + ' - ' + sub1end,
      issue: '1'
    };
  });

  it('Has no map on the empty current issue page', function () {
    cy.visit('/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Current")').click();
    cy.get('.pkp_structure_main').should('not.contain', 'Times & locations');
    cy.get('#mapdiv').should('not.exist');
  });

  it('Has not yet a map on the current issue page after publishing a paper', function () {
    cy.login('aauthor');
    cy.get('a:contains("aauthor")').click();
    cy.get('a:contains("Dashboard")').click({ force: true });

    cy.createSubmissionAndPublish(submission);

    // go to journal index and check there is no map
    cy.visit('/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Current")').click();
    cy.get('.pkp_structure_main').should('contain', 'Vancouver is cool');
    cy.get('.pkp_structure_main').should('not.contain', 'Times & locations');
    cy.get('#mapdiv').should('not.exist');
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