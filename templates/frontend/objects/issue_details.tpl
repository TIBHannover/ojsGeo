{**
 * templates/frontend/objects/article_details.tpl
 *
 * Copyright (c) 2022 OPTIMETA project
 * Copyright (c) 2022 Daniel Nüst
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * @brief Embed geospatial metadata in hidden fields for use on the issue map.
 *
 * The main template is here extended using the hook 'Templates::Issue::Issue::Article'.
 *}

<input type="text" class="optimeta_data articleId" name="articleId"
    style="height: 0px; width: 0px; visibility: hidden;" value='article-{$article->getId()}'>
<input type="text" class="optimeta_data spatial" name="{$smarty.const.OPTIMETA_GEO_DB_FIELD_SPATIAL}"
    style="height: 0px; width: 0px; visibility: hidden;" value='{${$smarty.const.OPTIMETA_GEO_DB_FIELD_SPATIAL}}'>

{if $activeTheme->getOption('parentName') == 'defaultthemeplugin'}

<input type="text" class="optimeta_data popup" name="mapPopup"
    style="height: 0px; width: 0px; visibility: hidden;" value='
		<{$heading} class="title">
		<a id="article-{$article->getId()}" class="optimetageo_issue_maplink" {if $journal}href="{url journal=$journal->getPath() page="article" op="view" path=$articlePath}"{else}href="{url page="article" op="view" path=$articlePath}"{/if}>
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
		<p class="metadata">{$article->getCoverage($journal->getPrimaryLocale())|escape}</p>
	'>

{/if} {* defaultthemeplugin *}

{* Based on https://github.com/pkp/pragma/blob/main/templates/frontend/objects/article_summary.tpl *}
{if $activeTheme->getOption('parentName') == 'pragmathemeplugin'}

<input type="text" class="optimeta_data popup" name="mapPopup"
    style="height: 0px; width: 0px; visibility: hidden;" value='
		<h4 class="article__title">
			<a {if $journal}href="{url journal=$journal->getPath() page="article" op="view" path=$articlePath}"{else}href="{url page="article" op="view" path=$articlePath}"{/if}>
				{$article->getLocalizedFullTitle()|escape}
			</a>
		</h4>
		{if $showAuthor}
			<p class="metadata">{$article->getAuthorString()|escape}</p>
		{/if}
		<p class="metadata">{$article->getCoverage($journal->getPrimaryLocale())|escape}</p>
	'>

{/if} {* pragmathemeplugin *}

{* <input type="text" class="optimeta_data temporal" name="{$smarty.const.OPTIMETA_GEO_DB_FIELD_TIME_PERIODS}"
    style="height: 0px; width: 0px; visibility: hidden;" value='{${$smarty.const.OPTIMETA_GEO_DB_FIELD_TIME_PERIODS}}' /> *}
{* <input type="text" class="optimeta_data administrativeUnit" naissueme="{$smarty.const.OPTIMETA_GEO_DB_FIELD_ADMINUNIT}"
    style="height: 0px; width: 0px; visibility: hidden;" value='{${$smarty.const.OPTIMETA_GEO_DB_FIELD_ADMINUNIT}}' /> *}
