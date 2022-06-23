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
    fillOpacity: 0.6
};

const optimetageo_layerName = '{translate key="plugins.generic.optimetaGeo.map.articleLayerName"}';
const optimetageo_articleBaseUrl = '{if $journal}{url journal=$journal->getPath() page="article" op="view" path=""}{else}{url page="article" op="view" path=""}{/if}';
</script>

<link rel="stylesheet" href="{$pluginStylesheetURL}optimetaGeo.css" type="text/css" />

<input type="text" class="optimeta_data publications" name="publications"
    style="height: 0px; width: 0px; visibility: hidden;" value='{$publications}'>

{if $activeTheme->getOption('parentName') == 'defaultthemeplugin'}
<div class="page page_about_publishing_system">
	{include file="frontend/components/breadcrumbs.tpl" currentTitleKey="plugins.generic.optimetaGeo.journal.breadcrump"}
	<h1>{translate key="plugins.generic.optimetaGeo.journal.title"} {$context}</h1>
	<p>{translate key="plugins.generic.optimetaGeo.journal.text"}</p>

	<div id="mapdiv" style="width: 100%; height: 480px; z-index: 1;"></div>

</div><!-- .page -->
{/if} {* default *}

{if $activeTheme->getOption('parentName') == 'pragmathemeplugin'}
<main class="container main__content" id="main">
    <h2>{translate key="plugins.generic.optimetaGeo.journal.title"} {$context}</h2>
	<p>{translate key="plugins.generic.optimetaGeo.journal.text"}</p>

	<div id="mapdiv" style="width: 100%; height: 360px; z-index: 1; position: relative;" class="leaflet-container leaflet-touch leaflet-retina leaflet-fade-anim leaflet-grab leaflet-touch-drag leaflet-touch-zoom" tabindex="0"><div class="leaflet-pane leaflet-map-pane" style="transform: translate3d(0px, 0px, 0px);"><div class="leaflet-pane leaflet-tile-pane"><div class="leaflet-layer " style="z-index: 1; opacity: 1;"><div class="leaflet-tile-container leaflet-zoom-animated" style="z-index: 18; transform: translate3d(0px, 0px, 0px) scale(1);"><img alt="" role="presentation" src="https://b.tile.openstreetmap.org/4/8/5.png" class="leaflet-tile leaflet-tile-loaded" style="width: 256px; height: 256px; transform: translate3d(488px, 52px, 0px); opacity: 1;"><img alt="" role="presentation" src="https://a.tile.openstreetmap.org/4/8/4.png" class="leaflet-tile leaflet-tile-loaded" style="width: 256px; height: 256px; transform: translate3d(488px, -204px, 0px); opacity: 1;"><img alt="" role="presentation" src="https://a.tile.openstreetmap.org/4/7/5.png" class="leaflet-tile leaflet-tile-loaded" style="width: 256px; height: 256px; transform: translate3d(232px, 52px, 0px); opacity: 1;"><img alt="" role="presentation" src="https://c.tile.openstreetmap.org/4/9/5.png" class="leaflet-tile leaflet-tile-loaded" style="width: 256px; height: 256px; transform: translate3d(744px, 52px, 0px); opacity: 1;"><img alt="" role="presentation" src="https://c.tile.openstreetmap.org/4/8/6.png" class="leaflet-tile leaflet-tile-loaded" style="width: 256px; height: 256px; transform: translate3d(488px, 308px, 0px); opacity: 1;"><img alt="" role="presentation" src="https://c.tile.openstreetmap.org/4/7/4.png" class="leaflet-tile leaflet-tile-loaded" style="width: 256px; height: 256px; transform: translate3d(232px, -204px, 0px); opacity: 1;"><img alt="" role="presentation" src="https://b.tile.openstreetmap.org/4/9/4.png" class="leaflet-tile leaflet-tile-loaded" style="width: 256px; height: 256px; transform: translate3d(744px, -204px, 0px); opacity: 1;"><img alt="" role="presentation" src="https://b.tile.openstreetmap.org/4/7/6.png" class="leaflet-tile leaflet-tile-loaded" style="width: 256px; height: 256px; transform: translate3d(232px, 308px, 0px); opacity: 1;"><img alt="" role="presentation" src="https://a.tile.openstreetmap.org/4/9/6.png" class="leaflet-tile leaflet-tile-loaded" style="width: 256px; height: 256px; transform: translate3d(744px, 308px, 0px); opacity: 1;"><img alt="" role="presentation" src="https://c.tile.openstreetmap.org/4/6/5.png" class="leaflet-tile leaflet-tile-loaded" style="width: 256px; height: 256px; transform: translate3d(-24px, 52px, 0px); opacity: 1;"><img alt="" role="presentation" src="https://a.tile.openstreetmap.org/4/10/5.png" class="leaflet-tile leaflet-tile-loaded" style="width: 256px; height: 256px; transform: translate3d(1000px, 52px, 0px); opacity: 1;"><img alt="" role="presentation" src="https://b.tile.openstreetmap.org/4/6/4.png" class="leaflet-tile leaflet-tile-loaded" style="width: 256px; height: 256px; transform: translate3d(-24px, -204px, 0px); opacity: 1;"><img alt="" role="presentation" src="https://c.tile.openstreetmap.org/4/10/4.png" class="leaflet-tile leaflet-tile-loaded" style="width: 256px; height: 256px; transform: translate3d(1000px, -204px, 0px); opacity: 1;"><img alt="" role="presentation" src="https://a.tile.openstreetmap.org/4/6/6.png" class="leaflet-tile leaflet-tile-loaded" style="width: 256px; height: 256px; transform: translate3d(-24px, 308px, 0px); opacity: 1;"><img alt="" role="presentation" src="https://b.tile.openstreetmap.org/4/10/6.png" class="leaflet-tile leaflet-tile-loaded" style="width: 256px; height: 256px; transform: translate3d(1000px, 308px, 0px); opacity: 1;"></div></div></div><div class="leaflet-pane leaflet-shadow-pane"></div><div class="leaflet-pane leaflet-overlay-pane"><svg pointer-events="none" class="leaflet-zoom-animated" width="1332" height="432" style="transform: translate3d(-111px, -36px, 0px);" viewBox="-111 -36 1332 432"><g><path class="leaflet-interactive" stroke="#1E6292" stroke-opacity="1" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="#1E6292" fill-opacity="0.7" fill-rule="evenodd" d="M359 288L359 72L751 72L751 288z"></path></g></svg></div><div class="leaflet-pane leaflet-marker-pane"></div><div class="leaflet-pane leaflet-tooltip-pane"></div><div class="leaflet-pane leaflet-popup-pane"></div><div class="leaflet-proxy leaflet-zoom-animated" style="transform: translate3d(2115.33px, 1408.27px, 0px) scale(8);"></div></div><div class="leaflet-control-container"><div class="leaflet-top leaflet-left"><div class="leaflet-control-zoom leaflet-bar leaflet-control"><a class="leaflet-control-zoom-in" href="#" title="Zoom in" role="button" aria-label="Zoom in">+</a><a class="leaflet-control-zoom-out" href="#" title="Zoom out" role="button" aria-label="Zoom out">−</a></div></div><div class="leaflet-top leaflet-right"><div class="leaflet-control-layers leaflet-control" aria-haspopup="true"><a class="leaflet-control-layers-toggle" href="#" title="Layers"></a><section class="leaflet-control-layers-list"><div class="leaflet-control-layers-base"><label><div><input type="radio" class="leaflet-control-layers-selector" name="leaflet-base-layers_35" checked="checked"><span> OpenStreetMap</span></div></label><label><div><input type="radio" class="leaflet-control-layers-selector" name="leaflet-base-layers_35"><span> Esri World Imagery</span></div></label></div><div class="leaflet-control-layers-separator"></div><div class="leaflet-control-layers-overlays"><label><div><input type="checkbox" class="leaflet-control-layers-selector" checked=""><span> Articles</span></div></label></div></section></div></div><div class="leaflet-bottom leaflet-left"></div><div class="leaflet-bottom leaflet-right"><div class="leaflet-control-scale leaflet-control"><div class="leaflet-control-scale-line" style="width: 78px;">500 km</div><div class="leaflet-control-scale-line" style="width: 75px;">300 mi</div></div><div class="leaflet-control-attribution leaflet-control"><a href="https://leafletjs.com" title="A JS library for interactive maps">Leaflet</a> | Map data: © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors</div></div></div></div>
</main><!-- .container -->
{/if} {* pragma *}


{*main js script, needs to be loaded last*}
<script src="{$optimetagep_journalJS}" type="text/javascript" defer></script>

{include file="frontend/components/footer.tpl"}
