/**
 * @file cypress/tests/integration/34-submission-no-timeperiod.cy.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 * @brief Publishes an article that has spatial data but no time period, so
 *        downstream specs can exercise the "temporalProperties is empty" code
 *        path — used by issue #106 to check that the GeoJSON embedded in the
 *        DC.SpatialCoverage HTML-head meta tag still carries the empty
 *        timePeriods array and "not available" provenance block, and that no
 *        DC.temporal meta tag is emitted for such articles.
 */

describe('geoMetadata Submission Without Time Period', function () {

  var submission;

  before(function () {
    submission = {
      id: 0,
      prefix: '',
      title: 'Timeless Isle',
      subtitle: 'When was never asked',
      abstract: 'This article has spatial metadata but no temporal metadata.',
      // Intentionally no `timePeriod` — the createSubmission helper skips the
      // daterangepicker when the key is absent (see support/commands.js:396).
      issue: '1'
    };
  });

  it('Publishes a spatial-only article without a time period', function () {
    cy.login('aauthor');
    cy.get('a:contains("aauthor")').click();
    cy.get('a:contains("Dashboard")').click({ force: true });

    cy.createSubmissionAndPublish(submission);

    // Confirm the new article is listed in the same issue used by the HTML-head
    // suite, so spec 40 can navigate to it the same way it does for Hanover.
    cy.visit('/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Archive")').click();
    cy.get('a:contains("Vol. 1 No. 2 (2022)")').click();
    cy.get('.pkp_structure_main').should('contain', 'Timeless Isle');
  });

});
