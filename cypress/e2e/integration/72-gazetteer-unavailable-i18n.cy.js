/**
 * @file cypress/tests/integration/72-gazetteer-unavailable-i18n.cy.js
 *
 * Copyright (c) 2026 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * Regression for issue #164: when GeoNames is unavailable, the submission form
 * must show a translated cause-specific reason instead of a generic line, and
 * must never leak the raw English status.message from GeoNames into the UI.
 */

describe('geoMetadata gazetteer-unavailable reasons (issue #164)', { testIsolation: false }, function () {

  const EN_TITLE                  = 'The gazetteer service is unavailable.';
  const EN_FALLBACK_PREFIX        = 'Please enter administrative units manually';
  const EN_REASON_NO_BASEURL      = 'No GeoNames Base URL is configured for the plugin.';
  const EN_REASON_NO_USERNAME     = 'No GeoNames username is configured for the plugin.';
  const EN_REASON_INVALID         = 'The configured GeoNames Base URL or username is not valid.';
  const EN_REASON_QUOTA           = 'The configured GeoNames account has exceeded its daily request quota.';
  const EN_REASON_EXTERNAL        = 'GeoNames responded with an error.';

  const DE_TITLE                  = 'Der Gazetteer-Dienst ist nicht verfügbar.';
  const DE_REASON_QUOTA           = 'Das konfigurierte GeoNames-Konto hat sein tägliches Anfragelimit überschritten.';

  const openFreshSubmission = () => {
    cy.openSubmissionsAs('aauthor');
    cy.get('div#myQueue a:contains("New Submission"), div#myQueue a:contains("Neue Einreichung")').click();
    cy.get('input[id^="checklist-"]').click({ multiple: true });
    cy.get('input[id="privacyConsent"]').click();
    cy.get('button.submitFormButton').click();
    cy.wait(1000);
    cy.get('button.submitFormButton').click();
    cy.wait(2000);
  };

  it('exposes the gazetteer-unavailable globals to JS', function () {
    cy.setLocale('en_US');
    openFreshSubmission();
    cy.window().then((win) => {
      const g = win.eval('geoMetadata_gazetteerUnavailable');
      expect(g).to.have.property('title', EN_TITLE);
      expect(g.fallback).to.contain(EN_FALLBACK_PREFIX);
      expect(g.reasons).to.have.all.keys(
        'noBaseUrl', 'noUsername', 'invalidCredentials', 'quotaExceeded', 'externalError'
      );
      expect(g.reasons.noBaseUrl).to.equal(EN_REASON_NO_BASEURL);
      expect(g.reasons.noUsername).to.equal(EN_REASON_NO_USERNAME);
      expect(g.reasons.invalidCredentials).to.equal(EN_REASON_INVALID);
      expect(g.reasons.quotaExceeded).to.equal(EN_REASON_QUOTA);
      expect(g.reasons.externalError).to.equal(EN_REASON_EXTERNAL);
    });
  });

  it('maps GeoNames status envelopes to reason keys (value 19 = quota; else externalError)', function () {
    cy.window().then((win) => {
      const map = win.eval('mapGeonamesStatusToReason');
      expect(map({ value: 19, message: 'limit reached' })).to.equal('quotaExceeded');
      expect(map({ value: 10, message: 'auth' })).to.equal('externalError');
      expect(map(null)).to.equal('externalError');
    });
  });

  it('disableGazetteer renders each reason into the warning element', function () {
    const reasons = [
      { key: 'noBaseUrl',          text: EN_REASON_NO_BASEURL },
      { key: 'noUsername',         text: EN_REASON_NO_USERNAME },
      { key: 'invalidCredentials', text: EN_REASON_INVALID },
      { key: 'quotaExceeded',      text: EN_REASON_QUOTA },
      { key: 'externalError',      text: EN_REASON_EXTERNAL }
    ];
    reasons.forEach((r) => {
      cy.window().then((win) => {
        const $warn = win.jQuery('#geoMetadata_gazetteer_unavailable');
        $warn.hide();
        $warn.find('.geoMetadata_gazetteer_unavailable_reason').text('');
        win.eval('disableGazetteer')(r.key);
        expect($warn.is(':visible')).to.be.true;
        expect($warn.find('.geoMetadata_gazetteer_unavailable_reason').text()).to.contain(r.text);
        expect($warn.text()).to.contain(EN_TITLE);
        expect($warn.text()).to.contain(EN_FALLBACK_PREFIX);
      });
    });
  });

  it('runtime guard: GeoNames quota envelope mid-session swaps the warning to the quota reason', function () {
    cy.window().then((win) => {
      const $warn = win.jQuery('#geoMetadata_gazetteer_unavailable');
      $warn.hide();
      $warn.find('.geoMetadata_gazetteer_unavailable_reason').text('');
      // Reset both flags — the previous test's disableGazetteer calls null out
      // baseurlGeonames; without it the ajax block wouldn't fire at all.
      win.eval('baseurlGeonames = "http://api.geonames.org"');
      win.eval('gazetterDisabled = false');
      // Stub jQuery.ajax to immediately invoke success with a GeoNames error envelope.
      // ajaxRequestGeonamesPlaceName uses async:false, so the success handler runs
      // synchronously inside this call — exactly what we want to assert against.
      const originalAjax = win.jQuery.ajax;
      const RAW_GEONAMES_MESSAGE = 'the daily limit of 20000 credits for testuser has been exceeded.';
      win.jQuery.ajax = (opts) => {
        if (opts && typeof opts.success === 'function') {
          opts.success({ status: { value: 19, message: RAW_GEONAMES_MESSAGE } });
        }
      };
      try {
        win.eval('ajaxRequestGeonamesPlaceName')('Münster');
      } finally {
        win.jQuery.ajax = originalAjax;
      }
      expect($warn.is(':visible'), 'warning shown after error envelope').to.be.true;
      const reasonText = $warn.find('.geoMetadata_gazetteer_unavailable_reason').text();
      expect(reasonText).to.contain(EN_REASON_QUOTA);
      // Ensure the third-party English status.message is never relayed into the UI.
      expect($warn.text()).to.not.contain(RAW_GEONAMES_MESSAGE);
    });
  });

  it('end-to-end: a stubbed quota envelope on a real submission marker draw fires the warning', function () {
    openFreshSubmission();
    // Re-stub on the loaded window so the override is in place before the
    // marker draw triggers a hierarchyJSON call. Reset the warning visibility
    // and the gazetterDisabled flag a previous test may have left.
    cy.stubGeoNames({ mode: 'quota' });
    cy.window().then((win) => {
      const $warn = win.jQuery('#geoMetadata_gazetteer_unavailable');
      $warn.hide();
      $warn.find('.geoMetadata_gazetteer_unavailable_reason').text('');
      win.eval('gazetterDisabled = false');
      win.eval('baseurlGeonames = "http://api.geonames.org"');
    });
    cy.toolbarButton('marker').click();
    cy.get('#mapdiv').click(260, 110);
    cy.wait(2000);
    cy.window().then((win) => {
      const $warn = win.jQuery('#geoMetadata_gazetteer_unavailable');
      expect($warn.is(':visible'), 'warning visible after stubbed quota envelope').to.be.true;
      expect($warn.find('.geoMetadata_gazetteer_unavailable_reason').text())
        .to.contain(EN_REASON_QUOTA);
    });
    cy.clearGeoNamesStub();
  });

  it('end-to-end: a stubbed network failure on a real submission marker draw fires the warning', function () {
    openFreshSubmission();
    cy.stubGeoNames({ mode: 'network' });
    cy.window().then((win) => {
      const $warn = win.jQuery('#geoMetadata_gazetteer_unavailable');
      $warn.hide();
      $warn.find('.geoMetadata_gazetteer_unavailable_reason').text('');
      win.eval('gazetterDisabled = false');
      win.eval('baseurlGeonames = "http://api.geonames.org"');
    });
    cy.toolbarButton('marker').click();
    cy.get('#mapdiv').click(260, 110);
    cy.wait(2000);
    cy.window().then((win) => {
      const $warn = win.jQuery('#geoMetadata_gazetteer_unavailable');
      expect($warn.is(':visible'), 'warning visible after network failure').to.be.true;
      expect($warn.find('.geoMetadata_gazetteer_unavailable_reason').text())
        .to.contain(EN_REASON_EXTERNAL);
    });
    cy.clearGeoNamesStub();
  });

  it('locale switch: German submission form shows the German title and quota reason', function () {
    cy.setLocale('de_DE');
    openFreshSubmission();

    cy.window().then((win) => {
      const g = win.eval('geoMetadata_gazetteerUnavailable');
      expect(g.title).to.equal(DE_TITLE);
      expect(g.reasons.quotaExceeded).to.equal(DE_REASON_QUOTA);

      const $warn = win.jQuery('#geoMetadata_gazetteer_unavailable');
      $warn.hide();
      $warn.find('.geoMetadata_gazetteer_unavailable_reason').text('');
      win.eval('disableGazetteer')('quotaExceeded');
      expect($warn.is(':visible')).to.be.true;
      expect($warn.find('.geoMetadata_gazetteer_unavailable_reason').text()).to.contain(DE_REASON_QUOTA);
      expect($warn.text()).to.contain(DE_TITLE);
    });

    cy.setLocale('en_US');
  });
});
