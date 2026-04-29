{**
 * templates/submission/form/publicationTab.tpl
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * @brief Show geospatial metadata and allow editing during publication phase.
 *}

<link rel="stylesheet" href="{$pluginStylesheetURL}/styles.css" type="text/css" />

{* see templates/workflow/workflow.tpl for HTML structure, CSS classes, etc., used below *}

{* configuration values that are need in JS *}
<input type="text" id="geoMetadata_usernameGeonames" name="usernameGeonames" class="hiddenDataField" value="{$usernameGeonames}" />
<input type="text" id="geoMetadata_baseurlGeonames" name="baseurlGeonames" class="hiddenDataField" value="{$baseurlGeonames}" />
<input type="text" id="geoMetadata_coverageDisabledHover" name="coverageDisabledHover"
        style="height: 0px; width: 0px; visibility: hidden;"
        value="{translate key="plugins.generic.geoMetadata.submission.coverageDisabledHover"}">

{include file=$geoMetadata_mapJsGlobalsTpl}

<tab id="timeLocation" label="{translate key="plugins.generic.geoMetadata.publication.label"}">

    {if $geoMetadata_workflow_enableTemporal}
    <div class="pkpFormGroup__locale pkpFormGroup__locale--isVisible geoMetadata_formGroupMargin">
        <div class="pkpFormField">
            <div class="pkpFormField__heading">
                <label for="geoMetadata-temporal" class="pkpFormFieldLabel">
                    {translate key="plugins.generic.geoMetadata.geospatialmetadata.properties.temporal"}
                </label>
            </div>
            <div id="geoMetadata-temporal-description" class="pkpFormField__description">
                {translate key="plugins.generic.geoMetadata.geospatialmetadata.properties.temporal.description.submission"}
            </div>
            <div class="pkpFormField__control">
                <div class="pkpFormField__control_top">
                    <input id="geoMetadata-temporal" name="datetimes"
                        aria-describedby="geoMetadata-temporal-description"
                        placeholder="{translate key="plugins.generic.geoMetadata.geospatialmetadata.properties.temporal.placeholder"}"
                        type="text" class="pkpFormField__input pkpFormField--text__input" />
                </div>
            </div>
        </div>
    </div>
    {/if}

    {if $geoMetadata_workflow_enableSpatial}
    <div class="pkpFormGroup__locale pkpFormGroup__locale--isVisible geoMetadata_formGroupMargin">
        <div class="pkpFormField">
            <div class="pkpFormField__heading">
                <label for="mapdiv" class="pkpFormFieldLabel">
                    {translate key="plugins.generic.geoMetadata.geospatialmetadata.properties.spatial"}
                </label>
            </div>
            <div id="geoMetadata-spatial-description" class="pkpFormField__description">
                {translate key="plugins.generic.geoMetadata.geospatialmetadata.properties.spatial.description.submission"}
            </div>

            <div id="mapdiv" aria-describedby="geoMetadata-spatial-description" style="width: 100%; height: 400px; z-index: 0;"></div>
            <div class="pkpFormField__description geoMetadata_antimeridian_note">
                {translate key="plugins.generic.geoMetadata.submission.spatialProperties.antimeridianNote"}
            </div>
        </div>
    </div>
    {/if}

    {if $geoMetadata_workflow_enableAdminUnit}
    <div class="pkpFormGroup__locale pkpFormGroup__locale--isVisible geoMetadata_formGroupMargin">
        <div class="pkpFormField">
            <div class="pkpFormField__heading">
                <label for="administrativeUnitInput" class="pkpFormFieldLabel">
                    {translate key="plugins.generic.geoMetadata.geospatialmetadata.properties.spatial.administrativeUnit"}
                </label>
            </div>
            <div class="pkpFormField__description geoMetadata_warning" id="geoMetadata_gazetteer_unavailable" style="display:none;">
                <p align="justify"><strong>{translate key="plugins.generic.geoMetadata.gazetteer.unavailable.title"}</strong>
                    <span class="geoMetadata_gazetteer_unavailable_reason"></span>
                </p>
                <p align="justify">{translate key="plugins.generic.geoMetadata.gazetteer.unavailable.fallback"}</p>
            </div>
            <div id="geoMetadata-adminunit-description" class="pkpFormField__description">
                {translate key="plugins.generic.geoMetadata.geospatialmetadata.properties.spatial.administrativeUnit.description.submission"}
            </div>
            <div class="pkpFormField__control">
                <div class="pkpFormField__control_top">
                    <ul id="administrativeUnitInput" aria-describedby="geoMetadata-adminunit-description" aria-invalid="0" class="pkpFormField__input pkpFormField--text__input">
                    </ul>
                </div>
                <div class="pkpFormField__description geoMetadata_warning geoMetadata-manual-admin-unit-notice" style="display:none;">
                    {translate key="plugins.generic.geoMetadata.geospatialmetadata.properties.spatial.administrativeUnit.manualOverrideNotice"}
                </div>
            </div>
        </div>
    </div>
    {/if}

    <div class="pkpFormField__heading geoMetadata_formGroupMargin">
        <label class="pkpFormFieldLabel">
            {translate key="plugins.generic.geoMetadata.publication.tab.raw"}
        </label>
    </div>
    <div class="pkpFormField__description">
        {if $geoMetadata_workflow_protectRawFields}
            {translate key="plugins.generic.geoMetadata.publication.tab.raw.description.locked"}
        {else}
            {translate key="plugins.generic.geoMetadata.publication.tab.raw.description"}
        {/if}
    </div>

    {if $geoMetadata_workflow_protectRawFields}
    <button type="button" id="geoMetadata_rawFields_enable" class="pkpButton pkpButton--isPrimary">
        {translate key="plugins.generic.geoMetadata.publication.tab.raw.enable"}
    </button>
    {/if}

    <div id="geoMetadata_rawFields"{if $geoMetadata_workflow_protectRawFields} class="geoMetadata_rawFields--locked"{/if}>
        <pkp-form v-bind="components.{$smarty.const.GEOMETADATA_FORM_NAME}" @set="set"/>
    </div>

    {if $geoMetadata_workflow_protectRawFields}
    <script type="text/javascript">
        $(function() {
            var container = document.getElementById('geoMetadata_rawFields');
            var button = document.getElementById('geoMetadata_rawFields_enable');
            if (!container || !button) return;
            function lock() {
                container.querySelectorAll('textarea').forEach(function(t) {
                    t.setAttribute('readonly', 'readonly');
                    t.setAttribute('aria-readonly', 'true');
                });
            }
            function unlock() {
                container.classList.remove('geoMetadata_rawFields--locked');
                container.querySelectorAll('textarea').forEach(function(t) {
                    t.removeAttribute('readonly');
                    t.removeAttribute('aria-readonly');
                });
                button.style.display = 'none';
                var first = container.querySelector('textarea');
                if (first) first.focus();
            }
            // pkp-form mounts asynchronously; poll briefly for the textareas to appear.
            var attempts = 0;
            var timer = setInterval(function() {
                if (container.querySelectorAll('textarea').length > 0 || ++attempts > 40) {
                    clearInterval(timer);
                    lock();
                }
            }, 100);
            button.addEventListener('click', unlock);
        });
    </script>
    {/if}

    {* Fix Leaflet gray map issue when it is displayed later than page load. The script is included here and not in submission.js as submission.js is also used for submissionMetadataFormFields.tpl, which would throw errors with this function. *}
    <script type="text/javascript">
        // https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
        // https://stackoverflow.com/a/16462443
        $(function() {
            var observer = new MutationObserver(function(mutations) {
                if(mutations[0].attributeName === "hidden" && mutations[0].target.attributes['hidden'] === undefined)
                setTimeout(function () {
                    //window.dispatchEvent(new Event('resize'));
                    map.invalidateSize();
                    if (!jQuery.isEmptyObject(administrativeUnitsMap._layers)) {
                        map.fitBounds(administrativeUnitsMap.getBounds());
                    }
                }, 100);
            });
            var target = document.querySelector('#timeLocation');
            observer.observe(target, {
                attributes: true
            });
        });
    </script>

    {*main js script, needs to be loaded last*}
    <script src="{$geoMetadata_submissionJS}" type="text/javascript"></script>
</tab>
