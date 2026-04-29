{**
 * templates/frontend/objects/issue_map.tpl
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * @brief View of a map for all articles of an issue.
 *
 * @uses $issue Issue The issue
 * @uses $heading string HTML heading element, default: h2
 *}

 {if !$heading}
	{assign var="heading" value="h2"}
{/if}
{assign var="articleHeading" value="h3"}
{if $heading == "h3"}
	{assign var="articleHeading" value="h4"}
{elseif $heading == "h4"}
	{assign var="articleHeading" value="h5"}
{elseif $heading == "h5"}
	{assign var="articleHeading" value="h6"}
{/if}

<div id="geoMetadata_issueMap" class="section">
{if $section.articles}
	<link rel="stylesheet" href="{$pluginStylesheetURL}/styles.css" type="text/css" />

	{include file=$geoMetadata_mapJsGlobalsTpl}
	<script type="text/javascript">
		const geoMetadata_markerBaseUrl = '{$geoMetadata_markerBaseUrl}';
	</script>

    <{$heading}>{translate key="plugins.generic.geoMetadata.issue.title"}</{$heading}>

	{if $geoMetadata_issueHasTemporal}
	{capture assign="geoMetadata_issueFrom"}<span id="geoMetadata_issueTemporalFrom"></span>{/capture}
	{capture assign="geoMetadata_issueTo"}<span id="geoMetadata_issueTemporalTo"></span>{/capture}
	{capture assign="geoMetadata_issueYear"}<span id="geoMetadata_issueTemporalYear"></span>{/capture}
	<p id="geoMetadata_issueTemporalRange" class="description" style="display:none">
		{translate key="plugins.generic.geoMetadata.issue.temporalCoverage" from=$geoMetadata_issueFrom to=$geoMetadata_issueTo}
	</p>
	<p id="geoMetadata_issueTemporalSingle" class="description" style="display:none">
		{translate key="plugins.generic.geoMetadata.issue.temporalCoverage.singleYear" year=$geoMetadata_issueYear}
	</p>
	{/if}

	{if $geoMetadata_issueHasTemporal && $geoMetadata_showIssueTimeline}
	<script type="text/javascript">
		const geoMetadata_timelineCollapseHideLabel = '{translate key="plugins.generic.geoMetadata.timeline.collapse.hide"|escape:'javascript'}';
		const geoMetadata_timelineCollapseShowLabel = '{translate key="plugins.generic.geoMetadata.timeline.collapse.show"|escape:'javascript'}';
	</script>
	{include file=$geoMetadata_issueTimelineTpl}
	{/if}

	{if $geoMetadata_issueHasSpatial && $geoMetadata_showIssueMap}
	<div id="mapdiv" style="width: 100%; height: 360px; z-index: 1;"></div>
	<p class="geoMetadata_privacyNotice description">
		{translate key="plugins.generic.geoMetadata.privacy.mapNotice"}
	</p>
	{/if}

	<p class="geoMetadata_license">
		{translate key="plugins.generic.geoMetadata.license.frontend" license=$geoMetadata_metadataLicense}
	</p>
{/if}
</div>

{*main js script, needs to be loaded last*}
<script src="{$geoMetadata_issueJS}" type="text/javascript" defer></script>
