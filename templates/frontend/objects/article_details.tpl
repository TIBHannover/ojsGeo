{*the main template is here extended*}

<div style="clear:both;">
    <section id="item geospatialmetadata" class="item geospatialmetadata">
        <h2 class="label">{translate key="plugins.generic.geoOJS.geospatialmetadata"}</h2>
    </section>

    <section id="item temporal" class="item temporal">
        <h2 class="label">{translate key="plugins.generic.geoOJS.geospatialmetadata.properties.temporal"}</h2>
        <div id="temporalPropertiesShow">
            <table>
                <tr>
                    <td valign="top"><b>{translate
                            key="plugins.generic.geoOJS.geospatialmetadata.properties.temporal.start"}:</b></td>
                    <td id="start"></td>
                </tr>
                <tr>
                    <td valign="top"><b>{translate
                            key="plugins.generic.geoOJS.geospatialmetadata.properties.temporal.end"}:</b></td>
                    <td id="end"></td>
                </tr>
            </table>
        </div>
        <input type="text" id="temporalProperties" name="temporalProperties" size="30" style="visibility: hidden;"
            value='{$temporalProperties}' />
    </section>

    <section id="item spatial" class="item spatial">
        <h2 id="label" class="label">{translate key="plugins.generic.geoOJS.geospatialmetadata.properties.spatial"}</h2>
        <div id="mapdiv" style="width: 499px; height: 300px; margin-bottom: 20px; float: left; z-index: 0;"></div>
        <input type="text" id="spatialProperties" name="spatialProperties" size="30" style="visibility: hidden;"
            value='{$spatialProperties}'>
    </section>

    <section id="item administrativeUnit" class="item administrativeUnit">
        <h2 class="label">{translate key="plugins.generic.geoOJS.geospatialmetadata.properties.spatial.administrativeUnit.ArticleView"}</h2>
        <div id="administrativeUnitDescription"></div>
        <input type="text" id="administrativeUnit" name="administrativeUnit" size="30" style="visibility: hidden;"
            value='{$administrativeUnit}'>
    </section>
</div>

<style>
</style>

{*main js script, needs to be loaded last*}
<script src="{$article_detailsJS}" type="text/javascript" defer></script>