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
