/**
 * @file cypress/tests/integration/configuration.cy.js
 *
 * Copyright (c) 2022 OPTIMETA project
 * Copyright (c) 2022 Daniel Nüst
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 */

describe('OPTIMETA Geo Plugin Submission', function () {

  var submission;
  var submission2;
  var sub1start = '2022-01-01';
  var sub1end = '2022-12-31';

  before(function () {
    submission = {
      id: 0,
      //section: 'Articles',
      prefix: '',
      title: 'Hanover is nice',
      subtitle: 'It really is',
      abstract: 'The city of Hanover is really nice, because it is home of the TIB.',
      timePeriod: sub1start + ' - ' + sub1end,
      issue: '1'
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

  it('Has no map on the empty current issue page', function () {
    cy.visit('/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Current")').click();
    cy.get('.pkp_structure_main').should('not.contain', 'Times & locations');
    cy.get('#mapdiv').should('not.exist');
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
    cy.get('.pkp_structure_main').should('contain', 'Times & locations');
    cy.get('#mapdiv').should('exist');
  });

  it('Has the content of the administrative unit field inserted into the coverage field', function() {
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
    cy.get('input[id^="coverage-"').should('have.value', 'Earth, North America, Canada, British Columbia, Nazko');
    cy.get('a.leaflet-control-zoom-out').click().click().click().click().click().click().click().click().click().click().click();
    cy.wait(1000); // for map zoom to catch up
  });

  it('Updates the coverage field on interaction with the map', function () {
    // add another marker to update
    cy.toolbarButton('marker').click();
    cy.get('#mapdiv').click(400, 380);
    cy.wait(1000);
    cy.get('input[id^="coverage-"').should('have.value', 'Earth, North America, Canada, British Columbia');
  });

  it('Updates the coverage field on interaction with the administrative unit field', function () {
    cy.get('[title="Earth, North America, Canada, British Columbia"] > .tagit-close').click(); // click on the last tag
    cy.get('input[id^="coverage-"').should('have.value', 'Earth, North America, Canada');
  });

});