{**
 * templates/frontend/objects/issue_map.tpl
 *
 * Copyright (c) 2022 OPTIMETA, Daniel Nüst
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
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
    
    <div>Test map for issue no. {$issue->getBestIssueId()}!</div>
{/if}
</div>
