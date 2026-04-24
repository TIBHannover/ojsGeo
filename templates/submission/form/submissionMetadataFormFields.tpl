{**
 * templates/submission/formsubmissionMetadataFormFields.tpl
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * @brief Add forms to enter geospatial metadata during the submission.
 * 
 * The main template is here extended using the hook 'Templates::Submission::SubmissionMetadataForm::AdditionalMetadata'.
 *}

<link rel="stylesheet" href="{$pluginStylesheetURL}/styles.css" type="text/css" />

<input type="text" id="geoMetadata_usernameGeonames" name="usernameGeonames" class="hiddenDataField" value="{$usernameGeonames}" />
<input type="text" id="geoMetadata_baseurlGeonames" name="baseurlGeonames" class="hiddenDataField" value="{$baseurlGeonames}" />
<input type="text" id="geoMetadata_coverageDisabledHover" name="coverageDisabledHover"
        style="height: 0px; width: 0px; visibility: hidden;"
        value="{translate key="plugins.generic.geoMetadata.submission.coverageDisabledHover"}">

{include file=$geoMetadata_mapJsGlobalsTpl}
        
<div style="clear:both;">
    {fbvFormArea id="spatioTemporalFields"}

    {if $geoMetadata_submission_enableTemporal}
    {fbvFormSection title="plugins.generic.geoMetadata.geospatialmetadata.properties.temporal" for="timePeriodsWithDatepicker" inline=true}
    <p align="justify" class="description">{translate
        key="plugins.generic.geoMetadata.geospatialmetadata.properties.temporal.description.submission"}
    </p>
    <input type="text" id="timePeriodsWithDatepicker" name="datetimes"
        placeholder="{translate key="plugins.generic.geoMetadata.geospatialmetadata.properties.temporal.placeholder"}"
        style="width: 100%; height: 32px;" />
    <textarea id="timePeriods" name="{$smarty.const.GEOMETADATA_DB_FIELD_TIME_PERIODS}"
        class="hiddenDataField" style="height: 0;">{${$smarty.const.GEOMETADATA_DB_FIELD_TIME_PERIODS}}</textarea>
    {/fbvFormSection}
    {/if}

    {if $geoMetadata_submission_enableSpatial}
    {fbvFormSection title="plugins.generic.geoMetadata.geospatialmetadata.properties.spatial" for="spatialProperties" inline=true}
    <p align="justify" class="description">{translate
        key="plugins.generic.geoMetadata.geospatialmetadata.properties.spatial.description.submission"}
    </p>
    <div id="mapdiv" style="width: 100%; height: 400px; z-index: 0;"></div>
    <p align="justify" class="description geoMetadata_antimeridian_note">{translate
        key="plugins.generic.geoMetadata.submission.spatialProperties.antimeridianNote"}
    </p>
    <p align="justify" class="description geoMetadata_privacyNotice">{translate
        key="plugins.generic.geoMetadata.privacy.mapNotice"}
    </p>
    <textarea id="spatialProperties" name="{$smarty.const.GEOMETADATA_DB_FIELD_SPATIAL}"
        class="hiddenDataField" style="height: 0;">{${$smarty.const.GEOMETADATA_DB_FIELD_SPATIAL}}</textarea>

    <p align="justify" class="description">{translate
        key="plugins.generic.geoMetadata.license.submission" license=$geoMetadata_metadataLicense}
    </p>
    {/fbvFormSection}
    {/if}

    {if $geoMetadata_submission_enableAdminUnit}
    {fbvFormSection title="plugins.generic.geoMetadata.geospatialmetadata.properties.spatial.administrativeUnit" for="administrativeUnitInput"
    inline=true}
    <p align="justify" class="description geoMetadata_warning" id="geoMetadata_gazetteer_unavailable" style="display:none;">{translate
        key="plugins.generic.geoMetadata.geospatialmetadata.gazetteer_unavailable"}
    </p>
    <p align="justify" class="description">{translate
        key="plugins.generic.geoMetadata.geospatialmetadata.properties.spatial.administrativeUnit.description.submission"}
    </p>
    <ul id="administrativeUnitInput">
    </ul>
    <p class="description geoMetadata_warning geoMetadata-manual-admin-unit-notice" style="display:none;">{translate
        key="plugins.generic.geoMetadata.geospatialmetadata.properties.spatial.administrativeUnit.manualOverrideNotice"}
    </p>
    <textarea id="administrativeUnit" name="{$smarty.const.GEOMETADATA_DB_FIELD_ADMINUNIT}"
        class="hiddenDataField" style="height: 0;">{${$smarty.const.GEOMETADATA_DB_FIELD_ADMINUNIT}}</textarea>
    {/fbvFormSection}
    {/if}
    {/fbvFormArea}
</div>

{*main js script, needs to be loaded last*}
<script src="{$geoMetadata_submissionJS}" type="text/javascript"></script>
