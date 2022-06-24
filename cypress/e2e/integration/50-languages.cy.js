/**
 * @file cypress/tests/integration/html_head.cy.js
 *
 * Copyright (c) 2022 OPTIMETA project
 * Copyright (c) 2022 Daniel Nüst
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 */

describe('OPTIMETA Geoplugin languages', function () {

  it('has the German map headline in the frontend if language is enabled', function () {    
		// TODO login

    // TODO configure frontend language
    
    cy.visit('/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Current")').click();
    cy.get('.pkp_structure_main').should('contain', 'Zeiten & Orte');
  });

  it('has the Spanish map headline if language is enabled', function () {    
		// TODO login

    // TODO configure frontend language
    
    cy.visit('/');

    // TODO check map heading
  });

  it('has the French map headline if language is enabled', function () {    
		// TODO login

    // TODO configure frontend language
    
    cy.visit('/');

    // TODO check map heading
  });

});