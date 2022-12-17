/**
 * @file cypress/tests/integration/html_head.cy.js
 *
 * Copyright (c) 2022 OPTIMETA project
 * Copyright (c) 2022 Daniel Nüst
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 */

describe('OPTIMETA Geo Plugin Licensing Information', function () {

  it('Has licensing information on the journal map page', function () {
    cy.visit('/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Map")').click();
    cy.contains('.page', /license: CC-0/);
  });

  it('Has licensing information on the issue page', function () {
    cy.visit('/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Current")').click();
    cy.contains('.page', /license: CC-0/);
  });

  it('Has licensing information on the article page', function () {
    cy.visit('/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Archive")').click();
    cy.get('a:contains("Vol. 1 No. 2 (2022)")').click();
    cy.get('a:contains("Hanover is nice")').last().click();

    cy.contains('.page', /Geodata license: CC-0/);
    cy.contains('.page', /following license: CC-0/);
  });

  it('Shows license disclaimer during submission', function () {
    cy.logout();
    cy.login('aauthor');

    cy.get('a:contains("aauthor")').click();
    cy.get('a:contains("Dashboard")').click({ force: true });

    // submission page
    cy.get('h1').should('contain', 'Submission');
    cy.get('div#myQueue a:contains("New Submission")').click();
    cy.get('input[id^="checklist-"]').click({ multiple: true });
    cy.get('input[id="privacyConsent"]').click();
    cy.get('button.submitFormButton').click();
    cy.wait(2000);
    cy.get('button.submitFormButton').click();
    cy.wait(2000);
    cy.contains('#submitStep3Form', /temporal and spatial metadata will be published/);
    cy.contains('#submitStep3Form', /license: CC-0/);
  });

  it.only('Has no licensing information on an article without geospatial metadta', function () {
    cy.visit('/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Archive")').click();
    cy.get('a:contains("Vol. 1 No. 2 (2022)")').click();
    cy.get('a:contains("Vancouver has nothing")').last().click();

    cy.get('.optimetageo_license').should('not.be.visible');
    //cy.get('.pkp_structure_content').should('not.contain', 'Geodata license: CC-0');
    //cy.get('.pkp_structure_content').should('not.contain', 'following license: CC-0');
  });

});
