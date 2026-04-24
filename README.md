<div>
<a href="https://projects.tib.eu/komet/en/">
<img src="https://projects.tib.eu/fileadmin/data/komet/img/Logo_Komet_RZ.png" alt="Alt-Text" title="KOMET Logo" width="20%" align="middle">
</a>
</div>

# geoMetadata Plugin

[![Project Status: WIP – Initial development is in progress, but there has not yet been a stable, usable release suitable for the public.](https://www.repostatus.org/badges/latest/wip.svg)](https://www.repostatus.org/#wip) [![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.8198983.svg)](https://doi.org/10.5281/zenodo.8198983)

The geoMetadata Plugin (formerly known as OJS Geo Plugin or OPTIMETA Geo Plugin) offers a novel way to capture and provide geospatial properties of research articles in [Open Journal Systems (OJS)](https://pkp.sfu.ca/ojs/).
It is developed as part of the BMFTR-funded projects [OPTIMETA](https://projects.tib.eu/optimeta/en/) and [KOMET](https://projects.tib.eu/komet/en/).

The KOMET team develops further plugins like the [citationManager](https://github.com/TIBHannover/citationManager) and [pidManager](https://github.com/TIBHannover/pidManager).
Visit the [KOMET project website](https://projects.tib.eu/komet/output/) for a full overview of the project output.

## Functionality

Authors can either search for a location and accept the suggested bounding box or manually create one or more suitable geometric shape(s) on a map.
If authors enter geometries, a gazetteer is used to suggest a matching administrative unit’s name to the author.
This allows the plugin to store geospatial data in two forms: as text, using an administrative unit or standardised geographical norm data, and as geospatial coordinates in GeoJSON format.
Thereby the coordinates are stored accurately, while at the same time a textual description is accessible and flexible for non-map-related usage.
Authors can also choose to specify the temporal range within which the research was conducted.
In the article view, the properties specified by the author are then displayed and available for download as geoJSON.
In addition, the information is also added to the HTML source code of article’s landing pages in a semantically meaningful way.

<div style="text-align:center">
<img src="docs/screenshots/SubmissionView.png" alt="Alt-Text" title="Screenshot of entering geospatial properties in the OJS submission process" width="50%" align="middle"/>
<br/>
<em>Screenshot of entering geospatial properties in the OJS submission process</em>
</div>

<div style="text-align:center">
<img src="docs/screenshots/ArticleView.png" alt="screenshot of geo plugin" title="Screenshot of geospatial properties in the OJS article view" width="50%" align="middle"/>
<br/>
<em>Screenshot of geospatial properties in the OJS article view</em>
</div>

## Publications

A first prototype of the geoMetadata Plugin was developed under the name *geoOJS* by Tom Niers for the BSc. thesis [Geospatial Metadata for Discovery in Scholarly Publishing](http://nbn-resolving.de/urn:nbn:de:hbz:6-69029469735); the work was [presented at The Munin Conference on Scholarly Publishing, 2020](https://doi.org/10.7557/5.5590), see [recording](https://youtu.be/-Lc9AjHq_AY).

## Download & Installation

You can download OJS via the [PKP Software Download Section](https://pkp.sfu.ca/software/ojs/download/).
A detailed [GetStarted Guide](GetStarted.md) for installing OJS is available.

### From Source

Once OJS has been installed, the plugin must be downloaded and installed.

1. Clone [the code repository](https://github.com/TIBHannover/geoMetadata/) and save the contents into the directory `ojs/plugins/generic/geoMetadata` in your OJS installation.
1. Checkout the desired OJS version of the geoMetadata code repository by selecting the corresponding branch e.g. `stable-3_3_0`.
1. Run `composer install` in `ojs/plugins/generic/geoMetadata` to download JavaScript dependencies for the plugin using [Asset Packagist](https://asset-packagist.org/site/about).
1. Activate the plugin in the OJS plugin settings (OJS > Dashboard > Website > Plugins > Installed Plugins) and continue with [Configuration](#configuration).

### Via Release

See releases at <https://github.com/TIBHannover/geoMetadata/releases>.
In the GitHub Release View you will find 4 archives in the assets of the corresponding release:

- The `geoMetadata.tar.gz` and `geoMetadata.zip` archive contain the plugin's source code, along with the necessary JavaScript dependencies. No further installation via composer is required, the plugin is ready to use.
- `Source code (zip)` and `Source code (tar.gz)` contain only the plugin source code. Further installation via composer is required (See [Step 3. From Source](#from-source)).

We recommend downloading either the `geoMetadata.tar.gz` or the `geoMetadata.zip` archive, which include the JavaScript dependencies. The following guidelines will guide you through the installation process using these archives. There are two options available:

#### Installation via Upload

1. Download as `zip`-archive or `tar.gz`-archive. Renaming is not required.
1. Use the button `Upload a New Plugin` in the OJS plugin settings (OJS > Dashboard > Website > Plugins > Installed Plugins).
1. Select the `zip`-archive or `tar.gz`-archive for upload and click the `Save`-button.
1. Activate the plugin in the OJS plugin settings (OJS > Dashboard > Website > Plugins > Installed Plugins) and continue with [Configuration](#configuration).

##### Troubleshooting Installation via Uploading a Release

- The upload limit in OJS is 2 MB by default. To upload the geoMetadata plugin, you need to increase this limit in the used `php.ini`-file.
   - If you do not know where the `php.ini` file is located, you can find it by creating an `info.php`-file in your server folder containing the following content: `echo "<?php phpinfo();" >`
      - Open the `info.php`-file in a browser to check the location (property: `Loaded Configuration File`) of the `php.ini`-file.
   - The following properties need to be adapted:
      - `post_max_size = 100M`
      - `upload_max_filesize = 100M`
   - To apply the changes in the `php.ini`-file, a restart of Apache and OJS is required.
- If you want to upload the plugin as `tar.gz`-archive you need to define the `tar`-path in the OJS configuration file (`config.inc.php`).
   - code sequence in the `config.inc.php`:
      ```bash
      ; tar (used in backup plugin, translation packaging)
      tar = /bin/tar
      ```
   - If you are not aware of the `tar`-path on your system you can find it out by using the following command in the terminal: `which tar`.

#### Installation via Drag and Drop

1. Download as `zip`-archive or `tar.gz`-archive and uncompress it.
1. Save the contents into the directory `ojs/plugins/generic/geoMetadata` in your OJS installation.
   - It is important to store the content in the directory `ojs/plugins/generic/geoMetadata` and not in a directory including the tag e.g. `ojs/plugins/generic/geoMetadata-1.0.0.0-beta`.
1. Activate the plugin in the OJS plugin settings (OJS > Dashboard > Website > Plugins > Installed Plugins) and continue with [Configuration](#configuration).

## Configuration

### 1. Configure **GeoNames**

You have to specify your username for the GeoNames API, so that an alignment for the administrative units is possible.

1. Create an account on <https://www.geonames.org/login> and enable it by clicking the activiation link you receive via email.
1. Go to <https://www.geonames.org/manageaccount> and enable your account for free web services.
1. Enter the username and the GeoNames BaseURL in the settings (OJS > Dashboard > Website > Plugins > Installed Plugins > geoMetadata > blue arrow > Settings).

### 2. Configure **Issue TOC**

The plugin displays geospatial information for each article included in an issue on a map on the issue page.
To enable this feature, you need to change a line of code in the main OJS code.

You need to add the following line of code to the [issue_toc.tpl](https://github.com/pkp/ojs/blob/bad437e0ef240afb2370c0548e55fb18716fd278/templates/frontend/objects/issue_toc.tpl) in [line 130](https://github.com/pkp/ojs/blob/bad437e0ef240afb2370c0548e55fb18716fd278/templates/frontend/objects/issue_toc.tpl#L130):

```php
{call_hook name="Templates::Issue::TOC::Main"}
```

With your adaptations, this section of the file should look like this:

```php
{/foreach}                                     # line 129
{call_hook name="Templates::Issue::TOC::Main"} # line 130
</div><!-- .sections -->                       # line 131
```

### 3. Configure Journal Map

The plugin displays geospatial information for each article included in a journal on a map.
This map is available via the URL `<journal URL>/map`, e.g., `https://example-publisher.org/index.php/exampleJournal/map`.

This map is always available via the URL, but you can carry out the following steps to make it accessible to users with a button in the _Primary Navigation Menu_.

1. Enter the corresponding menu (OJS > Dashboard > Website > Setup > Navigation).
1. Add the Navigation Menu Item _Map_.
   1. _Add Item_
   1. Title: _Map_
   1. Navigation Menu Type: _Remote URL_
   1. URL: _journalURL/map_
1. Add Navigation Menu Item _Map_ to _Primary Navigation Menu_.
   - If the _Primary Navigation Menu_ is available.
      1. _Blue Arrow_ next to _Primary Navigation Menu_
      1. _Edit_
      1. Place the Menu Item _Map_ at the place where the user should find it. You can move the item _Map_ from the _Unassigned Menu Items_ to the _Assigned Menu Items_.
   - If the _Primary Navigation Menu_ is not available you have to create it.
      1. _Add Menu_
      1. Title: _Primary Navigation Menu_
      1. Active Theme Navigation Areas: _primary_
      1. Place all items the user should find in the menu including the item _Map_. You can move the items from the _Unassigned Menu Items_ to the _Assigned Menu Items_.

Further information on the geoJSON specification is available via a [wiki](https://github.com/tomniers/geoOJS/wiki/geoJSON-Specification).

## Contribute

All help is welcome: asking questions, providing documentation, testing, or even development.

Please note that this project is released with a [Contributor Code of Conduct](CONDUCT.md).
By participating in this project you agree to abide by its terms.

## External library translations

User-facing strings from the bundled Leaflet libraries are localized by the plugin at runtime:

- **Leaflet core** — zoom-button tooltips are localized by disabling the default `zoomControl` and adding a new `L.control.zoom({ zoomInTitle, zoomOutTitle })` with values from the plugin's locale files.
- **leaflet-control-geocoder** — `placeholder`, `errorMessage`, and `iconLabel` are passed as options to `L.Control.geocoder({ ... })` in `js/article_details.js` and `js/submission.js`.
- **Leaflet.Draw** — the toolbar/tooltip object `L.drawLocal` is deep-merged with the plugin's translated version (`$.extend(true, L.drawLocal, geoMetadata_drawLocal)`) in `js/submission.js` just before the draw control is instantiated.

All strings are defined as `plugins.generic.geoMetadata.map.*` keys in `locale/<locale>/locale.po` and rendered into JS globals by the shared Smarty partial `templates/frontend/_map_js_globals.tpl`, which is `{include}`d from every template that renders a map. If Leaflet.Draw or the geocoder are ever upgraded, verify that the object shape used by `geoMetadata_drawLocal` / the geocoder option names still match the upstream library — missing keys silently fall back to the library's English defaults.

## Notes About Accuracy

The spatial metadata is saved in GeoJSON format using the EPSG:4326 coordinate reference system (CRS) and the underlying dynamic WGS84 datum.
This means that even the same coordinates can point to different locations on Earth over time, as the so called "epoch" is not saved.
However, this only leads to an uncertainty of about +/- 2 m, which is generally _no problem at all_ for the use case of global dataset discovery.

The `ICBM` and `geo.position` meta tags (see below) are emitted with **5 decimal places** (~1.1 m at the equator).
This is deliberately coarser than the input geometry: a single representative point should not suggest more certainty than is warranted for post-hoc curated metadata, and research locations can be sensitive (endangered species habitats, protected field sites).
If you need higher precision, parse the `DC.SpatialCoverage` GeoJSON directly.

## Emitted HTML meta tags

For every article page with spatio-temporal metadata the plugin injects the following tags into `<head>`, alongside the standard OJS Dublin Core set.
They are intended to be consumed by academic search engines, discovery services, and generic crawlers.

| Tag | Source | Purpose |
|---|---|---|
| `DC.SpatialCoverage` | full stored GeoJSON FeatureCollection | machine-readable spatial coverage |
| `DC.box` | bbox of the most specific admin unit | [DCMI Box](https://www.dublincore.org/specifications/dublin-core/dcmi-box/) encoding |
| `ISO 19139` | bbox of the most specific admin unit | `gmd:EX_GeographicBoundingBox` fragment |
| `geo.placename` | name of the most specific admin unit | human-readable place name |
| `geo.region` | ISO 3166-1 + ISO 3166-2 of the most specific admin unit (e.g. `DE-SN`) | discovery by country / subdivision |
| `ICBM` | centroid of combined GeoJSON geometry (fallback: admin-unit bbox centroid) | [ICBM address](https://en.wikipedia.org/wiki/ICBM_address) convention, 5-decimal precision |
| `geo.position` | same centroid as `ICBM` | widely used `lat;lon` convention, 5-decimal precision |
| `DC.temporal` / `DC.PeriodOfTime` | stored temporal range | ISO 8601 interval |

The centroid for `ICBM` / `geo.position` is computed server-side either via `ST_Centroid(ST_Envelope(...))` on the OJS database (using [brick/geo](https://github.com/brick/geo) against MariaDB/MySQL) or, if the database engine cannot satisfy the query, via a pure-PHP bounding-box midpoint — both paths produce the same number.
Immediately before the tags the plugin writes an HTML comment documenting which source was used for the point (`<!-- geoMetadata: next meta tags based on combined centroid of N feature(s) -->` or `... admin unit bbox ("NAME") -->`) so readers of the page source can trace the provenance.

The ISO 3166 codes backing `geo.region` are captured at submission time from the GeoNames API (`hierarchyJSON` for ISO 3166-1, `countrySubdivisionJSON?type=ISO3166-2` for ISO 3166-2).
Articles submitted before this feature shipped carry no codes and therefore omit the `geo.region` tag until the author edits and re-saves the publication metadata.

## Testing

Tests are run with [Cypress](https://www.cypress.io/), for which dependencies are installed with npm using the `package.json`.

### Running Cypress Locally

```bash
# see also Cypress' system dependencies at https://docs.cypress.io/guides/getting-started/installing-cypress#Advanced-Installation
npm install

npx cypress open

# start compose configuration for desired OJS version, running on port 8080; OJS_VERSION is a image tag for pkpofficial/ojs
export OJS_VERSION=3_3_0-11 && docker-compose --file cypress/docker-compose-mysql.yml down --volume && docker-compose --file cypress/docker-compose-mysql.yml up
export OJS_VERSION=3_2_1-4 && docker-compose --file cypress/docker-compose-mysql.yml down --volume && docker-compose --file cypress/docker-compose-mysql.yml up

# open/run Cypress tests with a given OJS version
npm run cy_open
npm run cy_run
```

To debug, add `debugger;` to the code and make sure to have the developer tools open in the browser windows started by Cypress.

### Writing Tests

1. Start docker-compose configuration (see above)
1. Start Cypress (see above)
1. Write tests, run them in Cypress
1. If you need a clean start (= empty database) for a test, stop the docker-compose configuration, delete it (`down --volume`) and restart it

## Create a Release

1. Run `composer update` and `composer install`
1. Update the releaseVersion in the `version.xml` e.g. `<release>1.0.1.0-beta</release>`
   - Create a corresponding commit and push it to GitHub
1. Add a git tag and push it to GitHub
   - `git tag -a vReleaseVersion -m "release vReleaseVersion"` e.g. `git tag -a v1.0.1.0-beta -m "release v1.0.1.0-beta"`
      - The tag is now connected to the beforehand pushed commit with the changed `version.xml`
   - `git push origin tag vReleaseVersion` e.g. `git push origin tag v1.0.1.0-beta`
1. Create a `zip` and `tar.gz` archive of the local repository including the required dependencies from `vendor/` and `js/lib/` but excluding exclude non-essential files.
   - `zip`-archive
      ```bash
      zip -r geoMetadata.zip geoMetadata --exclude '*.git*' --exclude '*.github/*' --exclude 'node_modules/*' --exclude '*cypress/*' --exclude '*.gitignore*' --exclude '*.npmignore*' --exclude '*messages.mo*' --exclude '*cypress.config.js*' --exclude '*CONDUCT.md*' --exclude '*docs/*' --exclude '*testData/*'
      ```
   - `tar.gz`-archive
      ```bash
      tar -czf geoMetadata.tar.gz \
          --exclude='*.git*' \
          --exclude='*.github/*' \
          --exclude='node_modules/*' \
          --exclude='*cypress/*' \
          --exclude='*.gitignore*' \
          --exclude='*.npmignore*' \
          --exclude='*messages.mo*' \
          --exclude='*cypress.config.js*' \
          --exclude='*CONDUCT.md*' \
          --exclude='*docs/*' \
          --exclude='*testData/*' \
         geoMetadata
      ```
1. Create a new [release](https://github.com/TIBHannover/geoMetadata/releases) on GitHub using the tag just created, with a fitting title, description and, if necessary, check the `pre-release` box
1. Upload the both archives as binaries to the release on GitHub
1. Publish release

Later release workflows will include usage of the PKP CLI tool, see <https://docs.pkp.sfu.ca/dev/plugin-guide/en/release>.

## License

This project is published under GNU General Public License, Version 3.
