---
title: "geoMetadata Plugin — feature screenshots"
subtitle: "Generated 2026-04-27 from the testData dump on `http://localhost:8330`"
author: "OJS geoMetadata Plugin"
geometry: margin=2cm
papersize: a4
header-includes:
  - \usepackage{graphicx}
  - \usepackage{float}
  - \let\origfigure\figure
  - \let\endorigfigure\endfigure
  - \renewenvironment{figure}[1][]{\origfigure[H]}{\endorigfigure}
---

# About this document

One screenshot per page covering the headline features of the OJS `geoMetadata` plugin.
Every shot was produced by `headless/take-geometadata-screenshots.mjs` against the local
OJS dev-server at `http://localhost:8330` (the `gmdj` demo journal seeded from
`testData/stable-3_3_0-geoMetadata`). Each entry records the URL the screenshot was taken
at, the user account (if any), and links to the GitHub issues that drove the feature.

Sections in this document:

- **A** — Editorial workflow (publication tab)
- **B** — Reader article views
- **C** — Issue page
- **D** — Journal-wide map
- **E** — Admin settings
- **F** — Internationalisation

Source: <https://github.com/TIBHannover/geoMetadata>.

\newpage

# Section A — Editorial workflow (publication tab)

## Editor publication tab — raw GeoJSON / temporal fields locked by default

\begin{center}
\includegraphics[width=\linewidth, height=0.55\textheight, keepaspectratio]{01-A1-publication-tab-time-location-locked.png}
\end{center}

Editor publication tab → Time & Location, raw fields locked The raw-data textareas start read-only with an "Enable editing" button so an editor cannot accidentally corrupt stored GeoJSON by stray edits. An admin toggle under Workflow settings can disable the lock.

· **URL:** `http://localhost:8330/index.php/gmdj/workflow/index/22/5#publication/timeLocation` · **User:** logged in as **admin** (admin / admin) · **Issues:** [#114](https://github.com/TIBHannover/geoMetadata/issues/114) · **File:** `01-A1-publication-tab-time-location-locked.png`

\newpage

## Editor publication tab — raw fields after unlocking

\begin{center}
\includegraphics[width=\linewidth, height=0.55\textheight, keepaspectratio]{02-A2-publication-tab-time-location-unlocked.png}
\end{center}

Same view after clicking "Enable editing" — raw fields editable After clicking "Enable editing" the textareas accept input. The map widget on the same tab continues to reflect changes either way.

· **URL:** `http://localhost:8330/index.php/gmdj/workflow/index/22/5#publication/timeLocation` · **User:** logged in as **admin** (admin / admin) · **Issues:** [#114](https://github.com/TIBHannover/geoMetadata/issues/114) · **File:** `02-A2-publication-tab-time-location-unlocked.png`

\newpage

# Section B — Reader article views

## Article reader view — full geoMetadata block

\begin{center}
\includegraphics[width=\linewidth, height=0.55\textheight, keepaspectratio]{03-B1-article-full-metadata.png}
\end{center}

Article view with full spatial + temporal + administrative metadata. The "Time and Location" section appears below the abstract: a Leaflet map of the author-supplied geometries, the temporal range, and the gazetteer-derived administrative-unit chain (Earth → Europe → Republic of Austria).

· **URL:** `http://localhost:8330/index.php/gmdj/article/view/22` · **User:** no login required (anonymous reader) · **Issues:** [#6](https://github.com/TIBHannover/geoMetadata/issues/6), [#64](https://github.com/TIBHannover/geoMetadata/issues/64) · **File:** `03-B1-article-full-metadata.png`

\newpage

## GeoJSON download in the article sidebar

\begin{center}
\includegraphics[width=\linewidth, height=0.55\textheight, keepaspectratio]{04-B2-article-sidebar-download.png}
\end{center}

Article view with the GeoJSON download button in the right sidebar. The button in the article sidebar serves the stored geometry as a downloadable GeoJSON file. The visibility of this button is controlled by an admin toggle.

· **URL:** `http://localhost:8330/index.php/gmdj/article/view/27` · **User:** no login required (anonymous reader) · **Issues:** [#55](https://github.com/TIBHannover/geoMetadata/issues/55) · **File:** `04-B2-article-sidebar-download.png`

\newpage

## Map fullscreen mode

\begin{center}
\includegraphics[width=\linewidth, height=0.55\textheight, keepaspectratio]{05-B3-article-fullscreen-active.png}
\end{center}

Article-page map after engaging the fullscreen control. A Leaflet fullscreen control is added to every map (article, issue, and journal-wide). The control title is translated into all four bundled locales.

· **URL:** `http://localhost:8330/index.php/gmdj/article/view/22` · **User:** no login required (anonymous reader) · **Issues:** [#61](https://github.com/TIBHannover/geoMetadata/issues/61) · **File:** `05-B3-article-fullscreen-active.png`

\newpage

## Reset-view control

\begin{center}
\includegraphics[width=\linewidth, height=0.55\textheight, keepaspectratio]{06-B4-article-after-pan-zoom.png}
\end{center}

Article map after a manual pan/zoom — the reset-view control is the second button next to fullscreen. A reset-view button next to the fullscreen control returns the map to its initial view in one click. Present on all four maps (article, issue, journal-wide).

· **URL:** `http://localhost:8330/index.php/gmdj/article/view/22` · **User:** no login required (anonymous reader) · **File:** `06-B4-article-after-pan-zoom.png`

\newpage

## Antimeridian (180°) handling

\begin{center}
\includegraphics[width=\linewidth, height=0.55\textheight, keepaspectratio]{07-B5-article-antimeridian-crossing.png}
\end{center}

Antimeridian-crossing article: a MultiLineString stored as two segments, one per hemisphere, plus an admin-unit bbox overlay where east<west. Geometries crossing the antimeridian are stored as RFC 7946 §3.1.9-compliant Multi* features split at ±180°. The admin-unit overlay for countries with east<west bboxes (Russia, New Zealand, Fiji, parts of the US) draws two rectangles. ICBM / geo.position centroids are computed correctly across the dateline.

· **URL:** `http://localhost:8330/index.php/gmdj/article/view/46` · **User:** no login required (anonymous reader) · **Issues:** [#60](https://github.com/TIBHannover/geoMetadata/issues/60) · **File:** `07-B5-article-antimeridian-crossing.png`

\newpage

# Section C — Issue page

## Map icon in the issue table of contents

\begin{center}
\includegraphics[width=\linewidth, height=0.55\textheight, keepaspectratio]{08-C1-issue-toc-with-map-icons.png}
\end{center}

Issue TOC with the geoMetadata map icon next to every article title that has stored geometry. Hovering the icon highlights the article's features on the map; clicking opens the popup and scrolls the map into view. The icon is suppressed for articles with no spatial data (e.g. the "Outside of nowhere" fixture). Admin toggle, default on.

· **URL:** `http://localhost:8330/index.php/gmdj/issue/view/4` · **User:** no login required (anonymous reader) · **Issues:** [#158](https://github.com/TIBHannover/geoMetadata/issues/158) · **File:** `08-C1-issue-toc-with-map-icons.png`

\newpage

## Issue-wide map

\begin{center}
\includegraphics[width=\linewidth, height=0.55\textheight, keepaspectratio]{09-C2-issue-map-all-articles.png}
\end{center}

Issue page: every article in the issue rendered on a single map. Renders below the TOC via the Templates::Issue::TOC::Main hook (which OJS 3.3 does not ship — see the README for the one-line `issue_toc.tpl` patch).

· **URL:** `http://localhost:8330/index.php/gmdj/issue/view/4` · **User:** no login required (anonymous reader) · **Issues:** [#27](https://github.com/TIBHannover/geoMetadata/issues/27), [#69](https://github.com/TIBHannover/geoMetadata/issues/69) · **File:** `09-C2-issue-map-all-articles.png`

\newpage

## Two-way hover sync between TOC and map

\begin{center}
\includegraphics[width=\linewidth, height=0.55\textheight, keepaspectratio]{10-C3-issue-hover-sync.png}
\end{center}

Issue page: hovering an article entry in the TOC highlights all its geometries on the map (and vice-versa). Works for points, polygons, and lines. The synthetic mouseover here triggers the same handler real users invoke. Highlight colour is configurable (Map appearance settings).

· **URL:** `http://localhost:8330/index.php/gmdj/issue/view/4` · **User:** no login required (anonymous reader) · **Issues:** [#80](https://github.com/TIBHannover/geoMetadata/issues/80), [#83](https://github.com/TIBHannover/geoMetadata/issues/83) · **File:** `10-C3-issue-hover-sync.png`

\newpage

## Time-period summary above the issue map

\begin{center}
\includegraphics[width=\linewidth, height=0.55\textheight, keepaspectratio]{11-C4-issue-time-period-summary.png}
\end{center}

Overall time-period summary banner above the issue map: aggregated min start / max end across every article in the issue. A single-year-only special case shortens the phrasing to "in YYYY". BCE / deep-history years are compared numerically. The aggregator lives in js/lib/temporal.js and is shared with the article-page and journal-wide views.

· **URL:** `http://localhost:8330/index.php/gmdj/issue/view/4` · **User:** no login required (anonymous reader) · **Issues:** [#105](https://github.com/TIBHannover/geoMetadata/issues/105), [#57](https://github.com/TIBHannover/geoMetadata/issues/57) · **File:** `11-C4-issue-time-period-summary.png`

\newpage

## Multi-article overlap popup (issue map)

\begin{center}
\includegraphics[width=\linewidth, height=0.55\textheight, keepaspectratio]{12-C5-issue-overlap-popup.png}
\end{center}

Multi-article popup at the Hanover overlap: clicking a point covered by both the polygon and the line opens a popup with prev/next controls instead of arbitrarily picking one article. Triggered programmatically here at lat=52.40, lng=9.73 (a vertex of the LineString that also lies inside the Polygon). Real users get the same popup by clicking on overlapping geometry. Admin toggle, default on. Popup status: no popup.

· **URL:** `http://localhost:8330/index.php/gmdj/issue/view/4` · **User:** no login required (anonymous reader) · **Issues:** [#81](https://github.com/TIBHannover/geoMetadata/issues/81) · **File:** `12-C5-issue-overlap-popup.png`

\newpage

# Section D — Journal-wide map

## Journal-wide map

\begin{center}
\includegraphics[width=\linewidth, height=0.55\textheight, keepaspectratio]{13-D1-journal-map-full.png}
\end{center}

Journal-wide map at /<journal>/map: every published article in the journal on a single Leaflet map. Always available at the URL; can be linked from the primary navigation menu via an OJS Navigation Menu Item. Each feature carries an articleId and a popup with the article title, temporal range, and admin-unit chain.

· **URL:** `http://localhost:8330/index.php/gmdj/map` · **User:** no login required (anonymous reader) · **Issues:** [#7](https://github.com/TIBHannover/geoMetadata/issues/7) · **File:** `13-D1-journal-map-full.png`

\newpage

## Hover/active highlight on the journal map

\begin{center}
\includegraphics[width=\linewidth, height=0.55\textheight, keepaspectratio]{14-D2-journal-map-hover.png}
\end{center}

Journal map with the highlight colour applied to one feature. Matches the issue-map behaviour. The synthetic mouseover here fires the same Leaflet event a real user produces. Highlight colour and the synced-highlight behaviour are admin-configurable.

· **URL:** `http://localhost:8330/index.php/gmdj/map` · **User:** no login required (anonymous reader) · **Issues:** [#83](https://github.com/TIBHannover/geoMetadata/issues/83) · **File:** `14-D2-journal-map-hover.png`

\newpage

## Multi-article overlap popup (journal map)

\begin{center}
\includegraphics[width=\linewidth, height=0.55\textheight, keepaspectratio]{15-D3-journal-map-overlap-popup.png}
\end{center}

Multi-article overlap popup on the journal map at the same Hanover point. Same picker as the issue-map variant, but spans every article in the journal rather than a single issue. Popup status: overlap-popup.

· **URL:** `http://localhost:8330/index.php/gmdj/map` · **User:** no login required (anonymous reader) · **Issues:** [#81](https://github.com/TIBHannover/geoMetadata/issues/81) · **File:** `15-D3-journal-map-overlap-popup.png`

\newpage

# Section G — Timeline strip (issue #74)

## Journal-wide timeline (under the map)

\begin{center}
\includegraphics[width=\linewidth, height=0.55\textheight, keepaspectratio]{16-G1-journal-timeline.png}
\end{center}

Timeline strip below the journal-wide map: every published article positioned on a year axis according to its temporal metadata, with a "Hide timeline" collapse link above the strip. Stacked beneath the existing map on the same /map page (no separate URL or menu entry). Built on vis-timeline with a deep-time bridge in js/lib/temporal.js::toVisDate() — the earliest tick on the axis comes from a Holocene-era fixture article. Independent admin toggle from the map.

· **URL:** `http://localhost:8330/index.php/gmdj/map` · **User:** no login required (anonymous reader) · **Issues:** [#74](https://github.com/TIBHannover/geoMetadata/issues/74) · **File:** `16-G1-journal-timeline.png`

\newpage

## Issue-page timeline (under the issue map)

\begin{center}
\includegraphics[width=\linewidth, height=0.55\textheight, keepaspectratio]{17-G2-issue-timeline.png}
\end{center}

Timeline strip below the issue-TOC map: only the articles in this issue, on the same year axis, with the same collapse link. Same renderer and collapse UI as the journal-wide variant, scoped to the current issue. Hidden when no article in the issue carries temporal data.

· **URL:** `http://localhost:8330/index.php/gmdj/issue/view/4` · **User:** no login required (anonymous reader) · **Issues:** [#74](https://github.com/TIBHannover/geoMetadata/issues/74) · **File:** `17-G2-issue-timeline.png`

\newpage

# Section E — Admin settings

## Settings form — overview

\begin{center}
\includegraphics[width=\linewidth, height=0.55\textheight, keepaspectratio]{18-E0-settings-full-form.png}
\end{center}

Top of the geoMetadata settings form (admin → Website → Plugins → geoMetadata → Settings). The form is divided into eight sections; subsequent shots zoom into each. Almost every visible/discovery feature can be toggled per journal so a publisher can opt in or out without code changes.

· **URL:** `http://localhost:8330/index.php/gmdj/management/settings/website#plugins` · **User:** logged in as **admin** (admin / admin) · **Issues:** [#23](https://github.com/TIBHannover/geoMetadata/issues/23) · **File:** `18-E0-settings-full-form.png`

\newpage

## Article-page settings

\begin{center}
\includegraphics[width=\linewidth, height=0.55\textheight, keepaspectratio]{19-E1-article-page.png}
\end{center}

Toggles for the article-page map, the temporal block, the administrative-unit block, and the GeoJSON download in the article sidebar.

· **URL:** `http://localhost:8330/index.php/gmdj/management/settings/website#plugins` · **User:** logged in as **admin** (admin / admin) · **Issues:** [#23](https://github.com/TIBHannover/geoMetadata/issues/23), [#55](https://github.com/TIBHannover/geoMetadata/issues/55) · **File:** `19-E1-article-page.png`

\newpage

## Issue and journal-map settings

\begin{center}
\includegraphics[width=\linewidth, height=0.55\textheight, keepaspectratio]{20-E2-issue-journal-map.png}
\end{center}

Toggles for the issue-page map, the journal-wide map, and the issue-TOC map icon.

· **URL:** `http://localhost:8330/index.php/gmdj/management/settings/website#plugins` · **User:** logged in as **admin** (admin / admin) · **Issues:** [#23](https://github.com/TIBHannover/geoMetadata/issues/23), [#158](https://github.com/TIBHannover/geoMetadata/issues/158) · **File:** `20-E2-issue-journal-map.png`

\newpage

## Map appearance settings

\begin{center}
\includegraphics[width=\linewidth, height=0.55\textheight, keepaspectratio]{21-E3-map-appearance.png}
\end{center}

Default centre/zoom for the submission map plus colour pickers for the article geometry, the hover highlight, the administrative-unit overlay (colour + fill opacity), and the marker hue rotations. The synced-highlight toggle is here too.

· **URL:** `http://localhost:8330/index.php/gmdj/management/settings/website#plugins` · **User:** logged in as **admin** (admin / admin) · **Issues:** [#39](https://github.com/TIBHannover/geoMetadata/issues/39), [#73](https://github.com/TIBHannover/geoMetadata/issues/73), [#145](https://github.com/TIBHannover/geoMetadata/issues/145) · **File:** `21-E3-map-appearance.png`

\newpage

## Submission-form settings

\begin{center}
\includegraphics[width=\linewidth, height=0.55\textheight, keepaspectratio]{22-E4a-submission.png}
\end{center}

Per-component toggles for the submission form: spatial input, temporal input, admin-unit input.

· **URL:** `http://localhost:8330/index.php/gmdj/management/settings/website#plugins` · **User:** logged in as **admin** (admin / admin) · **Issues:** [#23](https://github.com/TIBHannover/geoMetadata/issues/23) · **File:** `22-E4a-submission.png`

\newpage

## Editorial-workflow settings

\begin{center}
\includegraphics[width=\linewidth, height=0.55\textheight, keepaspectratio]{23-E4b-workflow.png}
\end{center}

Mirror of the submission-form toggles for the editorial publication tab, plus the raw-data lock toggle (#114).

· **URL:** `http://localhost:8330/index.php/gmdj/management/settings/website#plugins` · **User:** logged in as **admin** (admin / admin) · **Issues:** [#23](https://github.com/TIBHannover/geoMetadata/issues/23), [#114](https://github.com/TIBHannover/geoMetadata/issues/114) · **File:** `23-E4b-workflow.png`

\newpage

## Discovery / HTML-head metadata

\begin{center}
\includegraphics[width=\linewidth, height=0.55\textheight, keepaspectratio]{24-E5-discovery-meta-tags.png}
\end{center}

Toggles for the four meta-tag families (Dublin Core, geo.* / placename / region, ICBM / geo.position centroid, ISO 19139) plus the schema.org JSON-LD block.

· **URL:** `http://localhost:8330/index.php/gmdj/management/settings/website#plugins` · **User:** logged in as **admin** (admin / admin) · **Issues:** [#3](https://github.com/TIBHannover/geoMetadata/issues/3), [#87](https://github.com/TIBHannover/geoMetadata/issues/87), [#88](https://github.com/TIBHannover/geoMetadata/issues/88), [#92](https://github.com/TIBHannover/geoMetadata/issues/92) · **File:** `24-E5-discovery-meta-tags.png`

\newpage

## External services + privacy disclosure

\begin{center}
\includegraphics[width=\linewidth, height=0.55\textheight, keepaspectratio]{25-E6-external-services.png}
\end{center}

Toggles for the optional Esri base layer and the Leaflet geocoder. The reader-facing privacy textarea below the toggles is composed live based on which services are enabled, so disabling a service removes its line from the disclosure shown to readers.

· **URL:** `http://localhost:8330/index.php/gmdj/management/settings/website#plugins` · **User:** logged in as **admin** (admin / admin) · **Issues:** [#124](https://github.com/TIBHannover/geoMetadata/issues/124) · **File:** `25-E6-external-services.png`

\newpage

## Accounts (GeoNames)

\begin{center}
\includegraphics[width=\linewidth, height=0.55\textheight, keepaspectratio]{26-E7-accounts-geonames.png}
\end{center}

GeoNames API username + base URL, used by the gazetteer-driven administrative-unit suggestion during submission.

· **URL:** `http://localhost:8330/index.php/gmdj/management/settings/website#plugins` · **User:** logged in as **admin** (admin / admin) · **File:** `26-E7-accounts-geonames.png`

\newpage

# Section F — Internationalisation

## German UI (de_DE)

\begin{center}
\includegraphics[width=\linewidth, height=0.55\textheight, keepaspectratio]{27-F-de_DE-article-view.png}
\end{center}

Article reader view in German: plugin UI strings, Leaflet zoom titles, draw-toolbar tooltips, and geocoder placeholder are all translated. Translations live in locale/<locale>/locale.po. The msgid order is enforced across all four bundled locales (en_US / de_DE / fr_FR / es_ES) by 50-locales.cy.js.

· **URL:** `http://localhost:8330/index.php/gmdj/article/view/22` · **User:** no login required (anonymous reader) · **Issues:** [#109](https://github.com/TIBHannover/geoMetadata/issues/109), [#111](https://github.com/TIBHannover/geoMetadata/issues/111), [#151](https://github.com/TIBHannover/geoMetadata/issues/151) · **File:** `27-F-de_DE-article-view.png`

\newpage

## French UI (fr_FR)

\begin{center}
\includegraphics[width=\linewidth, height=0.55\textheight, keepaspectratio]{28-F-fr_FR-article-view.png}
\end{center}

Article reader view in French: plugin UI strings, Leaflet zoom titles, draw-toolbar tooltips, and geocoder placeholder are all translated. Translations live in locale/<locale>/locale.po. The msgid order is enforced across all four bundled locales (en_US / de_DE / fr_FR / es_ES) by 50-locales.cy.js.

· **URL:** `http://localhost:8330/index.php/gmdj/article/view/22` · **User:** no login required (anonymous reader) · **Issues:** [#94](https://github.com/TIBHannover/geoMetadata/issues/94), [#109](https://github.com/TIBHannover/geoMetadata/issues/109), [#111](https://github.com/TIBHannover/geoMetadata/issues/111), [#151](https://github.com/TIBHannover/geoMetadata/issues/151) · **File:** `28-F-fr_FR-article-view.png`

\newpage

## Spanish UI (es_ES)

\begin{center}
\includegraphics[width=\linewidth, height=0.55\textheight, keepaspectratio]{29-F-es_ES-article-view.png}
\end{center}

Article reader view in Spanish: plugin UI strings, Leaflet zoom titles, draw-toolbar tooltips, and geocoder placeholder are all translated. Translations live in locale/<locale>/locale.po. The msgid order is enforced across all four bundled locales (en_US / de_DE / fr_FR / es_ES) by 50-locales.cy.js.

· **URL:** `http://localhost:8330/index.php/gmdj/article/view/22` · **User:** no login required (anonymous reader) · **Issues:** [#95](https://github.com/TIBHannover/geoMetadata/issues/95), [#109](https://github.com/TIBHannover/geoMetadata/issues/109), [#111](https://github.com/TIBHannover/geoMetadata/issues/111), [#151](https://github.com/TIBHannover/geoMetadata/issues/151) · **File:** `29-F-es_ES-article-view.png`

\newpage
