<?php
/**
 * @file GeoMetadataPlugin.inc.php
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file dLICENSE.
 *
 * @class GeoMetadataPlugin
 * @brief Plugin class for the geoMetadata Plugin.
 */

const MAP_URL_PATH = 'map';

// following names are also used in JavaScript files to identify fields
const GEOMETADATA_DB_FIELD_TIME_PERIODS = 'geoMetadata::timePeriods';
const GEOMETADATA_DB_FIELD_SPATIAL =      'geoMetadata::spatialProperties';
const GEOMETADATA_DB_FIELD_ADMINUNIT =    'geoMetadata::administrativeUnit';

const GEOMETADATA_FORM_NAME = 'geoMetadata_PublicationForm';

const GEOMETADATA_PLUGIN_PATH = __DIR__;

require_once (GEOMETADATA_PLUGIN_PATH . '/vendor/autoload.php');

import('lib.pkp.classes.plugins.GenericPlugin');

import('plugins.generic.geoMetadata.classes.Components.Forms.PublicationForm');
import('plugins.generic.geoMetadata.classes.Components.Forms.SettingsForm');
import('plugins.generic.geoMetadata.classes.Geo.AntimeridianSplitter');
import('plugins.generic.geoMetadata.classes.Geo.Centroid');
import('plugins.generic.geoMetadata.classes.Geo.SchemaOrgGeo');

use geoMetadata\classes\Components\Forms\PublicationForm;
use geoMetadata\classes\Components\Forms\SettingsForm;
use geoMetadata\classes\Geo\AntimeridianSplitter;
use geoMetadata\classes\Geo\Centroid;
use geoMetadata\classes\Geo\SchemaOrgGeo;
use Spatie\SchemaOrg\Schema;

class GeoMetadataPlugin extends GenericPlugin
{
    protected $ojsVersion = '3.3.0.0';

    protected $versionSpecificNameState = 'state';

	public $templateParameters = [
		'pluginStylesheetURL' => '',
		'pluginJavaScriptURL' => '',
	];

	public $dbFields = [
		'spatial' => GEOMETADATA_DB_FIELD_SPATIAL,
		'temporal' => GEOMETADATA_DB_FIELD_TIME_PERIODS,
		'admin' => GEOMETADATA_DB_FIELD_ADMINUNIT,
	];

	/**
	 * Boolean plugin-setting read with "never saved" = on semantics.
	 */
	public function isFeatureEnabled(string $key): bool
	{
		$value = $this->getSetting($this->getCurrentContextId(), $key);
		return $value === null || (bool) $value;
	}

	/**
	 * String plugin-setting read with a per-key fallback from SettingsForm::$settingDefaults.
	 */
	public function getSettingOrDefault(string $key): ?string
	{
		$value = $this->getSetting($this->getCurrentContextId(), $key);
		if ($value === null || $value === '') {
			return SettingsForm::getDefault($key);
		}
		return (string) $value;
	}

	/**
	 * Return a CSS `rgba(r, g, b, a)` string for a `#RRGGBB` hex + an alpha in [0, 1].
	 * Malformed input falls back to black + the given alpha.
	 */
	public static function hexToRgba(string $hex, float $alpha): string
	{
		$hex = ltrim($hex, '#');
		if (strlen($hex) !== 6 || !ctype_xdigit($hex)) {
			return "rgba(0, 0, 0, {$alpha})";
		}
		$r = hexdec(substr($hex, 0, 2));
		$g = hexdec(substr($hex, 2, 2));
		$b = hexdec(substr($hex, 4, 2));
		return "rgba({$r}, {$g}, {$b}, {$alpha})";
	}

	public function register($category, $path, $mainContextId = NULL)
	{
		// Register the plugin even when it is not enabled
		$success = parent::register($category, $path, $mainContextId);

		// Current Request / Context
		$request = $this->getRequest();

		// Fill generic template parameters
		$this->templateParameters['pluginStylesheetURL'] = $request->getBaseUrl() . '/' . $this->getPluginPath() . '/css';
		$this->templateParameters['pluginJavaScriptURL'] = $request->getBaseUrl() . '/' . $this->getPluginPath() . '/js';

		// important to check if plugin is enabled before registering the hook, cause otherwise plugin will always run no matter enabled or disabled!
		if ($success && $this->getEnabled()) {
			// Register the /map URL handler if either the journal map or the journal timeline (issue #74)
			// is enabled — both render on the same page.
			if ($this->isFeatureEnabled('geoMetadata_showJournalMap') || $this->isFeatureEnabled('geoMetadata_showJournalTimeline')) {
				// custom page handler, see https://docs.pkp.sfu.ca/dev/plugin-guide/en/examples-custom-page
				HookRegistry::register('LoadHandler', array($this, 'setPageHandler'));
			}

			// Hooks for changing the frontent Submit an Article 3. Enter Metadata
			HookRegistry::register('Templates::Submission::SubmissionMetadataForm::AdditionalMetadata', array($this, 'extendSubmissionMetadataFormTemplate'));

			// Server-side validation of the temporal field on step 3 (refs #140).
			HookRegistry::register('submissionsubmitstep3form::readuservars', array($this, 'step3TemporalReadUserVars'));
			HookRegistry::register('submissionsubmitstep3form::Constructor', array($this, 'step3TemporalAddValidator'));

			// Hooks for changing the article page
			HookRegistry::register('Templates::Article::Main', array(&$this, 'extendArticleMainTemplate'));
			HookRegistry::register('Templates::Article::Main', array(&$this, 'emitSchemaOrgJsonLd'));
			HookRegistry::register('Templates::Article::Details', array(&$this, 'extendArticleDetailsTemplate'));
			HookRegistry::register('ArticleHandler::view', array(&$this, 'extendArticleView')); //

			if ($this->isFeatureEnabled('geoMetadata_showIssueMap') || $this->isFeatureEnabled('geoMetadata_showIssueTimeline')) {
				HookRegistry::register('Templates::Issue::TOC::Main', array(&$this, 'extendIssueTocTemplate'));
				HookRegistry::register('Templates::Issue::Issue::Article', array(&$this, 'extendIssueTocArticleTemplate'));
			}

			// Hook for adding a tab to the publication phase
			HookRegistry::register('Template::Workflow::Publication', array($this, 'extendPublicationTab'));

			// Hook for creating and setting a new field in the database 
			HookRegistry::register('Schema::get::publication', array($this, 'addToSchema'));
			HookRegistry::register('Publication::edit', array($this, 'editPublication')); // Take care, hook is called twice, first during Submission Workflow and also before Schedule for Publication in the Review Workflow!!!

			$request = Application::get()->getRequest();
			$templateMgr = TemplateManager::getManager($request);

			// jQuery is already loaded via ojs/lib/pkp/classes/template/PKPTemplateManager.inc.php 
			$urlLeafletCSS =               $request->getBaseUrl() . '/' . $this->getPluginPath() . '/js/lib/leaflet/dist/leaflet.css';
			$urlLeafletJS =                $request->getBaseUrl() . '/' . $this->getPluginPath() . '/js/lib/leaflet/dist/leaflet.js';
			$urlLeafletDrawCSS =           $request->getBaseUrl() . '/' . $this->getPluginPath() . '/js/lib/leaflet-draw/dist/leaflet.draw.css';
			$urlLeafletDrawJS =            $request->getBaseUrl() . '/' . $this->getPluginPath() . '/js/lib/leaflet-draw/dist/leaflet.draw.js';
			$urlLeafletFullscreenCSS =     $request->getBaseUrl() . '/' . $this->getPluginPath() . '/js/lib/leaflet.fullscreen/Control.FullScreen.css';
			$urlLeafletFullscreenJS =      $request->getBaseUrl() . '/' . $this->getPluginPath() . '/js/lib/leaflet.fullscreen/Control.FullScreen.js';
			$urlLeafletControlGeocodeJS =  $request->getBaseUrl() . '/' . $this->getPluginPath() . '/js/lib/leaflet-control-geocoder/dist/Control.Geocoder.js';
			$urlLeafletControlGeocodeCSS = $request->getBaseUrl() . '/' . $this->getPluginPath() . '/js/lib/leaflet-control-geocoder/dist/Control.Geocoder.css';

			// loading the leaflet scripts, source: https://leafletjs.com/examples/quick-start/
			$templateMgr->addStyleSheet('leafletCSS', $urlLeafletCSS, array('contexts' => array('frontend', 'backend')));
			$templateMgr->addJavaScript('leafletJS', $urlLeafletJS, array('contexts' => array('frontend', 'backend')));

			// loading the leaflet draw scripts, source: https://www.jsdelivr.com/package/npm/leaflet-draw?path=dist
			$templateMgr->addStyleSheet("leafletDrawCSS", $urlLeafletDrawCSS, array('contexts' => array('frontend', 'backend')));
			$templateMgr->addJavaScript("leafletDrawJS", $urlLeafletDrawJS, array('contexts' => array('frontend', 'backend')));

			// loading the leaflet fullscreen control, source: https://github.com/brunob/leaflet.fullscreen
			$templateMgr->addStyleSheet("leafletFullscreenCSS", $urlLeafletFullscreenCSS, array('contexts' => array('frontend', 'backend')));
			$templateMgr->addJavaScript("leafletFullscreenJS", $urlLeafletFullscreenJS, array('contexts' => array('frontend', 'backend')));

			// loading leaflet control geocoder (search), source: https://github.com/perliedman/leaflet-control-geocoder
			$templateMgr->addJavaScript("leafletControlGeocodeJS", $urlLeafletControlGeocodeJS, array('contexts' => array('frontend', 'backend')));
			$templateMgr->addStyleSheet("leafletControlGeocodeCSS", $urlLeafletControlGeocodeCSS, array('contexts' => array('frontend', 'backend')));

			// vis-timeline (issue #74) — register only when at least one timeline scope is enabled.
			if ($this->isFeatureEnabled('geoMetadata_showJournalTimeline') || $this->isFeatureEnabled('geoMetadata_showIssueTimeline')) {
				$urlVisTimelineJS  = $request->getBaseUrl() . '/' . $this->getPluginPath() . '/js/lib/vis-timeline/standalone/umd/vis-timeline-graph2d.min.js';
				$urlVisTimelineCSS = $request->getBaseUrl() . '/' . $this->getPluginPath() . '/js/lib/vis-timeline/styles/vis-timeline-graph2d.min.css';
				$templateMgr->addJavaScript('visTimelineJS', $urlVisTimelineJS, array('contexts' => array('frontend')));
				$templateMgr->addStyleSheet('visTimelineCSS', $urlVisTimelineCSS, array('contexts' => array('frontend')));
			}

			$urlPluginCSS = $this->templateParameters['pluginStylesheetURL'] . '/styles.css';
			$templateMgr->addStyleSheet("geoMetadataStyles", $urlPluginCSS, array('contexts' => array('frontend', 'backend')));

			// plugins JS scripts and CSS
			$urlTemporalLibJS = $request->getBaseUrl() . '/' . $this->getPluginPath() . '/js/lib/temporal.js';
			$templateMgr->addJavaScript('geoMetadataTemporalLibJS', $urlTemporalLibJS, array('contexts' => array('frontend', 'backend')));

			$urlThemeResolversJS = $request->getBaseUrl() . '/' . $this->getPluginPath() . '/js/lib/theme_resolvers.js';
			$templateMgr->addJavaScript('geoMetadataThemeResolversJS', $urlThemeResolversJS, array('contexts' => array('frontend', 'backend')));

			$urlResetViewJS = $request->getBaseUrl() . '/' . $this->getPluginPath() . '/js/lib/reset_view_control.js';
			$templateMgr->addJavaScript('geoMetadataResetViewJS', $urlResetViewJS, array('contexts' => array('frontend', 'backend')));

			$urlMapOverlapJS = $request->getBaseUrl() . '/' . $this->getPluginPath() . '/js/lib/map_overlap.js';
			$templateMgr->addJavaScript('geoMetadataMapOverlapJS', $urlMapOverlapJS, array('contexts' => array('frontend', 'backend')));

			$templateMgr->assign('geoMetadata_submissionJS',      $request->getBaseUrl() . '/' . $this->getPluginPath() . '/js/submission.js');
			$templateMgr->assign('geoMetadata_article_detailsJS', $request->getBaseUrl() . '/' . $this->getPluginPath() . '/js/article_details.js');
			$templateMgr->assign('geoMetadata_issueJS',           $request->getBaseUrl() . '/' . $this->getPluginPath() . '/js/issue.js');
			$templateMgr->assign('geoMetadata_markerBaseUrl',     $request->getBaseUrl() . '/' . $this->getPluginPath() . '/js/lib/leaflet-color-markers/img/');

			// Smarty resource name for the shared map-JS-globals partial. Used as
			// {include file=$geoMetadata_mapJsGlobalsTpl}. Plugin-local partials must be addressed via
			// the plugin's PKP-template-resource because OJS hook-rendered plugin templates inherit the
			// core Smarty template root, not the plugin's directory.
			$templateMgr->assign('geoMetadata_mapJsGlobalsTpl',   $this->getTemplateResource('frontend/_map_js_globals.tpl'));
			$templateMgr->assign('geoMetadata_journalTimelineTpl', $this->getTemplateResource('frontend/objects/journal_timeline.tpl'));
			$templateMgr->assign('geoMetadata_issueTimelineTpl',   $this->getTemplateResource('frontend/objects/issue_timeline.tpl'));

			// Pre-translated strings for the shared JS globals. Done in PHP so the template can apply
			// |escape:'javascript' to each value — the {translate} Smarty function doesn't chain
			// modifiers on its own output, and raw translations with an apostrophe (e.g. fr_FR
			// "Annuler l'édition, …") will close the surrounding JS string literal. See the header of
			// templates/frontend/_map_js_globals.tpl.
			$templateMgr->assign('geoMetadata_i18n', [
				'articleLayerName'        => __('plugins.generic.geoMetadata.map.articleLayerName'),
				'adminLayerName'          => __('plugins.generic.geoMetadata.map.administrativeLayerName'),
				'overlayGeometry'         => __('plugins.generic.geoMetadata.map.overlay.geometry'),
				'overlayAdminUnit'        => __('plugins.generic.geoMetadata.map.overlay.administrativeUnit'),
				'fullscreenTitle'         => __('plugins.generic.geoMetadata.map.fullscreen.title'),
				'fullscreenTitleCancel'   => __('plugins.generic.geoMetadata.map.fullscreen.titleCancel'),
				'zoomInTitle'             => __('plugins.generic.geoMetadata.map.zoom.in'),
				'zoomOutTitle'            => __('plugins.generic.geoMetadata.map.zoom.out'),
				'geocoderPlaceholder'     => __('plugins.generic.geoMetadata.map.geocoder.placeholder'),
				'geocoderError'           => __('plugins.generic.geoMetadata.map.geocoder.errorMessage'),
				'geocoderButtonTitle'     => __('plugins.generic.geoMetadata.map.geocoder.buttonTitle'),
				'drawActionCancelTitle'   => __('plugins.generic.geoMetadata.map.draw.actionCancelTitle'),
				'drawActionCancel'        => __('plugins.generic.geoMetadata.map.draw.actionCancel'),
				'drawFinishTitle'         => __('plugins.generic.geoMetadata.map.draw.finishTitle'),
				'drawFinish'              => __('plugins.generic.geoMetadata.map.draw.finish'),
				'drawUndoTitle'           => __('plugins.generic.geoMetadata.map.draw.undoTitle'),
				'drawUndo'                => __('plugins.generic.geoMetadata.map.draw.undo'),
				'drawPolyline'            => __('plugins.generic.geoMetadata.map.draw.polyline'),
				'drawPolygon'             => __('plugins.generic.geoMetadata.map.draw.polygon'),
				'drawRectangle'           => __('plugins.generic.geoMetadata.map.draw.rectangle'),
				'drawMarker'              => __('plugins.generic.geoMetadata.map.draw.marker'),
				'drawMarkerTipStart'      => __('plugins.generic.geoMetadata.map.draw.marker.tooltipStart'),
				'drawPolygonTipStart'     => __('plugins.generic.geoMetadata.map.draw.polygon.tooltipStart'),
				'drawPolygonTipCont'      => __('plugins.generic.geoMetadata.map.draw.polygon.tooltipCont'),
				'drawPolygonTipEnd'       => __('plugins.generic.geoMetadata.map.draw.polygon.tooltipEnd'),
				'drawPolylineTipStart'    => __('plugins.generic.geoMetadata.map.draw.polyline.tooltipStart'),
				'drawPolylineTipCont'     => __('plugins.generic.geoMetadata.map.draw.polyline.tooltipCont'),
				'drawPolylineTipEnd'      => __('plugins.generic.geoMetadata.map.draw.polyline.tooltipEnd'),
				'drawRectangleTipStart'   => __('plugins.generic.geoMetadata.map.draw.rectangle.tooltipStart'),
				'drawSimpleshapeTipEnd'   => __('plugins.generic.geoMetadata.map.draw.simpleshape.tooltipEnd'),
				'editSaveTitle'           => __('plugins.generic.geoMetadata.map.edit.saveTitle'),
				'editSave'                => __('plugins.generic.geoMetadata.map.edit.save'),
				'editCancelTitle'         => __('plugins.generic.geoMetadata.map.edit.cancelTitle'),
				'editCancel'              => __('plugins.generic.geoMetadata.map.edit.cancel'),
				'editClearAllTitle'       => __('plugins.generic.geoMetadata.map.edit.clearAllTitle'),
				'editClearAll'            => __('plugins.generic.geoMetadata.map.edit.clearAll'),
				'editEdit'                => __('plugins.generic.geoMetadata.map.edit.edit'),
				'editEditDisabled'        => __('plugins.generic.geoMetadata.map.edit.editDisabled'),
				'editRemove'              => __('plugins.generic.geoMetadata.map.edit.remove'),
				'editRemoveDisabled'      => __('plugins.generic.geoMetadata.map.edit.removeDisabled'),
				'editHandlerText'         => __('plugins.generic.geoMetadata.map.edit.handlerText'),
				'editHandlerSubtext'      => __('plugins.generic.geoMetadata.map.edit.handlerSubtext'),
				'editRemoveHandlerText'   => __('plugins.generic.geoMetadata.map.edit.removeHandlerText'),
				'issueMapIconAria'        => __('plugins.generic.geoMetadata.issue.mapIcon.aria'),
				'resetViewTitle'          => __('plugins.generic.geoMetadata.map.resetView.title'),
				'overlapPrevTitle'        => __('plugins.generic.geoMetadata.map.overlap.prevTitle'),
				'overlapNextTitle'        => __('plugins.generic.geoMetadata.map.overlap.nextTitle'),
				'overlapCounter'          => __('plugins.generic.geoMetadata.map.overlap.counter'),
				'adminUnitValidationHierarchyAndGeometry' => __('plugins.generic.geoMetadata.submission.administrativeUnit.validation.hierarchyAndGeometry'),
				'adminUnitValidationHierarchyOnly'        => __('plugins.generic.geoMetadata.submission.administrativeUnit.validation.hierarchyOnly'),
				'adminUnitValidationGeometryOnly'         => __('plugins.generic.geoMetadata.submission.administrativeUnit.validation.geometryOnly'),
				'gazetteerUnavailableTitle'                  => __('plugins.generic.geoMetadata.gazetteer.unavailable.title'),
				'gazetteerUnavailableFallback'               => __('plugins.generic.geoMetadata.gazetteer.unavailable.fallback'),
				'gazetteerUnavailableReasonNoBaseUrl'        => __('plugins.generic.geoMetadata.gazetteer.unavailable.reason.noBaseUrl'),
				'gazetteerUnavailableReasonNoUsername'       => __('plugins.generic.geoMetadata.gazetteer.unavailable.reason.noUsername'),
				'gazetteerUnavailableReasonInvalidCredentials' => __('plugins.generic.geoMetadata.gazetteer.unavailable.reason.invalidCredentials'),
				'gazetteerUnavailableReasonQuotaExceeded'    => __('plugins.generic.geoMetadata.gazetteer.unavailable.reason.quotaExceeded'),
				'gazetteerUnavailableReasonExternalError'    => __('plugins.generic.geoMetadata.gazetteer.unavailable.reason.externalError'),
			]);

			$templateMgr->assign('geoMetadata_mapUrlPath', MAP_URL_PATH);
			$templateMgr->assign('geoMetadata_metadataLicense', '<a href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank" rel="noopener noreferrer">CC-0</a>');

			// issue #124: propagate to every map-rendering template via $this->templateParameters.
			$this->templateParameters['geoMetadata_showEsriBaseLayer'] = $this->isFeatureEnabled('geoMetadata_showEsriBaseLayer');
			$this->templateParameters['geoMetadata_showGeocoder'] = $this->isFeatureEnabled('geoMetadata_enableGeocoderSearch');

			foreach ([
				'geoMetadata_submissionMapDefaultLat',
				'geoMetadata_submissionMapDefaultLng',
				'geoMetadata_submissionMapDefaultZoom',
				'geoMetadata_mapFeatureColor',
				'geoMetadata_mapFeatureColorHighlight',
				'geoMetadata_adminUnitOverlayColor',
				'geoMetadata_adminUnitOverlayFillOpacity',
				'geoMetadata_markerHueRotation',
				'geoMetadata_markerHueRotationHighlight',
			] as $key) {
				$this->templateParameters[$key] = $this->getSettingOrDefault($key);
			}
			$this->templateParameters['geoMetadata_mapFeatureColorHighlight_rgba15'] =
				self::hexToRgba($this->templateParameters['geoMetadata_mapFeatureColorHighlight'], 0.15);
			$this->templateParameters['geoMetadata_enableSyncedHighlight'] =
				$this->isFeatureEnabled('geoMetadata_enableSyncedHighlight');
			$this->templateParameters['geoMetadata_showIssueMapIcon'] =
				$this->isFeatureEnabled('geoMetadata_showIssueMapIcon');
			$this->templateParameters['geoMetadata_overlapPicker'] =
				$this->isFeatureEnabled('geoMetadata_overlapPicker');
			$this->templateParameters['geoMetadata_showJournalMap'] =
				$this->isFeatureEnabled('geoMetadata_showJournalMap');
			$this->templateParameters['geoMetadata_showIssueMap'] =
				$this->isFeatureEnabled('geoMetadata_showIssueMap');
			$this->templateParameters['geoMetadata_showJournalTimeline'] =
				$this->isFeatureEnabled('geoMetadata_showJournalTimeline');
			$this->templateParameters['geoMetadata_showIssueTimeline'] =
				$this->isFeatureEnabled('geoMetadata_showIssueTimeline');
			// CollapsedByDefault is a boolean that defaults to OFF (timeline expanded on first
			// page load); use a raw setting read so a never-saved row counts as false.
			$this->templateParameters['geoMetadata_timelineCollapsedByDefault'] =
				(bool) $this->getSetting($this->getCurrentContextId(), 'geoMetadata_timelineCollapsedByDefault');
			$this->templateParameters['geoMetadata_timelineShowInstructions'] =
				$this->isFeatureEnabled('geoMetadata_timelineShowInstructions');
			$this->templateParameters['geoMetadata_timelineHeight'] =
				$this->getSettingOrDefault('geoMetadata_timelineHeight');
			$this->templateParameters['geoMetadata_timelineClusterMaxItems'] =
				$this->getSettingOrDefault('geoMetadata_timelineClusterMaxItems');
		}

		return $success;
	}

	/**
	 * @param hookName
	 * @param params
	 */
	public function setPageHandler($hookName, $params)
	{
		$page = $params[0];
		if ($page === MAP_URL_PATH) {
			$this->import('classes/handler/JournalMapHandler');
			define('HANDLER_CLASS', 'JournalMapHandler');
			return true;
		}
		return false;
	}

	/**
	 * Fetch the native PDO handle OJS is already using so brick/geo's
	 * PDOEngine can issue ST_Centroid / ST_Envelope against the same DB.
	 * Returns null on any failure — callers must fall back gracefully.
	 */
	private static function getOjsPdo(): ?\PDO
	{
		try {
			return \Illuminate\Database\Capsule\Manager::getPdo();
		} catch (\Throwable $e) {
			error_log('[geoMetadata] could not obtain PDO (falling back to pure-PHP centroid): ' . $e->getMessage());
			return null;
		}
	}

	/**
	 * Inject metadata into article HTML head
	 * @param $hookName string
	 * @param $args array
	 * @return boolean
	 */
	function extendArticleView($hookName, $args)
	{
		$request = $args[0];
		$article = $args[2];
		// args[3] is the publication OJS resolved for this view — for
		// /article/view/{id}/version/{N} it's the requested older version,
		// for the canonical URL it's getCurrentPublication(). Fall back to
		// current if the hook signature changes upstream.
		$publication = $args[3] ?? $article->getCurrentPublication();

		$emitDC        = $this->isFeatureEnabled('geoMetadata_emitMetaDublinCore');
		$emitGeoNames  = $this->isFeatureEnabled('geoMetadata_emitMetaGeoNames');
		$emitGeoCoords = $this->isFeatureEnabled('geoMetadata_emitMetaGeoCoords');
		$emitISO19139  = $this->isFeatureEnabled('geoMetadata_emitMetaISO19139');
		if (!$emitDC && !$emitGeoNames && !$emitGeoCoords && !$emitISO19139) {
			return false;
		}

		$templateMgr = TemplateManager::getManager($request);

		$spatial            = $publication->getData(GEOMETADATA_DB_FIELD_SPATIAL);
		$administrativeUnit = $publication->getData(GEOMETADATA_DB_FIELD_ADMINUNIT);

		// Most specific admin unit feeds DC.box / ISO 19139 and the ICBM / geo.position fallback.
		$lowestAdministrativeUnit     = null;
		$lowestAdministrativeUnitName = null;
		$lowestAdministrativeUnitBBox = null;
		$decodedAdminUnits            = [];
		$decodedAdminUnits = $administrativeUnit ? (json_decode($administrativeUnit) ?? []) : [];
		$hasAdminUnits = !empty($decodedAdminUnits);
		if ($hasAdminUnits) {
			foreach ($decodedAdminUnits as $unit) {
				if (isset($unit->bbox) && $unit->bbox != 'not available') {
					$lowestAdministrativeUnit     = $unit;
					$lowestAdministrativeUnitName = $unit->name;
					$lowestAdministrativeUnitBBox = $unit->bbox;
				}
			}
		}

		$dcTagAdded = false;

		if ($emitDC && $spatial) {
			$templateMgr->addHeader('dublinCoreSpatialCoverage', '<meta name="DC.SpatialCoverage" scheme="GeoJSON" content="' . htmlspecialchars(strip_tags($spatial)) . '" />');
			$dcTagAdded = true;
		}

		// DC.Coverage: OJS's DublinCoreMetaPlugin emits this from the article's
		// (submission-level, latest-version) coverage field on canonical URLs
		// but explicitly suppresses it on /article/view/{id}/version/{N} URLs
		// (see DublinCoreMetaPlugin::handleArticleHook). For the plugin's own
		// per-version data to be discoverable on older versions, emit a
		// publication-specific DC.Coverage from the requested publication's
		// admin-unit hierarchy ONLY on the /version/ URLs — on the canonical
		// URL OJS already emits a (locale-tagged) DC.Coverage and we don't
		// want duplicates.
		$requestArgs = $request->getRequestedArgs();
		$onVersionUrl = isset($requestArgs[1]) && $requestArgs[1] === 'version';
		if ($emitDC && $hasAdminUnits && $onVersionUrl) {
			$names = array_map(function ($u) { return $u->name; }, $decodedAdminUnits);
			$names = array_values(array_filter($names, function ($n) { return $n !== null && $n !== ''; }));
			if (!empty($names)) {
				$templateMgr->addHeader('dublinCoreCoverageGeoMetadata',
					'<meta name="DC.Coverage" content="' . htmlspecialchars(implode(', ', $names)) . '" />');
				$dcTagAdded = true;
			}
		}

		if ($emitGeoCoords) {
			$centroid = null;
			$provenance = null;
			if ($spatial) {
				$centroid = Centroid::fromGeoJson($spatial, self::getOjsPdo());
				if ($centroid) {
					$featureCount = count(json_decode($spatial)->features ?? []);
					$provenance = 'combined centroid of ' . $featureCount . ' feature(s)';
				}
			}
			if (!$centroid && $lowestAdministrativeUnitBBox) {
				$centroid = Centroid::fromBbox($lowestAdministrativeUnitBBox);
				$provenance = 'centroid of most precise admin unit bbox ("' . $lowestAdministrativeUnitName . '")';
			}
			if ($centroid) {
				$lat = number_format($centroid[0], 5, '.', '');
				$lon = number_format($centroid[1], 5, '.', '');
				$templateMgr->addHeader('geoMetadataCentroidProvenance',
					'<!-- geoMetadata: next meta tags based on ' . htmlspecialchars($provenance) . ' -->');
				$templateMgr->addHeader('icbm',
					'<meta name="ICBM" content="' . $lat . ', ' . $lon . '" />');
				$templateMgr->addHeader('geoPosition',
					'<meta name="geo.position" content="' . $lat . ';' . $lon . '" />');
			}
		}

		if ($hasAdminUnits) {
			if ($emitGeoNames && $lowestAdministrativeUnitName) {
				$templateMgr->addHeader('geoPlacename', '<meta name="geo.placename" content="' . htmlspecialchars(strip_tags($lowestAdministrativeUnitName)) . '" />');
			}

			// geo.region: ISO 3166-1 [+ -2] codes captured at submission; records predating that capture are skipped until they re-save.
			if ($emitGeoNames && $lowestAdministrativeUnit) {
				$isoCountry     = $lowestAdministrativeUnit->isoCountryCode    ?? null;
				$isoSubdivision = $lowestAdministrativeUnit->isoSubdivisionCode ?? null;
				if ($isoCountry) {
					$region = $isoSubdivision ? ($isoCountry . '-' . $isoSubdivision) : $isoCountry;
					$templateMgr->addHeader('geoRegion',
						'<meta name="geo.region" content="' . htmlspecialchars($region) . '" />');
				} else {
					error_log('[geoMetadata] geo.region skipped (no ISO codes stored) for admin unit geonameId='
						. ($lowestAdministrativeUnit->geonameId ?? '?'));
				}
			}

			if ($lowestAdministrativeUnitName && $lowestAdministrativeUnitBBox) {
				// DCMI Box / ISO 19139 both accept east<west as a valid antimeridian-crossing bbox.
				if ($emitDC) {
					$templateMgr->addHeader('dublincCoreBox', '<meta name="DC.box" content="name=' .
						$lowestAdministrativeUnitName .
						'; northlimit=' . $lowestAdministrativeUnitBBox->north .
						'; southlimit=' . $lowestAdministrativeUnitBBox->south .
						'; westlimit='  . $lowestAdministrativeUnitBBox->west  .
						'; eastlimit='  . $lowestAdministrativeUnitBBox->east  .
						'; projection=EPSG3857" />');
					$dcTagAdded = true;
				}

				if ($emitISO19139) {
					$templateMgr->addHeader('isoGeographicBoundingBox', '<meta name="ISO 19139" content="' .
						'<gmd:EX_GeographicBoundingBox>' .
						'<gmd:westBoundLongitude><gco:Decimal>' . $lowestAdministrativeUnitBBox->west . '</gco:Decimal></gmd:westBoundLongitude>' .
						'<gmd:eastBoundLongitude><gco:Decimal>' . $lowestAdministrativeUnitBBox->east . '</gco:Decimal></gmd:eastBoundLongitude>' .
						'<gmd:southBoundLatitude><gco:Decimal>' . $lowestAdministrativeUnitBBox->south . '</gco:Decimal></gmd:southBoundLatitude>' .
						'<gmd:northBoundLatitude><gco:Decimal>' . $lowestAdministrativeUnitBBox->north . '</gco:Decimal></gmd:northBoundLatitude></gmd:EX_GeographicBoundingBox>" />');
				}
			}
		}

		$timePeriods = $publication->getData(GEOMETADATA_DB_FIELD_TIME_PERIODS);
		if ($emitDC && !empty($timePeriods)) {
			$begin = explode('..', explode('{', $timePeriods)[1])[0];
			$end = explode('}', explode('..', explode('{', $timePeriods)[1])[1])[0];

			// / is the ISO8601 time-interval separator.
			$templateMgr->addHeader('dublinCoreTemporal', '<meta name="DC.temporal" scheme="ISO8601" content="' .
				$begin . '/' . $end .
				'"/>');
			$templateMgr->addHeader('dublinCorePeriodOfTime', '<meta name="DC.PeriodOfTime" scheme="ISO8601" content="' .
				$begin . '/' . $end .
				'"/>');
			$dcTagAdded = true;
		}

		if ($dcTagAdded) {
			$templateMgr->addHeader('dublinCoreSchemaDecl', '<link rel="schema.DC" href="http://purl.org/dc/elements/1.1/" />');
		}

		return false;
	}

	/**
	 * Function which extends the submissionMetadataFormFields template and adds template variables concerning temporal- and spatial properties 
	 * and the administrative unit if there is already a storage in the database. 
	 * @param hook Templates::Submission::SubmissionMetadataForm::AdditionalMetadata
	 */
	public function extendSubmissionMetadataFormTemplate($hookName, $params)
	{
		/*
		This way templates are loaded. 
		Its important that the corresponding hook is activated. 
		If you want to override a template you need to create a .tpl-file which is in the plug-ins template path which the same 
		path it got in the regular ojs structure. E.g. if you want to override/add something to this template 
		'/ojs/lib/pkp/templates/submission/submissionMetadataFormTitleFields.tpl'
		you have to store in in the plug-ins template path under this path 'submission/form/submissionMetadataFormFields.tpl'. 
		Further details can be found here: https://docs.pkp.sfu.ca/dev/plugin-guide/en/templates
		Where are templates located: https://docs.pkp.sfu.ca/pkp-theming-guide/en/html-smarty
		*/

		$templateMgr = &$params[1];
		$output = &$params[2];

		$submissionSpatial     = $this->isFeatureEnabled('geoMetadata_submission_enableSpatial');
		$submissionTemporal    = $this->isFeatureEnabled('geoMetadata_submission_enableTemporal');
		$submissionAdminUnit   = $this->isFeatureEnabled('geoMetadata_submission_enableAdminUnit');
		if (!$submissionSpatial && !$submissionTemporal && !$submissionAdminUnit) {
			return false;
		}

		$request = Application::get()->getRequest();
		$context = $request->getContext();

		/*
		Check if the user has entered an username in the plugin settings for the GeoNames API (https://www.geonames.org/login). 
		The result is passed on accordingly to submission.js as template variable. 
		*/
		$usernameGeonames = $this->getSetting($context->getId(), 'geoMetadata_geonames_username');
		$templateMgr->assign('usernameGeonames', $usernameGeonames);
		$baseurlGeonames = $this->getSetting($context->getId(), 'geoMetadata_geonames_baseurl');
		$templateMgr->assign('baseurlGeonames', $baseurlGeonames);

		/*
		In case the user repeats the step "3. Enter Metadata" in the process 'Submit an Article' and comes back to this step to make changes again, 
		the already entered data is read from the database, added to the template and displayed for the user.
		Data is loaded from the database, passed as template variable to the 'submissionMetadataFormFiels.tpl' 
	 	and requested from there in the 'submission.js' to display coordinates in a map, the date and coverage information if available.
		*/
		$submissionDao = Application::getSubmissionDAO();
		$submissionId = $request->getUserVar('submissionId');
		$submission = $submissionDao->getById($submissionId);
		$publication = null;

		if ($submission) {
			$publication = $submission->getCurrentPublication();

			$timePeriods = $publication->getData(GEOMETADATA_DB_FIELD_TIME_PERIODS);
			$spatialProperties = $publication->getData(GEOMETADATA_DB_FIELD_SPATIAL);
			$administrativeUnit = $publication->getData(GEOMETADATA_DB_FIELD_ADMINUNIT);
		}

		// On re-render after a failed validation, prefer the user's submitted
		// value so the input stays visible for correction rather than silently
		// reverting to the last-persisted value.
		$postedTimePeriods = $request->getUserVar(GEOMETADATA_DB_FIELD_TIME_PERIODS);
		if ($postedTimePeriods !== null) {
			$timePeriods = $postedTimePeriods;
		}

		if ($timePeriods === null) {
			$timePeriods = '';
		}

		if ($spatialProperties === null) {
			$spatialProperties = '{"type":"FeatureCollection","features":[],"administrativeUnits":{},"temporalProperties":{"timePeriods":[],"provenance":{"description":"not available","id":"not available"}}}';
		}

		if ($administrativeUnit === null || $administrativeUnit === '' || (is_array($administrativeUnit) && current($administrativeUnit) === '')) {
			$administrativeUnit = '[]';
		}

		$templateMgr->assign(GEOMETADATA_DB_FIELD_TIME_PERIODS, $timePeriods);
		$templateMgr->assign(GEOMETADATA_DB_FIELD_SPATIAL, $spatialProperties);
		$templateMgr->assign(GEOMETADATA_DB_FIELD_ADMINUNIT, $administrativeUnit);
		$templateMgr->assign('geoMetadata_submission_enableSpatial', $submissionSpatial);
		$templateMgr->assign('geoMetadata_submission_enableTemporal', $submissionTemporal);
		$templateMgr->assign('geoMetadata_submission_enableAdminUnit', $submissionAdminUnit);

		$templateMgr->assign($this->templateParameters);

		$output .= $templateMgr->fetch($this->getTemplateResource('submission/form/submissionMetadataFormFields.tpl'));

		return false;
	}

	/**
	 * Function which extends ArticleMain Template by geospatial properties if available. 
	 * Data is loaded from the database, passed as template variable to the 'article_details.tpl' 
	 * and requested from there in the 'article_details.js' to display coordinates in a map, the date and coverage information if available.
	 * @param hook Templates::Article::Main
	 */
	public function extendArticleMainTemplate($hookName, $params)
	{
		$templateMgr = &$params[1];
		$output = &$params[2];

		$showMap       = $this->isFeatureEnabled('geoMetadata_showArticleMap');
		$showTemporal  = $this->isFeatureEnabled('geoMetadata_showArticleTemporal');
		$showAdminUnit = $this->isFeatureEnabled('geoMetadata_showArticleAdminUnit');
		if (!$showMap && !$showTemporal && !$showAdminUnit) {
			return false;
		}

		$publication = $templateMgr->getTemplateVars('publication');

		$temporalProperties = $publication->getData(GEOMETADATA_DB_FIELD_TIME_PERIODS);
		$spatialProperties =  $publication->getData(GEOMETADATA_DB_FIELD_SPATIAL);
		$administrativeUnit = $publication->getData(GEOMETADATA_DB_FIELD_ADMINUNIT);

		if ($temporalProperties === null) {
			$temporalProperties = '';
		}

		if ($spatialProperties === null) {
			$spatialProperties = '{"type":"FeatureCollection","features":[],"administrativeUnits":{},"temporalProperties":{"timePeriods":[],"provenance":{"description":"not available","id":"not available"}}}';
		}

		if ($administrativeUnit === null || $administrativeUnit === '') {
			$administrativeUnit = '[]';
		}

		$templateMgr->assign(GEOMETADATA_DB_FIELD_TIME_PERIODS, $temporalProperties);
		$templateMgr->assign(GEOMETADATA_DB_FIELD_SPATIAL, $spatialProperties);
		$templateMgr->assign(GEOMETADATA_DB_FIELD_ADMINUNIT, $administrativeUnit);
		$templateMgr->assign('geoMetadata_showArticleMap', $showMap);
		$templateMgr->assign('geoMetadata_showArticleTemporal', $showTemporal);
		$templateMgr->assign('geoMetadata_showArticleAdminUnit', $showAdminUnit);

		$templateMgr->assign($this->templateParameters);

		$output .= $templateMgr->fetch($this->getTemplateResource('frontend/objects/article_details.tpl'));

		return false;
	}

	/**
	 * Emit a schema.org/ScholarlyArticle JSON-LD block on article pages, carrying
	 * the article's spatialCoverage and temporalCoverage. Coexists with another
	 * plugin's article-level JSON-LD via shared @id (article URL).
	 * @param hook Templates::Article::Main
	 */
	public function emitSchemaOrgJsonLd($hookName, $params)
	{
		if (!$this->isFeatureEnabled('geoMetadata_emitSchemaOrg')) {
			return false;
		}

		try {
			$templateMgr = &$params[1];
			$output = &$params[2];

			$publication = $templateMgr->getTemplateVars('publication');
			if (!$publication) {
				return false;
			}

			$spatial            = $publication->getData(GEOMETADATA_DB_FIELD_SPATIAL);
			$administrativeUnit = $publication->getData(GEOMETADATA_DB_FIELD_ADMINUNIT);
			$timePeriods        = $publication->getData(GEOMETADATA_DB_FIELD_TIME_PERIODS);

			$lowestUnit = null;
			$decoded = $administrativeUnit ? (json_decode($administrativeUnit) ?? []) : [];
			foreach ($decoded as $unit) {
				if (isset($unit->bbox) && $unit->bbox != 'not available') {
					$lowestUnit = $unit;
				}
			}

			$articleGeo = SchemaOrgGeo::buildArticleGeometries($spatial);
			$adminPlace = $this->buildAdminUnitPlace($lowestUnit);
			$temporalCoverage = $this->buildTemporalCoverage($timePeriods);

			if ($articleGeo === null && $adminPlace === null && $temporalCoverage === null) {
				return false;
			}

			$request   = Application::get()->getRequest();
			$articleId = $publication->getData('submissionId');
			$articleUrl = $request->url(null, 'article', 'view', $articleId);
			$title = $publication->getLocalizedFullTitle();
			$doi   = method_exists($publication, 'getStoredPubId') ? $publication->getStoredPubId('doi') : null;

			$article = Schema::scholarlyArticle()
				->setProperty('@id', $articleUrl)
				->mainEntityOfPage($articleUrl);

			if ($title) {
				$article->headline($title);
			}
			if ($doi) {
				$article->identifier(
					Schema::propertyValue()
						->propertyID('doi')
						->value($doi)
				);
			}

			$places = [];
			if ($articleGeo !== null) {
				$places[] = [
					'@type' => 'Place',
					'additionalProperty' => [
						'@type'      => 'PropertyValue',
						'propertyID' => 'geometrySource',
						'value'      => SchemaOrgGeo::SOURCE_ARTICLE_EXTENT,
					],
					'geo' => $articleGeo,
				];
			}
			if ($adminPlace !== null) {
				$places[] = $adminPlace;
			}
			if (!empty($places)) {
				$article->spatialCoverage(count($places) === 1 ? $places[0] : $places);
			}

			if ($temporalCoverage !== null) {
				$article->temporalCoverage($temporalCoverage);
			}

			$templateMgr->assign('geoMetadata_schemaOrgScript', $article->toScript());
			$output .= $templateMgr->fetch($this->getTemplateResource('frontend/objects/schema_org_jsonld.tpl'));
		} catch (\Throwable $e) {
			error_log('[geoMetadata] schema.org JSON-LD skipped: ' . $e->getMessage());
		}
		return false;
	}

	/**
	 * Build a schema.org Place for the lowest administrative unit: name,
	 * GeoNames URI as sameAs, ISO country/subdivision codes as
	 * additionalProperty, the bbox as geo. Returns null when there is no
	 * usable bbox to emit. The Place is tagged as administrativeUnitBoundingBox
	 * via additionalProperty so consumers can distinguish it from the
	 * article-extent Place without inspecting names.
	 */
	private function buildAdminUnitPlace($unit): ?array
	{
		if (!$unit) return null;
		$bboxShape = SchemaOrgGeo::buildAdminUnitBoxShape($unit->bbox ?? null);
		if ($bboxShape === null) return null;

		$additionalProperty = [[
			'@type'      => 'PropertyValue',
			'propertyID' => 'geometrySource',
			'value'      => SchemaOrgGeo::SOURCE_ADMIN_UNIT_BBOX,
		]];
		if (!empty($unit->isoCountryCode)) {
			$additionalProperty[] = [
				'@type'      => 'PropertyValue',
				'propertyID' => 'isoCountryCode',
				'value'      => $unit->isoCountryCode,
			];
		}
		if (!empty($unit->isoSubdivisionCode)) {
			$additionalProperty[] = [
				'@type'      => 'PropertyValue',
				'propertyID' => 'isoSubdivisionCode',
				'value'      => $unit->isoSubdivisionCode,
			];
		}

		$place = ['@type' => 'Place'];
		if (!empty($unit->name)) {
			$place['name'] = $unit->name;
		}
		if (!empty($unit->geonameId)) {
			$place['sameAs'] = 'https://www.geonames.org/' . $unit->geonameId;
		}
		$place['additionalProperty'] = $additionalProperty;
		$place['geo'] = $bboxShape;
		return $place;
	}

	/**
	 * Convert the stored `{begin..end}` timePeriods string into a schema.org
	 * temporalCoverage value: an ISO 8601 interval `begin/end`. Returns null
	 * when the field is empty or unparseable.
	 */
	private function buildTemporalCoverage(?string $timePeriods): ?string
	{
		if (empty($timePeriods)) return null;
		$openBrace = strpos($timePeriods, '{');
		$closeBrace = strpos($timePeriods, '}');
		$dotDot = strpos($timePeriods, '..');
		if ($openBrace === false || $closeBrace === false || $dotDot === false) return null;
		$begin = substr($timePeriods, $openBrace + 1, $dotDot - $openBrace - 1);
		$end   = substr($timePeriods, $dotDot + 2, $closeBrace - $dotDot - 2);
		if ($begin === '' || $end === '') return null;
		return $begin . '/' . $end;
	}

	/**
	 * Function which extends the ArticleMain Template by a download button for the geospatial Metadata as geoJSON.
	 * @param hook Templates::Article::Details
	 */
	public function extendArticleDetailsTemplate($hookName, $params)
	{
		$templateMgr = &$params[1];
		$output = &$params[2];

		if (!$this->isFeatureEnabled('geoMetadata_showDownloadSidebar')) {
			return false;
		}

		$templateMgr->assign($this->templateParameters);

		$output .= $templateMgr->fetch($this->getTemplateResource('frontend/objects/article_details_download.tpl'));

		return false;
	}

	/**
	 * Function which extends the issue TOC with a timeline and map view
	 * @param hook Templates::Issue::TOC::Main
	 */
	public function extendIssueTocTemplate($hookName, $params)
	{
		$templateMgr = &$params[1];
		$output = &$params[2];

		$publishedSubmissions = $templateMgr->getTemplateVars('publishedSubmissions');
		$hasSpatial = self::issueHasAnySpatialData($publishedSubmissions);
		$hasTemporal = self::issueHasAnyTemporalData($publishedSubmissions);
		if (!$hasSpatial && !$hasTemporal) {
			return false;
		}
		$templateMgr->assign('geoMetadata_issueHasSpatial', $hasSpatial);
		$templateMgr->assign('geoMetadata_issueHasTemporal', $hasTemporal);

		$templateMgr->assign($this->templateParameters);

		$output .= $templateMgr->fetch($this->getTemplateResource('frontend/objects/issue_map.tpl'));

		return false;
	}

	/**
	 * Does any article in the issue have non-empty spatial metadata?
	 * Returns on the first match so an issue with many articles doesn't pay
	 * for a full walk.
	 */
	private static function issueHasAnySpatialData($publishedSubmissions): bool
	{
		if (empty($publishedSubmissions)) {
			return false;
		}
		foreach ($publishedSubmissions as $section) {
			$articles = (is_array($section) ? ($section['articles'] ?? []) : []);
			foreach ($articles as $article) {
				$publication = $article->getCurrentPublication();
				if (!$publication) continue;
				$raw = $publication->getData(GEOMETADATA_DB_FIELD_SPATIAL);
				if (!$raw) continue;
				$decoded = json_decode($raw);
				if (!$decoded) continue;
				if (!empty($decoded->features)) return true;
				$units = $decoded->administrativeUnits ?? null;
				if (is_array($units) && count($units) > 0) return true;
			}
		}
		return false;
	}

	/**
	 * Does any article in the issue have a non-empty time period?
	 */
	private static function issueHasAnyTemporalData($publishedSubmissions): bool
	{
		if (empty($publishedSubmissions)) {
			return false;
		}
		foreach ($publishedSubmissions as $section) {
			$articles = (is_array($section) ? ($section['articles'] ?? []) : []);
			foreach ($articles as $article) {
				$publication = $article->getCurrentPublication();
				if (!$publication) continue;
				$raw = $publication->getData(GEOMETADATA_DB_FIELD_TIME_PERIODS);
				if (empty($raw)) continue;
				if (preg_match('/\{\s*-?\d+-\d{2}-\d{2}\s*\.\.\s*-?\d+-\d{2}-\d{2}\s*\}/', $raw)) {
					return true;
				}
			}
		}
		return false;
	}

	/**
	 * Function which extends each article in an issue TOC with hidden fields with geospatial data
	 * @param hook Templates::Issue::Issue::Article
	 */
	public function extendIssueTocArticleTemplate($hookName, $params)
	{
		$templateMgr = &$params[1];
		$output = &$params[2];

		$templateMgr->assign($this->templateParameters);

		$publication = $templateMgr->getTemplateVars('publication');
		if ($publication === null) {
			// pragma theme
			$articlePath = $templateMgr->getTemplateVars('articlePath');

			if ($articlePath === null) {
				return false;
			} else {
				$publicationDao = DAORegistry::getDAO('PublicationDAO');
				$publication = $publicationDao->getById($articlePath);
			}
		}

		$spatialProperties = $publication->getData(GEOMETADATA_DB_FIELD_SPATIAL);
		if ($spatialProperties === null) {
			$spatialProperties = '{"type":"FeatureCollection","features":[],"administrativeUnits":{},"temporalProperties":{"timePeriods":[],"provenance":{"description":"not available","id":"not available"}}}';
		}
		$templateMgr->assign(GEOMETADATA_DB_FIELD_SPATIAL, $spatialProperties);

		$templateMgr->assign('journal', Application::get()->getRequest()->getJournal()); // access primary locale

		$temporalProperties = $publication->getData(GEOMETADATA_DB_FIELD_TIME_PERIODS);
		if ($temporalProperties === null) {
			$temporalProperties = '';
		}
		$templateMgr->assign(GEOMETADATA_DB_FIELD_TIME_PERIODS, $temporalProperties);

		$output .= $templateMgr->fetch($this->getTemplateResource('frontend/objects/issue_details.tpl'));

		return false;
	}

	/**
	 * @param string $hookname
	 * @param array $args [string, TemplateManager]
	 * @brief Show tab under Publications
	 */
	public function extendPublicationTab(string $hookName, array $args): void
	{
		$templateMgr = &$args[1];

		$workflowSpatial   = $this->isFeatureEnabled('geoMetadata_workflow_enableSpatial');
		$workflowTemporal  = $this->isFeatureEnabled('geoMetadata_workflow_enableTemporal');
		$workflowAdminUnit = $this->isFeatureEnabled('geoMetadata_workflow_enableAdminUnit');
		if (!$workflowSpatial && !$workflowTemporal && !$workflowAdminUnit) {
			return;
		}

		$request = $this->getRequest();
		$context = $request->getContext();
		$submission = $templateMgr->getTemplateVars('submission');
		$submissionId = $submission->getId();
		$latestPublication = $submission->getLatestPublication();

		$dispatcher = $request->getDispatcher();
		$apiBaseUrl = $dispatcher->url($request, ROUTE_API, $context->getData('urlPath'), '');

		$usernameGeonames = $this->getSetting($context->getId(), 'geoMetadata_geonames_username');
		$templateMgr->assign('usernameGeonames', $usernameGeonames);
		$baseurlGeonames = $this->getSetting($context->getId(), 'geoMetadata_geonames_baseurl');
		$templateMgr->assign('baseurlGeonames', $baseurlGeonames);

		$form = new PublicationForm(
            $apiBaseUrl . 'submissions/' . $submissionId . '/publications/' . $latestPublication->getId(),
            $latestPublication,
            __('plugins.generic.geoMetadata.publication.success'));

		$state = $templateMgr->getTemplateVars($this->versionSpecificNameState);
		$state['components'][GEOMETADATA_FORM_NAME] = $form->getConfig();
		$templateMgr->assign($this->versionSpecificNameState, $state);

		$templateMgr->assign('submissionId', $submissionId);
		$templateMgr->assign('geoMetadata_workflow_enableSpatial', $workflowSpatial);
		$templateMgr->assign('geoMetadata_workflow_enableTemporal', $workflowTemporal);
		$templateMgr->assign('geoMetadata_workflow_enableAdminUnit', $workflowAdminUnit);
		$templateMgr->assign('geoMetadata_workflow_protectRawFields', $this->isFeatureEnabled('geoMetadata_workflow_protectRawFields'));

		$templateMgr->assign($this->templateParameters);

		$templateMgr->display($this->getTemplateResource("submission/form/publicationTab.tpl"));
	}

	/**
	 * Function which extends the schema of the publication_settings table in the database. 
	 * There are two further rows in the table one for the spatial properties, and one for the timestamp. 
	 * @param hook Schema::get::publication
	 */
	public function addToSchema($hookName, $params)
	{
		// possible types: integer, string, text 
		$schema = $params[0];

		// save timestamp as text in a list of ISO8601 time intervals/time periods as described in RFC3339 appendix, https://datatracker.ietf.org/doc/html/rfc3339#appendix-A, see also https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
		$timePeriods = '{
			"type": "string",
			"multilingual": false,
			"apiSummary": true,
			"validation": [
				"nullable"
			]
		}';
		$schema->properties->{GEOMETADATA_DB_FIELD_TIME_PERIODS} = json_decode($timePeriods);

		$spatialProperties = '{
			"type": "string",
			"multilingual": false,
			"apiSummary": true,
			"validation": [
				"nullable"
			]
		}';
		$schema->properties->{GEOMETADATA_DB_FIELD_SPATIAL} = json_decode($spatialProperties);

		$administrativeUnits = '{
			"type": "string",
			"multilingual": false,
			"apiSummary": true,
			"validation": [
				"nullable"
			]
		}';
		$schema->properties->{GEOMETADATA_DB_FIELD_ADMINUNIT} = json_decode($administrativeUnits);

		return false;
	}

	/**
	 * Inject the temporal field into SubmissionSubmitStep3Form::readUserVars so
	 * the POSTed value lands in the form's _data array and is available for
	 * validation and template re-render after a validation failure.
	 */
	public function step3TemporalReadUserVars($hookName, $args)
	{
		$vars =& $args[1];
		$vars[] = GEOMETADATA_DB_FIELD_TIME_PERIODS;
		return false;
	}

	/**
	 * Add a FormValidatorCustom to SubmissionSubmitStep3Form for the temporal
	 * field. Accepts an empty value or `{side..side}` where each side is a
	 * signed integer year, YYYY-MM, or YYYY-MM-DD. The full-featured
	 * replacement (multi-period UI, calendar fallback, geological time)
	 * remains tracked in #140.
	 */
	public function step3TemporalAddValidator($hookName, $args)
	{
		$form = $args[0];
		import('lib.pkp.classes.form.validation.FormValidatorCustom');
		$form->addCheck(new FormValidatorCustom(
			$form,
			GEOMETADATA_DB_FIELD_TIME_PERIODS,
			'optional',
			'plugins.generic.geoMetadata.geospatialmetadata.properties.temporal.error',
			array(get_class($this), 'validateTimePeriodString')
		));
		return false;
	}

	/**
	 * Validator callback: the stored format is either empty or one or more
	 * concatenated `{side..side}` ranges where each side is a signed integer
	 * year, YYYY-MM, or YYYY-MM-DD. Month is 01-12, day is 01-31. Mirrors
	 * js/lib/temporal.js#parseSide.
	 */
	public static function validateTimePeriodString($value)
	{
		if ($value === null || $value === '') return true;
		$month = '(?:0[1-9]|1[0-2])';
		$day   = '(?:0[1-9]|[12]\d|3[01])';
		$side  = '\s*-?\d+(?:-' . $month . '(?:-' . $day . ')?)?\s*';
		return (bool) preg_match('/^(?:\{' . $side . '\.\.' . $side . '\})+$/', trim($value));
	}

	/**
	 * Function which fills the new fields (created by the function addToSchema) in the schema.
	 * The data is collected using the 'submission.js', then passed as input to the 'submissionMetadataFormFields.tpl'
	 * and requested from it in this php script by a POST-method.
	 * @param hook Publication::edit
	 */
	function editPublication(string $hookname, array $params)
	{
		$newPublication = $params[0];

		$temporalProperties = $_POST[GEOMETADATA_DB_FIELD_TIME_PERIODS] ?? null;
		$spatialProperties =  $_POST[GEOMETADATA_DB_FIELD_SPATIAL] ?? null;
		$administrativeUnit = $_POST[GEOMETADATA_DB_FIELD_ADMINUNIT] ?? null;
		
		// The following 3 clauses must also fire for "empty" POST values so that
		// removing previously-stored data updates the row rather than leaving stale data behind.
		if ($spatialProperties !== null) {
			$spatialProperties = AntimeridianSplitter::splitGeoJson($spatialProperties);
			$newPublication->setData(GEOMETADATA_DB_FIELD_SPATIAL, $spatialProperties);
		}

		if ($temporalProperties !== null) {
			$newPublication->setData(GEOMETADATA_DB_FIELD_TIME_PERIODS, $temporalProperties);
		}

		if ($administrativeUnit !== null) {
			$newPublication->setData(GEOMETADATA_DB_FIELD_ADMINUNIT, $administrativeUnit);

			$decoded = json_decode($administrativeUnit);
			$journal = Application::get()->getRequest()->getJournal();

			if (is_array($decoded) && count($decoded) > 0) {
				$administrativeUnitNames = array_map(function ($unit) {
					return $unit->name;
				}, $decoded);
				$newPublication->setData('coverage', implode(', ', $administrativeUnitNames), $journal->getPrimaryLocale());
			} else {
				$newPublication->setData('coverage', "no data", $journal->getPrimaryLocale());
			}
		}
	}

	/**
	 * @copydoc Plugin::getActions() - https://docs.pkp.sfu.ca/dev/plugin-guide/en/settings
	 * Function needed for Plugin Settings.
	 */
	public function getActions($request, $actionArgs)
	{

		// Get the existing actions
		$actions = parent::getActions($request, $actionArgs);
		if (!$this->getEnabled()) {
			return $actions;
		}

		// Create a LinkAction that will call the plugin's
		// `manage` method with the `settings` verb.
		$router = $request->getRouter();
		import('lib.pkp.classes.linkAction.request.AjaxModal');
		$linkAction = new LinkAction(
			'settings',
			new AjaxModal(
				$router->url(
					$request,
					null,
					null,
					'manage',
					null,
					array(
						'verb' => 'settings',
						'plugin' => $this->getName(),
						'category' => 'generic'
					)
				),
				$this->getDisplayName()
			),
			__('manager.plugins.settings'),
			null
		);

		// Add the LinkAction to the existing actions.
		// Make it the first action to be consistent with
		// other plugins.
		array_unshift($actions, $linkAction);

		return $actions;
	}

	/**
	 * @copydoc Plugin::manage() - https://docs.pkp.sfu.ca/dev/plugin-guide/en/settings#the-form-class 
	 * Function needed for Plugin Settings. 
	 */
	public function manage($args, $request)
	{
		switch ($request->getUserVar('verb')) {
			case 'settings':

				$form = new SettingsForm($this);

				// Fetch the form the first time it loads, before
				// the user has tried to save it
				if (!$request->getUserVar('save')) {
					$form->initData();
					return new JSONMessage(true, $form->fetch($request));
				}

				// Validate and execute the form
				$form->readInputData();
				if ($form->validate()) {
					$form->execute();
					return new JSONMessage(true);
				}
				// Validation failed: re-render the form so AjaxFormHandler swaps the
				// HTML and the per-field error sub-label from addError() becomes visible.
				return new JSONMessage(true, $form->fetch($request));
		}
		return parent::manage($args, $request);
	}

	/**
	 * Provide a name for this plugin (plugin gallery)
	 *
	 * The name will appear in the Plugin Gallery where editors can
	 * install, enable and disable plugins.
	 */
	public function getDisplayName()
	{
		return __('plugins.generic.geoMetadata.name');
	}

	/**
	 * Provide a description for this plugin (plugin gallery) 
	 *
	 * The description will appear in the Plugin Gallery where editors can
	 * install, enable and disable plugins.
	 */
	public function getDescription()
	{
		return __('plugins.generic.geoMetadata.description');
	}

	/**
	 * Get the current context ID or the site-wide context ID (0) if no context
	 * can be found.
	 */
	function getCurrentContextId()
	{
		$context = Application::get()->getRequest()->getContext();
		return is_null($context) ? 0 : $context->getId();
	}

}
