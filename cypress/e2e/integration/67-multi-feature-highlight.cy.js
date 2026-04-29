/**
 * @file cypress/e2e/integration/67-multi-feature-highlight.cy.js
 *
 * Copyright (c) 2026 KOMET project, OPTIMETA project, Daniel Nüst
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * @brief Synced highlight across an article's features (issue #84).
 *
 * The other fixture articles all have a single Feature in their FeatureCollection
 * (Wellington's MultiLineString is one Feature with multi-geometry, which Leaflet
 * renders as one layer). This spec adds an article with three distinct Features
 * — a Point on Madagascar plus rectangular Polygons over Australia and Brazil —
 * so the journal-map hover handler exercises the
 * articleLayersMap.get(id).forEach loop in js/journal.js' highlightArticleFeatures.
 *
 * Asserts that hovering one feature flips the Leaflet style of every layer that
 * belongs to the same article (and only that article), and that mouseout reverts.
 */

describe('geoMetadata Multi-Feature Synced Highlight', function () {

  const submission = {
    id: 0,
    prefix: '',
    title: 'Three continents traverse',
    subtitle: 'A multi-feature fixture for synced highlighting',
    abstract: 'Three widely-separated features in one article: a Point on Madagascar plus country-scale Polygons over Australia and Brazil.',
    issue: '1',
    directInject: {
      spatial: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { provenance: { description: 'Direct test injection (67-multi-feature-highlight.cy.js)', id: 99 } },
            geometry: { type: 'Point', coordinates: [46.87, -19.0] }
          },
          {
            type: 'Feature',
            properties: { provenance: { description: 'Direct test injection (67-multi-feature-highlight.cy.js)', id: 99 } },
            geometry: { type: 'Polygon', coordinates: [[[112, -10], [154, -10], [154, -44], [112, -44], [112, -10]]] }
          },
          {
            type: 'Feature',
            properties: { provenance: { description: 'Direct test injection (67-multi-feature-highlight.cy.js)', id: 99 } },
            geometry: { type: 'Polygon', coordinates: [[[-74, 4], [-34, 4], [-34, -34], [-74, -34], [-74, 4]]] }
          }
        ],
        administrativeUnits: [],
        temporalProperties: {
          timePeriods: [],
          provenance: { description: 'not available', id: 'not available' }
        }
      },
      adminUnit: []
    }
  };

  const TARGET_TITLE = 'Three continents traverse';

  // Resolve the articleId of TARGET_TITLE on the loaded journal map by matching
  // against articlePopupMap (popup HTML carries the title).
  const findTargetArticleId = (win) => {
    for (const [id, html] of win.articlePopupMap.entries()) {
      if (html && html.includes(TARGET_TITLE)) return id;
    }
    throw new Error('did not find articleId for ' + TARGET_TITLE);
  };

  before(function () {
    cy.openSubmissionsAs('aauthor');
    cy.createSubmissionAndPublish(submission);
  });

  it('Stores three distinct Features in the FeatureCollection', function () {
    cy.logout();
    cy.openSubmissionsAs('eeditor');
    // Article is fully published by createSubmissionAndPublish in before(),
    // so it lives in Archives, not the active queue.
    cy.get('button[id="archive-button"]').click();
    cy.contains('.listPanel__item--submission', TARGET_TITLE)
      .find('a:contains("View")').first().click({ force: true });
    cy.get('div[role="tablist"]').find('button:contains("Publication")').click();
    cy.get('button[id^="timeLocation"]').click();

    cy.get('textarea[name="geoMetadata::spatialProperties"]').invoke('val').then(($v) => {
      const parsed = JSON.parse($v);
      expect(parsed.features, 'three Feature entries persisted').to.have.lengthOf(3);
      const types = parsed.features.map(f => f.geometry.type).sort();
      expect(types).to.deep.equal(['Point', 'Polygon', 'Polygon']);
    });
    cy.logout();
  });

  it('Journal map highlights all three layers when hovering one (issue #84)', function () {
    cy.visit('/' + Cypress.env('contexts').primary.path + '/map');
    cy.get('#mapdiv').should('exist');
    cy.window().its('articleLayersMap').should('exist');
    cy.wait(3000);

    cy.window().then((win) => {
      expect(win.eval('geoMetadata_enableSyncedHighlight'), 'synced-highlight toggle on by default').to.be.true;

      const targetId = findTargetArticleId(win);
      const targetLayers = win.articleLayersMap.get(targetId);
      expect(targetLayers, 'three layers for the multi-feature article').to.have.lengthOf(3);

      // Pin a control article (any other article with at least one layer) and
      // capture its baseline path color so we can assert it stays at default
      // throughout the hover.
      let controlId = null;
      for (const [id, layers] of win.articleLayersMap.entries()) {
        if (id !== targetId && layers.length > 0) { controlId = id; break; }
      }
      expect(controlId, 'control article exists').to.not.be.null;
      const controlPathBefore = win.articleLayersMap.get(controlId)
        .find(l => l.options && l.options.color);
      const controlColorBefore = controlPathBefore ? controlPathBefore.options.color : null;

      // Baseline: every target layer carries the default class/color.
      targetLayers.forEach((layer) => {
        if (layer.feature.geometry.type === 'Point') {
          expect(layer.options.icon.options.className).to.equal('geoMetadata_marker_default');
        } else {
          expect(layer.options.color).to.equal(win.eval('geoMetadata_mapLayerStyle').color);
        }
      });

      // Hover a point inside the Brazil rectangle (well clear of the other
      // fixture geometries) and re-read every layer's style. Hover is now
      // driven by map-level mousemove (issue #159), so we fire on the map
      // rather than on a layer.
      win.map.fire('mousemove', { latlng: win.L.latLng(-15, -54) });

      targetLayers.forEach((layer) => {
        if (layer.feature.geometry.type === 'Point') {
          expect(layer.options.icon.options.className,
            'point class flipped to highlight').to.equal('geoMetadata_marker_highlight');
          expect(layer.getElement().className,
            'point DOM <img> carries the highlight class').to.contain('geoMetadata_marker_highlight');
        } else {
          expect(layer.options.color,
            'polygon stroke flipped to highlight').to.equal(win.eval('geoMetadata_mapLayerStyleHighlight').color);
        }
      });

      // The control article is untouched — only the hovered article highlights.
      if (controlPathBefore) {
        expect(controlPathBefore.options.color,
          'control article stays at default during hover').to.equal(controlColorBefore);
      }

      // Map mouseout reverts every target layer.
      win.map.fire('mouseout');
      targetLayers.forEach((layer) => {
        if (layer.feature.geometry.type === 'Point') {
          expect(layer.options.icon.options.className).to.equal('geoMetadata_marker_default');
        } else {
          expect(layer.options.color).to.equal(win.eval('geoMetadata_mapLayerStyle').color);
        }
      });
    });
  });

  it('Disabling the synced-highlight toggle suppresses the cross-feature flip', function () {
    const toggleSelector = 'form[id="geoMetadataSettings"] input[name="geoMetadata_enableSyncedHighlight"]';
    const submitBtn = 'form[id="geoMetadataSettings"] button[id^="submitFormButton"]';

    cy.login('admin', 'admin', Cypress.env('contexts').primary.path);
    cy.get('nav[class="app__nav"] a:contains("Website")').click();
    cy.get('button[id="plugins-button"]').click();
    cy.get('tr[id="component-grid-settings-plugins-settingsplugingrid-category-generic-row-geometadataplugin"] a[class="show_extras"]').click();
    cy.get('a[id^="component-grid-settings-plugins-settingsplugingrid-category-generic-row-geometadataplugin-settings-button"]').click();
    cy.get(toggleSelector).uncheck();
    cy.get(submitBtn).click();
    cy.wait(1000);

    cy.visit('/' + Cypress.env('contexts').primary.path + '/map');
    cy.get('#mapdiv').should('exist');
    // articleLayersMap is populated asynchronously by journal.js DOM-ready code.
    cy.wait(3000);
    cy.window().then((win) => {
      expect(win.eval('geoMetadata_enableSyncedHighlight'), 'toggle now off').to.be.false;
      const targetId = findTargetArticleId(win);
      const layers = win.articleLayersMap.get(targetId);
      const polygon = layers.find(l => l.feature.geometry.type === 'Polygon');
      const colorBefore = polygon.options.color;
      win.map.fire('mousemove', { latlng: win.L.latLng(-15, -54) });
      // With the toggle off the map-level mousemove handler is never bound,
      // so the polygon stays at default.
      expect(polygon.options.color, 'no highlight when toggle off').to.equal(colorBefore);
    });

    // Restore so subsequent specs see the default-on state.
    cy.login('admin', 'admin', Cypress.env('contexts').primary.path);
    cy.get('nav[class="app__nav"] a:contains("Website")').click();
    cy.get('button[id="plugins-button"]').click();
    cy.get('tr[id="component-grid-settings-plugins-settingsplugingrid-category-generic-row-geometadataplugin"] a[class="show_extras"]').click();
    cy.get('a[id^="component-grid-settings-plugins-settingsplugingrid-category-generic-row-geometadataplugin-settings-button"]').click();
    cy.get(toggleSelector).check();
    cy.get(submitBtn).click();
    cy.wait(1000);
  });

});
