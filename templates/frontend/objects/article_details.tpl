{*the main template is here extended*}

<div style="clear:both;">
    <section class="item geospatialmetadata">
        <h2 class="label">{translate key="plugins.generic.geoOJS.geospatialmetadata"}</h2>
    </section>

    <section class="item temporal">
        <h2 class="label">{translate key="plugins.generic.geoOJS.geospatialmetadata.properties.temporal"}</h2>
        <input type="text" name="datetimes" style="width: 499px; height: 30px; z-index: 0;" />
        <input type="text" id="temporalProperties" name="temporalProperties" size="30" style="visibility: hidden;" value='{$temporalProperties}' />
    </section>

    <section class="item spatial">
        <h2 class="label">{translate key="plugins.generic.geoOJS.geospatialmetadata.properties.spatial"}</h2>
        <div id="mapdiv" style="width: 499px; height: 300px; margin-bottom: 20px; float: left; z-index: 0;"></div>
        <input type="text" id="spatialProperties" name="spatialProperties" size="30" style="visibility: hidden;" value='{$spatialProperties}'>
    </section>
</div>

<style>
</style>

{*main js script, needs to be loaded last*}
<script src="{$article_detailsJS}" type="text/javascript" defer></script>
