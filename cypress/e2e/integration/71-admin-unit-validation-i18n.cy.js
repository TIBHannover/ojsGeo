/**
 * @file cypress/tests/integration/71-admin-unit-validation-i18n.cy.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * Regression for issue #110: the admin-unit input-validation alerts
 * (preprocessTag in submission.js) must render in the active UI locale,
 * not always in English. Reporter's screenshot showed an English alert on
 * a German OJS instance for the hierarchy-and-geometry mismatch case.
 */

describe('geoMetadata admin-unit validation alerts (issue #110)', { testIsolation: false }, function () {

  const TYPED = 'Republic of Albania';
  const SUBORDER = JSON.stringify(['Earth', 'Europe', 'Republic of Albania']);

  const EN_HIERARCHY_AND_GEOMETRY =
    'Your input "' + TYPED + '" with the superior administrative units ' + SUBORDER +
    ' is not valid: it does not match the existing hierarchy of administrative units nor the geometries on the map.' +
    ' Change the tag, the existing administrative units, or the geometries on the map.';

  const DE_HIERARCHY_AND_GEOMETRY =
    'Ihre Eingabe "' + TYPED + '" mit den übergeordneten Verwaltungseinheiten ' + SUBORDER +
    ' ist ungültig: Sie passt weder zur bestehenden Hierarchie der Verwaltungseinheiten noch zu den Geometrien auf der Karte.' +
    ' Ändern Sie das Schlagwort, die bestehenden Verwaltungseinheiten oder die Geometrien auf der Karte.';

  let capturedAlert = null;

  const captureNextAlert = () => {
    capturedAlert = null;
    cy.on('window:alert', (msg) => { capturedAlert = msg; });
  };

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

  const dropPointInGermany = () => {
    cy.toolbarButton('marker').click();
    cy.get('#mapdiv').click(260, 110);
    cy.wait(3000);
    cy.get('#administrativeUnitInput li.tagit-choice').its('length').should('be.gt', 0);
  };

  it('exposes the translated validation templates as a JS const (en_US)', function () {
    cy.setLocale('en_US');
    openFreshSubmission();
    cy.window().then((win) => {
      // Globals from _map_js_globals.tpl: const declarations live in script
      // scope so they're not on window directly. Read them via eval so we
      // exercise the actual emitted bindings rather than stubbing them.
      const t = win.eval('geoMetadata_adminUnitValidation');
      expect(t).to.have.property('hierarchyAndGeometry');
      expect(t).to.have.property('hierarchyOnly');
      expect(t).to.have.property('geometryOnly');
      expect(t.hierarchyAndGeometry).to.include('{$input}');
      expect(t.hierarchyAndGeometry).to.include('{$units}');
      expect(t.hierarchyOnly).to.include('{$input}');
      expect(t.geometryOnly).to.include('{$input}');
    });
  });

  it('substitutes {$input} and {$units} via geoMetadataFormat', function () {
    cy.window().then((win) => {
      const fmt = win.eval('geoMetadataFormat');
      const out = fmt('A {$input} B {$units} C', { input: 'x', units: 'y' });
      expect(out).to.equal('A x B y C');
      const partial = fmt('only {$input} known', { input: 'x' });
      expect(partial).to.equal('only x known');
      const unknown = fmt('keep {$missing} as-is', { input: 'x' });
      expect(unknown).to.equal('keep {$missing} as-is');
    });
  });

  it('fires the English hierarchy-and-geometry alert when typing a mismatched tag', function () {
    dropPointInGermany();
    captureNextAlert();
    cy.get('#administrativeUnitInput > .tagit-new > .ui-widget-content').type(TYPED + '{enter}');
    cy.wait(2500);
    cy.then(() => {
      expect(capturedAlert, 'window.alert was fired').to.be.a('string');
      expect(capturedAlert).to.equal(EN_HIERARCHY_AND_GEOMETRY);
    });
  });

  it('fires the German hierarchy-and-geometry alert after switching locale', function () {
    cy.setLocale('de_DE');
    openFreshSubmission();
    dropPointInGermany();
    captureNextAlert();
    cy.get('#administrativeUnitInput > .tagit-new > .ui-widget-content').type(TYPED + '{enter}');
    cy.wait(2500);
    cy.then(() => {
      expect(capturedAlert, 'window.alert was fired').to.be.a('string');
      expect(capturedAlert).to.equal(DE_HIERARCHY_AND_GEOMETRY);
    });
    cy.setLocale('en_US');
  });

});
