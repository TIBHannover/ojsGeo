# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the geoMetadata Plugin for Open Journal Systems (OJS), developed as part of the KOMET and OPTIMETA projects. The plugin allows authors to capture and provide geospatial properties of research articles, storing data both as GeoJSON coordinates and textual administrative units.

## Architecture

### Core Components

- **GeoMetadataPlugin.inc.php**: Main plugin class that extends OJS's GenericPlugin
- **classes/**: PHP classes organized with PSR-4 autoloading (`ojs\geometadata\`)
  - `Components/Forms/`: Form handlers for settings and publication forms
  - `handler/JournalMapHandler.inc.php`: Handles journal map display functionality
- **templates/**: Smarty templates for frontend display
  - `frontend/objects/`: Article and issue view templates
  - `frontend/pages/`: Journal map page template
- **js/**: JavaScript files for interactive functionality (Leaflet maps, form handling)
- **css/**: Stylesheets for the plugin UI

### Key Database Fields

- `geoMetadata::spatialProperties`: GeoJSON spatial data
- `geoMetadata::timePeriods`: Temporal range data
- `geoMetadata::administrativeUnit`: Administrative unit names

### External Dependencies

The plugin uses several JavaScript libraries managed via Composer + Asset Packagist:

- Leaflet (mapping)
- Leaflet Draw (shape drawing)
- Leaflet Fullscreen (fullscreen map control)
- Leaflet Control Geocoder (search functionality)
- Daterangepicker (temporal range selection)
- Font Awesome (icons)

### Submission vs. publication-tab templates

The plugin renders two editable forms for spatio-temporal metadata. They share element selectors but use different markup:

- `templates/submission/form/submissionMetadataFormFields.tpl` — author-side submission form; classic `{fbvFormSection}` markup; temporal input id is `timePeriodsWithDatepicker`.
- `templates/submission/form/publicationTab.tpl` — editor-side publication workflow tab; newer `pkpFormField` / Vue-adjacent markup; temporal input id is `geoMetadata-temporal`.

Both share `js/submission.js`, which locates fields through the common selectors `input[name="datetimes"]`, `#mapdiv`, and `#administrativeUnitInput`. Changes to one form's fields usually need a mirror change in the other.

## Development Commands

### Dependency Management

```bash
# Install PHP and JavaScript dependencies
composer install

# Update dependencies
composer update
```

### Testing

```bash
# Install test dependencies
npm install

# Run Cypress tests interactively
npm run cy_open

# Run Cypress tests headlessly
npm run cy_run

# Start test environment with Docker
npm run test_compose
```

Cypress is the source of truth for regression coverage — self-bootstraps a fresh OJS (walks the web installer, creates users, submits articles), runs all specs in `cypress/e2e/integration/` in filename order, and is the only suite meant for CI. The fullscreen control (issue #61) is covered by `44-fullscreen.cy.js` (basic) and `52-fullscreen-locales.cy.js` (translations — depends on `50-locales.cy.js` having enabled the UI locales earlier in the run).

**Fixture articles** — the suite creates a deterministic set of submissions, each shaped to exercise a different branch of the plugin. Pick the one that matches the code path a new spec needs:

| Article | Spatial | Temporal | Admin unit | Exercises |
|---|---|---|---|---|
| Hanover is nice | LineString | 2022-01-01 … 12-31 | Germany (bbox + ISO codes) | Full happy path; every meta-tag family emits |
| Vancouver is cool | Point | 2021-01-01 … 12-31 | Earth (`bbox: not available`) | No-bbox branch; `DC.box` / `ISO 19139` not emitted |
| Timeless Isle | Polygon | — | Earth | Empty-`timePeriods` branch of `DC.SpatialCoverage` |
| Atlas of Saxony | — | — | Saxony (bbox only) | Centroid-from-admin-unit-bbox fallback for `ICBM` / `geo.position` |
| Wellington ferry across the dateline | MultiLineString (split) | 2023-01-01 … 12-31 | New Zealand (bbox east<west) | Antimeridian-crossing storage form; admin-unit overlay with crossing bbox |

**Tests must not recompute expected values.** When asserting on numeric metadata (centroids, bounding boxes, ISO codes, etc.) pin the expected value as a plain literal tied to a specific test record whose input data is fixed — do not port a mirror of the production algorithm into the spec. If you need deterministic numbers for an exact-value assertion, create or reuse a test record with known, fixed stored data (e.g. the spatial-free "Atlas of Saxony" record whose fallback ICBM is the exact centre of Saxony's GeoNames bbox), rather than deriving numbers from what the page renders. Reimplementing the computation makes the test a tautology; comparing against a known constant catches a regression.

**Keep source code comments short and factual.** Prefer no comment over a weak one; good naming carries more weight. When a comment is needed, state the fact or invariant — not the alternatives that were explored, the historical motivation, the issue/plan that led to the change, or which decision number in a plan doc it implements. Those belong in the commit message or PR description where they can be found by `git blame`, not in the code where they rot. **More than two lines of consecutive comment requires explicit developer confirmation** — if an explanation really needs a paragraph, raise it with the developer instead of checking it in unilaterally.

### Locale files (`.po` + `messages.mo`)

`locale/<lang>/locale.po` holds per-language translations for `en_US`, `de_DE`, `fr_FR`, and `es_ES`. **msgid order must be aligned across all four locales** — `50-locales.cy.js` enforces identical translated-message counts via `msgfmt --statistics`, but misaligned ordering is silent. When adding or removing a key, insert or remove it at the same relative position in every `.po` file.

`messages.mo` is a single compiled artifact at the repo root (not per-locale), built from `locale/fr_FR/locale.po`. Regenerate after any `.po` change:

```bash
msgfmt locale/fr_FR/locale.po -o messages.mo
```

### Ad-hoc headless-browser inspection (not a test suite)

For one-off poking at the *locally-installed* OJS (see the dev-server section below — `localhost:8330` backed by the `testData` dump), there is a small Playwright toolbox at `/home/daniel/git/KOMET/headless/`:

```bash
cd /home/daniel/git/KOMET/headless
node inspect.mjs http://localhost:8330/index.php/gmdj/article/view/20 --screenshot --html
node test-fullscreen.mjs                          # en_US
OJS_LOCALE=de_DE node test-fullscreen.mjs         # translations
```

Use this for reproducing visual bugs, grabbing screenshots, inspecting console/network on a live dev instance, or exercising the testData-seeded demo journal (which the cypress suite does not include). Do not treat it as a regression suite — it's not in CI, URLs/IDs are hard-coded to the testData dump, and it targets a different OJS install than cypress does. See `headless/README.md` for detailed limitations.

### Docker Testing Environment

```bash
# Start OJS with MySQL for testing (runs on port 8080)
export OJS_VERSION=3_3_0-11 && docker-compose --file cypress/docker-compose-mysql.yml down --volume && docker-compose --file cypress/docker-compose-mysql.yml up
```

### Running an OJS dev server from this host

The parent directory `/home/daniel/git/KOMET/` contains a `Makefile` and scaffolding for several ways to run OJS locally:

- `ojs-330/` — OJS 3.3.0-22 extracted from the pkp.sfu.ca tarball. The `geoMetadata` plugin is symlinked at `ojs-330/plugins/generic/geoMetadata → /home/daniel/git/KOMET/geoMetadata`, so edits in this repo are live on the local server. (`ojs-350/` is still empty.)
- `docker-mysql-databases/` — init scripts for the shared MySQL container. Currently empty; add a `.sql` file here if you want extra databases auto-created on first container start.
- `Makefile` targets (from `/home/daniel/git/KOMET/`):
  - `make mysql_create` — starts a shared MySQL 8 container named `ojs-dev-mysql` on **host port 3307** (user `ojs`/`ojs`, root `root`). Non-default port to avoid colliding with Daniel's local MySQL on 3306.
  - `make mysql_start` / `make mysql_stop` — restart the same container.
  - `make phpmyadmin` — runs phpMyAdmin on port 82, linked to the mysql container.
  - `make ojs_330` — `cd ojs-330 && php -S localhost:8330`. Reads `ojs-330/config.inc.php`, which must set `host = 127.0.0.1` / `port = 3307` (using `localhost` fails: PHP mysqli interprets it as a UNIX socket).
  - `link_plugin_folders version=330` — expects the OPTIMETA layout; for this project the symlink already exists.

To reload the plugin's `testData` dump into the dev DB:

```bash
# create the target DB (first time only) and grant it to the ojs user
docker exec -i ojs-dev-mysql mysql -uroot -proot -e \
  "CREATE DATABASE IF NOT EXISTS ojs_dump; GRANT ALL ON ojs_dump.* TO 'ojs'@'%'; FLUSH PRIVILEGES;"
# load the dump
docker exec -i ojs-dev-mysql mysql -uojs -pojs ojs_dump \
  < testData/stable-3_3_0-geoMetadata/mariadb/database.sql
# sync files + public into the OJS install
cp -r testData/stable-3_3_0-geoMetadata/mariadb/files   ../ojs-330/files
cp -r testData/stable-3_3_0-geoMetadata/mariadb/public/. ../ojs-330/public/
```

The seeded journal with spatial demo content is `gmdj`; a known-good article URL is <http://localhost:8330/index.php/gmdj/article/view/20>. Admin login is `admin`/`admin`.

### Local PHP dev with native MySQL (no docker)

When docker is broken or flaky, the plugin can also run against the host's native MySQL/MariaDB on the default port 3306 — no container involved. `ojs-330/config.inc.php` is currently configured for this path (database `ojs_geometadata_330`, user `ojs/ojs`), and `Makefile` targets `geometadata_330_*` automate the testData reload.

One-off root setup (MariaDB/MySQL root typically authenticates via unix_socket, so this runs from a plain `sudo mysql -uroot` session — no password needed):

```sql
CREATE USER IF NOT EXISTS 'ojs'@'localhost' IDENTIFIED BY 'ojs';
GRANT CREATE ON *.* TO 'ojs'@'localhost';
CREATE DATABASE IF NOT EXISTS ojs_geometadata_330
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON ojs_geometadata_330.* TO 'ojs'@'localhost';
FLUSH PRIVILEGES;
```

The `GRANT CREATE ON *.*` lets the Makefile target re-CREATE the DB after a drop without needing root again. Every subsequent operation — loading the dump, resetting the DB, opening a client — uses only `ojs/ojs`.

Once the grants are in place, from `/home/daniel/git/KOMET/`:

```bash
make geometadata_330_load_testdata         # loads testData SQL + syncs files/ + public/ + enables plugin locales
make geometadata_330_reset_db              # drops + recreates + reloads (clean slate)
make geometadata_330_enable_plugin_locales # idempotent; enables en_US + de_DE + fr_FR + es_ES + fr_CA at site and on journal `gmdj`
make geometadata_330_mysql_client          # interactive mysql client into the DB
make ojs_330                               # starts php -S localhost:8330
```

`geometadata_330_load_testdata` chains `geometadata_330_enable_plugin_locales` automatically so a fresh bring-up has every locale the plugin ships translations for (`en_US`, `de_DE`, `fr_FR`, `es_ES`) already enabled at both the site level and on the `gmdj` journal. Run the standalone target only if you clobbered the locale rows and need to restore them without a full reload.

### Test accounts (from the testData dump)

| User | Password | Roles on `gmdj` (journal_id 2) |
|---|---|---|
| `admin` | `admin` | Site admin + every journal role |
| `tobler` | `tobler` | Author, Reviewer |

Other users (rvaca, amwandenga, …) only have roles on journal_id 1 (`publicknowledge`) — use them only for cross-journal testing. For plugin work on the demo journal, `admin` covers the staff-side flow and `tobler` covers the author/reviewer-side flow.

Compared to the docker stack: **+** no docker daemon or iptables chain to worry about, **+** much faster startup (seconds vs ~30s), **+** plugin edits are live via the existing `ojs-330/plugins/generic/geoMetadata` symlink. **−** only one DB name (`ojs_geometadata_330`), so parallel variants need new targets; **−** native mysql/mariadb must be installed on the host (usually is on dev laptops).

Both configs (docker `ojs_dump` on 3307 and native `ojs_geometadata_330` on 3306) cannot be active against the same `ojs-330/config.inc.php` at once — switching between them means editing `host/port/name` in that file. The native config is the current default.

**Recommended path for this plugin**: the `cypress/docker-compose-mysql.yml` stack above is the path of least resistance — it bind-mounts `../` (this plugin's root) into the running OJS container at `/var/www/html/plugins/generic/geoMetadata`, so edits are live without any further wiring. OJS runs at http://localhost:8080 and the first run goes through the web installer (DB host `db`, user `ojs`, password `ojs`, database `ojs`, driver `mysqli` — values in `cypress/.env`). Default admin credentials after install are `admin`/`admin` (per the Makefile comment).

### Changelog (mandatory)

**Every user-visible change must be recorded in `CHANGELOG.md` in the same commit that introduces it.** Code changes without a corresponding changelog entry are incomplete — do not open a PR or ask the user to commit until the changelog is updated. The only exemptions are changes with zero user-visible effect: internal refactors, dev-tooling tweaks, CLAUDE.md edits, test-only changes that don't shift behaviour, comment/formatting changes.

The file follows [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/). The rules that matter:

- **Append to the `## [X.Y.Z.Z] - unreleased` section at the top.** If no unreleased section exists, create one for the next version. Do not edit past release sections — they are frozen history.
- **Group entries under the standard category headings**, in this order: `### Added`, `### Changed`, `### Deprecated`, `### Removed`, `### Fixed`, `### Security`. Omit categories that have no entries. Pick the category that matches the change's effect on users, not the implementation kind.
- **Fence every heading with blank lines on both sides** — a blank line before and after each `##` version heading and each `###` category heading, including between a heading and the first bullet underneath it.
- **Reverse chronological order between versions** (newest on top). Within a category, order is not strict — group related entries together.
- **One bullet per change, written for humans.** State what changed from the user's perspective, not the implementation. Link the tracking issue(s) as `[#NN](https://github.com/TIBHannover/geoMetadata/issues/NN)` whenever one exists — if a change has no issue, the entry still goes in without a link rather than being skipped.
- **Don't dump commit messages.** Multiple commits that together deliver one user-visible change get one entry. Internal churn (fix-up commits, rebases, merge commits) is invisible here.
- **On release**: rename `## [X.Y.Z.Z] - unreleased` to `## [X.Y.Z.Z] - YYYY-MM-DD` with the tag date, then open a fresh unreleased section above it for the next cycle.

### Release Process

1. Update version in `version.xml`
2. Run `composer update` and `composer install`
3. Finalise `CHANGELOG.md`: rename the `unreleased` section to `## [X.Y.Z.Z] - YYYY-MM-DD`
4. Create git tag: `git tag -a vX.X.X.X-beta -m "release vX.X.X.X-beta"`
5. Push tag: `git push origin tag vX.X.X.X-beta`
6. Create release archives excluding development files

## Plugin Integration

### OJS Integration Points

- Extends GenericPlugin for core OJS functionality
- Hooks into submission forms via `Templates::Submission::SubmissionMetadataForm::AdditionalMetadata`
- Displays on article pages via `Templates::Article::Details`
- Adds journal map route via custom handler

### Configuration Requirements

- GeoNames API username for administrative unit lookup
- Optional modification to OJS core `issue_toc.tpl` for issue maps
- Menu setup for journal map access

### File Structure for OJS Installation

Plugin should be installed in: `ojs/plugins/generic/geoMetadata/`

### Adding an admin-configurable feature toggle

Per-journal boolean settings follow a specific pattern designed to preserve behavior on upgrade:

1. Register the key in both `SettingsForm::$settings` and `SettingsForm::$booleanDefaultOnSettings`.
2. Read it at render time via `GeoMetadataPlugin::isFeatureEnabled($key)`. Null (never saved) is treated as on, so installs that predate the toggle see no visible change after the plugin is updated.
3. Gate the rendering block with `{if $...}` in the Smarty template, or early-return in the hook callback for fully-gated features.
4. Add a checkbox to the appropriate `{fbvFormArea}` in `templates/settings.tpl` plus a `<key>` / `<key>.description` msgid pair in all four `locale/*/locale.po` files.
5. Regenerate `messages.mo`.

### Adding a third-party service (privacy disclosure)

Every external service the plugin calls (tile providers, gazetteers, geocoders) needs a reader-visible privacy snippet that the settings page composes live based on which services are toggled on. To add a service:

1. Add the toggle via the admin-toggle pattern above.
2. Add a `<script type="text/plain" id="geoMetadata_privacySnippet_<service>">` block in `templates/settings.tpl` that emits `{translate key="plugins.generic.geoMetadata.privacy.snippet.<service>"}`.
3. Add an entry `['<checkboxId>', '<snippetId>']` to the `toggleables` array in the live-update `<script>` in the same file.
4. Add the `privacy.snippet.<service>` msgid to all four `.po` files.

Skipping step 3 leaves the live textarea out of sync with the stored state; skipping step 4 breaks the locale-count check.

## JavaScript Architecture

- `article_details.js`: Article view map functionality
- `submission.js`: Submission form integration
- `journal.js` and `issue.js`: Journal and issue map displays
- Uses Leaflet for all mapping functionality with additional plugins for drawing and geocoding