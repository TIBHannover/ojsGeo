/**
 * @file cypress/tests/integration/10-installation.cy.js
 *
 * Copyright (c) 2022 OPTIMETA project
 * Copyright (c) 2022 Daniel Nüst
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 * Based on file cypress/tests/data/10-Installation.spec.js
 *
 */

describe('OPTIMETA Geoplugin Tests', function () {

  it('Installs the software', function () {
    cy.install();
  });

  it('Adds a journal', function () {
    cy.createContext();
  });
});
