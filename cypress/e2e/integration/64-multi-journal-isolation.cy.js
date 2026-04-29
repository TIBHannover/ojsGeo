/**
 * @file cypress/e2e/integration/64-multi-journal-isolation.cy.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * Issue #99 — verify per-context isolation that the rest of the suite is
 * structurally blind to (it only ever runs against the primary journal):
 *   1. plugin settings on journal A do not bleed into journal B
 *   2. journal-map publications are filtered by context (no cross-bleed)
 *   3. issue-map articles are filtered by context (no cross-bleed)
 *
 * Depends on 11-second-journal.cy.js having seeded the secondary with
 * published submissions.
 */

describe('geoMetadata Multi-journal Isolation', function () {

  const primary = Cypress.env('contexts').primary.path;
  const secondary = Cypress.env('contexts').secondary.path;

  // Seed at least one published article on the primary via DB so the
  // content-isolation tests have data on both sides regardless of whether
  // upstream submission specs ran. 11-second-journal already DB-seeds the
  // secondary, so doing the symmetric thing here makes 64 self-sufficient.
  before(function () {
    cy.publishSubmissionViaDb('primary', {
      title: 'Hanover is nice',
      abstract: 'Primary-side seed for the isolation regression.',
      givenName: 'Augusta',
      familyName: 'Author',
      geoMetadata: {
        spatial: {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            properties: { provenance: { description: 'geometric shape created by user (drawing)', id: 11 } },
            geometry: { type: 'LineString', coordinates: [[8.43, 52.37], [9.73, 52.40]] }
          }],
        },
        temporal: '{2022-01-01..2022-12-31}',
      },
    });
  });

  const openSettings = (contextPath) => {
    cy.login('admin', 'admin', contextPath);
    cy.get('nav[class="app__nav"] a:contains("Website")').click();
    cy.get('button[id="plugins-button"]').click();
    cy.get('tr[id="component-grid-settings-plugins-settingsplugingrid-category-generic-row-geometadataplugin"] a[class="show_extras"]').click();
    cy.get('a[id^="component-grid-settings-plugins-settingsplugingrid-category-generic-row-geometadataplugin-settings-button"]').click();
    cy.get('form[id="geoMetadataSettings"]').should('exist');
  };

  const setToggleAndSave = (name, checked) => {
    if (checked) {
      cy.get(`form[id="geoMetadataSettings"] input[name="${name}"]`).check();
    } else {
      cy.get(`form[id="geoMetadataSettings"] input[name="${name}"]`).uncheck();
    }
    cy.get('form[id="geoMetadataSettings"] button[id^="submitFormButton"]').click();
    cy.wait(1000);
  };

  it('toggling showJournalMap off in primary does not affect secondary', function () {
    // The /<journal>/map route is registered when showJournalMap OR
    // showJournalTimeline is enabled (both render on the same page). Disable
    // both for the 404 assertion to hold; restore both at the end.
    openSettings(primary);
    setToggleAndSave('geoMetadata_showJournalTimeline', false);
    openSettings(primary);
    setToggleAndSave('geoMetadata_showJournalMap', false);

    cy.request({ url: '/' + primary + '/map', failOnStatusCode: false })
      .its('status').should('eq', 404);

    openSettings(secondary);
    cy.get('form[id="geoMetadataSettings"] input[name="geoMetadata_showJournalMap"]')
      .should('be.checked');
    cy.request({ url: '/' + secondary + '/map', failOnStatusCode: false })
      .its('status').should('eq', 200);

    openSettings(primary);
    setToggleAndSave('geoMetadata_showJournalMap', true);
    openSettings(primary);
    setToggleAndSave('geoMetadata_showJournalTimeline', true);
    cy.request({ url: '/' + primary + '/map', failOnStatusCode: false })
      .its('status').should('eq', 200);
  });

  it('journal-map publications do not bleed across contexts', function () {
    const collectIds = (contextPath) => {
      cy.visit('/' + contextPath + '/map');
      return cy.get('input[name="publications"]')
        .invoke('attr', 'value')
        .then((raw) => {
          const arr = JSON.parse(raw);
          return arr.map((p) => p.publicationId);
        });
    };

    collectIds(primary).then((primaryIds) => {
      collectIds(secondary).then((secondaryIds) => {
        expect(primaryIds.length, 'primary has at least one published article').to.be.greaterThan(0);
        expect(secondaryIds.length, 'secondary has at least one published article').to.be.greaterThan(0);
        const overlap = primaryIds.filter((id) => secondaryIds.includes(id));
        expect(overlap, 'no publication id appears on both journal maps').to.deep.equal([]);
      });
    });
  });

  it('issue-map articles do not bleed across contexts', function () {
    // Issue ids are global, not per-journal — the secondary's first published
    // issue is not id 1. Look up each journal's first published issue id.
    const collectArticleIds = (contextPath) => {
      return cy.task('dbGetPublishedIssueId', { contextPath }).then((issueId) => {
        expect(issueId, 'published issue exists for ' + contextPath).to.be.a('number');
        cy.visit('/' + contextPath + '/issue/view/' + issueId);
        return cy.get('body').then(($body) => {
          const inputs = $body.find('input.geoMetadata_data.articleId');
          return [...inputs].map((el) => el.value);
        });
      });
    };

    collectArticleIds(primary).then((primaryIds) => {
      collectArticleIds(secondary).then((secondaryIds) => {
        expect(primaryIds.length, 'primary issue has at least one article').to.be.greaterThan(0);
        expect(secondaryIds.length, 'secondary issue has at least one article').to.be.greaterThan(0);
        const overlap = primaryIds.filter((id) => secondaryIds.includes(id));
        expect(overlap, 'no article id appears on both issue maps').to.deep.equal([]);
      });
    });
  });

});
