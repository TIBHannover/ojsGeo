{*the main template is here extended*}

<div style="clear:both;">
    {fbvFormSection title="plugins.generic.geoOJS.geospatialmetadata" for="period" inline=true}
		<p class="description">{translate key="plugins.generic.geoOJS.geospatialmetadata.description"}</p>

		{*temporal*}

    	<input type="text" name="datetimes" />

    	{*{fbvElement type="text" multilingual=false name="period" id="period" value=$coverage maxlength="255" readonly=$readOnly required=false}*}

		{*spatial*}

		<div id="mapdiv" style="width: 600px; height: 400px; float: left;  z-index: 0;"></div>

    {/fbvFormSection}
</div>


{*main js script, needs to be loaded last*}
<script src="{$geoOJSScript}" type="text/javascript" defer></script>
