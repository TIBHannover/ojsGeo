{*the main template is here extended*}

<div style="clear:both;">
    {fbvFormArea id="tagitFields" title="plugins.generic.geoOJS.geospatialmetadata"}
    <p class="description">{translate key="plugins.generic.geoOJS.geospatialmetadata.description"}</p>

    {*temporal*}
    {fbvFormSection title="plugins.generic.geoOJS.geospatialmetadata" for="period" inline=true}
    <input type="text" name="datetimes" />
    {/fbvFormSection}

    {*{fbvElement type="text" multilingual=false name="period" id="period" value=$coverage maxlength="255" readonly=$readOnly required=false}*}

    {*spatial*}
    {fbvFormSection title="plugins.generic.geoOJS.geospatialmetadata" for="period" inline=true}
    <div id="mapdiv" style="width: 600px; height: 400px; float: left;  z-index: 0;"></div>
    {/fbvFormSection}
    {/fbvFormArea}

</div>


{*main js script, needs to be loaded last*}
<script src="{$geoOJSScript}" type="text/javascript" defer></script>