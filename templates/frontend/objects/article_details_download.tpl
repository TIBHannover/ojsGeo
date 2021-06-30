{*the main template is here extended using the hook 'Templates::Article::Details'*}

<div style="clear:both;">
    <section id="item geospatialmetadatadownload" class="item geospatialmetadatadownload">
        <p class="description" style="color: rgba(0,0,0,0.54); font-size: 13px;">{translate
            key="plugins.generic.geoOJS.geospatialmetadata.properties.spatial.download.geoJSON"}
        </p>
        <a class="obj_galley_link geoJSON" onclick="downloadGeospatialMetadataAsGeoJSON()">geoJSON</a>
    </section>
</div>

{*main js script is already loaded in article_details.tpl*}