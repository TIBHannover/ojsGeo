[![OPTIMETA Logo](https://projects.tib.eu/fileadmin/_processed_/e/8/csm_Optimeta_Logo_web_98c26141b1.png)](https://projects.tib.eu/optimeta/en/)

# OPTIMETA geo plugin

[![Project Status: WIP – Initial development is in progress, but there has not yet been a stable, usable release suitable for the public.](https://www.repostatus.org/badges/latest/wip.svg)](https://www.repostatus.org/#wip)

The OPTIMETA geo plugin offers a novel way to capture and provide geospatial properties of research articles in [Open Journal Systems](https://pkp.sfu.ca/ojs/) (OJS).
It is developed as part of the BMBF-funded project [OPTIMETA](https://projects.tib.eu/optimeta/en/).
A first prototype was developed under the name *geoOJS* by Tom Niers for the BSc. thesis [Geospatial Metadata for Discovery in Scholarly Publishing](http://nbn-resolving.de/urn:nbn:de:hbz:6-69029469735); the work was [presented at The Munin Conference on Scholarly Publishing, 2020](https://doi.org/10.7557/5.5590), see [recording](https://youtu.be/-Lc9AjHq_AY).

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

1. Download the plugin [here](https://github.com/TIBHannover/optimetaGeo/) and unzip the folder into `ojs/plugins/generic/optimetaGeo` in OJS
1. Go to the directory `js/lib` and run `php -f downloadJavascriptLibraries.php` to download required JS libs
1. Activate the plugin in the OJS plug-in settings
1. Specify your GeoNames username

   You have to specify your username for the GeoNames api, so that an alignment for the administrative units is possible.

   1. Create an account on <https://www.geonames.org/login>
   1. Enter the username in the settings (OJS > Settings > Website > Plugins > Installed Plugins > OPTIMETA geo plugin > blue arrow > Settings)

Further information is available in the [wiki](https://github.com/tnier01/geoOJS/wiki).

# Contribute

All help is welcome: asking questions, providing documentation, testing, or even development.

Please note that this project is released with a [Contributor Code of Conduct](CONDUCT.md).
By participating in this project you agree to abide by its terms.

# Notes about accuracy

- accuracy +/- 2 m (via https://twitter.com/nyalldawson/status/1393050257554956289?s=09) is sufficient for discovery

# Testing

## Running Cypress

```bash
# see also Cypress' system dependencies at https://docs.cypress.io/guides/getting-started/installing-cypress#Advanced-Installation
npm install

npx cypress open

# start compose configuration for desired OJS version, which run on ports 9xxx where "xxx" is the version string of OJS, e.g., 9330
docker-compose --file cypress/docker-compose-mysql.yml down --volume && OJS_VERSION=3_3_0-11 docker-compose --file cypress/docker-compose-mysql.yml up

# open/run Cypress tests with a given OJS version
npm run cy_open
npm run cy_run
```

## Writing tests

1. Start docker-compose configuration (see above)
1. Start Cypress (see above)
1. Write tests, run them in Cypress
1. If you need a clean start (= empty database) for a test, stop the docker-compose configuration, delete it ('down --volume') and restart it

## Running CI action locally

You can use [`act`](https://github.com/nektos/act) to run the tests as if they were running as a GitHub action.

```bash
# curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash 
# https://lindevs.com/install-act-on-ubuntu/

# list actions
act -l

# use 'medium' image when asked, and override used image - see https://github.com/shivammathur/setup-php#local-testing-setup
act -P ubuntu-latest=shivammathur/node:latest
```

# License

This project is published under GNU General Public License, Version 3.
