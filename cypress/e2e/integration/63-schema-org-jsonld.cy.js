/**
 * @file cypress/e2e/integration/63-schema-org-jsonld.cy.js
 *
 * Copyright (c) 2026 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * @brief Verify the schema.org JSON-LD block emitted on article pages
 *        (issue #92): @type ScholarlyArticle, headline, @id == article URL,
 *        spatialCoverage as one or two Place objects (article-extent Place
 *        + admin-unit Place, distinguished by a `geometrySource` property),
 *        temporalCoverage as an ISO 8601 interval. One fixture article per
 *        geometry branch.
 *
 *        Restores geoMetadata_emitSchemaOrg to ON at the end so subsequent
 *        specs (and re-runs) see the default-on state.
 */

const SOURCE_ARTICLE = 'articleSpatialExtent';
const SOURCE_ADMIN   = 'administrativeUnitBoundingBox';

const visitArticle = (issueLabel, title) => {
  cy.visit('/' + Cypress.env('contexts').primary.path + '/');
  cy.get('nav[class="pkp_site_nav_menu"] a:contains("Archive")').click();
  cy.get('a:contains("' + issueLabel + '")').click();
  cy.openArticleByTitle('' + title + '');
};

const visitVol1No2 = (title) => visitArticle('Vol. 1 No. 2 (2022)', title);

const parseJsonLd = () =>
  cy.get('script[type="application/ld+json"]').first().invoke('text').then((raw) => JSON.parse(raw));

const asArray = (v) => (v === undefined || v === null) ? [] : (Array.isArray(v) ? v : [v]);
const placesIn = (ld) => asArray(ld.spatialCoverage);

// Find the additionalProperty value for a given propertyID on either a
// Place or a GeoShape — additionalProperty may be a single object or an array.
const sourceOf = (node) =>
  asArray(node && node.additionalProperty)
    .find((p) => p && p.propertyID === 'geometrySource');

const findPlaceBySource = (ld, source) =>
  placesIn(ld).find((p) => {
    const tag = sourceOf(p);
    return tag && tag.value === source;
  });

const toggleSelector = (name) => `form[id="geoMetadataSettings"] input[name="${name}"]`;
const submitBtnSelector = 'form[id="geoMetadataSettings"] button[id^="submitFormButton"]';

const setSchemaOrgToggle = (checked) => {
  cy.login('admin', 'admin', Cypress.env('contexts').primary.path);
  cy.get('nav[class="app__nav"] a:contains("Website")').click();
  cy.get('button[id="plugins-button"]').click();
  cy.get('tr[id="component-grid-settings-plugins-settingsplugingrid-category-generic-row-geometadataplugin"] a[class="show_extras"]').click();
  cy.get('a[id^="component-grid-settings-plugins-settingsplugingrid-category-generic-row-geometadataplugin-settings-button"]').click();
  if (checked) {
    cy.get(toggleSelector('geoMetadata_emitSchemaOrg')).check();
  } else {
    cy.get(toggleSelector('geoMetadata_emitSchemaOrg')).uncheck();
  }
  cy.get(submitBtnSelector).click();
  cy.wait(1000);
};

describe('geoMetadata schema.org JSON-LD - Hanover (LineString + admin-unit bbox + temporal)', function () {

  beforeEach(() => visitVol1No2('Hanover is nice'));

  it('emits a single ld+json block with @type ScholarlyArticle', function () {
    cy.get('script[type="application/ld+json"]').should('have.length.at.least', 1);
    parseJsonLd().then((ld) => {
      expect(ld['@context']).to.equal('https://schema.org');
      expect(ld['@type']).to.equal('ScholarlyArticle');
    });
  });

  it('@id and mainEntityOfPage match the current article URL', function () {
    cy.url().then((url) => {
      parseJsonLd().then((ld) => {
        expect(ld['@id']).to.equal(url);
        expect(ld['mainEntityOfPage']).to.equal(url);
      });
    });
  });

  it('headline contains the article title', function () {
    parseJsonLd().then((ld) => {
      expect(ld.headline).to.match(/Hanover is nice/);
    });
  });

  it('spatialCoverage carries two Places: article-extent and admin-unit', function () {
    parseJsonLd().then((ld) => {
      const places = placesIn(ld);
      expect(places, 'two Place objects').to.have.length(2);
      places.forEach((p) => expect(p['@type']).to.equal('Place'));
    });
  });

  it('article-extent Place has a GeoShape line and tags every shape with geometrySource', function () {
    parseJsonLd().then((ld) => {
      const articlePlace = findPlaceBySource(ld, SOURCE_ARTICLE);
      expect(articlePlace, 'article-extent Place').to.exist;
      const shapes = asArray(articlePlace.geo);
      expect(shapes, 'at least one shape').to.have.length.at.least(1);
      const lines = shapes.filter((s) => s['@type'] === 'GeoShape' && s.line);
      expect(lines, 'at least one GeoShape line').to.have.length.at.least(1);
      shapes.forEach((s) => {
        const tag = sourceOf(s);
        expect(tag, 'geometrySource on each shape').to.exist;
        expect(tag.value).to.equal(SOURCE_ARTICLE);
      });
    });
  });

  it('admin-unit Place names Germany, links to GeoNames, and emits the right bbox + ISO codes', function () {
    parseJsonLd().then((ld) => {
      const adminPlace = findPlaceBySource(ld, SOURCE_ADMIN);
      expect(adminPlace, 'admin-unit Place').to.exist;
      expect(adminPlace.name).to.equal('Federal Republic of Germany');
      expect(adminPlace.sameAs).to.match(/^https:\/\/www\.geonames\.org\/\d+$/);
      expect(adminPlace.geo['@type']).to.equal('GeoShape');
      // Germany bbox already pinned by 40-html_head.cy.js. schema.org GeoShape.box
      // order: "swLat swLon neLat neLon".
      expect(adminPlace.geo.box).to.equal('47.2701236047 5.8663152683722 55.058383600807 15.041815651616');
      const props = asArray(adminPlace.additionalProperty);
      const country = props.find((p) => p.propertyID === 'isoCountryCode');
      expect(country, 'isoCountryCode property').to.exist;
      expect(country.value).to.equal('DE');
    });
  });

  it('temporalCoverage is the ISO 8601 interval 2022-01-01/2022-12-31', function () {
    parseJsonLd().then((ld) => {
      expect(ld.temporalCoverage).to.equal('2022-01-01/2022-12-31');
    });
  });
});

describe('geoMetadata schema.org JSON-LD - Vancouver is cool (Point, no usable admin-unit bbox)', function () {

  // "Vancouver is cool" stores Earth as the admin unit, whose bbox is "not
  // available", so only the article-extent Place is emitted.

  beforeEach(() => visitVol1No2('Vancouver is cool'));

  it('emits only an article-extent Place with a GeoCoordinates point', function () {
    parseJsonLd().then((ld) => {
      const places = placesIn(ld);
      expect(places).to.have.length(1);
      const articlePlace = findPlaceBySource(ld, SOURCE_ARTICLE);
      expect(articlePlace, 'article-extent Place').to.exist;
      const single = Array.isArray(articlePlace.geo) ? articlePlace.geo[0] : articlePlace.geo;
      expect(single['@type']).to.equal('GeoCoordinates');
      expect(single.latitude).to.be.within(48, 50);
      expect(single.longitude).to.be.within(-124, -122);
    });
  });

  it('temporalCoverage is the ISO 8601 interval 2021-01-01/2021-12-31', function () {
    parseJsonLd().then((ld) => {
      expect(ld.temporalCoverage).to.equal('2021-01-01/2021-12-31');
    });
  });
});

describe('geoMetadata schema.org JSON-LD - Timeless Isle (Polygon, no temporal)', function () {

  beforeEach(() => visitVol1No2('Timeless Isle'));

  it('article-extent Place has a GeoShape polygon', function () {
    parseJsonLd().then((ld) => {
      const articlePlace = findPlaceBySource(ld, SOURCE_ARTICLE);
      expect(articlePlace, 'article-extent Place').to.exist;
      const single = Array.isArray(articlePlace.geo) ? articlePlace.geo[0] : articlePlace.geo;
      expect(single['@type']).to.equal('GeoShape');
      expect(single.polygon).to.be.a('string').and.match(/^-?\d+(\.\d+)?( -?\d+(\.\d+)?){3,}/);
    });
  });

  it('does NOT emit temporalCoverage', function () {
    parseJsonLd().then((ld) => {
      expect(ld).not.to.have.property('temporalCoverage');
    });
  });
});

describe('geoMetadata schema.org JSON-LD - Atlas of Saxony (admin-unit bbox only)', function () {

  beforeEach(() => visitVol1No2('Atlas of Saxony'));

  it('emits only an admin-unit Place with name Saxony and ISO 3166-2 DE-SN', function () {
    parseJsonLd().then((ld) => {
      const places = placesIn(ld);
      expect(places, 'one admin-unit Place').to.have.length(1);
      const adminPlace = findPlaceBySource(ld, SOURCE_ADMIN);
      expect(adminPlace, 'admin-unit Place').to.exist;
      expect(adminPlace.name).to.equal('Saxony');
      expect(adminPlace.sameAs).to.match(/^https:\/\/www\.geonames\.org\/\d+$/);

      const props = asArray(adminPlace.additionalProperty);
      const country = props.find((p) => p.propertyID === 'isoCountryCode');
      const sub     = props.find((p) => p.propertyID === 'isoSubdivisionCode');
      expect(country.value).to.equal('DE');
      expect(sub.value).to.equal('SN');

      expect(adminPlace.geo['@type']).to.equal('GeoShape');
      const parts = adminPlace.geo.box.split(' ').map(Number);
      expect(parts).to.have.length(4);
      const [swLat, swLon, neLat, neLon] = parts;
      expect(swLat).to.be.within(50.1, 51.0);
      expect(neLat).to.be.within(51.5, 51.7);
      expect(swLon).to.be.within(11.8, 12.5);
      expect(neLon).to.be.within(14.5, 15.1);
    });
  });
});

describe('geoMetadata schema.org JSON-LD - Wellington (MultiLineString + east<west bbox)', function () {

  beforeEach(() => visitVol1No2('Wellington to Chatham Islands ferry across the dateline'));

  it('article-extent Place has multiple GeoShape lines (MultiLineString split)', function () {
    parseJsonLd().then((ld) => {
      const articlePlace = findPlaceBySource(ld, SOURCE_ARTICLE);
      expect(articlePlace, 'article-extent Place').to.exist;
      const shapes = asArray(articlePlace.geo);
      const lines = shapes.filter((s) => s['@type'] === 'GeoShape' && s.line);
      expect(lines, 'GeoShape line entries from the MultiLineString split').to.have.length.at.least(2);
    });
  });

  it('admin-unit Place emits the New Zealand bbox east<west to mark antimeridian crossing', function () {
    parseJsonLd().then((ld) => {
      const adminPlace = findPlaceBySource(ld, SOURCE_ADMIN);
      expect(adminPlace, 'admin-unit Place').to.exist;
      const [, swLon, , neLon] = adminPlace.geo.box.split(' ').map(Number);
      expect(neLon).to.be.lessThan(swLon);
    });
  });
});

describe('geoMetadata schema.org JSON-LD - Outside of nowhere (no spatial, no temporal)', function () {

  beforeEach(() => visitVol1No2('Outside of nowhere'));

  it('does NOT emit a JSON-LD block when there is nothing geo-related to say', function () {
    cy.get('script[type="application/ld+json"]').should('not.exist');
  });
});

describe('geoMetadata schema.org JSON-LD - emitSchemaOrg toggle', function () {

  it('off: no JSON-LD block on Hanover; on: emits again', function () {
    setSchemaOrgToggle(false);
    visitVol1No2('Hanover is nice');
    cy.get('script[type="application/ld+json"]').should('not.exist');

    setSchemaOrgToggle(true);
    visitVol1No2('Hanover is nice');
    cy.get('script[type="application/ld+json"]').should('exist');
  });
});
