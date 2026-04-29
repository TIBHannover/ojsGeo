/**
 * @file cypress/tests/integration/html_head.cy.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 */

describe('geoMetadata Maps', function () {

  // Find Hanover's (or "Editors saves the day"'s) LineString from directInject
  // at (8.43, 52.37) to prove the issue map actually rendered article geometry.
  // Layer ordering isn't stable; number of features varies with how many of
  // the upstream submissions drew geometry.
  const checkHanoverLineStringPresent = (features) => {
    const lineString = features.find(f =>
      f.geometry.type === 'LineString' &&
      Math.abs(f.geometry.coordinates[0][0] - 8.43) < 0.01 &&
      Math.abs(f.geometry.coordinates[0][1] - 52.37) < 0.01
    );
    expect(lineString, 'Hanover LineString (starts near 8.43, 52.37)').to.exist;
    expect(lineString.geometry.coordinates.length).to.equal(2);
  };

  // At least 3 geometries expected: Vancouver is cool (Point), Hanover is nice
  // (LineString), Editors saves the day (LineString). Other specs add more.
  const minGeometries = 3;

  const collectFeatures = (win) => {
    const features = [];
    win.map.eachLayer((layer) => { if (layer.feature) features.push(layer.feature); });
    return features;
  };

  it('The map on the current issue page has the papers\' geometries', function () {
    cy.visit('/' + Cypress.env('contexts').primary.path + '/');
    cy.window().wait(200).then((win) => {
      const features = collectFeatures(win);
      expect(features.length).to.be.at.least(minGeometries);
      checkHanoverLineStringPresent(features);
    });
  });

  it('The map on the issue page in the archive has the papers\' geometries', function () {
    cy.visit('/' + Cypress.env('contexts').primary.path + '/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Archive")').click();
    cy.get('a:contains("Vol. 1 No. 2 (2022)")').click();

    cy.get('.pkp_structure_main').should('contain', 'Times & Locations');
    cy.get('#mapdiv').should('exist');

    cy.window().wait(200).then((win) => {
      const features = collectFeatures(win);
      expect(features.length).to.be.at.least(minGeometries);
      checkHanoverLineStringPresent(features);
    });
  });

  it('The article page has the paper\'s geometry and the administrative units', function () {
    cy.visit('/' + Cypress.env('contexts').primary.path + '/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Archive")').click();
    cy.get('a:contains("Vol. 1 No. 2 (2022)")').click();
    cy.openArticleByTitle('Hanover is nice');

    cy.get('.pkp_structure_main').should('contain', 'Time and Location');
    cy.get('#mapdiv').should('exist');

    cy.mapHasFeatures(1);
    cy.window().wait(200).then((win) => {
      checkHanoverLineStringPresent(collectFeatures(win));
    });

    cy.window().wait(200).then(({ map }) => {
      // The admin-unit overlay colour is the configurable
      // geoMetadata_adminUnitOverlayColor (default #000000); match either the
      // hex or the legacy CSS name so the test survives future default changes.
      var foundAdminLayerBasedOnColor = false;
      map.eachLayer(function (layer) {
        if (layer.options.hasOwnProperty('color') &&
            (layer.options.color === 'black' || layer.options.color === '#000000')) {
          foundAdminLayerBasedOnColor = true;
          expect(layer.options.fillOpacity).to.equal(0.15);
          expect(layer._latlngs[0]).to.have.lengthOf(4);
        }
      });
      expect(foundAdminLayerBasedOnColor).to.be.true;
    });
  });

  it('The article page has the administrative units in a text', function () {
    cy.visit('/' + Cypress.env('contexts').primary.path + '/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Archive")').click();
    cy.get('a:contains("Vol. 1 No. 2 (2022)")').click();
    cy.openArticleByTitle('Hanover is nice');

    cy.get('#geoMetadata_article_administrativeUnit').should('contain', 'Earth, Europe, Federal Republic of Germany');
  });

  it('Shows the published paper on the journal map', function () {
    cy.visit('/' + Cypress.env('contexts').primary.path + '/map');
    cy.get('.pkp_structure_main').should('contain', 'Times & Locations');
    cy.get('#mapdiv').should('exist');
  });

  it('Does not show an article from an unpublished issue on the journal map', function () {
    this.skip(); // TODO fix journal map in tests

    cy.openSubmissionsAs('aauthor');

    cy.createSubmissionAndPublish(submission2);

    // TODO
  });
});