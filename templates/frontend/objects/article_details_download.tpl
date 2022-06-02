 {**
 * templates/frontend/objects/article_details_download.tpl
 *
 * Copyright (c) 2022 OPTIMETA project
 * Copyright (c) 2022 Daniel Nüst
 * Copyright (c) 2021 Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * @brief Add download link for geospatial metadata to article page sidebar.
 * 
 * The main template is here extended using the hook 'Templates::Article::Details'.
 *}

<link rel="stylesheet" href="{$pluginStylesheetURL}/optimetaGeo.css" type="text/css" />

<div style="clear:both;">
    <section id="item geospatialmetadatadownload" class="item geospatialmetadatadownload">
        <section class="sub_item">
            <h2 class="label">
                {translate key="plugins.generic.optimetaGeo.article.details.download"}
            </h2>
            <div class="value">
                <p>
                    <a class="obj_galley_link geoJSON" onclick="downloadGeospatialMetadataAsGeoJSON()">GeoJSON</a>
                    <span class="optimetageo_download_about">
                        <a href="https://geojson.org/">
                        {translate key="plugins.generic.optimetaGeo.article.details.geoJSON.about"}
                        </a>
                    </span>
                </p>
            </div>
        </section>
    </section>
</div>

{*main js script is already loaded in article_details.tpl*}