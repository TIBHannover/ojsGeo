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
    <{$heading}>{translate key="plugins.generic.optimetaGeo.issue.title"}</{$heading}>

	<div id="mapdiv" style="width: 100%; height: 360px; z-index: 1;"></div>
{/if}
</div>

{*main js script, needs to be loaded last*}
<script src="{$optimeta_issueJS}" type="text/javascript" defer></script>
