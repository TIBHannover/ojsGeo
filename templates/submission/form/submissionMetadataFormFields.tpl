{**
 * templates/submission/formsubmissionMetadataFormFields.tpl
 *
 * Copyright (c) 2022 OPTIMETA project
 * Copyright (c) 2022 Daniel Nüst
 * Copyright (c) 2021 Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * @brief Add forms to enter geospatial metadata during the submission.
 * 
 * The main template is here extended using the hook 'Templates::Submission::SubmissionMetadataForm::AdditionalMetadata'
 *}

<link rel="stylesheet" href="{$pluginStylesheetURL}/optimetaGeo.css" type="text/css" />

<input type="text" id="optimetageo_usernameGeonames" name="usernameGeonames" class="hiddenDataField" value="{$usernameGeonames}" />
<input type="text" id="optimetageo_baseurlGeonames" name="baseurlGeonames" class="hiddenDataField" value="{$baseurlGeonames}" />
<input type="text" id="optimetageo_coverageDisabledHover" name="coverageDisabledHover"
        style="height: 0px; width: 0px; visibility: hidden;"
        value="{translate key="plugins.generic.optimetaGeo.submission.coverageDisabledHover"}">
        
<div style="clear:both;">
    {fbvFormArea id="spatioTemporalFields"}

    {*temporal*}
    {fbvFormSection title="plugins.generic.optimetaGeo.geospatialmetadata.properties.temporal" for="timePeriodsWithDatepicker" inline=true}
    <p align="justify" class="description">{translate
        key="plugins.generic.optimetaGeo.geospatialmetadata.properties.temporal.description.submission"}
    </p>
    <input type="text" id="timePeriodsWithDatepicker" name="datetimes" style="width: 100%; height: 32px; z-index: 0;" />
    <textarea id="timePeriods" name="{$smarty.const.OPTIMETA_GEO_DB_FIELD_TIME_PERIODS}"
        class="hiddenDataField" style="height: 0;">{${$smarty.const.OPTIMETA_GEO_DB_FIELD_TIME_PERIODS}}</textarea>
    {/fbvFormSection}

    {*spatial*}
    {fbvFormSection title="plugins.generic.optimetaGeo.geospatialmetadata.properties.spatial" for="spatialProperties" inline=true}
    <p align="justify" class="description">{translate
        key="plugins.generic.optimetaGeo.geospatialmetadata.properties.spatial.description.submission"}
    </p>
    <div id="mapdiv" style="width: 100%; height: 400px; z-index: 0;"></div>
    <textarea id="spatialProperties" name="{$smarty.const.OPTIMETA_GEO_DB_FIELD_SPATIAL}"
        class="hiddenDataField" style="height: 0;">{${$smarty.const.OPTIMETA_GEO_DB_FIELD_SPATIAL}}</textarea>

    <p align="justify" class="description">{translate
        key="plugins.generic.optimetaGeo.license.submission"} {$optimetageo_metadataLicense}
    </p>
    {/fbvFormSection}

    {*administrativeUnit*}
    {fbvFormSection title="plugins.generic.optimetaGeo.geospatialmetadata.properties.spatial.administrativeUnit" for="administrativeUnitInput"
    inline=true}
    <p align="justify" class="description optimetageo_warning" id="optimetageo_gazetteer_unavailable" style="display:none;">{translate
        key="plugins.generic.optimetaGeo.geospatialmetadata.gazetteer_unavailable"}
    </p>
    <p align="justify" class="description">{translate
        key="plugins.generic.optimetaGeo.geospatialmetadata.properties.spatial.administrativeUnit.description.submission"}
    </p>
    <ul id="administrativeUnitInput">
    </ul>
    <textarea id="administrativeUnit" name="{$smarty.const.OPTIMETA_GEO_DB_FIELD_ADMINUNIT}"
        class="hiddenDataField" style="height: 0;">{${$smarty.const.OPTIMETA_GEO_DB_FIELD_ADMINUNIT}}</textarea>
    {/fbvFormSection}
    {/fbvFormArea}
</div>

{*z-index must be changed for the daterangepicker*}
<style>
    .daterangepicker {
        direction: ltr;
        text-align: left;
        z-index: 1;
    }
</style>

{*main js script, needs to be loaded last*}
<script src="{$optimetageo_submissionJS}" type="text/javascript"></script>
