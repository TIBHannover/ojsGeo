/**
 * @file cypress/e2e/integration/60-timeperiod-formats.cy.js
 *
 * Copyright (c) 2026 KOMET project, OPTIMETA project, Daniel Nüst
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * End-to-end coverage for the full set of time-period formats accepted by
 * js/lib/temporal.js + GeoMetadataPlugin::validateTimePeriodString — bare
 * year, year-month, day, mixed precision in both directions, BCE, single-
 * day, and multi-period. Existing fixture articles all use
 * `{YYYY-MM-DD..YYYY-MM-DD}`, so the rendered pipeline (sidebar,
 * DC.PeriodOfTime, DC.temporal) has only ever been verified against one
 * shape.
 *
 * Strategy: borrow Vancouver (created by spec 21, period
 * `{2021-01-01..2021-12-31}`), SQL-UPDATE its `geoMetadata::timePeriods`
 * setting per format, visit its article page, assert the rendered output,
 * restore the original value at the end. Same pattern as spec 55's
 * multi-period test. No login or submission flow involved — those paths
 * are already covered by the unit-level tests in spec 55 and the UI-typing
 * tests in spec 33.
 */

describe('geoMetadata Time Period Format Diversity', { testIsolation: false }, function () {

  const TARGET_TITLE     = 'Vancouver is cool';
  const ORIGINAL_PERIOD  = '{2021-01-01..2021-12-31}';

  const FORMATS = [
    { stored: '{1990..2010}',             start: '1990',       end: '2010',       dcIso: '1990/2010',             note: 'YYYY..YYYY (bare-year range)' },
    { stored: '{2019-03..2019-09}',       start: '2019-03',    end: '2019-09',    dcIso: '2019-03/2019-09',       note: 'YYYY-MM..YYYY-MM (year-month range)' },
    { stored: '{2020..2020-06-15}',       start: '2020',       end: '2020-06-15', dcIso: '2020/2020-06-15',       note: 'mixed start=YYYY end=YYYY-MM-DD' },
    { stored: '{2021-03-15..2022}',       start: '2021-03-15', end: '2022',       dcIso: '2021-03-15/2022',       note: 'mixed start=YYYY-MM-DD end=YYYY' },
    { stored: '{-500-01-01..-100-12-31}', start: '-500-01-01', end: '-100-12-31', dcIso: '-500-01-01/-100-12-31', note: 'BCE day precision' },
    { stored: '{2015-08-11..2015-08-11}', start: '2015-08-11', end: '2015-08-11', dcIso: '2015-08-11/2015-08-11', note: 'single-day range (start == end)' }
  ];

  const MULTI_VALUE = '{1990..1995}{2010..2015}';

  function mysqlExec(sql) {
    const host = Cypress.env('DBHOST');
    const user = Cypress.env('DBUSERNAME');
    const pw   = Cypress.env('DBPASSWORD');
    const db   = Cypress.env('DBNAME');
    return cy.exec(`docker exec ${host} mysql -u${user} -p${pw} ${db} -e "${sql.replace(/"/g, '\\"')}"`);
  }

  // Resolved at spec start: there can be more than one publication titled
  // "Vancouver is cool" if an earlier spec retried, so locating the right
  // one by title alone is ambiguous. The publication whose period matches
  // ORIGINAL_PERIOD is the one created by spec 21.
  let targetPublicationId = null;
  let targetSubmissionId  = null;

  function setTargetPeriod(value) {
    return mysqlExec(
      `UPDATE publication_settings SET setting_value = '${value}' ` +
      `WHERE setting_name = 'geoMetadata::timePeriods' ` +
      `AND publication_id = ${targetPublicationId}`
    );
  }

  function visitTarget() {
    cy.visit('/' + Cypress.env('contexts').primary.path + '/article/view/' + targetSubmissionId);
  }

  function setDublinCoreEmission(value) {
    return mysqlExec(
      `UPDATE plugin_settings SET setting_value = '${value}' ` +
      `WHERE setting_name = 'geoMetadata_emitMetaDublinCore'`
    ).then(function () {
      // OJS file-caches plugin_settings under cache/_db. SQL UPDATEs alone do
      // not invalidate that cache, so $this->getSetting(...) keeps returning
      // the pre-update value. Wipe the file cache to force a fresh DB read.
      return cy.exec('docker exec ojs sh -c "rm -f /var/www/html/cache/_db/fc-*.php" || true');
    });
  }

  before(function () {
    // Spec 49-meta-tag-toggles turns DC emission off and does not restore it,
    // so DC.PeriodOfTime / DC.temporal would never render here. Re-enable it
    // for the duration of this spec; the after() hook puts it back to 0.
    setDublinCoreEmission(1);

    mysqlExec(
      `SELECT publication_id FROM publication_settings ` +
      `WHERE setting_name = 'geoMetadata::timePeriods' ` +
      `AND setting_value = '${ORIGINAL_PERIOD}' ` +
      `LIMIT 1`
    ).then(function (res) {
      const lines = res.stdout.split('\n').filter(Boolean);
      targetPublicationId = parseInt(lines[lines.length - 1], 10);
      expect(targetPublicationId, 'target publication id').to.be.a('number').and.not.NaN;
      return mysqlExec(
        `SELECT submission_id FROM publications WHERE publication_id = ${targetPublicationId}`
      );
    }).then(function (res) {
      const lines = res.stdout.split('\n').filter(Boolean);
      targetSubmissionId = parseInt(lines[lines.length - 1], 10);
      expect(targetSubmissionId, 'target submission id').to.be.a('number').and.not.NaN;
    });
  });

  FORMATS.forEach(function (f) {

    describe('Stored ' + f.stored + ' (' + f.note + ')', function () {

      before(function () {
        setTargetPeriod(f.stored);
        visitTarget();
      });

      it('hidden #geoMetadata_temporal renders the SQL-seeded value', function () {
        cy.get('#geoMetadata_temporal').should('have.value', f.stored);
      });

      it('sidebar renders start=' + f.start + ' and end=' + f.end, function () {
        cy.get('#geoMetadata_span_start').should('have.text', f.start);
        cy.get('#geoMetadata_span_end').should('have.text', f.end);
      });

      it('DC.PeriodOfTime and DC.temporal emit ' + f.dcIso + ' (ISO8601)', function () {
        cy.get('meta[name="DC.PeriodOfTime"]').should('have.attr', 'scheme', 'ISO8601');
        cy.get('meta[name="DC.PeriodOfTime"]').should('have.attr', 'content', f.dcIso);
        cy.get('meta[name="DC.temporal"]').should('have.attr', 'scheme', 'ISO8601');
        cy.get('meta[name="DC.temporal"]').should('have.attr', 'content', f.dcIso);
      });
    });
  });

  describe('Multi-period ' + MULTI_VALUE + ' (UI cannot enter two blocks; SQL-seeded)', function () {

    before(function () {
      setTargetPeriod(MULTI_VALUE);
      visitTarget();
    });

    it('hidden #geoMetadata_temporal carries the multi-block string verbatim', function () {
      cy.get('#geoMetadata_temporal').should('have.value', MULTI_VALUE);
    });

    it('sidebar renders the first block only (parser behaviour)', function () {
      cy.get('#geoMetadata_span_start').should('have.text', '1990');
      cy.get('#geoMetadata_span_end').should('have.text', '1995');
    });

    it('DC.PeriodOfTime and DC.temporal emit only the first block (plugin behaviour)', function () {
      cy.get('meta[name="DC.PeriodOfTime"]').should('have.attr', 'content', '1990/1995');
      cy.get('meta[name="DC.temporal"]').should('have.attr', 'content', '1990/1995');
    });
  });

  after(function () {
    if (targetPublicationId !== null) {
      setTargetPeriod(ORIGINAL_PERIOD);
    }
    // Restore the DC emission toggle to the off state spec 49 left it in.
    setDublinCoreEmission(0);
  });

});
