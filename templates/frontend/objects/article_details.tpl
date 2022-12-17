{**
 * templates/frontend/objects/article_details.tpl
 *
 * Copyright (c) 2022 OPTIMETA project
 * Copyright (c) 2022 Daniel Nüst
 * Copyright (c) 2021 Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * @brief Show geospatial metadata on the article page.
 *
 * the main template is here extended using the hook 'Templates::Article::Main'.
 *}

<script type="text/javascript">
const optimetageo_mapLayerStyle = {
    weight: 5,
    color: '#1E6292',
    dashArray: '',
    fillOpacity: 0.6
};

const optimetageo_articleLayerName = '{translate key="plugins.generic.optimetaGeo.map.articleLayerName"}';
const optimetageo_adminLayerName = '{translate key="plugins.generic.optimetaGeo.map.administrativeLayerName"}';
</script>

<div style="clear:both;">
    <section id="optimeta_article_geospatialmetadata" class="item geospatialmetadata">
        <h2 class="label">{translate key="plugins.generic.optimetaGeo.article.metadata.long"}</h2>

        {*temporal*}
        <p id="optimeta_article_temporal" class="description">
            {translate key="plugins.generic.optimetaGeo.geospatialmetadata.properties.temporal.from"} <span id="optimetageo_span_start"  class="optimetageo_timestamp"></span>
            {translate key="plugins.generic.optimetaGeo.geospatialmetadata.properties.temporal.to"}   <span id="optimetageo_span_end" class="optimetageo_timestamp"></span>.&nbsp;<span class="fa fa-question-circle tooltip">
                <span class="tooltiptext">{translate
                key="plugins.generic.optimetaGeo.geospatialmetadata.properties.temporal.description.article"}</span>
            </span>
        </p>

        {*spatial*} {*administrativeUnit*}
        <p id="optimeta_article_spatial" class="description">
            {translate key="plugins.generic.optimetaGeo.geospatialmetadata.properties.spatial"}&nbsp;<span class="fa fa-question-circle tooltip">
                <span class="tooltiptext">{translate
                key="plugins.generic.optimetaGeo.geospatialmetadata.properties.spatial.description.article"}</span>
        </p>

        <div id="mapdiv" style="width: 100%; height: 300px; z-index: 1;"></div>

        <p id="optimeta_article_administrativeUnit" class="description">
            {translate key="plugins.generic.optimetaGeo.geospatialmetadata.properties.administrativeUnit"} <span id="optimeta_span_admnistrativeUnit" class="optimetageo_coverage"></span>&nbsp;<span class="fa fa-question-circle tooltip">
            <span class="tooltiptext">{translate
                key="plugins.generic.optimetaGeo.geospatialmetadata.properties.administrativeUnit.description.article"}</span>
            </span>
        </p>

        <p class="optimetageo_license">
            {translate key="plugins.generic.optimetaGeo.license.frontend"} {$optimetageo_metadataLicense}
        </p>

        {* name is used for the submitted form and the name in the PHP backend, id is used for JavaScript *}
        <input type="text" id="optimeta_temporal" name="{$smarty.const.OPTIMETA_GEO_DB_FIELD_TIME_PERIODS}"
            style="height: 0px; width: 0px; visibility: hidden;" value='{${$smarty.const.OPTIMETA_GEO_DB_FIELD_TIME_PERIODS}}' />
        <input type="text" id="optimeta_spatial" name="{$smarty.const.OPTIMETA_GEO_DB_FIELD_SPATIAL}"
            style="height: 0px; width: 0px; visibility: hidden;" value='{${$smarty.const.OPTIMETA_GEO_DB_FIELD_SPATIAL}}' />
        <input type="text" id="optimeta_administrativeUnit" name="{$smarty.const.OPTIMETA_GEO_DB_FIELD_ADMINUNIT}"
            style="height: 0px; width: 0px; visibility: hidden;" value='{${$smarty.const.OPTIMETA_GEO_DB_FIELD_ADMINUNIT}}' />
    </section>

</div>

{*main js script, needs to be loaded last*}
<script src="{$optimetageo_article_detailsJS}" type="text/javascript" defer></script>
