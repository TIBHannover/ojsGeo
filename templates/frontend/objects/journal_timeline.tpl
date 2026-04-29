{**
 * templates/frontend/objects/journal_timeline.tpl
 *
 * Copyright (c) 2026 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * @brief Timeline strip showing every published article's time periods, rendered
 *        below the journal-wide map (issue #74). Reuses the .geoMetadata_data.publications
 *        hidden input that journal_map.tpl already exposes for the map itself.
 *}

<div id="geoMetadata_journalTimeline" class="geoMetadata_timelineSection">
    <p class="geoMetadata_timelineCollapse">
        <a href="#" class="geoMetadata_timelineCollapseLink"
           role="button"
           aria-expanded="{if $geoMetadata_timelineCollapsedByDefault}false{else}true{/if}"
           aria-controls="geoMetadata_journalTimelineBody">
            <span class="geoMetadata_timelineCollapseIcon" aria-hidden="true">{if $geoMetadata_timelineCollapsedByDefault}&#9654;{else}&#9660;{/if}</span>
            <span class="geoMetadata_timelineCollapseLabel">{if $geoMetadata_timelineCollapsedByDefault}{translate key="plugins.generic.geoMetadata.timeline.collapse.show"}{else}{translate key="plugins.generic.geoMetadata.timeline.collapse.hide"}{/if}</span>
        </a>
    </p>
    <div id="geoMetadata_journalTimelineBody" class="geoMetadata_timelineBody"{if $geoMetadata_timelineCollapsedByDefault} style="display:none"{/if}>
        <h2>{translate key="plugins.generic.geoMetadata.timeline.heading"}</h2>
        {if $geoMetadata_timelineShowInstructions}
        <p class="geoMetadata_privacyNotice description">
            {translate key="plugins.generic.geoMetadata.timeline.instructions"}
        </p>
        {/if}
        <div id="gm-timelinediv" class="geoMetadata_timelineCanvas" style="height: {$geoMetadata_timelineHeight|escape:'html'}px;"></div>
    </div>
</div>
