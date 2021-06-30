{*the main template is here extended using the hook 'Templates::Article::Main'*}

<div style="clear:both;">
    <section id="item geospatialmetadata" class="item geospatialmetadata">
        <h2 class="label">{translate key="plugins.generic.geoOJS.geospatialmetadata"}</h2>
        <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">{translate
            key="plugins.generic.geoOJS.geospatialmetadata.description.article"}
        </p>
    </section>

    {*temporal*}
    <section id="item temporal" class="item temporal">
        <h2 class="label">{translate key="plugins.generic.geoOJS.geospatialmetadata.properties.temporal"}</h2>
        <div id="temporalPropertiesShow">
            <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">{translate
                key="plugins.generic.geoOJS.geospatialmetadata.properties.temporal.description.article"}
            </p>
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
        <input type="text" id="temporalProperties" name="temporalProperties"
            style="height: 0px; width: 0px; visibility: hidden;" value='{$temporalProperties}' />
    </section>

    {*spatial*}
    <section id="item spatial" class="item spatial">
        <h2 id="label" class="label">{translate key="plugins.generic.geoOJS.geospatialmetadata.properties.spatial"}</h2>
        <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">{translate
            key="plugins.generic.geoOJS.geospatialmetadata.properties.spatial.description.article"}
        </p>
        <div id="mapdiv" style="width: 100%; height: 300px;"></div>
        <input type="text" id="spatialProperties" name="spatialProperties"
            style="height: 0px; width: 0px; visibility: hidden;" value='{$spatialProperties}'>
    </section>

    {*administrativeUnit*}
    <section id="item administrativeUnit" class="item administrativeUnit">
        <h2 class="label">{translate
            key="plugins.generic.geoOJS.geospatialmetadata.properties.spatial.administrativeUnit.ArticleView"}</h2>
        <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">{translate
            key="plugins.generic.geoOJS.geospatialmetadata.properties.spatial.administrativeUnit.description.article"}
        </p>
        <div id="administrativeUnitDescription"></div>
        <input type="text" id="administrativeUnit" name="administrativeUnit"
            style="height: 0px; width: 0px; visibility: hidden;" value='{$administrativeUnit}'>
    </section>
</div>

{*main js script, needs to be loaded last*}
<script src="{$article_detailsJS}" type="text/javascript" defer></script>