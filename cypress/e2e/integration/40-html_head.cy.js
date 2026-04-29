/**
 * @file cypress/tests/integration/html_head.cy.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
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

describe('geoMetadata Geospatial Metadata in HTML Head', function () {

  beforeEach(() => {
    cy.visit('/' + Cypress.env('contexts').primary.path + '/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Archive")').click();
    cy.get('a:contains("Vol. 1 No. 2 (2022)")').click();
    cy.openArticleByTitle('Hanover is nice');
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

  it('DC.SpatialCoverage GeoJSON includes the article time period and provenance (issue #106)', function () {
    // The temporal range entered in 32-submission.cy.js (2022-01-01 — 2022-12-31) is
    // written into the stored GeoJSON by js/submission.js:1256 as `{YYYY-MM-DD..YYYY-MM-DD}`
    // inside `temporalProperties.timePeriods`, with a user-provenance record emitted by
    // submission.js:836-837. The DC.SpatialCoverage meta tag ships that blob verbatim
    // (GeoMetadataPlugin.inc.php:227), so both values must appear here exactly.
    metaContains('DC.SpatialCoverage', [
      /"timePeriods":\["\{2022-01-01\.\.2022-12-31\}"\]/,
      /"provenance":\{"description":"temporal properties created by user","id":31\}/
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

  // Exact-value tests for ICBM / geo.position live in the Atlas of Saxony
  // block below; Hanover's Leaflet pixel-click geometry is not deterministic
  // enough. These are format + consistency only.

  it('has ICBM with a lat, lon pair at 5-decimal precision (issue #87)', function () {
    metaContains('ICBM', /^-?\d+\.\d{5}, -?\d+\.\d{5}$/);
  });

  it('has geo.position with a lat;lon pair at 5-decimal precision (issue #87)', function () {
    metaContains('geo.position', /^-?\d+\.\d{5};-?\d+\.\d{5}$/);
  });

  it('ICBM and geo.position carry the same coordinates (issue #87)', function () {
    cy.get('meta[name="ICBM"]').invoke('attr', 'content').then((icbm) => {
      cy.get('meta[name="geo.position"]').invoke('attr', 'content').then((pos) => {
        // ICBM "lat, lon" and geo.position "lat;lon" must match on the numbers.
        expect(icbm.replace(', ', ';')).to.equal(pos);
      });
    });
  });

  // Hanover's admin unit is Germany; its bbox centre resolves to Thuringia
  // via GeoNames countrySubdivisionJSON, so geo.region is "DE-TH".
  const EXPECTED_ISO_COUNTRY     = 'DE';
  const EXPECTED_ISO_SUBDIVISION = 'TH';
  const EXPECTED_GEO_REGION      = EXPECTED_ISO_COUNTRY + '-' + EXPECTED_ISO_SUBDIVISION;

  it('has geo.region exactly "' + EXPECTED_GEO_REGION + '" (issue #88)', function () {
    metaContains('geo.region', new RegExp('^' + EXPECTED_GEO_REGION + '$'));
  });

  it('stored admin unit carries the exact ISO 3166-1 country code (issue #88)', function () {
    cy.get('#geoMetadata_administrativeUnit').invoke('val').then((raw) => {
      const units = JSON.parse(raw);
      expect(units, 'administrative unit array').to.be.an('array').and.not.be.empty;
      const mostSpecific = units[units.length - 1];
      expect(mostSpecific.isoCountryCode, 'isoCountryCode on most specific unit').to.equal(EXPECTED_ISO_COUNTRY);
    });
  });

  it('stored admin unit carries the exact ISO 3166-2 subdivision code (issue #88)', function () {
    cy.get('#geoMetadata_administrativeUnit').invoke('val').then((raw) => {
      const mostSpecific = JSON.parse(raw).slice(-1)[0];
      expect(mostSpecific.isoSubdivisionCode, 'isoSubdivisionCode on most specific unit').to.equal(EXPECTED_ISO_SUBDIVISION);
    });
  });

  it('geo.region meta tag value matches the stored codes exactly (issue #88)', function () {
    cy.get('#geoMetadata_administrativeUnit').invoke('val').then((raw) => {
      const unit = JSON.parse(raw).slice(-1)[0];
      const built = unit.isoCountryCode + '-' + unit.isoSubdivisionCode;
      metaContains('geo.region', new RegExp('^' + built.replace('-', '\\-') + '$'));
    });
  });

  it('stored spatialProperties (= download payload) includes ISO codes on admin unit (issue #88)', function () {
    // #geoMetadata_spatial is what downloadGeospatialMetadataAsGeoJSON serves.
    cy.get('#geoMetadata_spatial').invoke('val').then((raw) => {
      const geojson = JSON.parse(raw);
      expect(geojson.administrativeUnits, 'administrativeUnits on stored GeoJSON').to.be.an('array').and.not.be.empty;
      const mostSpecific = geojson.administrativeUnits[geojson.administrativeUnits.length - 1];
      expect(mostSpecific.isoCountryCode,     'isoCountryCode').to.equal(EXPECTED_ISO_COUNTRY);
      expect(mostSpecific.isoSubdivisionCode, 'isoSubdivisionCode').to.equal(EXPECTED_ISO_SUBDIVISION);
    });
  });
});

describe('geoMetadata Temporal Metadata in HTML Head', function () {

  beforeEach(() => {
    cy.visit('/' + Cypress.env('contexts').primary.path + '/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Archive")').click();
    cy.get('a:contains("Vol. 1 No. 2 (2022)")').click();
    cy.openArticleByTitle('Hanover is nice');
  });

  it('has DC.temporal with correct scheme and content', function () {
    metaContains('DC.temporal', /2022-01-01\/2022-12-31/, 'ISO8601');
  });

  it('has DC.PeriodOfTime with the correct scheme and content', function () {
    metaContains('DC.PeriodOfTime', /2022-01-01\/2022-12-31/, 'ISO8601');
  });

});

describe('geoMetadata HTML Head - Article Without Time Period (issue #106)', function () {

  // Uses the "Timeless Isle" article published by 34-submission-no-timeperiod.cy.js:
  // spatial data present, no temporal range entered.

  beforeEach(() => {
    cy.visit('/' + Cypress.env('contexts').primary.path + '/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Archive")').click();
    cy.get('a:contains("Vol. 1 No. 2 (2022)")').click();
    cy.openArticleByTitle('Timeless Isle');
  });

  it('DC.SpatialCoverage GeoJSON has empty timePeriods and "not available" provenance', function () {
    // js/submission.js writes these exact defaults when the time-period
    // textarea is empty; GeoMetadataPlugin.inc.php then ships the resulting
    // GeoJSON verbatim into DC.SpatialCoverage.
    metaContains('DC.SpatialCoverage', [
      /"timePeriods":\[\]/,
      /"provenance":\{"description":"not available","id":"not available"\}/
    ], 'GeoJSON');
  });

  it('does not emit a DC.temporal meta tag', function () {
    cy.get('meta[name="DC.temporal"]').should('not.exist');
  });

  it('does not emit a DC.PeriodOfTime meta tag', function () {
    cy.get('meta[name="DC.PeriodOfTime"]').should('not.exist');
  });

});

describe('geoMetadata HTML Head - Atlas of Saxony (exact centroid values, issues #87 + #88)', function () {

  // Expected values are plain literals from the fixed stored data in
  // 36-submission-saxony.cy.js — Saxony's GeoNames bbox centre at 5 decimals
  // plus its ISO 3166-2 code.
  const EXPECTED_ICBM        = '50.92825, 13.45664';
  const EXPECTED_GEO_POS     = '50.92825;13.45664';
  const EXPECTED_GEO_REGION  = 'DE-SN';
  const EXPECTED_PROVENANCE  =
    '<!-- geoMetadata: next meta tags based on centroid of most precise admin unit bbox (&quot;Saxony&quot;) -->';

  beforeEach(() => {
    cy.visit('/' + Cypress.env('contexts').primary.path + '/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Archive")').click();
    cy.get('a:contains("Vol. 1 No. 2 (2022)")').click();
    cy.openArticleByTitle('Atlas of Saxony');
  });

  it('has ICBM exactly "' + EXPECTED_ICBM + '" (fallback: admin-unit bbox centre) (issue #87)', function () {
    metaContains('ICBM', new RegExp('^' + EXPECTED_ICBM.replace(/\./g, '\\.').replace(',', ',') + '$'));
  });

  it('has geo.position exactly "' + EXPECTED_GEO_POS + '" (issue #87)', function () {
    metaContains('geo.position', new RegExp('^' + EXPECTED_GEO_POS.replace(/\./g, '\\.').replace(';', ';') + '$'));
  });

  it('has geo.region exactly "' + EXPECTED_GEO_REGION + '" (issue #88)', function () {
    metaContains('geo.region', new RegExp('^' + EXPECTED_GEO_REGION.replace('-', '\\-') + '$'));
  });

  it('has geo.placename exactly "Saxony"', function () {
    metaContains('geo.placename', /^Saxony$/);
  });

  it('emits the admin-unit-bbox provenance HTML comment (issue #87 fallback path)', function () {
    cy.url().then((url) => {
      cy.request(url).then((resp) => {
        expect(resp.body).to.include(EXPECTED_PROVENANCE);
      });
    });
  });

  it('stored admin unit carries the exact ISO 3166-1 + ISO 3166-2 codes (issue #88)', function () {
    cy.get('#geoMetadata_administrativeUnit').invoke('val').then((raw) => {
      const unit = JSON.parse(raw).slice(-1)[0];
      expect(unit.isoCountryCode,     'isoCountryCode').to.equal('DE');
      expect(unit.isoSubdivisionCode, 'isoSubdivisionCode').to.equal('SN');
    });
  });

  it('stored spatialProperties (= download payload) carries the exact ISO codes (issue #88)', function () {
    cy.get('#geoMetadata_spatial').invoke('val').then((raw) => {
      const mostSpecific = JSON.parse(raw).administrativeUnits.slice(-1)[0];
      expect(mostSpecific.isoCountryCode,     'isoCountryCode').to.equal('DE');
      expect(mostSpecific.isoSubdivisionCode, 'isoSubdivisionCode').to.equal('SN');
    });
  });

});
