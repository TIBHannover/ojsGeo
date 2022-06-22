/**
 * @file cypress/tests/integration/configuration.cy.js
 *
 * Copyright (c) 2022 OPTIMETA project
 * Copyright (c) 2022 Daniel Nüst
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 */

describe('OPTIMETA Geoplugin Theme tests', function () {

  it('Enable theme', function () {
    cy.login('admin', 'admin', 'publicknowledge');
    cy.get('nav[class="app__nav"] a:contains("Website")').click();
    cy.get('button[id="plugins-button"]').click();
    // disable plugin if enabled
    
    cy.get('input[id^="select-cell-optimetageoplugin-enabled"]')
      .then($btn => {
        if ($btn.attr('checked') === 'checked') {
          cy.get('input[id^="select-cell-optimetageoplugin-enabled"]').click();
          cy.get('div[class*="pkp_modal_panel"] button[class*="pkpModalConfirmButton"]').click();
          cy.get('div:contains(\'The plugin "OPTIMETA Geo Plugin" has been disabled.\')');
        }
      });
  });

  it('Configure theme', function () {
    cy.login('admin', 'admin', 'publicknowledge');
    
    // TODO set parent theme
  });

});