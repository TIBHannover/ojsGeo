/**
 * @file cypress/tests/integration/html_head.cy.js
 *
 * Copyright (c) 2022 OPTIMETA project
 * Copyright (c) 2022 Daniel Nüst
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 */

describe('OPTIMETA Geoplugin HTML Metadata', function () {
  
  it('has DC.Coverage with correct text string', function () {
    cy.visit('/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Archive")').click();
    cy.get('a:contains("Vol. 1 No. 2 (2022)")').click();
    cy.get('a:contains("Hanover is nice")').click();
    
    cy.get('meta[name="DC.Coverage"]').should('have.attr', 'content', 'Earth, Europe, Federal Republic of Germany');
  });

  it('has DC.SpatialCoverage with the correct scheme and content', function () {
    // TODO <meta name="DC.SpatialCoverage" scheme="GeoJSON" content="{&quot;type&quot;:&quot;FeatureCollection&quot;,&...]}}" />
  });

  it('has geo.placename with the correct place name', function () {
    // TODO <meta name="geo.placename" content="Federative Republic of Brazil" />
  });

  it('has DC.box with the correct bounding box, project, and name in the content', function () {
    // TODO <meta name="DC.box" content="name=Federative Republic of Brazil; northlimit=5.264877; southlimit=-33.750706; westlimit=-73.985535; eastlimit=-28.839052; projection=EPSG3857" />
  });

  it('has ISO 19139 with the correct XML content', function () {
    // TODO <meta name="ISO 19139" content="<gmd:EX_GeographicBoundingBox><gmd:westBoundLongitude><gco:Decimal>-73.985535</gco:Decimal></gmd:westBoundLongitude><gmd:eastBoundLongitude><gco:Decimal>-28.839052</gco:Decimal></gmd:eastBoundLongitude><gmd:southBoundLatitude><gco:Decimal>-33.750706</gco:Decimal></gmd:southBoundLatitude><gmd:northBoundLatitude><gco:Decimal>5.264877</gco:Decimal></gmd:northBoundLatitude></gmd:EX_GeographicBoundingBox>" />
  });

  it('has ', function () {
    // TODO 
  });

  it('has ', function () {
    // TODO 
  });

  it('has ', function () {
    // TODO 
  });

  it('has ', function () {
    // TODO 
  });

  it('has ', function () {
    // TODO 
  });

});


describe('OPTIMETA Geoplugin HTML temporal head metadata', function () {

  it('has DC.temporal with correct scheme and content', function () {
    // TODO <meta name="DC.temporal" scheme="ISO8601" content="2022-07-05/2022-07-06"/>
  });

  it('has DC.PeriodOfTime with the correct scheme and content', function () {
    // TODO <meta name="DC.PeriodOfTime" scheme="ISO8601" content="2022-07-05/2022-07-06"/>
  });

});
