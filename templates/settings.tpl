{*template settings for geoMetadata.'*}
<script>
    $(function() {ldelim}
    $('#geoMetadataSettings').pkpHandler('$.pkp.controllers.form.AjaxFormHandler');
    {rdelim});
</script>

<form class="pkp_form" id="geoMetadataSettings" method="POST"
    action="{url router=$smarty.const.ROUTE_COMPONENT op="manage" category="generic" plugin=$pluginName verb="settings" save=true}">
    <!-- Always add the csrf token to secure your form -->
    {csrf}

    {fbvFormArea id="geoMetadataSettingsArticlePage" title="plugins.generic.geoMetadata.settings.section.articlePage"}
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.section.articlePage.intro"}
    </p>
    {fbvFormSection list=true}
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.showArticleMap.description"}
        {fbvElement
        type="checkbox"
        id="geoMetadata_showArticleMap"
        value="1"
        checked=$geoMetadata_showArticleMap
        label="plugins.generic.geoMetadata.settings.showArticleMap"
        }
    </p>
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.showArticleTemporal.description"}
        {fbvElement
        type="checkbox"
        id="geoMetadata_showArticleTemporal"
        value="1"
        checked=$geoMetadata_showArticleTemporal
        label="plugins.generic.geoMetadata.settings.showArticleTemporal"
        }
    </p>
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.showArticleAdminUnit.description"}
        {fbvElement
        type="checkbox"
        id="geoMetadata_showArticleAdminUnit"
        value="1"
        checked=$geoMetadata_showArticleAdminUnit
        label="plugins.generic.geoMetadata.settings.showArticleAdminUnit"
        }
    </p>
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.showDownloadSidebar.description"}
        {fbvElement
        type="checkbox"
        id="geoMetadata_showDownloadSidebar"
        value="1"
        checked=$geoMetadata_showDownloadSidebar
        label="plugins.generic.geoMetadata.settings.showDownloadSidebar"
        }
    </p>
    {/fbvFormSection}
    {/fbvFormArea}

    {fbvFormArea id="geoMetadataSettingsIssueAndJournal" title="plugins.generic.geoMetadata.settings.section.issueAndJournal"}
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.section.issueAndJournal.intro"}
    </p>
    {fbvFormSection list=true}
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.showIssueMap.description"}
        {fbvElement
        type="checkbox"
        id="geoMetadata_showIssueMap"
        value="1"
        checked=$geoMetadata_showIssueMap
        label="plugins.generic.geoMetadata.settings.showIssueMap"
        }
    </p>
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.showJournalMap.description"}
        {fbvElement
        type="checkbox"
        id="geoMetadata_showJournalMap"
        value="1"
        checked=$geoMetadata_showJournalMap
        label="plugins.generic.geoMetadata.settings.showJournalMap"
        }
    </p>
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.showIssueTimeline.description"}
        {fbvElement
        type="checkbox"
        id="geoMetadata_showIssueTimeline"
        value="1"
        checked=$geoMetadata_showIssueTimeline
        label="plugins.generic.geoMetadata.settings.showIssueTimeline"
        }
    </p>
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.showJournalTimeline.description"}
        {fbvElement
        type="checkbox"
        id="geoMetadata_showJournalTimeline"
        value="1"
        checked=$geoMetadata_showJournalTimeline
        label="plugins.generic.geoMetadata.settings.showJournalTimeline"
        }
    </p>
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.timelineCollapsedByDefault.description"}
        {fbvElement
        type="checkbox"
        id="geoMetadata_timelineCollapsedByDefault"
        value="1"
        checked=$geoMetadata_timelineCollapsedByDefault
        label="plugins.generic.geoMetadata.settings.timelineCollapsedByDefault"
        }
    </p>
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.timelineShowInstructions.description"}
        {fbvElement
        type="checkbox"
        id="geoMetadata_timelineShowInstructions"
        value="1"
        checked=$geoMetadata_timelineShowInstructions
        label="plugins.generic.geoMetadata.settings.timelineShowInstructions"
        }
    </p>
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.timelineHeight.description"}
        {fbvElement
        type="text"
        id="geoMetadata_timelineHeight"
        value=$geoMetadata_timelineHeight
        size=$fbvStyles.size.SMALL
        label="plugins.generic.geoMetadata.settings.timelineHeight"
        }
    </p>
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.timelineClusterMaxItems.description"}
        {fbvElement
        type="text"
        id="geoMetadata_timelineClusterMaxItems"
        value=$geoMetadata_timelineClusterMaxItems
        size=$fbvStyles.size.SMALL
        label="plugins.generic.geoMetadata.settings.timelineClusterMaxItems"
        }
    </p>
    {/fbvFormSection}
    {/fbvFormArea}

    {fbvFormArea id="geoMetadataSettingsMapAppearance" title="plugins.generic.geoMetadata.settings.section.mapAppearance"}
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.section.mapAppearance.intro"}
    </p>

    {fbvFormSection title="plugins.generic.geoMetadata.settings.subsection.submissionMapDefault" list=true}
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.subsection.submissionMapDefault.description"}
    </p>
    <input type="hidden" name="geoMetadata_submissionMapDefaultLat"  id="geoMetadata_submissionMapDefaultLat"  value="{$geoMetadata_submissionMapDefaultLat|escape}">
    <input type="hidden" name="geoMetadata_submissionMapDefaultLng"  id="geoMetadata_submissionMapDefaultLng"  value="{$geoMetadata_submissionMapDefaultLng|escape}">
    <input type="hidden" name="geoMetadata_submissionMapDefaultZoom" id="geoMetadata_submissionMapDefaultZoom" value="{$geoMetadata_submissionMapDefaultZoom|escape}">
    <div id="geoMetadata_defaultMapViewPreview" style="height: 300px; margin-top: 10px;"></div>
    <script>
    (function () {ldelim}
        var tries = 0;
        function init() {ldelim}
            var div = document.getElementById('geoMetadata_defaultMapViewPreview');
            var latInput  = document.getElementById('geoMetadata_submissionMapDefaultLat');
            var lngInput  = document.getElementById('geoMetadata_submissionMapDefaultLng');
            var zoomInput = document.getElementById('geoMetadata_submissionMapDefaultZoom');
            if (!div || !latInput || !lngInput || !zoomInput || typeof L === 'undefined') return;
            if (div.offsetWidth === 0 && tries++ < 50) {ldelim} setTimeout(init, 100); return; {rdelim}
            if (div.dataset.geoMetadataInited === '1') return;
            div.dataset.geoMetadataInited = '1';
            var miniMap = L.map('geoMetadata_defaultMapViewPreview').setView(
                [parseFloat(latInput.value) || 0, parseFloat(lngInput.value) || 0],
                parseInt(zoomInput.value, 10) || 2
            );
            L.tileLayer('https://{ldelim}s{rdelim}.tile.openstreetmap.org/{ldelim}z{rdelim}/{ldelim}x{rdelim}/{ldelim}y{rdelim}.png', {ldelim}
                attribution: 'Map data: &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
                maxZoom: 18
            {rdelim}).addTo(miniMap);
            miniMap.on('moveend', function () {ldelim}
                var c = miniMap.getCenter();
                latInput.value  = c.lat.toFixed(6);
                lngInput.value  = c.lng.toFixed(6);
                zoomInput.value = miniMap.getZoom();
            {rdelim});
            window.geoMetadata_settingsMiniMap = miniMap;
            miniMap.invalidateSize();
        {rdelim}
        if (document.readyState === 'loading') {ldelim}
            document.addEventListener('DOMContentLoaded', init);
        {rdelim} else {ldelim}
            init();
        {rdelim}
    {rdelim})();
    </script>
    {/fbvFormSection}

    {fbvFormSection title="plugins.generic.geoMetadata.settings.subsection.featureColours" list=true}
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.subsection.featureColours.description"}
    </p>
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.mapFeatureColor.description"}
        <br/>
        <label for="geoMetadata_mapFeatureColor">{translate key="plugins.generic.geoMetadata.settings.mapFeatureColor"}</label>
        <input type="color" id="geoMetadata_mapFeatureColor" name="geoMetadata_mapFeatureColor" value="{$geoMetadata_mapFeatureColor|escape}">
    </p>
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.markerHueRotation.description"}
        <br/>
        <label for="geoMetadata_markerHueRotation">{translate key="plugins.generic.geoMetadata.settings.markerHueRotation"}</label>
        <input type="range" id="geoMetadata_markerHueRotation" name="geoMetadata_markerHueRotation" min="0" max="360" step="1" value="{$geoMetadata_markerHueRotation|escape}" style="vertical-align: middle;">
        <span id="geoMetadata_markerHueRotation_value" style="display: inline-block; min-width: 3em; vertical-align: middle;">{$geoMetadata_markerHueRotation|escape}&deg;</span>
        <img id="geoMetadata_markerHueRotation_preview"
             src="{$geoMetadata_markerBaseUrl|escape}marker-icon-2x-blue.png"
             alt=""
             style="height: 41px; vertical-align: middle; filter: hue-rotate({$geoMetadata_markerHueRotation|escape}deg);">
    </p>
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.mapFeatureColorHighlight.description"}
        <br/>
        <label for="geoMetadata_mapFeatureColorHighlight">{translate key="plugins.generic.geoMetadata.settings.mapFeatureColorHighlight"}</label>
        <input type="color" id="geoMetadata_mapFeatureColorHighlight" name="geoMetadata_mapFeatureColorHighlight" value="{$geoMetadata_mapFeatureColorHighlight|escape}">
    </p>
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.enableSyncedHighlight.description"}
        {fbvElement
        type="checkbox"
        id="geoMetadata_enableSyncedHighlight"
        value="1"
        checked=$geoMetadata_enableSyncedHighlight
        label="plugins.generic.geoMetadata.settings.enableSyncedHighlight"
        }
    </p>
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.showIssueMapIcon.description"}
        {fbvElement
        type="checkbox"
        id="geoMetadata_showIssueMapIcon"
        value="1"
        checked=$geoMetadata_showIssueMapIcon
        label="plugins.generic.geoMetadata.settings.showIssueMapIcon"
        }
    </p>
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.overlapPicker.description"}
        {fbvElement
        type="checkbox"
        id="geoMetadata_overlapPicker"
        value="1"
        checked=$geoMetadata_overlapPicker
        label="plugins.generic.geoMetadata.settings.overlapPicker"
        }
    </p>
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.markerHueRotationHighlight.description"}
        <br/>
        <label for="geoMetadata_markerHueRotationHighlight">{translate key="plugins.generic.geoMetadata.settings.markerHueRotationHighlight"}</label>
        <input type="range" id="geoMetadata_markerHueRotationHighlight" name="geoMetadata_markerHueRotationHighlight" min="0" max="360" step="1" value="{$geoMetadata_markerHueRotationHighlight|escape}" style="vertical-align: middle;">
        <span id="geoMetadata_markerHueRotationHighlight_value" style="display: inline-block; min-width: 3em; vertical-align: middle;">{$geoMetadata_markerHueRotationHighlight|escape}&deg;</span>
        <img id="geoMetadata_markerHueRotationHighlight_preview"
             src="{$geoMetadata_markerBaseUrl|escape}marker-icon-2x-blue.png"
             alt=""
             style="height: 41px; vertical-align: middle; filter: hue-rotate({$geoMetadata_markerHueRotationHighlight|escape}deg);">
    </p>
    <script>
    (function () {ldelim}
        function wire(sliderId, valueId, previewId) {ldelim}
            var slider  = document.getElementById(sliderId);
            var valueEl = document.getElementById(valueId);
            var preview = document.getElementById(previewId);
            if (!slider || !valueEl || !preview) return;
            function update() {ldelim}
                valueEl.textContent = slider.value + '°';
                preview.style.filter = 'hue-rotate(' + slider.value + 'deg)';
            {rdelim}
            slider.addEventListener('input', update);
        {rdelim}
        wire('geoMetadata_markerHueRotation',          'geoMetadata_markerHueRotation_value',          'geoMetadata_markerHueRotation_preview');
        wire('geoMetadata_markerHueRotationHighlight', 'geoMetadata_markerHueRotationHighlight_value', 'geoMetadata_markerHueRotationHighlight_preview');
    {rdelim})();
    </script>
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.adminUnitOverlayColor.description"}
        <br/>
        <label for="geoMetadata_adminUnitOverlayColor">{translate key="plugins.generic.geoMetadata.settings.adminUnitOverlayColor"}</label>
        <input type="color" id="geoMetadata_adminUnitOverlayColor" name="geoMetadata_adminUnitOverlayColor" value="{$geoMetadata_adminUnitOverlayColor|escape}">
    </p>
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.adminUnitOverlayFillOpacity.description"}
        <br/>
        <label for="geoMetadata_adminUnitOverlayFillOpacity">{translate key="plugins.generic.geoMetadata.settings.adminUnitOverlayFillOpacity"}</label>
        <input type="number" id="geoMetadata_adminUnitOverlayFillOpacity" name="geoMetadata_adminUnitOverlayFillOpacity" step="0.05" min="0" max="1" value="{$geoMetadata_adminUnitOverlayFillOpacity|escape}">
    </p>
    {/fbvFormSection}
    {/fbvFormArea}

    {fbvFormArea id="geoMetadataSettingsSubmission" title="plugins.generic.geoMetadata.settings.section.submission"}
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.section.submission.intro"}
    </p>
    {fbvFormSection list=true}
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.submission_enableSpatial.description"}
        {fbvElement
        type="checkbox"
        id="geoMetadata_submission_enableSpatial"
        value="1"
        checked=$geoMetadata_submission_enableSpatial
        label="plugins.generic.geoMetadata.settings.submission_enableSpatial"
        }
    </p>
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.submission_enableTemporal.description"}
        {fbvElement
        type="checkbox"
        id="geoMetadata_submission_enableTemporal"
        value="1"
        checked=$geoMetadata_submission_enableTemporal
        label="plugins.generic.geoMetadata.settings.submission_enableTemporal"
        }
    </p>
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.submission_enableAdminUnit.description"}
        {fbvElement
        type="checkbox"
        id="geoMetadata_submission_enableAdminUnit"
        value="1"
        checked=$geoMetadata_submission_enableAdminUnit
        label="plugins.generic.geoMetadata.settings.submission_enableAdminUnit"
        }
    </p>
    {/fbvFormSection}
    {/fbvFormArea}

    {fbvFormArea id="geoMetadataSettingsWorkflow" title="plugins.generic.geoMetadata.settings.section.workflow"}
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.section.workflow.intro"}
    </p>
    {fbvFormSection list=true}
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.workflow_enableSpatial.description"}
        {fbvElement
        type="checkbox"
        id="geoMetadata_workflow_enableSpatial"
        value="1"
        checked=$geoMetadata_workflow_enableSpatial
        label="plugins.generic.geoMetadata.settings.workflow_enableSpatial"
        }
    </p>
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.workflow_enableTemporal.description"}
        {fbvElement
        type="checkbox"
        id="geoMetadata_workflow_enableTemporal"
        value="1"
        checked=$geoMetadata_workflow_enableTemporal
        label="plugins.generic.geoMetadata.settings.workflow_enableTemporal"
        }
    </p>
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.workflow_enableAdminUnit.description"}
        {fbvElement
        type="checkbox"
        id="geoMetadata_workflow_enableAdminUnit"
        value="1"
        checked=$geoMetadata_workflow_enableAdminUnit
        label="plugins.generic.geoMetadata.settings.workflow_enableAdminUnit"
        }
    </p>
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.workflow_protectRawFields.description"}
        {fbvElement
        type="checkbox"
        id="geoMetadata_workflow_protectRawFields"
        value="1"
        checked=$geoMetadata_workflow_protectRawFields
        label="plugins.generic.geoMetadata.settings.workflow_protectRawFields"
        }
    </p>
    {/fbvFormSection}
    {/fbvFormArea}

    {fbvFormArea id="geoMetadataSettingsDiscovery" title="plugins.generic.geoMetadata.settings.section.discovery"}
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.section.discovery.intro"}
    </p>
    {fbvFormSection list=true}
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.emitMetaDublinCore.description"}
        {fbvElement
        type="checkbox"
        id="geoMetadata_emitMetaDublinCore"
        value="1"
        checked=$geoMetadata_emitMetaDublinCore
        label="plugins.generic.geoMetadata.settings.emitMetaDublinCore"
        }
    </p>
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.emitMetaGeoNames.description"}
        {fbvElement
        type="checkbox"
        id="geoMetadata_emitMetaGeoNames"
        value="1"
        checked=$geoMetadata_emitMetaGeoNames
        label="plugins.generic.geoMetadata.settings.emitMetaGeoNames"
        }
    </p>
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.emitMetaGeoCoords.description"}
        {fbvElement
        type="checkbox"
        id="geoMetadata_emitMetaGeoCoords"
        value="1"
        checked=$geoMetadata_emitMetaGeoCoords
        label="plugins.generic.geoMetadata.settings.emitMetaGeoCoords"
        }
    </p>
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.emitMetaISO19139.description"}
        {fbvElement
        type="checkbox"
        id="geoMetadata_emitMetaISO19139"
        value="1"
        checked=$geoMetadata_emitMetaISO19139
        label="plugins.generic.geoMetadata.settings.emitMetaISO19139"
        }
    </p>
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.emitSchemaOrg.description"}
        {fbvElement
        type="checkbox"
        id="geoMetadata_emitSchemaOrg"
        value="1"
        checked=$geoMetadata_emitSchemaOrg
        label="plugins.generic.geoMetadata.settings.emitSchemaOrg"
        }
    </p>
    {/fbvFormSection}
    {/fbvFormArea}

    {fbvFormArea id="geoMetadataSettingsServices" title="plugins.generic.geoMetadata.settings.section.services"}
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.section.services.intro"}
    </p>
    {fbvFormSection list=true}
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.showEsriBaseLayer.description"}
        {fbvElement
        type="checkbox"
        id="geoMetadata_showEsriBaseLayer"
        value="1"
        checked=$geoMetadata_showEsriBaseLayer
        label="plugins.generic.geoMetadata.settings.showEsriBaseLayer"
        }
    </p>
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.enableGeocoderSearch.description"}
        {fbvElement
        type="checkbox"
        id="geoMetadata_enableGeocoderSearch"
        value="1"
        checked=$geoMetadata_enableGeocoderSearch
        label="plugins.generic.geoMetadata.settings.enableGeocoderSearch"
        }
    </p>
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.privacy.info"}
    </p>
    <textarea id="geoMetadata_privacySnippet" readonly rows="10"
        style="width: 100%; font-family: monospace; font-size: 12px;">{translate key="plugins.generic.geoMetadata.privacy.snippet.osm"}{if $geoMetadata_showEsriBaseLayer}
{translate key="plugins.generic.geoMetadata.privacy.snippet.esri"}{/if}{if $geoMetadata_enableGeocoderSearch}
{translate key="plugins.generic.geoMetadata.privacy.snippet.geocoder"}{/if}
{translate key="plugins.generic.geoMetadata.privacy.snippet.legitimateInterest"}</textarea>
    {* Raw translation sources read from the DOM by the live-update script below, *}
    {* which avoids JS-string escaping for snippets that contain quotes and HTML. *}
    <script type="text/plain" id="geoMetadata_privacySnippet_osm">{translate key="plugins.generic.geoMetadata.privacy.snippet.osm"}</script>
    <script type="text/plain" id="geoMetadata_privacySnippet_esri">{translate key="plugins.generic.geoMetadata.privacy.snippet.esri"}</script>
    <script type="text/plain" id="geoMetadata_privacySnippet_geocoder">{translate key="plugins.generic.geoMetadata.privacy.snippet.geocoder"}</script>
    <script type="text/plain" id="geoMetadata_privacySnippet_legitimateInterest">{translate key="plugins.generic.geoMetadata.privacy.snippet.legitimateInterest"}</script>
    <script>
    (function() {ldelim}
        var textarea = document.getElementById('geoMetadata_privacySnippet');
        if (!textarea) return;
        var toggleables = [
            ['geoMetadata_showEsriBaseLayer', 'geoMetadata_privacySnippet_esri'],
            ['geoMetadata_enableGeocoderSearch', 'geoMetadata_privacySnippet_geocoder']
        ];
        var osm = document.getElementById('geoMetadata_privacySnippet_osm').textContent;
        var leg = document.getElementById('geoMetadata_privacySnippet_legitimateInterest').textContent;
        function geoMetadata_updatePrivacySnippet() {ldelim}
            var parts = [osm];
            for (var i = 0; i < toggleables.length; i++) {ldelim}
                var cb = document.getElementById(toggleables[i][0]);
                var sn = document.getElementById(toggleables[i][1]);
                if (cb && cb.checked && sn) parts.push(sn.textContent);
            {rdelim}
            parts.push(leg);
            textarea.value = parts.join('\n');
        {rdelim}
        toggleables.forEach(function (pair) {ldelim}
            var cb = document.getElementById(pair[0]);
            if (cb) cb.addEventListener('change', geoMetadata_updatePrivacySnippet);
        {rdelim});
    {rdelim})();
    </script>
    {/fbvFormSection}
    {/fbvFormArea}

    {fbvFormArea id="geoMetadataSettingsAccounts" title="plugins.generic.geoMetadata.settings.section.accounts"}
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.section.accounts.intro"}
    </p>
    {fbvFormSection list=true}
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.usernameGeonames.description"}
        {fbvElement
        type="text"
        id="geoMetadata_geonames_username"
        value=$geoMetadata_geonames_username
        label="plugins.generic.geoMetadata.settings.usernameGeonames"
        }
    </p>
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.geoMetadata.settings.baseurlGeonames.description"}
        {fbvElement
        type="text"
        id="geoMetadata_geonames_baseurl"
        value=$geoMetadata_geonames_baseurl
        label="plugins.generic.geoMetadata.settings.baseurlGeonames"
        }
    </p>
    {/fbvFormSection}
    {/fbvFormArea}

    {fbvFormButtons submitText="common.save"}
</form>
