{**
 * templates/frontend/objects/issue_details.tpl
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * @brief Embed geospatial metadata in hidden fields for use on the issue map.
 *
 * The main template is here extended using the hook 'Templates::Issue::Issue::Article'.
 *}

<input type="text" class="geoMetadata_data articleId" name="articleId"
    style="height: 0px; width: 0px; visibility: hidden;"
    value='article-{$article->getId()}'
    data-title="{$article->getLocalizedTitle()|strip_unsafe_html|escape}"
    data-sr-label="{translate key="plugins.generic.geoMetadata.issue.mapIcon.sr" title=$article->getLocalizedTitle()|strip_unsafe_html|escape}">
<input type="text" class="geoMetadata_data spatial" name="{$smarty.const.GEOMETADATA_DB_FIELD_SPATIAL}"
    style="height: 0px; width: 0px; visibility: hidden;" value='{${$smarty.const.GEOMETADATA_DB_FIELD_SPATIAL}|escape:'html'}'>
<input type="text" class="geoMetadata_data temporal" name="{$smarty.const.GEOMETADATA_DB_FIELD_TIME_PERIODS}"
    style="height: 0px; width: 0px; visibility: hidden;" value='{${$smarty.const.GEOMETADATA_DB_FIELD_TIME_PERIODS}|escape:'html'}'>
<input type="text" class="geoMetadata_data popup" name="mapPopup"
    style="height: 0px; width: 0px; visibility: hidden;" value='
		<{$heading} class="title">
		<a id="article-{$article->getId()}" class="geoMetadata_issue_maplink" {if $journal}href="{url journal=$journal->getPath() page="article" op="view" path=$articlePath}"{else}href="{url page="article" op="view" path=$articlePath}"{/if}>
			{$article->getLocalizedTitle()|strip_unsafe_html}
			{if $article->getLocalizedSubtitle()}
				<span class="subtitle">
					{$article->getLocalizedSubtitle()|escape}
				</span>
			{/if}
		</a>
		</{$heading}>
		<br/>
		{if $showAuthor}
			<div class="authors">
				{$article->getAuthorString()|escape}
			</div>
		{/if} 
		{if $publication->getData(GEOMETADATA_DB_FIELD_TIME_PERIODS) != ""}
			<p></p>
			<i class="fa fa-calendar pkpIcon--inline"></i>
			<i>{$publication->getData(GEOMETADATA_DB_FIELD_TIME_PERIODS)|escape|replace:'..':' – '|replace:'{':''|replace:'}':''}</i>
		{/if}
		{if $article->getCoverage($journal->getPrimaryLocale()) != "no data" && $article->getCoverage($journal->getPrimaryLocale()) != ""}
			<p></p>
            <i class="fa fa-map-marker pkpIcon--inline"></i>
			<i>{$article->getCoverage($journal->getPrimaryLocale())|escape}</i>
		{/if}
	'>

{* <input type="text" class="geoMetadata_data temporal" name="{$smarty.const.GEOMETADATA_DB_FIELD_TIME_PERIODS}"
    style="height: 0px; width: 0px; visibility: hidden;" value='{${$smarty.const.GEOMETADATA_DB_FIELD_TIME_PERIODS}}' /> *}
{* <input type="text" class="geoMetadata_data administrativeUnit" naissueme="{$smarty.const.GEOMETADATA_DB_FIELD_ADMINUNIT}"
    style="height: 0px; width: 0px; visibility: hidden;" value='{${$smarty.const.GEOMETADATA_DB_FIELD_ADMINUNIT}|escape:'html'}' /> *}
