[![OPTIMETA Logo](https://projects.tib.eu/fileadmin/_processed_/e/8/csm_Optimeta_Logo_web_98c26141b1.png)](https://projects.tib.eu/optimeta/en/)


# OPTIMETA geo plugin

The OPTIMETA geo plugin offers a novel way to capture and provide geospatial properties of research articles in [Open Journal Systems](https://pkp.sfu.ca/ojs/) (OJS).
It is developed as part of the BMBF-funded project [OPTIMETA](https://projects.tib.eu/optimeta/en/).
A first prototype was developed under the name *geoOJS* by Tom Niers for the BSc. thesis [Geospatial Metadata for Discovery in Scholarly Publishing](http://nbn-resolving.de/urn:nbn:de:hbz:6-69029469735).

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

# Installation

1. Download the plugin [here]() and unzip the folder into `ojs/plugins/generic/optimeta-geoplugin` in OJS
2. Activate the plugin in the OJS plug-in settings
3. Specify your GeoNames username

   You have to specify your username for the GeoNames api, so that an alignment for the administrative units is possible.

   1. Create an account on https://www.geonames.org/login
   1. Enter the username in the settings (OJS > Settings > Website > Plugins > Installed Plugins > OPTIMETA geo plugin > blue arrow > Settings)

Further information is available in the [siki](https://github.com/tnier01/geoOJS/wiki).

# Contribute

All help is welcome: asking questions, providing documentation, testing, or even development.

Please note that this project is released with a [Contributor Code of Conduct](CONDUCT.md).
By participating in this project you agree to abide by its terms.

# Notes about accuracy

- accuracy +/- 2 m (via https://twitter.com/nyalldawson/status/1393050257554956289?s=09) is sufficient for discovery

# License

This project is published under GNU General Public License, Version 3.
