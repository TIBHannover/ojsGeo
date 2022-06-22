/**
 * @file cypress/tests/integration/configuration.cy.js
 *
 * Copyright (c) 2022 OPTIMETA project
 * Copyright (c) 2022 Daniel Nüst
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 */

describe('OPTIMETA Geoplugin tests', function () {

  let submission;

  before(function () {
    submission = {
      id: 0,
      section: 'Articles',
      prefix: '',
      title: 'Hanover is nice',
      subtitle: 'It really is',
      abstract: 'The city of Hanover is really nice, because it is home of the TIB.'
    };

    cy.register({
      'username': 'aauthor',
      'givenName': 'Augusta',
      'familyName': 'Author',
      'affiliation': 'University of Research',
      'country': 'Germany',
    });
  });

  it('Has a map on the current issue page and the issue page after publishing a paper', function () {
    cy.createSubmissionAndPublish(submission);

    // go to journal index and check if there is an empty map
    cy.get('a[class="app__contextTitle"]').click();
    cy.get('div[class*="page_index_journal"]:contains("Times & locations")');

    // TODO check there is a map!

    // go to issue page and repeat
    // TODO
  });

});