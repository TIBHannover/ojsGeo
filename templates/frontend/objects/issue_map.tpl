{**
 * templates/frontend/objects/article_details.tpl
 *
 * Copyright (c) 2022 OPTIMETA project
 * Copyright (c) 2022 Daniel Nüst
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * @brief View of a map for all articles of an issue
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

 <div class="section">

{if $section.articles}
	<link rel="stylesheet" href="{$pluginStylesheetURL}/optimetaGeo.css" type="text/css" />
	
	<script type="text/javascript">
		const optimetageo_mapLayerStyle = {
			weight: 5,
			color: '#1E6292',
			dashArray: '',
			fillOpacity: 0.7
		};

		const optimetageo_mapLayerStyleHighlight = {
			weight: 5,
			color: 'red',
			dashArray: '',
			fillOpacity: 0.7
		};

		const optimetageo_layerName = '{translate key="plugins.generic.optimetaGeo.map.articleLayerName"}';
		const optimetageo_markerBaseUrl = '{$optimetageo_markerBaseUrl}';
	</script>

    <{$heading}>{translate key="plugins.generic.optimetaGeo.issue.title"}</{$heading}>

	<div id="mapdiv" style="width: 100%; height: 360px; z-index: 1;"></div>
{/if}
</div>

{*main js script, needs to be loaded last*}
<script src="{$optimetageo_issueJS}" type="text/javascript" defer></script>
