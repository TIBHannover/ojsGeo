
{* Das eigentliche Template wird um das was hier geschrieben wird erweitert *}

{*
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css"
        integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
        crossorigin="" />

    <!-- Make sure you put this AFTER Leaflet's CSS -->
    <script src="https://unpkg.com/leaflet@1.6.0/dist/leaflet.js"
        integrity="sha512-gZwIG9x3wUXg2hdXF6+rVkLF/0Vi9U8D2Ntg4Ga5I5BZpVkVxlJWbSQtXPSiUTtC0TjtGOmxa1AJPuV0CPthew=="
        crossorigin=""></script>*}

<link rel="stylesheet" type="text/css" href="{$leafletCSS}">
<script src="{$leafletJS}" type="text/javascript"></script>

<div style="clear:both;">
    {fbvFormSection title="plugins.generic.geoOJS.location.title" for="location" inline=true}
    {fbvElement type="text" multilingual=false name="location" id="location" value=$coverage maxlength="255" readonly=$readOnly required=false}
    {/fbvFormSection}
</div>

<div id="mapdiv" style="width: 600px; height: 400px; float: left;"></div>
<script src="{$geoOJSScript}" type="text/javascript" defer></script>
