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
</script>

<input type="text" class="optimeta_data articleId" name="spatialProperties"
    style="height: 0px; width: 0px; visibility: hidden;" value='article-{$article->getId()}'>
<input type="text" class="optimeta_data spatial" name="spatialProperties"
    style="height: 0px; width: 0px; visibility: hidden;" value='{$spatialProperties}'>
<input type="text" class="optimeta_data popup" name="mapPopup"
    style="height: 0px; width: 0px; visibility: hidden;" value='<{$heading} class="title">
		<a id="article-{$article->getId()}" {if $journal}href="{url journal=$journal->getPath() page="article" op="view" path=$articlePath}"{else}href="{url page="article" op="view" path=$articlePath}"{/if}>
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
    {/if}'>

{* <input type="text" class="optimeta_data temporal" name="temporalProperties"
    style="height: 0px; width: 0px; visibility: hidden;" value='{$temporalProperties}' /> *}
{* <input type="text" class="optimeta_data administrativeUnit" name="administrativeUnit"
    style="height: 0px; width: 0px; visibility: hidden;" value='{$administrativeUnit}'> *}
