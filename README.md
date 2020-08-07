<img src="logo.png" alt="Alt-Text" title="" />
<!---created here: https://www.freelogodesign.org/preview?lang=de&name=geoOJS%20OJS&logo=421f5b45-02da-4a66-90da-d213adc643b4--->
work in progress - A plugin for integrating geospatial data in OJS. 

If you want to use the setting "enable_cdn = Off" in the OJS config.inc.php you need to download the following files and create these folders in the plug-ins main path: 

"enable_cdn_Off/daterangepicker/": 
- https://cdn.jsdelivr.net/momentjs/latest/moment.min.js
- https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.min.js
- https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.css

"enable_cdn_Off/leaflet/":
Download all the files and folders of dist (https://www.jsdelivr.com/package/npm/leaflet?path=dist) into this path

"enable_cdn_Off/leaflet-draw/":
Download all the files and folders of dist (https://www.jsdelivr.com/package/npm/leaflet?path=dist) into this path

"enable_cdn_Off/leaflet-control-geocoder/":
Download all the files and folders (https://www.jsdelivr.com/package/npm/leaflet-control-geocoder) into this path 
