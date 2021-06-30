{*the main template is here extended using the hook
'Templates::Submission::SubmissionMetadataForm::AdditionalMetadata'*}

<div style="clear:both;">
    {fbvFormArea id="tagitFields" title="plugins.generic.geoOJS.geospatialmetadata"}
    <p align="justify" class="description">{translate
        key="plugins.generic.geoOJS.geospatialmetadata.description.submission"}</p>

    {*temporal*}
    {fbvFormSection title="plugins.generic.geoOJS.geospatialmetadata.properties.temporal" for="period" inline=true}
    <p align="justify" class="description">{translate
        key="plugins.generic.geoOJS.geospatialmetadata.properties.temporal.description.submission"}
    </p>
    <input type="text" name="datetimes" style="width: 100%; height: 32px; z-index: 0;" />
    <input type="text" id="temporalProperties" name="temporalProperties"
        style="height: 0px; width: 0px; z-index: 0; visibility: hidden;" />
    <input type="text" id="temporalPropertiesFromDb" name="temporalPropertiesFromDb"
        style="height: 0px; width: 0px; visibility: hidden;" value='{$temporalPropertiesFromDb}' />
    {/fbvFormSection}

    {*spatial*}
    {fbvFormSection title="plugins.generic.geoOJS.geospatialmetadata.properties.spatial" for="period" inline=true}
    <p align="justify" class="description">{translate
        key="plugins.generic.geoOJS.geospatialmetadata.properties.spatial.description.submission"}
    </p>
    <div id="mapdiv" style="width: 100%; height: 400px; z-index: 0;"></div>
    <input type="text" id="spatialProperties" name="spatialProperties" size="30"
        style="height: 0px; width: 0px; visibility: hidden;">
    <input type="text" id="spatialPropertiesFromDb" name="spatialPropertiesFromDb"
        style="height: 0px; width: 0px; visibility: hidden;" value='{$spatialPropertiesFromDb}' />
    {/fbvFormSection}

    {*administrativeUnit*}
    {fbvFormSection title="plugins.generic.geoOJS.geospatialmetadata.properties.spatial.administrativeUnit" for="period"
    inline=true}
    <p align="justify" class="description">{translate
        key="plugins.generic.geoOJS.geospatialmetadata.properties.spatial.administrativeUnit.description.submission"}
    </p>
    <ul id="administrativeUnitInput">
    </ul>
    <input type="text" id="administrativeUnit" name="administrativeUnit" size="30" style="visibility: hidden;">
    <input type="text" id="administrativeUnitFromDb" name="administrativeUnitFromDb"
        style="height: 0px; width: 0px; visibility: hidden;" value='{$administrativeUnitFromDb}' />
    <input type="text" id="usernameGeonames" name="usernameGeonames"
        style="height: 0px; width: 0px; visibility: hidden;" value='{$usernameGeonames}' />
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
<script src="{$submissionMetadataFormFieldsJS}" type="text/javascript" defer></script>