{*the main template is here extended*}

{*loading needed scripts from geoOJSPlugin.inc.php*}
<link rel="stylesheet" type="text/css" href="{$leafletCSS}">
<script src="{$leafletJS}" type="text/javascript"></script>
<link rel="stylesheet" type="text/css" href="{$leafletDrawCSS}">
<script src="{$leafletDrawJS}" type="text/javascript" defer></script>

<div style="clear:both;">
    {fbvFormSection title="plugins.generic.geoOJS.location.title" for="location" inline=true}
    {fbvElement type="text" multilingual=false name="location" id="location" value=$coverage maxlength="255" readonly=$readOnly required=false}
    {/fbvFormSection}
</div>

<div id="mapdiv" style="width: 600px; height: 400px; float: left;"></div>

{*main js script, needs to be loaded last*}
<script src="{$geoOJSScript}" type="text/javascript" defer></script>
