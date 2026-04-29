# Changelog

All notable changes to the geoMetadata plugin are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0.0] - unreleased

Internationalisation, configurability, and HTML-head metadata — target release for [Milestone 7](https://github.com/TIBHannover/geoMetadata/milestone/7) (OJS 3.3; OJS 3.5 support tracked separately).

### Added

- Interactive timeline strip below the journal-wide map (`<journal>/map`) and below the issue-TOC map: every published article is positioned on a horizontal year axis according to its `geoMetadata::timePeriods`. Built on [vis-timeline](https://github.com/visjs/vis-timeline) (Apache-2.0 / MIT, fetched via Composer), with deep-time / BCE support via the ECMAScript expanded-year ISO bridge in `js/lib/temporal.js::toVisDate()`. A "Hide timeline" / "Show timeline" link with triangle icon (▼ / ▶) collapses the strip in-place. Two new admin toggles `geoMetadata_showJournalTimeline` and `geoMetadata_showIssueTimeline` (default on) gate the journal-page and issue-TOC strips independently of the existing map toggles. The vis-timeline JS/CSS bundle is loaded only when at least one timeline toggle is enabled — map-only journals pay no runtime cost. **No `config.inc.php` change is required** beyond the existing Issue-TOC hook patch ([#74](https://github.com/TIBHannover/geoMetadata/issues/74); follow-ups [#155](https://github.com/TIBHannover/geoMetadata/issues/155) two-pane overview, [#156](https://github.com/TIBHannover/geoMetadata/issues/156) press-wide aggregation, [#157](https://github.com/TIBHannover/geoMetadata/issues/157) linked brushing).
- `testData` dump now contains a Wellington antimeridian-crossing fixture article ("Wellington to Chatham Islands ferry across the dateline", submission 46) — a Wellington Harbour → Waitangi MultiLineString, which crosses the antimeridian because the Chatham Islands sit east of 180° within NZ territory — so demos and the Playwright screenshot script can exercise the [#60](https://github.com/TIBHannover/geoMetadata/issues/60) split-MultiLineString rendering without a fresh Cypress run.
- Multi-article picker on the issue and journal maps: clicking where two or more articles' geometries overlap opens a popup that cycles through every article at that location with prev/next controls (wrap-around), instead of arbitrarily picking the one painted on top. Admin toggle, default on ([#81](https://github.com/TIBHannover/geoMetadata/issues/81)).
- Hover and active-article highlighting on the journal map, matching the issue-map behaviour ([#83](https://github.com/TIBHannover/geoMetadata/issues/83)).
- Fullscreen button on all maps ([#61](https://github.com/TIBHannover/geoMetadata/issues/61)).
- `ICBM`, `geo.position`, and `geo.region` HTML meta tags ([#87](https://github.com/TIBHannover/geoMetadata/issues/87), [#88](https://github.com/TIBHannover/geoMetadata/issues/88)).
- Configurable base layer with reader-facing info on the external services in use ([#124](https://github.com/TIBHannover/geoMetadata/issues/124)).
- Admin toggles for article, issue, and journal map visibility ([#23](https://github.com/TIBHannover/geoMetadata/issues/23)).
- Admin toggles for the submission form, editorial workflow tab, HTML meta tags, and map geocoder ([#23](https://github.com/TIBHannover/geoMetadata/issues/23)).
- Admin toggle to show/hide the GeoJSON download button in the article sidebar ([#55](https://github.com/TIBHannover/geoMetadata/issues/55)).
- Overall time-period summary above the issue-TOC map and the journal-wide map, with a single-year special case and support for BCE / deep-history years via numeric comparison ([#105](https://github.com/TIBHannover/geoMetadata/issues/105)).
- Shared `js/lib/temporal.js` parser/aggregator; replaces the fragile inline split in `article_details.js` / `issue.js` / `journal.js` and is forward-compatible with multi-period per article ([#57](https://github.com/TIBHannover/geoMetadata/issues/57)).
- Cypress coverage for all admin toggles and for the time-period field in the HTML-head GeoJSON export ([#106](https://github.com/TIBHannover/geoMetadata/issues/106)).
- Cypress regression test that editing geo metadata on a new publication version leaves the previous version's stored data intact ([#102](https://github.com/TIBHannover/geoMetadata/issues/102)).
- Map appearance settings: configurable default view for the submission map, and colours for article geometry, hover highlight, administrative-unit overlay, and point markers ([#39](https://github.com/TIBHannover/geoMetadata/issues/39), [#73](https://github.com/TIBHannover/geoMetadata/issues/73), [#145](https://github.com/TIBHannover/geoMetadata/issues/145)).
- Hover highlighting on the issue page uses the configured highlight colour, with an admin toggle to synchronise (or disable) the two-way hover between map and article entries.
- Map icon next to each article title in the issue table of contents; hover highlights the article's geometries, click opens the popup and scrolls the map into view. Admin toggle, default on ([#158](https://github.com/TIBHannover/geoMetadata/issues/158)).
- Reset-view button next to the fullscreen control on every map; one click returns the map to its initial view.
- Raw-data textareas on the publication tab start read-only with an "Enable editing" button, to prevent accidental edits that can silently corrupt stored GeoJSON. An admin toggle under *Workflow settings* disables the lock for journals that prefer the previous always-editable behaviour ([#114](https://github.com/TIBHannover/geoMetadata/issues/114)).
- schema.org JSON-LD on article pages: a `ScholarlyArticle` block with `@id` (article URL), `mainEntityOfPage`, `headline`, DOI as `identifier` (when present), `spatialCoverage` split into separate `Place` objects for the article-extent geometry and the lowest administrative unit, and `temporalCoverage` as ISO 8601 interval. Article-extent shapes follow ESIPFed science-on-schema.org conventions (`GeoCoordinates` / `GeoShape` line / polygon, lat-lon order); the admin-unit Place carries the unit name, a GeoNames URI as `sameAs`, and ISO 3166-1 / 3166-2 codes via `additionalProperty`, with its bbox emitted as a `GeoShape` (east<west when the bbox crosses the antimeridian, matching `DC.box` / `ISO 19139`). A `geometrySource` `PropertyValue` on every Place and on every article-extent shape distinguishes author-provided geometry from the admin-unit bounding box. Coexists with another plugin's article-level JSON-LD via shared `@id`. Admin toggle under *Discovery meta tags*, default on ([#92](https://github.com/TIBHannover/geoMetadata/issues/92)).
- Cypress: regress per-journal settings + content isolation by exercising a second journal (`cartography`) alongside the primary, with three published articles seeded (one via the editorial UI, two via direct DB write) ([#99](https://github.com/TIBHannover/geoMetadata/issues/99)).

### Changed

- Hovering the issue or journal map now highlights every article whose geometry contains the cursor — both the article entries on the issue page's table of contents and the matching layers on either map — instead of only the topmost geometry Leaflet would have fired on ([#159](https://github.com/TIBHannover/geoMetadata/issues/159)).
- Replaced the daterangepicker on both submission forms with a plain-text field accepting `YYYY`, `YYYY-MM`, or `YYYY-MM-DD` on each side (signed integers for BCE). Validation runs server-side via OJS `FormValidatorCustom` on `SubmissionSubmitStep3Form`; invalid input is preserved in the field for correction instead of being silently dropped. Preliminary — full replacement tracked in [#140](https://github.com/TIBHannover/geoMetadata/issues/140).
- Dropped `npm-asset/daterangepicker` and `npm-asset/moment` (and transitively `npm-asset/jquery`) from composer; removed the JS/CSS include wiring and the `.daterangepicker` CSS overrides from submission templates.
- Translated remaining Leaflet controls — zoom, geocoder, and draw toolbar ([#109](https://github.com/TIBHannover/geoMetadata/issues/109), [#111](https://github.com/TIBHannover/geoMetadata/issues/111), [#151](https://github.com/TIBHannover/geoMetadata/issues/151)).
- Cleaned up i18n antipatterns ([#152](https://github.com/TIBHannover/geoMetadata/issues/152)).
- Aligned msgid order across `en_US` / `de_DE` / `fr_FR` / `es_ES` locales and regenerated `messages.mo`.
- Removed the `"no data"` sentinel string across all three hidden-metadata fields. `geoMetadata::administrativeUnit` now uses the JSON literal `[]` for empty, `geoMetadata::timePeriods` uses the empty string, and the PHP display-layer substitution for `geoMetadata::spatialProperties` now emits the canonical empty `FeatureCollection` instead of the sentinel. Readers drop their `== "no data"` branches and parse/test for emptiness directly. Installations with existing `"no data"` rows should re-save affected publications, or run a one-off SQL cleanup: `UPDATE publication_settings SET setting_value='[]' WHERE setting_name='geoMetadata::administrativeUnit' AND setting_value='no data'; UPDATE publication_settings SET setting_value='' WHERE setting_name='geoMetadata::timePeriods' AND setting_value='no data';` ([#154](https://github.com/TIBHannover/geoMetadata/issues/154)).

### Fixed

- Journal map page (`/<journal>/map`) rendered invalid JS (`fillOpacity: }` syntax error) because `JournalMapHandler` did not propagate the plugin's shared map-template variables, leaving `_map_js_globals.tpl` to emit empty `const` declarations. The resulting crash took out every map script on the page, including the overall time-period summary.
- Issue-page hover: point markers now highlight when hovering the article div, not just polygons ([#83](https://github.com/TIBHannover/geoMetadata/issues/83)).
- Locale switching in tests; restored `DC.PeriodOfTime` HTML meta emission.
- Removed dead `isEsriBaseLayerEnabled` helper.
- Administrative-unit field now resets coherently when all map features are removed and no longer validates user-typed tags against a stale hierarchy. Manually typed tags survive map edits, and removing any auto-derived tag switches the field into full manual-override mode — the remaining tags freeze and map edits no longer re-derive administrative units until every manual tag is cleared. A warning-styled notice next to the field explains when manual curation is blocking auto-updates; the "gazetteer unavailable" warning now also suggests refreshing the page ([#112](https://github.com/TIBHannover/geoMetadata/issues/112)).
- Geometries crossing the antimeridian (180° meridian) are now stored as RFC 7946 §3.1.9-compliant `MultiPolygon` / `MultiLineString` features split into one part per hemisphere. A new `AntimeridianSplitter` runs on the `Publication::edit` hook so every stored record is unambiguous; legacy pre-fix records render correctly in-memory and are normalised on the next save. The admin-unit overlay for countries with `east<west` bboxes (Russia, New Zealand, Fiji, parts of the US) draws two rectangles across the dateline instead of flipping to the wrong hemisphere. `Centroid` now handles crossing envelopes and skips MySQL's Cartesian `ST_Envelope` for MultiPolygons that straddle ±180°, so `ICBM` / `geo.position` tags are correct. All four maps enable Leaflet's `worldCopyJump`, and a small informational note below the editing maps explains the split-on-save behaviour ([#60](https://github.com/TIBHannover/geoMetadata/issues/60)).
- Translated the admin-unit input-validation alerts on the submission form and the publication tab; previously these were always shown in English regardless of the journal locale ([#110](https://github.com/TIBHannover/geoMetadata/issues/110)).
- The "gazetteer unavailable" notice on the submission form and publication tab now explains the cause — missing GeoNames Base URL, missing username, invalid credentials, daily quota exceeded, or generic external error — instead of a single generic line. A defensive guard on the autocomplete request also surfaces a quota-exhausted state mid-session, and the plugin settings form rejects a save with bad GeoNames credentials inline using the same translated reasons. All five reasons are translated into `en_US`, `de_DE`, `fr_FR`, and `es_ES` ([#164](https://github.com/TIBHannover/geoMetadata/issues/164)).
- Every GeoNames call (search, hierarchy by lat/lng, hierarchy by id, bbox lookup, country-subdivision lookup) now surfaces a translated reason on a network failure, a 5xx response, or an inline error envelope — previously only `searchJSON` checked for the inline-error envelope and none of them handled hard network failures, so a flaky gazetteer would silently leave the field empty mid-submission with no explanation.
- Older publication versions (`/article/view/{id}/version/{N}`) now emit the article's geo metadata in the HTML head — `DC.Coverage` for the administrative unit, plus the plugin's other geo meta tags — so each version is independently discoverable. OJS's bundled DublinCoreMetaPlugin previously suppressed `DC.Coverage` on `/version/` URLs ([#102](https://github.com/TIBHannover/geoMetadata/issues/102)).
- Pressing Escape now closes the issue/journal-map article popup regardless of which element holds keyboard focus, and the icon-hover map highlight now lights up the article's geometry whether or not the synced-highlight admin toggle is on. The reset-view control no longer drifts during the post-init `fitBounds` chain — its captured view is the post-async-fitBounds view, and the reset itself is now an instant snap rather than a smooth animation, so a user that pans away always returns to the same place.
- Hover and click hit-testing on the issue and journal maps now matches the visible feature footprint at every zoom level. Hovering anywhere on a marker icon — not just its bottom tip — highlights the article and registers a click; the click target on a polyline now follows the pointer cursor over the visible stroke. Previously the marker hit zone was a small circle around the icon's lat/lng anchor and the polyline hit zone used a 100m geometric tolerance, both of which routinely missed clicks the cursor had clearly landed on ([#81](https://github.com/TIBHannover/geoMetadata/issues/81), [#159](https://github.com/TIBHannover/geoMetadata/issues/159)).
- Journal-wide map and timeline now show one entry per article when an article has multiple published versions; previously every version was rendered, stacking duplicate geometries on the map and breaking the timeline strip with a duplicate-id error from vis-timeline.

## [1.0.1.0] - 2025-10-14

Bugfix and packaging release on the `stable-3_3_0` branch.

### Added

- Seeded `testData` dump with the `tobler` author/reviewer account and polyline sample.

### Fixed

- PHP 8.1+ compatibility.
- Re-editing of geospatial properties on existing submissions.
- Issue map: highlight all features of an article when any one is hovered.
- Journal and issue views when a submission has no geoMetadata.
- Journal map Smarty template breaking on apostrophes in titles.
- `submissionId` vs `publicationId` mix-up in journal-map article links.
- Fetch publication via `SubmissionDAO` to avoid stale previous-submission data.
- Font Awesome loaded via OJS to avoid version conflicts.

### Changed

- `testData` excluded from release archives.
- Removed the OptiMeta logo and discontinued-theme references from the README.

## [1.0.0.0-beta] - 2022-09-26

First public beta on the `stable-3_3_0` branch. The CHANGELOG was added later, so the entries below are reconstructed from the issue tracker and commit history; dates and grouping are best-effort.

### Added

- Author submission form: enter geospatial extent by drawing one or more shapes (point, line, polygon) on a Leaflet map, or by accepting the bounding box returned by a place-name search ([#1](https://github.com/TIBHannover/geoMetadata/issues/1), [#18](https://github.com/TIBHannover/geoMetadata/issues/18)).
- Author submission form: enter a temporal range as a daterangepicker; stored as ISO-style text rather than Unix epoch ([#15](https://github.com/TIBHannover/geoMetadata/issues/15), [#25](https://github.com/TIBHannover/geoMetadata/issues/25), [#37](https://github.com/TIBHannover/geoMetadata/issues/37), [#89](https://github.com/TIBHannover/geoMetadata/issues/89)).
- Gazetteer-driven administrative-unit suggestion via the GeoNames API; stored alongside the GeoJSON as a separate textual field for non-map consumers ([#58](https://github.com/TIBHannover/geoMetadata/issues/58), [#64](https://github.com/TIBHannover/geoMetadata/issues/64)).
- Editorial-workflow publication tab so editors can review and revise spatio-temporal metadata during production / when scheduling for publication ([#19](https://github.com/TIBHannover/geoMetadata/issues/19), [#53](https://github.com/TIBHannover/geoMetadata/issues/53), [#65](https://github.com/TIBHannover/geoMetadata/issues/65)).
- Article-page reader view: map of the author-supplied geometry, temporal range, and administrative unit, with a GeoJSON download in the article sidebar ([#6](https://github.com/TIBHannover/geoMetadata/issues/6)).
- Issue-page reader view: map of every article in the issue, with two-way hover sync between map features and the table-of-contents entries (including point markers) ([#27](https://github.com/TIBHannover/geoMetadata/issues/27), [#69](https://github.com/TIBHannover/geoMetadata/issues/69), [#80](https://github.com/TIBHannover/geoMetadata/issues/80)). Requires the host theme's `issue_toc.tpl` to expose the `Templates::Issue::TOC::Main` hook.
- Journal-wide map at `/<journal>/map`, listing every article in the journal on a single Leaflet map with popups linking back to each article ([#7](https://github.com/TIBHannover/geoMetadata/issues/7)).
- HTML `<head>` injection on article pages: `DC.SpatialCoverage` (full GeoJSON), `DC.box` (DCMI Box from the most specific admin unit), and `DC.Coverage` as a comma-separated text list of admin-unit names, intended for academic search engines and discovery services ([#3](https://github.com/TIBHannover/geoMetadata/issues/3), [#22](https://github.com/TIBHannover/geoMetadata/issues/22), [#64](https://github.com/TIBHannover/geoMetadata/issues/64)).
- Plugin settings page with the GeoNames API username and base URL ([#2](https://github.com/TIBHannover/geoMetadata/issues/2)).
- Internationalisation: English, German, French, and Spanish translations of the plugin's user-facing strings, including the daterangepicker `cancelLabel` ([#94](https://github.com/TIBHannover/geoMetadata/issues/94), [#95](https://github.com/TIBHannover/geoMetadata/issues/95), [#90](https://github.com/TIBHannover/geoMetadata/issues/90)).
- Cypress test suite that bootstraps a fresh OJS via docker-compose and exercises installation, configuration, submission, and the article/issue/journal map views ([#47](https://github.com/TIBHannover/geoMetadata/issues/47)).
- JavaScript dependency management via Composer + Asset Packagist (Leaflet, Leaflet Draw, leaflet-control-geocoder, daterangepicker, Font Awesome) — replaces the earlier CDN-loading scheme ([#49](https://github.com/TIBHannover/geoMetadata/issues/49), [#51](https://github.com/TIBHannover/geoMetadata/issues/51)).
- Theme support beyond OJS default: Bootstrap3 ([#122](https://github.com/TIBHannover/geoMetadata/issues/122)).
- Transparent licensing notice for the metadata captured and emitted by the plugin ([#30](https://github.com/TIBHannover/geoMetadata/issues/30)).
