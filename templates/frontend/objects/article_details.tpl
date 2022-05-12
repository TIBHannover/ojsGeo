{*the main template is here extended using the hook 'Templates::Article::Main'*}

<div style="clear:both;">
    <section id="item geospatialmetadata" class="item geospatialmetadata">
        <h2 class="label">{translate key="plugins.generic.optimetaGeo.article.metadata.long"}</h2>

        {*temporal*}
        <p id="item temporal" class="description">
            {translate key="plugins.generic.optimetaGeo.geospatialmetadata.properties.temporal.from"} <span id="start"  class="optimetageo_timestamp"></span>
            {translate key="plugins.generic.optimetaGeo.geospatialmetadata.properties.temporal.to"} <span id="end" class="optimetageo_timestamp"></span>.&nbsp;<span class="fas fa-question-circle tooltip">
                <span class="tooltiptext" style="top: -18px;">{translate
                key="plugins.generic.optimetaGeo.geospatialmetadata.properties.temporal.description.article"}</span>
            </span>
        </p>

        {*spatial*} {*administrativeUnit*}
        <p id="item spatial" class="description">
            {translate key="plugins.generic.optimetaGeo.geospatialmetadata.properties.spatial"}&nbsp;<span class="fas fa-question-circle tooltip">
                <span class="tooltiptext" style="top: -66px;">{translate
                key="plugins.generic.optimetaGeo.geospatialmetadata.properties.spatial.description.article"}</span>
        </p>

        <div id="mapdiv" style="width: 100%; height: 300px; z-index: 1;"></div>

        <p id="item admnistrativeUnit" class="description">
            {translate key="plugins.generic.optimetaGeo.geospatialmetadata.properties.administrativeUnit"} <span id="administrativeUnit" class="optimetageo_coverage"></span>&nbsp;<span class="fas fa-question-circle tooltip">
            <span class="tooltiptext" style="top: -42px;">{translate
                key="plugins.generic.optimetaGeo.geospatialmetadata.properties.administrativeUnit.description.article"}</span>
            </span>
        </p>

        <input type="text" id="temporalProperties" name="temporalProperties"
            style="height: 0px; width: 0px; visibility: hidden;" value='{$temporalProperties}' />
        <input type="text" id="spatialProperties" name="spatialProperties"
            style="height: 0px; width: 0px; visibility: hidden;" value='{$spatialProperties}'>
        <input type="text" id="administrativeUnitProperties" name="administrativeUnit"
            style="height: 0px; width: 0px; visibility: hidden;" value='{$administrativeUnit}'>
    </section>

</div>

{*main js script, needs to be loaded last*}
<script src="{$article_detailsJS}" type="text/javascript" defer></script>