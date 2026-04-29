{**
 * templates/frontend/pages/journal_map.tpl
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * @brief Display the page to view geospatial metadata for a journal.
 *
 * @uses $journal The name of the journal currently being viewed
 * @uses $publications JSON-encoded array with all data for the map
 *}

{include file="frontend/components/header.tpl" pageTitle="plugins.generic.geoMetadata.journal.pageTitle"}

{include file=$geoMetadata_mapJsGlobalsTpl}
<script type="text/javascript">
const geoMetadata_articleBaseUrl = '{if $journal}{url journal=$journal->getPath() page="article" op="view" path=""}{else}{url page="article" op="view" path=""}{/if}';
</script>

<link rel="stylesheet" href="{$pluginStylesheetURL}styles.css" type="text/css" />

<input type="text" class="geoMetadata_data publications" name="publications"
    style="height: 0px; width: 0px; visibility: hidden;" value='{$publications|escape:'html'}'>

<div class="page page_about_publishing_system">
	{include file="frontend/components/breadcrumbs.tpl" currentTitleKey="plugins.generic.geoMetadata.journal.breadcrump"}
	<h1>{translate key="plugins.generic.geoMetadata.journal.title" journal=$context}</h1>
	<p>{translate key="plugins.generic.geoMetadata.journal.text"}</p>

	{capture assign="geoMetadata_journalFrom"}<span id="geoMetadata_journalTemporalFrom"></span>{/capture}
	{capture assign="geoMetadata_journalTo"}<span id="geoMetadata_journalTemporalTo"></span>{/capture}
	{capture assign="geoMetadata_journalYear"}<span id="geoMetadata_journalTemporalYear"></span>{/capture}
	<p id="geoMetadata_journalTemporalRange" class="description" style="display:none">
		{translate key="plugins.generic.geoMetadata.journal.temporalCoverage" from=$geoMetadata_journalFrom to=$geoMetadata_journalTo}
	</p>
	<p id="geoMetadata_journalTemporalSingle" class="description" style="display:none">
		{translate key="plugins.generic.geoMetadata.journal.temporalCoverage.singleYear" year=$geoMetadata_journalYear}
	</p>

	{if $geoMetadata_showJournalTimeline}
	<script type="text/javascript">
		const geoMetadata_timelineCollapseHideLabel = '{translate key="plugins.generic.geoMetadata.timeline.collapse.hide"|escape:'javascript'}';
		const geoMetadata_timelineCollapseShowLabel = '{translate key="plugins.generic.geoMetadata.timeline.collapse.show"|escape:'javascript'}';
	</script>
	{include file=$geoMetadata_journalTimelineTpl}
	{/if}

	{if $geoMetadata_showJournalMap}
	<div id="mapdiv" style="width: 100%; height: 480px; z-index: 1;"></div>
	<p class="geoMetadata_privacyNotice description">
		{translate key="plugins.generic.geoMetadata.privacy.mapNotice"}
	</p>
	{/if}

	<p class="geoMetadata_license">
		{translate key="plugins.generic.geoMetadata.license.frontend" license=$geoMetadata_metadataLicense}
	</p>
</div><!-- .page -->

{*main js script, needs to be loaded last*}
<script src="{$geoMetadata_journalJS}" type="text/javascript" defer></script>

{include file="frontend/components/footer.tpl"}
