/**
 * @file cypress/tests/integration/configuration.cy.js
 *
 * Copyright (c) 2022 OPTIMETA project
 * Copyright (c) 2022 Daniel Nüst
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 */

describe('OPTIMETA Geoplugin Production Editing', function () {

  var submission;
  var sub1start = '2022-01-01';
  var sub1end = '2022-12-31';

  before(function () {
    submission = {
      id: 0,
      //section: 'Articles',
      prefix: '',
      title: 'Editors saves the day',
      subtitle: 'Nothing without her!',
      abstract: 'The publicatin process needs editors.',
      timePeriod: sub1start + ' - ' + sub1end,
      issue: '1'
    };

    cy.login('aauthor');
    cy.get('a:contains("aauthor")').click();
    cy.get('a:contains("Dashboard")').click({ force: true });
    cy.createSubmission(submission);
    cy.logout();
  });

  it('Can inspect the spatio-temporal metadata as editor', function () {
    cy.login('eeditor');
    cy.get('a:contains("eeditor"):visible').click();
    cy.get('a:contains("Dashboard")').click({ force: true });
    cy.get('a:contains("View")').first().click(); // click latest submission

    cy.get('div[role="tablist"]').find('button:contains("Publication")').click();

    // the coverage metadata field is disabled but with correct content
    cy.get('button[id^="metadata"]').click();
    cy.get('input[id^="metadata-coverage-"').invoke('attr', 'disabled').should('eq', 'disabled');
    cy.get('input[id^="metadata-coverage-"').invoke('attr', 'title').should('contain', 'field has been disabled');
    cy.get('input[id^="metadata-coverage-"').should('have.value', 'Earth, Europe, Federal Republic of Germany');

    // time & location tab
    cy.get('button[id^="timeLocation"]').click();
    cy.get('#mapdiv').should('exist');
    cy.get('textarea').should('have.length', 3); // three text areas for raw input

    // check metadata is loaded correctly
    cy.get('textarea[name="optimetaGeo::timePeriods"]').invoke('val') // .should('contain') does not work
      .then($value => {
        expect($value).to.equal('{' + sub1start + '..' + sub1end + '}');
      });
    cy.get('textarea[name="optimetaGeo::administrativeUnit"]').invoke('val')
      .then($value => {
        expect($value).to.include('["Earth","Europe","Federal Republic of Germany"]');
      });
    cy.get('#administrativeUnitInput').contains("Federal Republic of Germany");
    cy.get('#administrativeUnitInput li.tagit-choice').should('have.length', 3);
  });

  it('Updates raw data when interacting with time period', function () {
    cy.get('input[name=datetimes]').clear().type('2022-09-02 - 2022-10-03');
    cy.wait(500);
    cy.get('.applyBtn').click();
    cy.get('textarea[name="optimetaGeo::timePeriods"]').invoke('val')
      .then($value => {
        expect($value).to.equal('{2022-09-02..2022-10-03}');
      });
  });

  it('Updates raw data and coverage field in Metadata tab when interacting with map', function () {
    cy.toolbarButton('marker').click();
    cy.get('#mapdiv').dblclick(220, 200);
    cy.wait(2000); // needs to query GeoNames etc.
    cy.get('textarea[name="optimetaGeo::spatialProperties"]').invoke('val')
      .then($value => {
        expect($value).to.include('{"type":"Point","coordinates":['); // before there was only type:LineString
      });
    cy.get('textarea[name="optimetaGeo::administrativeUnit"]').invoke('val')
      .then($value => {
        expect($value).to.not.include('Federal Republic of Germany');
      });
    cy.get('#administrativeUnitInput li.tagit-choice').should('have.length', 2);
    cy.get('input[id^="metadata-coverage-"').should('have.value', 'Earth, Europe');
  });

  it('Updates raw data and coverage field in Metadata tab when interacting with administrative regions tags', function () {
    cy.get('[title="Earth, Europe"] > .tagit-close').click();
    cy.get('textarea[name="optimetaGeo::administrativeUnit"]').invoke('val')
      .then($value => {
        expect($value).to.not.include('Europe');
      });
    cy.get('input[id^="metadata-coverage-"').should('have.value', 'Earth');
  });

  it('Author can see and edit time & location in publication tab', function () {
    cy.login('aauthor');
    cy.get('a:contains("aauthor")').click();
    cy.get('a:contains("Dashboard")').click({ force: true });
    cy.get('a:contains("View")').first().click(); // click latest submission

    cy.get('div[role="tablist"]').find('button:contains("Publication")').click();
    cy.get('input[id^="metadata-coverage-"').should('have.value', 'Earth, Europe, Federal Republic of Germany');
    cy.get('button[id^="timeLocation"]').click();
    cy.get('#mapdiv').should('exist');
    cy.get('textarea').should('have.length', 3); // three text areas for raw input

    // check metadata is loaded correctly
    cy.get('textarea[name="optimetaGeo::timePeriods"]').invoke('val') // .should('contain') does not work
      .then($value => {
        expect($value).to.equal('{' + sub1start + '..' + sub1end + '}');
      });
    cy.get('textarea[name="optimetaGeo::administrativeUnit"]').invoke('val')
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
    cy.wait('@post').its('response.statusCode').should('eq', 200);

    cy.logout();
  });

  it('Has updated information on preview page', function () {
    cy.login('eeditor');
    cy.get('a:contains("eeditor"):visible').click();
    cy.get('a:contains("Dashboard")').click({ force: true });
    cy.get('a:contains("View")').first().click(); // click latest submission

    cy.get('div[role="tablist"]').find('button:contains("Publication")').click();
    cy.get('button[id^="timeLocation"]').click();

    // make actual changes
    cy.get('input[name=datetimes]').clear().type('2022-10-10 - 2022-11-11');
    cy.wait(500);
    cy.get('.applyBtn').click();
    cy.toolbarButton('marker').click();
    cy.get('#mapdiv').dblclick(222, 200);
    cy.wait(2000); // needs to query GeoNames etc.

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
    cy.get('#optimetageo_start').should('contain', '2022-10-10');
    cy.get('#optimetageo_end').should('contain', '2022-11-11');
    cy.get('meta[name="DC.Coverage"]').should('have.attr', 'content').and('equal', 'Earth, Europe');
    cy.get('meta[name="DC.SpatialCoverage"]').should('have.attr', 'content').and('contain', '{"type":"Point","coordinates":[');

    cy.logout();
  });

  it('Can save time & location in publication tab as editor', function () {
    cy.login('eeditor');
    cy.get('a:contains("eeditor"):visible').click();
    cy.get('a:contains("Dashboard")').click({ force: true });
    cy.get('a:contains("View")').first().click(); // click latest submission

    cy.get('div[role="tablist"]').find('button:contains("Publication")').click();
    cy.get('button[id^="timeLocation"]').click();

    // make actual changes
    cy.get('input[name=datetimes]').clear().type('2022-09-08 - 2022-09-08');
    cy.wait(500);
    cy.get('.applyBtn').click();
    cy.toolbarButton('marker').click();
    cy.get('#mapdiv').dblclick(220, 200);
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
    cy.login('eeditor');
    cy.get('a:contains("eeditor"):visible').click();
    cy.get('a:contains("Dashboard")').click({ force: true });
    cy.get('a:contains("View")').first().click(); // click latest submission

    cy.get('a[id^="accept-button"]').click();
    cy.get('input[id^="skipEmail-skip"]').click();
    cy.get('form[id="promote"] button:contains("Next:")').click();
    cy.get('input[id^="select"]').click();
    cy.get('button:contains("Record Editorial Decision")').click();
    cy.wait(2000);
    cy.get('a:contains("Send To Production")').click();
    cy.get('input[id="skipEmail-skip"]').click();
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

    cy.get('.pkpWorkflow__identificationId').then(id => {
      cy.visit('/');
      cy.get('a#article-' + id.text()).click();
      cy.wait(500);

      // check correct data is on the publication page
      cy.get('#optimetageo_start').should('contain', '2022-09-08');
      cy.get('#optimetageo_end').should('contain', '2022-09-08');
      cy.get('meta[name="DC.Coverage"]').should('have.attr', 'content').and('equal', 'Earth, Europe');
      cy.get('meta[name="DC.SpatialCoverage"]').should('have.attr', 'content').and('contain', '{"type":"Point","coordinates":['); // cypress takes are of decoding

      cy.logout();
    });
  });

  it('After publication author cannot edit time & location metadata', function () {
    cy.login('aauthor');
    cy.get('a:contains("aauthor")').click();
    cy.get('a:contains("Dashboard")').click({ force: true });
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