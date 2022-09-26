[![OPTIMETA Logo](https://projects.tib.eu/fileadmin/_processed_/e/8/csm_Optimeta_Logo_web_98c26141b1.png)](https://projects.tib.eu/optimeta/en/)

# OPTIMETA Geoplugin

[![Project Status: WIP – Initial development is in progress, but there has not yet been a stable, usable release suitable for the public.](https://www.repostatus.org/badges/latest/wip.svg)](https://www.repostatus.org/#wip)

The OPTIMETA geo plugin offers a novel way to capture and provide geospatial properties of research articles in [Open Journal Systems](https://pkp.sfu.ca/ojs/) (OJS).
It is developed as part of the BMBF-funded project [OPTIMETA](https://projects.tib.eu/optimeta/en/).
The OPTIMETA team also develops the [OPTIMETA Citations Plugin](https://github.com/TIBHannover/optimetaCitations) for capturing articles' citation information and contributing these to the metadata commons.

A first prototype of the Geoplugin was developed under the name *geoOJS* by Tom Niers for the BSc. thesis [Geospatial Metadata for Discovery in Scholarly Publishing](http://nbn-resolving.de/urn:nbn:de:hbz:6-69029469735); the work was [presented at The Munin Conference on Scholarly Publishing, 2020](https://doi.org/10.7557/5.5590), see [recording](https://youtu.be/-Lc9AjHq_AY).

<div style="text-align:center">
<img src="screenshots/SubmissionView.png" alt="Alt-Text" title="Screenshot of entering geospatial properties in the OJS submission process" width="50%" align="middle"/>
<br/>
<em>Screenshot of entering geospatial properties in the OJS submission process</em>
</div>

Authors can either search for a location and accept the suggested bounding box or manually create one or more suitable geometric shape(s) on a map.
If authors enter geometries, a gazetteer is used to suggest a matching administrative unit’s name to the author.
This allows the plugin to store geospatial data in two forms: as text, using an administrative unit or standardised geographical norm data, and as geospatial coordinates in GeoJSON format.
Thereby the coordinates are stored accurately, while at the same time a textual description is accessible and flexible for non-map-related usage.
In addition to displaying geospatial information on maps, it is also added to the HTML source code of article’s landing pages in a semantically meaningful way.
In the article view, the properties specified by the author are then displayed and available for download as geoJSON.

<div style="text-align:center">
<img src="screenshots/ArticleView.png" alt="screenshot of geo plugin" title="Screenshot of geospatial properties in the OJS article view" width="50%" align="middle"/>
<br/>
<em>Screenshot of geospatial properties in the OJS article view</em>
</div>

# Download & Installation

## Release

See releases at <https://github.com/TIBHannover/optimetaGeo/releases>.
The release bundles contain plugin source code as well as the the required JavaScript dependencies so the plugin is ready to be used.
Note that you need the OPTIMETA geo plugin theme for some of the frontend displays, see <https://github.com/ifgi/optimetaGeoTheme>.

## From source

1. Checkout the desired version from [the code repository](https://github.com/TIBHannover/optimetaGeo/) and save the contents into `ojs/plugins/generic/optimetaGeo` in your OJS installation
1. Run `composer install` to download JavaScript dependencies for the plugin using [Asset Packagist](https://asset-packagist.org/site/about)
   Go to `js/lib/leaflet-control-geocoder` and run `npm install` (see [this issue](https://github.com/perliedman/leaflet-control-geocoder/issues/310))
1. Activate the plugin in the OJS plug-in settings
1. Install and activate the OJS Geoplugin Theme: <https://github.com/ifgi/optimetaGeoTheme/releases>

# Configuration

1. Configure **GeoNames**

   You have to specify your username for the GeoNames api, so that an alignment for the administrative units is possible.

   1. Create an account on <https://www.geonames.org/login>
   1. Enter the username in the settings (OJS > Settings > Website > Plugins > Installed Plugins > OPTIMETA geo plugin > blue arrow > Settings)
1. Configure **theme**

   Set the name of your used theme.

Further information is available in the [wiki](https://github.com/tnier01/geoOJS/wiki).

# Contribute

All help is welcome: asking questions, providing documentation, testing, or even development.

Please note that this project is released with a [Contributor Code of Conduct](CONDUCT.md).
By participating in this project you agree to abide by its terms.

# Notes about accuracy

The spatial metadata is saved in GeoJSON format using the [EPSG:4326 coordinate reference system]() (CRS) and the underlying [dynamic WGS84 datum]().
This means that even the same coordinates can point to different locations on Earth over time, as the so called "epoch" is not saved.
However, this only leads to an uncertainty of about +/- 2 m, which is generally _no problem at all_ for the use case of global dataset discovery.
For a nice explainer on this (non) issue see [this informative thread on Twitter by Nyall Dawson](https://twitter.com/nyalldawson/status/1393050257554956289?s=09).

# Testing

Tests are run with [Cypress](https://www.cypress.io/), for which dependencies are installed with npm using the `package.json`.

## Running Cypress locally

```bash
# see also Cypress' system dependencies at https://docs.cypress.io/guides/getting-started/installing-cypress#Advanced-Installation
npm install

npx cypress open

# start compose configuration for desired OJS version, running on port 8080; OJS_VERSION is a image tag for pkpofficial/ojs
export OJS_VERSION=3_3_0-11 &&     docker-compose --file cypress/docker-compose-mysql.yml down --volume && docker-compose --file cypress/docker-compose-mysql.yml up
export OJS_VERSION=3_2_1-4 && docker-compose --file cypress/docker-compose-mysql.yml down --volume && docker-compose --file cypress/docker-compose-mysql.yml up

# open/run Cypress tests with a given OJS version
npm run cy_open
npm run cy_run
```

To debug, add `debugger;` to the code and make sure to have the developer tools open in the browser windows started by Cypress.

## Writing tests

1. Start docker-compose configuration (see above)
1. Start Cypress (see above)
1. Write tests, run them in Cypress
1. If you need a clean start (= empty database) for a test, stop the docker-compose configuration, delete it (`down --volume`) and restart it

# Create a release

1. Run `composer update` and `composer install`
1. Update the release version in `version.xml`
1. Add a git tag and push it to GitHub
1. Create a zip archive of the local files with the following command to include the required dependencies from `vendor/` and `js/lib/` but to exclude non-essential files:

   ```bash
   rm optimetaGeo.zip && zip -r optimetaGeo.zip ./ --exclude '*.git*' --exclude '*.github/*' --exclude 'node_modules/*' --exclude '*cypress/*' --exclude '*.gitignore*' --exclude '*.npmignore*' --exclude '*messages.mo*' --exclude '*cypress.config.js*' --exclude '*CONDUCT.md*' --exclude '*screenshots/*'
   ```

1. Upload the archive to the release on GitHub

Later release workflows will include usage of the PKP CLI tool, see <https://docs.pkp.sfu.ca/dev/plugin-guide/en/release>.

# License

This project is published under GNU General Public License, Version 3.
