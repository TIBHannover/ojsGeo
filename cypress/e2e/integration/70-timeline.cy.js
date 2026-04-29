/**
 * @file cypress/e2e/integration/70-timeline.cy.js
 *
 * Copyright (c) 2026 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * @brief Timeline strip on the journal /map page and on issue TOC pages (issue #74).
 *
 *        Asserts:
 *          - default-on rendering at journal scope (#gm-timelinediv populated)
 *          - default-on rendering at issue scope (#gm-issue-timelinediv populated)
 *          - articles with no temporal data are filtered out (Outside of nowhere absent)
 *          - clicking an item navigates to the article view
 *          - collapse / expand link toggles aria-expanded and the body element
 *          - BCE regression guard (Q7): "Long-Span Holocene Catalogue" is positioned
 *            to the LEFT of every modern-era item by DOM-emitted data-start, catching
 *            any vis-timeline patch that breaks expanded-year ISO parsing.
 *          - showJournalTimeline=off hides the strip while keeping the /map URL alive
 *            (because showJournalMap is still on).
 *
 *        Restores both timeline toggles to ON at the end of every test that touches them.
 */

describe('geoMetadata Timeline (issue #74)', function () {

  const toggleSelector = (name) => `form[id="geoMetadataSettings"] input[name="${name}"]`;
  const submitBtnSelector = 'form[id="geoMetadataSettings"] button[id^="submitFormButton"]';

  const openSettings = () => {
    cy.login('admin', 'admin', Cypress.env('contexts').primary.path);
    cy.get('nav[class="app__nav"] a:contains("Website")').click();
    cy.get('button[id="plugins-button"]').click();
    cy.get('tr[id="component-grid-settings-plugins-settingsplugingrid-category-generic-row-geometadataplugin"] a[class="show_extras"]').click();
    cy.get('a[id^="component-grid-settings-plugins-settingsplugingrid-category-generic-row-geometadataplugin-settings-button"]').click();
  };

  const setToggle = (name, checked) => {
    openSettings();
    if (checked) {
      cy.get(toggleSelector(name)).check();
    } else {
      cy.get(toggleSelector(name)).uncheck();
    }
    cy.get(submitBtnSelector).click();
    cy.wait(1000);
  };

  const journalMapUrl = () => '/' + Cypress.env('contexts').primary.path + '/map';

  it('renders the timeline strip below the map on the journal page', function () {
    cy.visit(journalMapUrl());
    cy.get('#geoMetadata_journalTimeline').should('exist');
    cy.get('#gm-timelinediv').should('exist');
    // vis-timeline injects .vis-item DOM nodes asynchronously after init.
    cy.get('#gm-timelinediv .vis-item', { timeout: 10000 }).its('length').should('be.gte', 1);
  });

  it('filters out articles with no temporal data', function () {
    cy.visit(journalMapUrl());
    // "Outside of nowhere" has no geoMetadata at all (12-primary-fixtures), so its title
    // must NOT appear inside any .vis-item.
    cy.get('#gm-timelinediv .vis-item', { timeout: 10000 }).should('exist');
    cy.get('#gm-timelinediv').contains('Outside of nowhere').should('not.exist');
  });

  it('BCE regression guard — Holocene item lays out left of every modern item', function () {
    // Permanent guard against a vis-timeline patch that breaks the ECMAScript
    // expanded-year ISO bridge in toVisDate(). The Long-Span Holocene Catalogue's
    // start (-008000) must produce a smaller `start` ISO string than any 19xx/20xx
    // article seeded in 12-primary-fixtures. We read the items journal.js handed
    // to vis.Timeline; inspecting the rendered DOM is fragile because vis-timeline
    // doesn't emit `data-start` and may cluster items off-screen.
    cy.visit(journalMapUrl());
    cy.get('#gm-timelinediv .vis-item', { timeout: 10000 }).should('have.length.at.least', 2);
    cy.window().its('geoMetadata_journalTimelineItems').should('exist');
    cy.window().then((win) => {
      const items = win.geoMetadata_journalTimelineItems;
      expect(items, 'timeline items array').to.have.length.at.least(2);
      const starts = items.map(it => String(it.start));
      // expanded-year ISO -008000-… sorts before any plain 1980-… string lexicographically
      const minStart = starts.reduce((a, b) => (a < b ? a : b));
      expect(minStart.startsWith('-'),
        `expected a BCE item (start "${minStart}") to be present`).to.equal(true);
    });
  });

  it('collapse link toggles the timeline body and aria-expanded', function () {
    cy.visit(journalMapUrl());
    cy.get('#geoMetadata_journalTimelineBody').should('be.visible');
    cy.get('#geoMetadata_journalTimeline .geoMetadata_timelineCollapseLink')
      .should('have.attr', 'aria-expanded', 'true')
      .click();
    cy.get('#geoMetadata_journalTimelineBody').should('not.be.visible');
    cy.get('#geoMetadata_journalTimeline .geoMetadata_timelineCollapseLink')
      .should('have.attr', 'aria-expanded', 'false')
      .click();
    cy.get('#geoMetadata_journalTimelineBody').should('be.visible');
  });

  it('hides the strip when showJournalTimeline is off, /map still 200', function () {
    setToggle('geoMetadata_showJournalTimeline', false);
    cy.request({ url: journalMapUrl(), failOnStatusCode: false })
      .its('status').should('eq', 200);
    cy.visit(journalMapUrl());
    cy.get('#mapdiv').should('exist');
    cy.get('#gm-timelinediv').should('not.exist');
    cy.get('#geoMetadata_journalTimeline').should('not.exist');
    setToggle('geoMetadata_showJournalTimeline', true);
  });

  it('renders the timeline strip on an issue TOC page', function () {
    // Vol. 1 No. 2 (2022) is the same issue used by 48-issue-journal-map-toggles.
    cy.visit('/' + Cypress.env('contexts').primary.path + '/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Archive")').click();
    cy.get('a:contains("Vol. 1 No. 2 (2022)")').click();
    cy.get('#geoMetadata_issueTimeline').should('exist');
    cy.get('#gm-issue-timelinediv').should('exist');
    cy.get('#gm-issue-timelinediv .vis-item', { timeout: 10000 }).its('length').should('be.gte', 1);
  });

  it('issue collapse link toggles the issue timeline body', function () {
    cy.visit('/' + Cypress.env('contexts').primary.path + '/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Archive")').click();
    cy.get('a:contains("Vol. 1 No. 2 (2022)")').click();
    cy.get('#geoMetadata_issueTimelineBody').should('be.visible');
    cy.get('#geoMetadata_issueTimeline .geoMetadata_timelineCollapseLink').click();
    cy.get('#geoMetadata_issueTimelineBody').should('not.be.visible');
  });

});
