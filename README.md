<img src="logo.png" alt="Alt-Text" title="" />
<!---created here: https://www.freelogodesign.org/preview?lang=de&name=geoOJS%20OJS&logo=421f5b45-02da-4a66-90da-d213adc643b4--->

*A plugin for integrating geospatial data in OJS*

**Content**
* [Abstract](https://github.com/tnier01/geoOJS#abstract)
* [Download & Installation](https://github.com/tnier01/geoOJS#download--installation)
* [Specify geonames username ](https://github.com/tnier01/geoOJS#specify-geonames-username)  
* [Wiki](https://github.com/tnier01/geoOJS#wiki)  

# Abstract
*geoOJS* offers a novel way for authors to provide spatial properties of research works when submitting an article to a journal based on the open source software Open Journal Systems (OJS, https://pkp.sfu.ca/ojs/)

The plugin adds the functionality that during the submission process for submitting an article ("3. Enter Metadata"), the author has the possibility to specify the articles content in terms of geospatial metadata. 

<div style="text-align:center">
<img src="screenshots/SubmissionView.png" alt="Alt-Text" title="Screenshot of geoOJS: geospatial properties in the OJS submission process" width="50%" align="middle"/>

*Screenshot of geoOJS: geospatial properties in the OJS submission process*
</div>


Authors can either search for a location and accept the suggested bounding box or manually create one or more suitable geometric shape(s) on a map. If authors enter geometries, a gazetteer is used to suggest a matching administrative unit’s name to the author. This allows geoOJS to store geospatial data in two forms: as text, using the above administrative unit or standardised geographical norm data, and as geospatial coordinates in GeoJSON format. <br>
Thereby the coordinates are stored accurately, while at the same time a textual description is accessible and flexible for non-map-related usage. In addition to displaying geospatial information on maps, it is also added to the HTML source code of articles’ landing pages in a semantically meaningful way. <br> 
In the article view, the properties specified by the author are then displayed and are available for download as geoJSON. 

<div style="text-align:center">
<img src="screenshots/ArticleView.png" alt="Alt-Text" title="Screenshot of geoOJS: geospatial properties in the OJS article view" width="50%" align="middle"/>

*Screenshot of geoOJS: geospatial properties in the OJS article view*
</div>

# Download & Installation 
- download the plug-in here as ```geoOJS.zip```
- rename the unzipped folder ```geoOJS-master``` to ```geoOJS```
- insert the folder ```geoOJS``` in the path ```ojs/plugins/generic/``` in OJS 
- activate the plug-in geoOJS in the OJS plug-in settings 
- Specify your geonames username

# Specify geonames username 
- You have to specify your username for the geonames api, so that an alignment for the administrative units is possible. 
- Create a account on https://www.geonames.org/login 
- Enter the username in the geoOJS plug-in settings (OJS -> Settings -> Website -> Plugins -> Installed Plugins -> geoOJS -> blue arrow -> Settings)!

<div style="text-align:center">
<img src="screenshots/PluginSettings.png" alt="Alt-Text" title="Screenshot of geoOJS: plug-in settings" width="50%" align="middle"/>

*Screenshot of geoOJS: plug-in settings*
</div>


# Wiki 
Further information you find in the Wiki.

**Wiki Content**
* [geoJSON-Specification](https://github.com/tnier01/geoOJS/wiki/geoJSON-Specification)
* [Enable CDN](https://github.com/tnier01/geoOJS/wiki/Enable-CDN)


