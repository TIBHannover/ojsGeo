/**
 * @file cypress/tests/integration/html_head.cy.js
 *
 * Copyright (c) 2022 OPTIMETA project
 * Copyright (c) 2022 Daniel Nüst
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 */

describe('OPTIMETA Geoplugin locales', function () {

  it('Has the German map headline in submission and the frontend if language is enabled for the UI', function () {
    cy.login('admin', 'admin', Cypress.env('contextPath'));

    cy.get('nav[class="app__nav"] a:contains("Website")').click();
    cy.get('#setup-button').click();
    cy.get('#languages-button').click();

    cy.get('h4').should('contain', 'Languages');
    cy.get('input[id^=select-cell-de_DE-uiLocale').check();
    cy.reload();

    cy.get('.pkpDropdown > .pkpButton').click();
    cy.get('a:contains("Deutsch")').click();

    // submission page
    cy.get('a:contains("Einreichungen")').click();
    cy.get('div#myQueue a:contains("Neue Einreichung")').click();
    cy.get('input[id^="checklist-"]').click({ multiple: true });
    cy.get('input[id="privacyConsent"]').click();
    cy.get('button.submitFormButton').click();
    cy.wait(2000);
    cy.get('button.submitFormButton').click();
    cy.wait(2000);
    cy.contains('#submitStep3Form', /Zeit und Ort/);

    // home page
    cy.visit('/');
    cy.get('#navigationPrimary > :nth-child(1) > a').click();
    cy.contains('.pkp_structure_main', /Zeiten \& Orte/);
  });

  it('Has the Spanish map headline in submission and the frontend if language is enabled for the UI', function () {
    cy.login('admin', 'admin', Cypress.env('contextPath'));

    cy.get('nav[class="app__nav"] a:contains("Website")').click();
    cy.get('#setup-button').click();
    cy.get('#languages-button').click();

    cy.get('h4').should('contain', 'Languages');
    cy.get('input[id^=select-cell-es_ES-uiLocale').check();
    cy.reload();

    cy.get('.pkpDropdown > .pkpButton').click();
    cy.get('a:contains("Español")').click();

    // submission page
    cy.get('a:contains("Envíos")').click();
    cy.get('div#myQueue a:contains("Nuevo")').click();
    cy.get('input[id^="checklist-"]').click({ multiple: true });
    cy.get('input[id="privacyConsent"]').click();
    cy.get('button.submitFormButton').click();
    cy.wait(2000);
    cy.get('button.submitFormButton').click();
    cy.wait(2000);
    cy.contains('#submitStep3Form', /Hora y ubicación/);

    // home page
    cy.visit('/');
    cy.get('#navigationPrimary > :nth-child(1) > a').click();
    cy.contains('.pkp_structure_main', /Tiempos y ubicaciones/);
  });
  
  it('Has the French map headline in submission and the frontend if language is enabled for the UI', function () {
    cy.login('admin', 'admin', Cypress.env('contextPath'));

    cy.get('nav[class="app__nav"] a:contains("Website")').click();
    cy.get('#setup-button').click();
    cy.get('#languages-button').click();

    cy.get('h4').should('contain', 'Languages');
    cy.get('input[id^=select-cell-fr_FR-uiLocale').check();
    cy.reload();

    cy.get('.pkpDropdown > .pkpButton').click();
    cy.get('a:contains("Français")').click();

    // submission page
    cy.get('a:contains("Soumissions")').click();
    cy.get('div#myQueue a:contains("Nouvelle")').click();
    cy.get('input[id^="checklist-"]').click({ multiple: true });
    cy.get('input[id="privacyConsent"]').click();
    cy.get('button.submitFormButton').click();
    cy.wait(2000);
    cy.get('button.submitFormButton').click();
    cy.wait(2000);
    cy.contains('#submitStep3Form', /Heure et localisation/);

    // home page
    cy.visit('/');
    cy.get('#navigationPrimary > :nth-child(1) > a').click();
    cy.contains('.pkp_structure_main', /Heures et lieux de publication/);
  });

});