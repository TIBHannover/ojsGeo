/**
 * @file cypress/tests/integration/html_head.cy.js
 *
 * Copyright (c) 2022 OPTIMETA project
 * Copyright (c) 2022 Daniel Nüst
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 */

describe('OPTIMETA Geoplugin Maps', function () {

  const checkFeatures = (features => {
    expect(features[0].geometry.type).to.equal('LineString');
    expect(features[0].geometry.coordinates.length).to.equal(2);
    expect(features[0].geometry.coordinates[0][0] - 8.43).to.be.lessThan(0.01);
    expect(features[0].geometry.coordinates[0][1] - 53.33).to.be.lessThan(0.01);
  });

  const geometriesCount = 4;

  it('The map on the current issue page has the papers\' geometries', function () {
    cy.visit('/');
    // 1 from "Hanover is nice", 3 from "Editors save the day"
    cy.mapHasFeatures(geometriesCount);
    cy.window().wait(200).then(({ map }) => {
      var features = [];
      map.eachLayer(function (layer) {
        if (layer.hasOwnProperty('feature')) {
          features.push(layer.feature);
        }
      });
      checkFeatures(features);
    });
  });

  it('The map on the issue page in the archive has the papers\' geometries', function () {
    cy.visit('/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Archive")').click();
    cy.get('a:contains("Vol. 1 No. 2 (2022)")').click();

    cy.get('.pkp_structure_main').should('contain', 'Times & locations');
    cy.get('#mapdiv').should('exist');

    cy.mapHasFeatures(geometriesCount);
    cy.window().wait(200).then(({ map }) => {
      var features = [];
      map.eachLayer(function (layer) {
        if (layer.hasOwnProperty('feature')) {
          features.push(layer.feature);
        }
      });
      checkFeatures(features);
    });
  });

  it('The article page has the paper\'s geometry and the administrative units', function () {
    cy.visit('/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Archive")').click();
    cy.get('a:contains("Vol. 1 No. 2 (2022)")').click();
    cy.get('a:contains("Hanover is nice")').click();

    cy.get('.pkp_structure_main').should('contain', 'Time and location');
    cy.get('#mapdiv').should('exist');

    cy.mapHasFeatures(1);
    cy.window().wait(200).then(({ map }) => {
      var features = [];
      map.eachLayer(function (layer) {
        if (layer.hasOwnProperty('feature')) {
          features.push(layer.feature);
        }
      });
      checkFeatures(features);
    });

    cy.window().wait(200).then(({ map }) => {
      var foundAdminLayerBasedOnColor = false;
      map.eachLayer(function (layer) {
        if (layer.options.hasOwnProperty('color') && layer.options.color === 'black') {
          foundAdminLayerBasedOnColor = true;
          expect(layer.options.fillOpacity).to.equal(0.15);
          expect(layer._latlngs[0]).to.have.lengthOf(4);
        }
      });
      expect(foundAdminLayerBasedOnColor).to.be.true;
    });
  });

  it('The article page has the administrative units in a text', function () {
    cy.visit('/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Archive")').click();
    cy.get('a:contains("Vol. 1 No. 2 (2022)")').click();
    cy.get('a:contains("Hanover is nice")').click();

    cy.get('#administrativeUnit').should('contain', 'Earth, Europe, Federal Republic of Germany');
  });

  it('Shows the published paper on the journal map', function () {
    this.skip(); // TODO fix journal map in tests

    cy.visit('/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Map")').click();
    cy.get('.pkp_structure_main').should('contain', 'Times & locations');
    cy.get('#mapdiv').should('exist');
  });

  it('Does not show an article from an unpublished issue on the journal map', function () {
    this.skip(); // TODO fix journal map in tests

    cy.login('aauthor');
    cy.get('a:contains("aauthor")').click();
    cy.get('a:contains("Dashboard")').click({ force: true });

    cy.createSubmissionAndPublish(submission2);

    // TODO
  });
});