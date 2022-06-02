{**
 * templates/frontend/pages/journal_map.tpl
 *
 * Copyright (c) 2022 OPTIMETA project
 * Copyright (c) 2022 Daniel Nüst
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * @brief Display the page to view geospatial metadata for a journal.
 *
 * @uses $journal The name of the journal currently being viewed
 * @uses $publications JSON-encoded array with all data for the map
 *}
{include file="frontend/components/header.tpl" pageTitle="plugins.generic.optimetaGeo.journal.pageTitle"}

<script type="text/javascript">
const optimetageo_mapLayerStyle = {
    weight: 5,
    color: '#1E6292',
    dashArray: '',
    fillOpacity: 0.7
};

const optimetageo_layerName = '{translate key="plugins.generic.optimetaGeo.map.articleLayerName"}';

const optimetageo_articleBaseUrl = '{if $journal}{url journal=$journal->getPath() page="article" op="view" path=""}{else}{url page="article" op="view" path=""}{/if}';

</script>

<link rel="stylesheet" href="{$pluginStylesheetURL}/optimetaGeo.css" type="text/css" />

<input type="text" class="optimeta_data publications" name="publications"
    style="height: 0px; width: 0px; visibility: hidden;" value='{$publications}'>

<div class="page page_about_publishing_system">
	{include file="frontend/components/breadcrumbs.tpl" currentTitleKey="plugins.generic.optimetaGeo.journal.breadcrump"}
	<h1>{translate key="plugins.generic.optimetaGeo.journal.title"} {$context}</h1>
	<p>{translate key="plugins.generic.optimetaGeo.journal.text"}</p>

	<div id="mapdiv" style="width: 100%; height: 480px; z-index: 1;"></div>

</div><!-- .page -->

{*main js script, needs to be loaded last*}
<script src="{$optimeta_journalJS}" type="text/javascript" defer></script>

{include file="frontend/components/footer.tpl"}
