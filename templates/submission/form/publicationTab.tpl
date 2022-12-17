{**
 * templates/submission/form/publicationTab.tpl
 *
 * Copyright (c) 2022 OPTIMETA project
 * Copyright (c) 2022 Daniel Nüst
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * @brief Show geospatial metadata and allow editing during publication phase.
 *}

<link rel="stylesheet" href="{$pluginStylesheetURL}/optimetaGeo.css" type="text/css" />

{* see templates/workflow/workflow.tpl for HTML structure, CSS classes, etc., used below *}

{* configuration values that are need in JS *}
<input type="text" id="optimetageo_usernameGeonames" name="usernameGeonames" class="hiddenDataField" value="{$usernameGeonames}" />
<input type="text" id="optimetageo_baseurlGeonames" name="baseurlGeonames" class="hiddenDataField" value="{$baseurlGeonames}" />
<input type="text" id="optimetageo_coverageDisabledHover" name="coverageDisabledHover"
        style="height: 0px; width: 0px; visibility: hidden;"
        value="{translate key="plugins.generic.optimetaGeo.submission.coverageDisabledHover"}">
    
<tab id="timeLocation" label="{translate key="plugins.generic.optimetaGeo.publication.label"}">

    {*temporal*}
    <div class="pkpFormGroup__locale pkpFormGroup__locale--isVisible optimetageo_formGroupMargin">
        <div class="pkpFormField">
            <div class="pkpFormField__heading">
                <label for="geoplugin-temporal" class="pkpFormFieldLabel">
                    {translate key="plugins.generic.optimetaGeo.geospatialmetadata.properties.temporal"}
                </label>
            </div>
            <div id="geoplugin-temporal-description" class="pkpFormField__description">
                {translate key="plugins.generic.optimetaGeo.geospatialmetadata.properties.temporal.description.submission"}
            </div>
            <div class="pkpFormField__control">
                <div class="pkpFormField__control_top">
                    <input id="geoplugin-temporal" name="datetimes" aria-describedby="geoplugin-temporal-description" aria-invalid="0" type="text" class="pkpFormField__input pkpFormField--text__input" />
                </div>
            </div>
        </div>
    </div>

    {*spatial*}
    <div class="pkpFormGroup__locale pkpFormGroup__locale--isVisible optimetageo_formGroupMargin">
        <div class="pkpFormField">
            <div class="pkpFormField__heading">
                <label for="mapdiv" class="pkpFormFieldLabel">
                    {translate key="plugins.generic.optimetaGeo.geospatialmetadata.properties.spatial"}
                </label>
            </div>
            <div id="geoplugin-spatial-description" class="pkpFormField__description">
                {translate key="plugins.generic.optimetaGeo.geospatialmetadata.properties.spatial.description.submission"}
            </div>
            
            <div id="mapdiv" aria-describedby="geoplugin-spatial-description" style="width: 100%; height: 400px; z-index: 0;"></div>
        </div>
    </div>

    {*administrativeUnit*}
    <div class="pkpFormGroup__locale pkpFormGroup__locale--isVisible optimetageo_formGroupMargin">
        <div class="pkpFormField">
            <div class="pkpFormField__heading">
                <label for="administrativeUnitInput" class="pkpFormFieldLabel">
                    {translate key="plugins.generic.optimetaGeo.geospatialmetadata.properties.spatial.administrativeUnit"}
                </label>
            </div>
            <div align="justify" class="pkpFormField__description optimetageo_warning" id="optimetageo_gazetteer_unavailable" style="display:none;">{translate
                key="plugins.generic.optimetaGeo.geospatialmetadata.gazetteer_unavailable"}
            </div>
            <div id="geoplugin-adminunit-description" class="pkpFormField__description">
                {translate key="plugins.generic.optimetaGeo.geospatialmetadata.properties.spatial.administrativeUnit.description.submission"}
            </div>
            <div class="pkpFormField__control">
                <div class="pkpFormField__control_top">
                    <ul id="administrativeUnitInput" aria-describedby="geoplugin-adminunit-description" aria-invalid="0" class="pkpFormField__input pkpFormField--text__input">
                    </ul>
                </div>
            </div>
        </div>
    </div>

    {*z-index must be changed for the daterangepicker*}
    <style>
        .daterangepicker {
            direction: ltr;
            text-align: left;
            z-index: 1;
        }
    </style>

    <div class="pkpFormField__heading optimetageo_formGroupMargin">
        <label class="pkpFormFieldLabel">
            {translate key="plugins.generic.optimetaGeo.publication.tab.raw"}
        </label>
    </div>
    <div class="pkpFormField__description">
        {translate key="plugins.generic.optimetaGeo.publication.tab.raw.description"}
    </div>

    <div>
        <pkp-form v-bind="components.{$smarty.const.OPTIMETA_GEO_FORM_NAME}" @set="set"/>
    </div>

    {*main js script, needs to be loaded last*}
    <script src="{$optimetageo_submissionJS}" type="text/javascript"></script>
    
    {* fix Leaflet gray map issue when it is displayed later than page load *}
    <script type="text/javascript">
        // https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
        // https://stackoverflow.com/a/16462443
        $(function() {
            var observer = new MutationObserver(function(mutations) {
                if(mutations[0].attributeName === "hidden" && mutations[0].target.attributes['hidden'] === undefined)
                setTimeout(function () {
                    //window.dispatchEvent(new Event('resize'));
                    map.invalidateSize();
                }, 100);
            });
            var target = document.querySelector('#timeLocation');
            observer.observe(target, {
                attributes: true
            });
        });
    </script>

</tab>
