/**
 * @file cypress/tests/integration/html_head.cy.js
 *
 * Copyright (c) 2022 OPTIMETA project
 * Copyright (c) 2022 Daniel Nüst
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 */

describe('OPTIMETA Geoplugin map pages', function () {

  it('has a map for the journal showing all articles of the journal', function () {    
		cy.visit('index.php');

    // TODO visit article page
  });

  it('has a map page for the issue showing geometries of the issue', function () {
    // TODO cy.get('h1').should('contain', 'Times & locations')
    // get mapdiv and inspect it
  });

  it('has a map page for the article with the geometry of the article', function () {
    // TODO https://medium.com/geoman-blog/testing-maps-e2e-with-cypress-ba9e5d903b2b
  });

});