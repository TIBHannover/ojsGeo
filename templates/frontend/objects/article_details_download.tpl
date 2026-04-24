 {**
 * templates/frontend/objects/article_details_download.tpl
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * @brief Add download link for geospatial metadata to article page sidebar.
 * 
 * The main template is here extended using the hook 'Templates::Article::Details'.
 *}

<div style="clear:both;">
    <section id="geoMetadata_article_spatial_download" class="item geospatialmetadatadownload">
        <section class="sub_item">
            <h2 class="label">
                {translate key="plugins.generic.geoMetadata.article.details.download"}
            </h2>
            <div class="value">
                <p>
                    <a class="obj_galley_link geoJSON" onclick="downloadGeospatialMetadataAsGeoJSON()">GeoJSON</a>
                    <span class="geoMetadata_download_about">
                        <a href="https://geojson.org/">
                        {translate key="plugins.generic.geoMetadata.article.details.geoJSON.about"}
                        </a>
                    </span>
                </p>
                <p class="geoMetadata_license">
                    {translate key="plugins.generic.geoMetadata.license.download" license=$geoMetadata_metadataLicense}
                </p>
            </div>
        </section>
    </section>
</div>

{*main js script is already loaded in article_details.tpl*}