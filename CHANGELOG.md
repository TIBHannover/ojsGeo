# Changelog

All notable changes to the geoMetadata plugin are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0.0] - unreleased

Internationalisation, configurability, and HTML-head metadata — target release for [Milestone 7](https://github.com/TIBHannover/geoMetadata/milestone/7) (OJS 3.3; OJS 3.5 support tracked separately).

### Added

- Fullscreen button on all maps ([#61](https://github.com/TIBHannover/geoMetadata/issues/61)).
- `ICBM`, `geo.position`, and `geo.region` HTML meta tags ([#87](https://github.com/TIBHannover/geoMetadata/issues/87), [#88](https://github.com/TIBHannover/geoMetadata/issues/88)).
- Configurable base layer with reader-facing info on the external services in use ([#124](https://github.com/TIBHannover/geoMetadata/issues/124)).
- Admin toggles for article, issue, and journal map visibility ([#23](https://github.com/TIBHannover/geoMetadata/issues/23)).
- Admin toggles for the submission form, editorial workflow tab, HTML meta tags, and map geocoder ([#23](https://github.com/TIBHannover/geoMetadata/issues/23)).
- Admin toggle to show/hide the GeoJSON download button in the article sidebar ([#55](https://github.com/TIBHannover/geoMetadata/issues/55)).
- Overall time-period summary above the issue-TOC map and the journal-wide map, with a single-year special case and support for BCE / deep-history years via numeric comparison ([#105](https://github.com/TIBHannover/geoMetadata/issues/105)).
- Shared `js/lib/temporal.js` parser/aggregator; replaces the fragile inline split in `article_details.js` / `issue.js` / `journal.js` and is forward-compatible with multi-period per article ([#57](https://github.com/TIBHannover/geoMetadata/issues/57)).
- Cypress coverage for all admin toggles and for the time-period field in the HTML-head GeoJSON export ([#106](https://github.com/TIBHannover/geoMetadata/issues/106)).

### Changed

- Replaced the daterangepicker on both submission forms with a plain-text field accepting `YYYY`, `YYYY-MM`, or `YYYY-MM-DD` on each side (signed integers for BCE). Validation runs server-side via OJS `FormValidatorCustom` on `SubmissionSubmitStep3Form`; invalid input is preserved in the field for correction instead of being silently dropped. Preliminary — full replacement tracked in [#140](https://github.com/TIBHannover/geoMetadata/issues/140).
- Dropped `npm-asset/daterangepicker` and `npm-asset/moment` (and transitively `npm-asset/jquery`) from composer; removed the JS/CSS include wiring and the `.daterangepicker` CSS overrides from submission templates.
- Translated remaining Leaflet controls — zoom, geocoder, and draw toolbar ([#109](https://github.com/TIBHannover/geoMetadata/issues/109), [#111](https://github.com/TIBHannover/geoMetadata/issues/111), [#151](https://github.com/TIBHannover/geoMetadata/issues/151)).
- Cleaned up i18n antipatterns ([#152](https://github.com/TIBHannover/geoMetadata/issues/152)).
- Aligned msgid order across `en_US` / `de_DE` / `fr_FR` / `es_ES` locales and regenerated `messages.mo`.

### Fixed

- Issue-page hover: point markers now highlight when hovering the article div, not just polygons ([#83](https://github.com/TIBHannover/geoMetadata/issues/83)).
- Locale switching in tests; restored `DC.PeriodOfTime` HTML meta emission.
- Removed dead `isEsriBaseLayerEnabled` helper.
- Administrative-unit field now resets coherently when all map features are removed and no longer validates user-typed tags against a stale hierarchy. Manually typed tags survive map edits, and removing any auto-derived tag switches the field into full manual-override mode — the remaining tags freeze and map edits no longer re-derive administrative units until every manual tag is cleared. A warning-styled notice next to the field explains when manual curation is blocking auto-updates; the "gazetteer unavailable" warning now also suggests refreshing the page ([#112](https://github.com/TIBHannover/geoMetadata/issues/112)).
- Geometries crossing the antimeridian (180° meridian) are now stored as RFC 7946 §3.1.9-compliant `MultiPolygon` / `MultiLineString` features split into one part per hemisphere. A new `AntimeridianSplitter` runs on the `Publication::edit` hook so every stored record is unambiguous; legacy pre-fix records render correctly in-memory and are normalised on the next save. The admin-unit overlay for countries with `east<west` bboxes (Russia, New Zealand, Fiji, parts of the US) draws two rectangles across the dateline instead of flipping to the wrong hemisphere. `Centroid` now handles crossing envelopes and skips MySQL's Cartesian `ST_Envelope` for MultiPolygons that straddle ±180°, so `ICBM` / `geo.position` tags are correct. All four maps enable Leaflet's `worldCopyJump`, and a small informational note below the editing maps explains the split-on-save behaviour ([#60](https://github.com/TIBHannover/geoMetadata/issues/60)).

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
