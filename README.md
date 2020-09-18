<img src="logo.png" alt="Alt-Text" title="" />
<!---created here: https://www.freelogodesign.org/preview?lang=de&name=geoOJS%20OJS&logo=421f5b45-02da-4a66-90da-d213adc643b4--->

A plugin for integrating geospatial data in OJS 

# Abstract
*geoOJS* offers a novel way for authors to provide spatial properties of research works when submitting an article to a journal based on the open source software Open Journal Systems (OJS, https://pkp.sfu.ca/ojs/)

The plugin adds the functionality that during the submission process for submitting an article ("3. Enter Metadata"), the author has the possibility to specify the articles content in terms of geospatial metadata. 

Authors can either search for a location and accept the suggested bounding box or manually create one or more suitable geometric shape(s) on a map. If authors enter geometries, a gazetteer is used to suggest a matching administrative unit’s name to the author. This allows geoOJS to store geospatial data in two forms: as text, using the above administrative unit or standardised geographical norm data, and as geospatial coordinates in GeoJSON format. <br>
Thereby the coordinates are stored accurately, while at the same time a textual description is accessible and flexible for non-map-related usage. In addition to displaying geospatial information on maps, it is also added to the HTML source code of articles’ landing pages in a semantically meaningful way. <br> 
In the article view, the properties specified by the author are then displayed and are available for download as geoJSON. 

# Specify geonames username 
- You have to specify your username for the geonames api, so that an alignment for the administrative units is possible. 
- create a account on https://www.geonames.org/login and insert it in line 6 of ```geoOJS/js/submissionMetadataFormFields.js``` 
- ```var usernameGeonames = 'yourUsername';```

# Download & Installation 
- download the plug-in here as ```geoOJS.zip```
- insert the unzipped file ```geoOJS``` in the path ```ojs/plugins/generic/``` in OJS 
- activate the plug-in geoOJS in the OJS plug-in settings 

# Enable CDN
If you want to use the setting "enable_cdn = Off" in the OJS config.inc.php you need to download the following files and create these folders in the plug-ins main path: 

```"enable_cdn_Off/daterangepicker/"```: 
- https://cdn.jsdelivr.net/momentjs/latest/moment.min.js
- https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.min.js
- https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.css

```"enable_cdn_Off/leaflet/"```:
- Download all the files and folders of dist (https://www.jsdelivr.com/package/npm/leaflet?path=dist) into this path

```"enable_cdn_Off/leaflet-draw/"```:
- Download all the files and folders of dist (https://www.jsdelivr.com/package/npm/leaflet?path=dist) into this path

```"enable_cdn_Off/leaflet-control-geocoder/"```:
- Download all the files and folders (https://www.jsdelivr.com/package/npm/leaflet-control-geocoder) into this path 
