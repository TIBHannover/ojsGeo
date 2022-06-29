/**
 * @file cypress/tests/integration/html_head.cy.js
 *
 * Copyright (c) 2022 OPTIMETA project
 * Copyright (c) 2022 Daniel Nüst
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 */

var metaContains = (name, content, scheme) => {
  if (Array.isArray(content)) {
    content.forEach(c => {
      cy.get('meta[name="' + name + '"]').should('have.attr', 'content').and('match', c);
    });
  } else {
    cy.get('meta[name="' + name + '"]').should('have.attr', 'content').and('match', content);
  }
  if (scheme) {
    cy.get('meta[name="' + name + '"]').should('have.attr', 'scheme', scheme);
  }
};

describe('OPTIMETA Geoplugin Geospatial Metadata in HTML Head', function () {

  beforeEach(() => {
    cy.visit('/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Archive")').click();
    cy.get('a:contains("Vol. 1 No. 2 (2022)")').click();
    cy.get('a:contains("Hanover is nice")').click();
  });

  it('has DC.Coverage with correct text string', function () {
    metaContains('DC.Coverage', /Earth, Europe, Federal Republic of Germany/);
  });

  it('has DC.SpatialCoverage with the correct scheme and content', function () {
    metaContains('DC.SpatialCoverage', [
      /{"type":"FeatureCollection"/,
      /{"type":"LineString","coordinates":\[\[8.43/,
      /"administrativeUnitSuborder":\["Earth","Europe","Federal Republic of Germany"\]/,
      /temporal properties created by user/
    ], 'GeoJSON');
  });

  it('has geo.placename with the correct place name', function () {
    metaContains('geo.placename', /^Federal Republic of Germany$/);
  });

  it('has DC.box with the correct bounding box, project, and name in the content', function () {
    metaContains('DC.box', /name=Federal Republic of Germany; northlimit=55.058383600807; southlimit=47.2701236047; westlimit=5.8663152683722; eastlimit=15.041815651616; projection=EPSG3857/);
  });

  it('has ISO 19139 with the correct XML content', function () {
    // TODO <meta name="" content="<gmd:EX_GeographicBoundingBox><gmd:westBoundLongitude><gco:Decimal>-73.985535</gco:Decimal></gmd:westBoundLongitude><gmd:eastBoundLongitude><gco:Decimal>-28.839052</gco:Decimal></gmd:eastBoundLongitude><gmd:southBoundLatitude><gco:Decimal>-33.750706</gco:Decimal></gmd:southBoundLatitude><gmd:northBoundLatitude><gco:Decimal>5.264877</gco:Decimal></gmd:northBoundLatitude></gmd:EX_GeographicBoundingBox>" />
    metaContains('ISO 19139', [
      /<gmd:EX_GeographicBoundingBox><gmd:westBoundLongitude><gco:Decimal>5.8663152683722/,
      /<gmd:eastBoundLongitude><gco:Decimal>15.041815651616/,
      /<gmd:southBoundLatitude><gco:Decimal>47.2701236047/,
      /<gmd:northBoundLatitude><gco:Decimal>55.058383600807/
    ]);
  });
});

describe('OPTIMETA Geoplugin Temporal Metadata in HTML Head', function () {

  it('has DC.temporal with correct scheme and content', function () {
    metaContains('DC.temporal', /2022-01-01\/2022-12-31/, 'ISO8601');
  });

  it('has DC.PeriodOfTime with the correct scheme and content', function () {
    metaContains('DC.PeriodOfTime', /2022-01-01\/2022-12-31/, 'ISO8601');
  });

});
