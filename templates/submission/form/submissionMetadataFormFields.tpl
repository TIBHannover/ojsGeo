{*the main template is here extended*}

{*
<script src="{$jqueryJS}" type="text/javascript"></script>
<script src="{$momentJS}" type="text/javascript" defer></script>
<script src="{$daterangepickerJS}" type="text/javascript" defer></script>
<link rel="stylesheet" type="text/css" href="{$daterangepickerCSS}">*}

<div style="clear:both;">
    {fbvFormSection title="plugins.generic.geoOJS.geospatialmetadata" for="period" inline=true}
		<p class="description">{translate key="plugins.generic.geoOJS.geospatialmetadata.description"}</p>

		{*temporal*}

    	{fbvElement type="text" multilingual=false name="period" id="period" value=$coverage maxlength="255" readonly=$readOnly required=false}

		{*spatial*}

		<div id="mapdiv" style="width: 600px; height: 400px; float: left;  z-index: 0;"></div>

    {/fbvFormSection}
</div>


{*main js script, needs to be loaded last*}
<script src="{$geoOJSScript}" type="text/javascript" defer></script>
