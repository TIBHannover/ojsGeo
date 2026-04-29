/**
 * @file cypress/tests/integration/59-configurable-map-defaults.cy.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * @brief Issues #39, #73, #145 — the plugin settings expose:
 *          - default lat/lng/zoom used by the submission map
 *          - hex colours for article geometry and its hover-highlight
 *          - hex colour + fill opacity for the administrative-unit overlay
 *
 *        Must restore every value to its default in the final block so later
 *        specs see the same baseline.
 */

describe('geoMetadata Configurable Map Defaults', function () {

  const submitBtnSelector = 'form[id="geoMetadataSettings"] button[id^="submitFormButton"]';

  // Lat/Lng render as either bare '0' (server-emitted default) or '0.000000'
  // (after the mini-map's moveend handler fires once on init); accept both.
  const DEFAULT_LAT_RE  = /^0(\.0{6})?$/;
  const DEFAULT_LNG_RE  = /^0(\.0{6})?$/;
  const DEFAULT_LAT  = '0.000000';
  const DEFAULT_LNG  = '0.000000';
  const DEFAULT_ZOOM = '2';
  const DEFAULT_FEATURE_COLOR   = '#1e6292';
  const DEFAULT_HIGHLIGHT_COLOR = '#ff0000';
  const DEFAULT_OVERLAY_COLOR   = '#000000';
  const DEFAULT_OVERLAY_OPACITY = '0.15';
  const DEFAULT_MARKER_HUE           = '0';
  const DEFAULT_MARKER_HUE_HIGHLIGHT = '150';

  const syncedHighlightCheckbox = 'form[id="geoMetadataSettings"] input[name="geoMetadata_enableSyncedHighlight"]';

  const setToggle = (selector, checked) => {
    openSettings();
    cy.get(selector).scrollIntoView();
    if (checked) { cy.get(selector).check({ force: true }); }
    else { cy.get(selector).uncheck({ force: true }); }
    saveSettings();
  };

  const openSettings = () => {
    cy.login('admin', 'admin', Cypress.env('contexts').primary.path);
    cy.get('nav[class="app__nav"] a:contains("Website")').click();
    cy.get('button[id="plugins-button"]').click();
    cy.get('tr[id="component-grid-settings-plugins-settingsplugingrid-category-generic-row-geometadataplugin"] a[class="show_extras"]').click();
    cy.get('a[id^="component-grid-settings-plugins-settingsplugingrid-category-generic-row-geometadataplugin-settings-button"]').click();
  };

  const saveSettings = () => {
    cy.get(submitBtnSelector).click();
    cy.wait(1000);
  };

  const setSubmissionDefaultView = (lat, lng, zoom) => {
    openSettings();
    // The Map Appearance section sits below the fold in the fixed-position
    // settings modal; scroll the preview into view before the visibility check.
    cy.get('#geoMetadata_defaultMapViewPreview').scrollIntoView().should('be.visible');
    cy.window().then((win) => {
      expect(win.geoMetadata_settingsMiniMap, 'mini-map exposed on window').to.exist;
      win.geoMetadata_settingsMiniMap.setView([lat, lng], zoom);
      // moveend is what writes the hidden inputs; force it to fire synchronously.
      win.geoMetadata_settingsMiniMap.fire('moveend');
    });
    cy.get('#geoMetadata_submissionMapDefaultLat').should('have.value', String(lat.toFixed(6)));
    cy.get('#geoMetadata_submissionMapDefaultLng').should('have.value', String(lng.toFixed(6)));
    cy.get('#geoMetadata_submissionMapDefaultZoom').should('have.value', String(zoom));
    saveSettings();
  };

  const setColor = (inputId, value) => {
    openSettings();
    cy.get('#' + inputId).invoke('val', value).trigger('input').trigger('change');
    saveSettings();
  };

  const setSlider = (inputId, value) => {
    openSettings();
    cy.get('#' + inputId).invoke('val', value).trigger('input').trigger('change');
    saveSettings();
  };

  // Atlas of Saxony is published in Vol. 1 No. 2 (2022); the Archive page
  // lists issues, not articles, so we must open the issue before clicking the
  // article title.
  const visitSaxony = () => {
    cy.visit('/' + Cypress.env('contexts').primary.path + '/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Archive")').click();
    cy.get('a:contains("Vol. 1 No. 2 (2022)")').click();
    cy.openArticleByTitle('Atlas of Saxony');
  };

  const visitCurrentIssue = () => {
    cy.visit('/' + Cypress.env('contexts').primary.path + '/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Archive")').click();
    cy.get('a:contains("Vol. 1 No. 2 (2022)")').click();
  };

  const visitArticle = (title) => {
    cy.visit('/' + Cypress.env('contexts').primary.path + '/');
    cy.get('nav[class="pkp_site_nav_menu"] a:contains("Archive")').click();
    cy.get('a:contains("Vol. 1 No. 2 (2022)")').click();
    cy.openArticleByTitle('' + title + '');
  };

  // Reset every appearance-related plugin setting straight via MySQL, so tests
  // that assert the shipped defaults don't depend on a successful prior
  // "restore" test. Deleting the rows lets SettingsForm::getDefault() fill in
  // the per-key defaults at render time.
  const resetAppearanceSettings = () => {
    const host = Cypress.env('DBHOST');
    const user = Cypress.env('DBUSERNAME');
    const pw   = Cypress.env('DBPASSWORD');
    const db   = Cypress.env('DBNAME');
    const keys = [
      'geoMetadata_submissionMapDefaultLat',
      'geoMetadata_submissionMapDefaultLng',
      'geoMetadata_submissionMapDefaultZoom',
      'geoMetadata_mapFeatureColor',
      'geoMetadata_mapFeatureColorHighlight',
      'geoMetadata_adminUnitOverlayColor',
      'geoMetadata_adminUnitOverlayFillOpacity',
      'geoMetadata_markerHueRotation',
      'geoMetadata_markerHueRotationHighlight',
      'geoMetadata_enableSyncedHighlight',
    ];
    const inList = keys.map((k) => `'${k}'`).join(',');
    cy.exec(
      `docker exec ${host} mysql -u${user} -p${pw} ${db} ` +
      `-e "DELETE FROM plugin_settings WHERE plugin_name='geometadataplugin' AND setting_name IN (${inList});"`
    );
  };
  before(resetAppearanceSettings);
  after(resetAppearanceSettings);

  it('exposes the Map Appearance section in plugin settings', function () {
    openSettings();
    cy.contains('form[id="geoMetadataSettings"]', 'Map appearance').should('exist');
    cy.get('#geoMetadata_submissionMapDefaultLat').should('exist');
    cy.get('#geoMetadata_submissionMapDefaultLng').should('exist');
    cy.get('#geoMetadata_submissionMapDefaultZoom').should('exist');
    cy.get('#geoMetadata_mapFeatureColor').should('have.attr', 'type', 'color');
    cy.get('#geoMetadata_mapFeatureColorHighlight').should('have.attr', 'type', 'color');
    cy.get('#geoMetadata_adminUnitOverlayColor').should('have.attr', 'type', 'color');
    cy.get('#geoMetadata_adminUnitOverlayFillOpacity').should('have.attr', 'type', 'number');
    cy.get('#geoMetadata_markerHueRotation').should('have.attr', 'type', 'range');
    cy.get('#geoMetadata_markerHueRotationHighlight').should('have.attr', 'type', 'range');
    cy.get('#geoMetadata_markerHueRotation_preview').should('exist');
    cy.get('#geoMetadata_markerHueRotationHighlight_preview').should('exist');
  });

  it('ships the configured defaults (issue #39/#145)', function () {
    openSettings();
    cy.get('#geoMetadata_submissionMapDefaultLat').invoke('val').should('match', DEFAULT_LAT_RE);
    cy.get('#geoMetadata_submissionMapDefaultLng').invoke('val').should('match', DEFAULT_LNG_RE);
    cy.get('#geoMetadata_submissionMapDefaultZoom').should('have.value', DEFAULT_ZOOM);
    cy.get('#geoMetadata_mapFeatureColor').should('have.value', DEFAULT_FEATURE_COLOR);
    cy.get('#geoMetadata_mapFeatureColorHighlight').should('have.value', DEFAULT_HIGHLIGHT_COLOR);
    cy.get('#geoMetadata_adminUnitOverlayColor').should('have.value', DEFAULT_OVERLAY_COLOR);
    cy.get('#geoMetadata_adminUnitOverlayFillOpacity').should('have.value', DEFAULT_OVERLAY_OPACITY);
    cy.get('#geoMetadata_markerHueRotation').should('have.value', DEFAULT_MARKER_HUE);
    cy.get('#geoMetadata_markerHueRotationHighlight').should('have.value', DEFAULT_MARKER_HUE_HIGHLIGHT);
  });

  it('slider updates the readout and preview marker filter live', function () {
    openSettings();
    cy.get('#geoMetadata_markerHueRotation').invoke('val', 75).trigger('input');
    cy.get('#geoMetadata_markerHueRotation_value').should('have.text', '75°');
    cy.get('#geoMetadata_markerHueRotation_preview')
      .should('have.attr', 'style')
      .and('include', 'hue-rotate(75deg)');
  });

  it('mini-map writes lat/lng/zoom into the hidden inputs on moveend', function () {
    openSettings();
    // Mini-map initialises asynchronously from the settings.tpl inline script;
    // scroll the preview into view and wait until window.geoMetadata_settingsMiniMap
    // is attached before driving it.
    cy.get('#geoMetadata_defaultMapViewPreview').scrollIntoView().should('be.visible');
    cy.window().should('have.property', 'geoMetadata_settingsMiniMap');
    cy.window().then((win) => {
      win.geoMetadata_settingsMiniMap.setView([51, 10], 5);
      win.geoMetadata_settingsMiniMap.fire('moveend');
    });
    cy.get('#geoMetadata_submissionMapDefaultLat').should('have.value', '51.000000');
    cy.get('#geoMetadata_submissionMapDefaultLng').should('have.value', '10.000000');
    cy.get('#geoMetadata_submissionMapDefaultZoom').should('have.value', '5');
  });

  it('submission map opens at the configured centre and zoom', function () {
    setSubmissionDefaultView(51.0, 10.0, 5);

    // OJS 3.3's submission entry point is the author dashboard's "New
    // Submission" button, not a direct /submission/wizard URL. Use aauthor
    // (spec 10 registers this user); tobler only exists in the testData dump.
    cy.logout();
    cy.openSubmissionsAs('aauthor');
    cy.get('div#myQueue a:contains("New Submission")').click();
    cy.get('input[id^="checklist-"]').click({ multiple: true });
    cy.get('input[id="privacyConsent"]').click();
    cy.get('button.submitFormButton').click();
    cy.wait(1000);
    cy.get('button.submitFormButton').click();
    cy.get('#mapdiv', { timeout: 20000 }).should('be.visible');
    // `var map = null` at submission.js:16 attaches to window but stays null
    // until initMap runs; wait for the actual Leaflet instance.
    cy.window({ timeout: 20000 }).should((win) => {
      expect(win.map, 'window.map').to.not.be.null;
    });
    cy.window().then((win) => {
      const center = win.map.getCenter();
      expect(center.lat, 'submission map lat').to.be.closeTo(51.0, 0.01);
      expect(center.lng, 'submission map lng').to.be.closeTo(10.0, 0.01);
      expect(win.map.getZoom(), 'submission map zoom').to.equal(5);
    });
  });

  it('article map uses the configured geometry colour', function () {
    setColor('geoMetadata_mapFeatureColor', '#00ff00');
    visitArticle('Hanover is nice');
    cy.get('#mapdiv path.leaflet-interactive').first().should('have.attr', 'stroke', '#00ff00');
  });

  it('point-geometry marker picks up the configured hue rotation', function () {
    setSlider('geoMetadata_markerHueRotation', 90);
    // "Vancouver is cool" has a Point geometry.
    visitArticle('Vancouver is cool');
    cy.get('#mapdiv img.leaflet-marker-icon.geoMetadata_marker_default')
      .should('have.length.at.least', 1);
    // `_map_js_globals.tpl` is included inside the article body (because
    // Leaflet loads at end-of-body), so the <style> block lives in <body>,
    // not <head>. Query all <style> tags and concatenate.
    cy.get('style').then(($styles) => {
      const css = $styles.toArray().map((el) => el.textContent).join('\n');
      expect(css).to.include('hue-rotate(90deg)');
    });
  });

  it('.geoMetadata_title_hover border follows the configured highlight colour', function () {
    setColor('geoMetadata_mapFeatureColorHighlight', '#00ff00');

    visitCurrentIssue();
    cy.get('style').then(($styles) => {
      const css = $styles.toArray().map((el) => el.textContent).join('\n');
      expect(css).to.include('.geoMetadata_title_hover');
      expect(css).to.include('border-left-color: #00ff00');
      expect(css).to.include('rgba(0, 255, 0, 0.15)');
    });
  });

  it('synced-highlight toggle off skips the hover wiring; on by default', function () {
    // The flag is emitted as a `const` in _map_js_globals.tpl and therefore
    // does not attach to `window`; inspect the inline script's source text
    // instead of window.geoMetadata_enableSyncedHighlight.
    const scriptHas = (needle) =>
      cy.get('script:not([src])').then(($scripts) => {
        const text = $scripts.toArray().map((s) => s.textContent).join('\n');
        expect(text).to.include(needle);
      });

    visitCurrentIssue();
    scriptHas('geoMetadata_enableSyncedHighlight = true');

    setToggle(syncedHighlightCheckbox, false);
    visitCurrentIssue();
    scriptHas('geoMetadata_enableSyncedHighlight = false');

    setToggle(syncedHighlightCheckbox, true);
  });

  it('admin-unit overlay uses the configured colour and fill opacity', function () {
    setColor('geoMetadata_adminUnitOverlayColor', '#123456');
    openSettings();
    cy.get('#geoMetadata_adminUnitOverlayFillOpacity')
      .invoke('val', '0.4').trigger('input').trigger('change');
    saveSettings();

    visitSaxony();
    // Atlas of Saxony's map has an admin-unit overlay (polygon from GeoNames
    // bbox) and a second path if it also has a geometry; pick the overlay
    // path by stroke colour.
    cy.get('#mapdiv path.leaflet-interactive[stroke="#123456"]')
      .should('have.attr', 'fill-opacity', '0.4');
  });

  it('restores every Map Appearance setting to its default', function () {
    setSubmissionDefaultView(parseFloat(DEFAULT_LAT), parseFloat(DEFAULT_LNG), parseInt(DEFAULT_ZOOM, 10));
    setColor('geoMetadata_mapFeatureColor',          DEFAULT_FEATURE_COLOR);
    setColor('geoMetadata_mapFeatureColorHighlight', DEFAULT_HIGHLIGHT_COLOR);
    setColor('geoMetadata_adminUnitOverlayColor',    DEFAULT_OVERLAY_COLOR);
    setSlider('geoMetadata_markerHueRotation',          DEFAULT_MARKER_HUE);
    setSlider('geoMetadata_markerHueRotationHighlight', DEFAULT_MARKER_HUE_HIGHLIGHT);
    setToggle(syncedHighlightCheckbox, true);

    openSettings();
    // Number inputs: .clear() doesn't always empty the value; assign directly.
    cy.get('#geoMetadata_adminUnitOverlayFillOpacity')
      .invoke('val', DEFAULT_OVERLAY_OPACITY).trigger('input').trigger('change');
    saveSettings();

    openSettings();
    cy.get('#geoMetadata_mapFeatureColor').should('have.value', DEFAULT_FEATURE_COLOR);
    cy.get('#geoMetadata_mapFeatureColorHighlight').should('have.value', DEFAULT_HIGHLIGHT_COLOR);
    cy.get('#geoMetadata_adminUnitOverlayColor').should('have.value', DEFAULT_OVERLAY_COLOR);
    cy.get('#geoMetadata_adminUnitOverlayFillOpacity').should('have.value', DEFAULT_OVERLAY_OPACITY);
    cy.get('#geoMetadata_markerHueRotation').should('have.value', DEFAULT_MARKER_HUE);
    cy.get('#geoMetadata_markerHueRotationHighlight').should('have.value', DEFAULT_MARKER_HUE_HIGHLIGHT);
  });
});
