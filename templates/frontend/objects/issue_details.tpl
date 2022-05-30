{*the main template is here extended using the hook 'Templates::Issue::Issue::Article'*}

<link rel="stylesheet" href="{$pluginStylesheetURL}/optimetaGeo.css" type="text/css" />

<script type="text/javascript">
var mapLayerStyle = {
        weight: 5,
        color: '#1E6292',
        dashArray: '',
        fillOpacity: 0.7
    }
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
