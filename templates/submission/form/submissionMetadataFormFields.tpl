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

<div style="clear:both;">
    {fbvFormArea id="tagitFields"
    title="plugins.generic.optimetaGeo.article.metadata.long"}

    <input type="text" id="optimetageo_coverageDisabledHover" name="coverageDisabledHover"
        style="height: 0px; width: 0px; visibility: hidden;"
        value="{translate key="plugins.generic.optimetaGeo.submission.coverageDisabledHover"}">
    
    {*temporal*}
    {fbvFormSection title="plugins.generic.optimetaGeo.geospatialmetadata.properties.temporal" for="period" inline=true}
    <p align="justify" class="description">{translate
        key="plugins.generic.optimetaGeo.geospatialmetadata.properties.temporal.description.submission"}
    </p>
    <input type="text" name="datetimes" style="width: 100%; height: 32px; z-index: 0;" />
    <input type="text" id="temporalProperties" name="temporalProperties"
        style="height: 0px; width: 0px; z-index: 0; visibility: hidden;" />
    <input type="text" id="temporalPropertiesFromDb" name="temporalPropertiesFromDb"
        style="height: 0px; width: 0px; visibility: hidden;" value='{$temporalPropertiesFromDb}' />
    {/fbvFormSection}

    {*spatial*}
    {fbvFormSection title="plugins.generic.optimetaGeo.geospatialmetadata.properties.spatial" for="period" inline=true}
    <p align="justify" class="description">{translate
        key="plugins.generic.optimetaGeo.geospatialmetadata.properties.spatial.description.submission"}
    </p>
    <div id="mapdiv" style="width: 100%; height: 400px; z-index: 0;"></div>
    <input type="text" id="spatialProperties" name="spatialProperties" size="30"
        style="height: 0px; width: 0px; visibility: hidden;">
    <input type="text" id="spatialPropertiesFromDb" name="spatialPropertiesFromDb"
        style="height: 0px; width: 0px; visibility: hidden;" value='{$spatialPropertiesFromDb}' />
    <p align="justify" class="description">{translate
        key="plugins.generic.optimetaGeo.geospatialmetadata.license.submission"}
    </p>
    {/fbvFormSection}

    {*administrativeUnit*}
    {fbvFormSection title="plugins.generic.optimetaGeo.geospatialmetadata.properties.spatial.administrativeUnit" for="period"
    inline=true}
    <p align="justify" class="description">{translate
        key="plugins.generic.optimetaGeo.geospatialmetadata.properties.spatial.administrativeUnit.description.submission"}
    </p>
    <ul id="administrativeUnitInput">
    </ul>
    <input type="text" id="administrativeUnit" name="administrativeUnit" size="30" style="visibility: hidden;">
    <input type="text" id="administrativeUnitFromDb" name="administrativeUnitFromDb"
        style="height: 0px; width: 0px; visibility: hidden;" value='{$administrativeUnitFromDb}' />
    <input type="text" id="optimetageo_usernameGeonames" name="usernameGeonames"
        style="height: 0px; width: 0px; visibility: hidden;" value="{$usernameGeonames}" />
    <input type="text" id="optimetageo_baseurlGeonames" name="baseurlGeonames"
        style="height: 0px; width: 0px; visibility: hidden;" value="{$baseurlGeonames}" />
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
<script src="{$optimetageo_submissionMetadataFormFieldsJS}" type="text/javascript"></script>