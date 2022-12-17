<?php

/**
 * @file OptimetaGeoPlugin.inc.php
 *
 * Copyright (c) 2022 OPTIMETA project
 * Copyright (c) 2022 Daniel Nüst
 * Distributed under the GNU GPL v3. For full terms see the file dLICENSE.
 *
 * @class OptimetaGeoPlugin
 * @brief Plugin class for the OPTIMETA project's geo plugin.
 */


const MAP_URL_PATH = 'map';

// following names are also used in JavaScript files to identify fields
const OPTIMETA_GEO_DB_FIELD_TIME_PERIODS = 'optimetaGeo::timePeriods';
const OPTIMETA_GEO_DB_FIELD_SPATIAL =      'optimetaGeo::spatialProperties';
const OPTIMETA_GEO_DB_FIELD_ADMINUNIT =    'optimetaGeo::administrativeUnit';

const OPTIMETA_GEO_FORM_NAME = 'OptimetaGeo_PublicationForm';

const OPTIMETA_GEO_PLUGIN_PATH = __DIR__;

require_once (OPTIMETA_GEO_PLUGIN_PATH . '/vendor/autoload.php');

import('lib.pkp.classes.plugins.GenericPlugin');

import('plugins.generic.optimetaGeo.classes.Components.Forms.PublicationForm');
import('plugins.generic.optimetaGeo.classes.Components.Forms.SettingsForm');

use Optimeta\Geo\Components\Forms\PublicationForm;
use Optimeta\Geo\Components\Forms\SettingsForm;

class OptimetaGeoPlugin extends GenericPlugin
{
    protected $ojsVersion = '3.3.0.0';

    protected $versionSpecificNameState = 'state';

	protected $templateParameters = [
		'pluginStylesheetURL' => '',
		'pluginJavaScriptURL' => '',
	];

	public $dbFields = [
		'spatial' => OPTIMETA_GEO_DB_FIELD_SPATIAL,
		'temporal' => OPTIMETA_GEO_DB_FIELD_TIME_PERIODS,
		'admin' => OPTIMETA_GEO_DB_FIELD_ADMINUNIT,
	];

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
			// custom page handler, see https://docs.pkp.sfu.ca/dev/plugin-guide/en/examples-custom-page
			HookRegistry::register('LoadHandler', array($this, 'setPageHandler'));

			// Hooks for changing the frontent Submit an Article 3. Enter Metadata 
			HookRegistry::register('Templates::Submission::SubmissionMetadataForm::AdditionalMetadata', array($this, 'extendSubmissionMetadataFormTemplate'));

			// Hooks for changing the article page 
			HookRegistry::register('Templates::Article::Main', array(&$this, 'extendArticleMainTemplate'));
			HookRegistry::register('Templates::Article::Details', array(&$this, 'extendArticleDetailsTemplate'));
			HookRegistry::register('ArticleHandler::view', array(&$this, 'extendArticleView')); //

			// Hooks for changing the issue page 
			HookRegistry::register('Templates::Issue::TOC::Main', array(&$this, 'extendIssueTocTemplate'));
			HookRegistry::register('Templates::Issue::Issue::Article', array(&$this, 'extendIssueTocArticleTemplate'));

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
			$urlMomentJS =                 $request->getBaseUrl() . '/' . $this->getPluginPath() . '/js/lib/moment/moment.js';
			$urlDaterangepickerJS =        $request->getBaseUrl() . '/' . $this->getPluginPath() . '/js/lib/daterangepicker/daterangepicker.js';
			$urlDaterangepickerCSS =       $request->getBaseUrl() . '/' . $this->getPluginPath() . '/js/lib/daterangepicker/daterangepicker.css';
			$urlLeafletControlGeocodeJS =  $request->getBaseUrl() . '/' . $this->getPluginPath() . '/js/lib/leaflet-control-geocoder/dist/Control.Geocoder.min.js';
			$urlLeafletControlGeocodeCSS = $request->getBaseUrl() . '/' . $this->getPluginPath() . '/js/lib/leaflet-control-geocoder/dist/Control.Geocoder.css';

			// loading the leaflet scripts, source: https://leafletjs.com/examples/quick-start/
			$templateMgr->addStyleSheet('leafletCSS', $urlLeafletCSS, array('contexts' => array('frontend', 'backend')));
			$templateMgr->addJavaScript('leafletJS', $urlLeafletJS, array('contexts' => array('frontend', 'backend')));

			// loading the leaflet draw scripts, source: https://www.jsdelivr.com/package/npm/leaflet-draw?path=dist
			$templateMgr->addStyleSheet("leafletDrawCSS", $urlLeafletDrawCSS, array('contexts' => array('frontend', 'backend')));
			$templateMgr->addJavaScript("leafletDrawJS", $urlLeafletDrawJS, array('contexts' => array('frontend', 'backend')));

			// loading the daterangepicker scripts, source: https://www.daterangepicker.com/#example2
			$templateMgr->addJavaScript("momentJS", $urlMomentJS, array('contexts' => array('frontend', 'backend')));
			$templateMgr->addJavaScript("daterangepickerJS", $urlDaterangepickerJS, array('contexts' => array('frontend', 'backend')));
			$templateMgr->addStyleSheet("daterangepickerCSS", $urlDaterangepickerCSS, array('contexts' => array('frontend', 'backend')));

			// loading leaflet control geocoder (search), source: https://github.com/perliedman/leaflet-control-geocoder 
			$templateMgr->addJavaScript("leafletControlGeocodeJS", $urlLeafletControlGeocodeJS, array('contexts' => array('frontend', 'backend')));
			$templateMgr->addStyleSheet("leafletControlGeocodeCSS", $urlLeafletControlGeocodeCSS, array('contexts' => array('frontend', 'backend')));

			// plugins JS scripts and CSS
			$templateMgr->assign('optimetageo_submissionJS',      $request->getBaseUrl() . '/' . $this->getPluginPath() . '/js/submission.js');
			$templateMgr->assign('optimetageo_article_detailsJS', $request->getBaseUrl() . '/' . $this->getPluginPath() . '/js/article_details.js');
			$templateMgr->assign('optimetageo_issueJS',           $request->getBaseUrl() . '/' . $this->getPluginPath() . '/js/issue.js');
			$templateMgr->assign('optimetageo_markerBaseUrl',     $request->getBaseUrl() . '/' . $this->getPluginPath() . '/js/lib/leaflet-color-markers/img/');

			$templateMgr->assign('optimetageo_mapUrlPath', MAP_URL_PATH);
			$templateMgr->assign('optimetageo_metadataLicense', '<a href="https://creativecommons.org/publicdomain/zero/1.0/">CC-0</a>');
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
	 * Inject metadata into article HTML head
	 * @param $hookName string
	 * @param $args array
	 * @return boolean
	 */
	function extendArticleView($hookName, $args)
	{
		$request = $args[0];
		$article = $args[2];
		$publication = $article->getCurrentPublication();
		$journal = $request->getContext();

		$templateMgr = TemplateManager::getManager($request);

		$templateMgr->addHeader('dublinCoreTemporal', '<link rel="schema.DC" href="http://purl.org/dc/elements/1.1/" />');

		// https://www.dublincore.org/specifications/dublin-core/dcmi-terms/terms/spatial/
		if ($spatial = $publication->getData(OPTIMETA_GEO_DB_FIELD_SPATIAL)) {
			$templateMgr->addHeader('dublinCoreSpatialCoverage', '<meta name="DC.SpatialCoverage" scheme="GeoJSON" content="' . htmlspecialchars(strip_tags($spatial)) . '" />');
		}

		if ($administrativeUnit = $publication->getData(OPTIMETA_GEO_DB_FIELD_ADMINUNIT)) {
			$administrativeUnitNames = array_map(function ($unit) {
				return $unit->name;
			}, json_decode($administrativeUnit));
			$administrativeUnitNames = implode(', ', $administrativeUnitNames);

			$lowestAdministrativeUnitName = null;
			$lowestAdministrativeUnitBBox = null;
			foreach (json_decode($administrativeUnit) as $unit) {
				if ($unit->bbox != 'not available') {
					$lowestAdministrativeUnitName = $unit->name;
					$lowestAdministrativeUnitBBox = $unit->bbox;
				}
			}

			if ($lowestAdministrativeUnitName) {
				// https://dohmaindesigns.com/adding-geo-meta-tags-to-your-website/
				$templateMgr->addHeader('geoPlacename', '<meta name="geo.placename" content="' . htmlspecialchars(strip_tags($lowestAdministrativeUnitName)) . '" />');
			}

			if ($lowestAdministrativeUnitName && $lowestAdministrativeUnitBBox) {
				// DCMI Box Encoding Scheme - https://www.dublincore.org/specifications/dublin-core/dcmi-box/
				$templateMgr->addHeader('dublincCoreBox', '<meta name="DC.box" content="name=' .
					$lowestAdministrativeUnitName .
					'; northlimit=' . $lowestAdministrativeUnitBBox->north .
					'; southlimit=' . $lowestAdministrativeUnitBBox->south .
					'; westlimit='  . $lowestAdministrativeUnitBBox->west  .
					'; eastlimit='  . $lowestAdministrativeUnitBBox->east  .
					'; projection=EPSG3857" />');

				// ISO 19139 - https://boundingbox.klokantech.com/
				$templateMgr->addHeader('isoGeographicBoundingBox', '<meta name="ISO 19139" content="' .
					'<gmd:EX_GeographicBoundingBox>' .
					'<gmd:westBoundLongitude><gco:Decimal>' . $lowestAdministrativeUnitBBox->west . '</gco:Decimal></gmd:westBoundLongitude>' .
					'<gmd:eastBoundLongitude><gco:Decimal>' . $lowestAdministrativeUnitBBox->east . '</gco:Decimal></gmd:eastBoundLongitude>' .
					'<gmd:southBoundLatitude><gco:Decimal>' . $lowestAdministrativeUnitBBox->south . '</gco:Decimal></gmd:southBoundLatitude>' .
					'<gmd:northBoundLatitude><gco:Decimal>' . $lowestAdministrativeUnitBBox->north . '</gco:Decimal></gmd:northBoundLatitude></gmd:EX_GeographicBoundingBox>" />');
			}
		}

		if ($timePeriods = $publication->getData(OPTIMETA_GEO_DB_FIELD_TIME_PERIODS)) {
			// FIXME crazy use of explode makes more sense when we support multiple periods
			$begin = explode('..', explode('{', $timePeriods)[1])[0];
			$end = explode('}', explode('..', explode('{', $timePeriods)[1])[1])[0];

			// / is the ISO8601 time interval separator, see https://en.wikipedia.org/wiki/ISO_8601
			$templateMgr->addHeader('dublinCoreTemporal', '<meta name="DC.temporal" scheme="ISO8601" content="' .  
				$begin. '/' . $end .
				'"/>');

			$templateMgr->addHeader('dublinCorePeriodOfTime', '<meta name="DC.PeriodOfTime" scheme="ISO8601" content="' . 
			$begin. '/' . $end .
			'"/>');
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

		// example: the arrow is used to access the attribute smarty of the variable smarty 
		// $templateMgr = $smarty->smarty; 

		$request = Application::get()->getRequest();
		$context = $request->getContext();

		/*
		Check if the user has entered an username in the plugin settings for the GeoNames API (https://www.geonames.org/login). 
		The result is passed on accordingly to submission.js as template variable. 
		*/
		$usernameGeonames = $this->getSetting($context->getId(), 'optimetaGeo_geonames_username');
		$templateMgr->assign('usernameGeonames', $usernameGeonames);
		$baseurlGeonames = $this->getSetting($context->getId(), 'optimetaGeo_geonames_baseurl');
		$templateMgr->assign('baseurlGeonames', $baseurlGeonames);

		/*
		In case the user repeats the step "3. Enter Metadata" in the process 'Submit an Article' and comes back to this step to make changes again, 
		the already entered data is read from the database, added to the template and displayed for the user.
		Data is loaded from the database, passed as template variable to the 'submissionMetadataFormFiels.tpl' 
	 	and requested from there in the 'submission.js' to display coordinates in a map, the date and coverage information if available.
		*/
		$publicationDao = DAORegistry::getDAO('PublicationDAO');
		$submissionId = $request->getUserVar('submissionId');
		$publication = $publicationDao->getById($submissionId);

		$timePeriods = $publication->getData(OPTIMETA_GEO_DB_FIELD_TIME_PERIODS);
		$spatialProperties = $publication->getData(OPTIMETA_GEO_DB_FIELD_SPATIAL);
		$administrativeUnit = $publication->getData(OPTIMETA_GEO_DB_FIELD_ADMINUNIT);

		// for the case that no data is available 
		if ($timePeriods === null) {
			$timePeriods = 'no data';
		}

		if ($spatialProperties === null || $spatialProperties === '{"type":"FeatureCollection","features":[],"administrativeUnits":{},"temporalProperties":{"timePeriods":[],"provenance":{"description":"not available","id":"not available"}}}') {
			$spatialProperties = 'no data';
		}

		if ($administrativeUnit === null || current($administrativeUnit) === '' || $administrativeUnit === '') {
			$administrativeUnit = 'no data';
		}

		//assign data as variables to the template 
		$templateMgr->assign(OPTIMETA_GEO_DB_FIELD_TIME_PERIODS, $timePeriods);
		$templateMgr->assign(OPTIMETA_GEO_DB_FIELD_SPATIAL, $spatialProperties);
		$templateMgr->assign(OPTIMETA_GEO_DB_FIELD_ADMINUNIT, $administrativeUnit);

		$templateMgr->assign($this->templateParameters);

		// here the original template is extended by the additional template for entering geospatial metadata  
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

		$publication = $templateMgr->getTemplateVars('publication');
		//$journal = Application::get()->getRequest()->getJournal();

		// get data from database 
		$temporalProperties = $publication->getData(OPTIMETA_GEO_DB_FIELD_TIME_PERIODS);
		$spatialProperties =  $publication->getData(OPTIMETA_GEO_DB_FIELD_SPATIAL);
		$administrativeUnit = $publication->getData(OPTIMETA_GEO_DB_FIELD_ADMINUNIT);
		//$publication->getLocalizedData('coverage', $journal->getPrimaryLocale());

		// for the case that no data is available 
		if ($temporalProperties === null || $temporalProperties === '') {
			$temporalProperties = 'no data';
		}

		if (($spatialProperties === null || $spatialProperties === '{"type":"FeatureCollection","features":[],"administrativeUnits":{},"temporalProperties":{"timePeriods":[],"provenance":"not available"}}')) {
			$spatialProperties = 'no data';
		}

		if ($administrativeUnit === null || $administrativeUnit === '') {
			$administrativeUnit = 'no data';
		}

		//assign data as variables to the template 
		$templateMgr->assign(OPTIMETA_GEO_DB_FIELD_TIME_PERIODS, $temporalProperties);
		$templateMgr->assign(OPTIMETA_GEO_DB_FIELD_SPATIAL, $spatialProperties);
		$templateMgr->assign(OPTIMETA_GEO_DB_FIELD_ADMINUNIT, $administrativeUnit);

		$templateMgr->assign($this->templateParameters);

		$output .= $templateMgr->fetch($this->getTemplateResource('frontend/objects/article_details.tpl'));

		return false;
	}

	/**
	 * Function which extends the ArticleMain Template by a download button for the geospatial Metadata as geoJSON. 
	 * @param hook Templates::Article::Details
	 */
	public function extendArticleDetailsTemplate($hookName, $params)
	{
		$templateMgr = &$params[1];
		$output = &$params[2];

		$templateMgr->assign($this->templateParameters);

		$output .= $templateMgr->fetch($this->getTemplateResource('frontend/objects/article_details_download.tpl'));

		return false;
	}

	/**
	 * Function which extends the issue TOC with a timeline and map view - needs the optimetaGeoTheme plugin!
	 * @param hook Templates::Issue::TOC::Main
	 */
	public function extendIssueTocTemplate($hookName, $params)
	{
		$templateMgr = &$params[1];
		$output = &$params[2];

		$templateMgr->assign($this->templateParameters);

		$output .= $templateMgr->fetch($this->getTemplateResource('frontend/objects/issue_map.tpl'));

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

		$spatialProperties = $publication->getData(OPTIMETA_GEO_DB_FIELD_SPATIAL);
		if (($spatialProperties === null || $spatialProperties === '{"type":"FeatureCollection","features":[],"administrativeUnits":{},"temporalProperties":{"timePeriods":[],"provenance":"not available"}}')) {
			$spatialProperties = 'no data';
		}
		$templateMgr->assign(OPTIMETA_GEO_DB_FIELD_SPATIAL, $spatialProperties);

		$templateMgr->assign('journal', Application::get()->getRequest()->getJournal()); // access primary locale

		//$temporalProperties = $publication->getData(OPTIMETA_GEO_DB_FIELD_TIME_PERIODS);
		//if ($temporalProperties === null || $temporalProperties === '') {
		//	$temporalProperties = 'no data';
		//}
		//$templateMgr->assign(OPTIMETA_GEO_DB_FIELD_TIME_PERIODS, $temporalProperties);

		//$administrativeUnit = $publication->getLocalizedData('coverage', $journal->getPrimaryLocale());
		//if ($administrativeUnit === null || $administrativeUnit === '') {
		//	$administrativeUnit = 'no data';
		//}
		//$templateMgr->assign(OPTIMETA_GEO_DB_FIELD_ADMINUNIT, $administrativeUnit);

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

		$request = $this->getRequest();
		$context = $request->getContext();
		$submission = $templateMgr->getTemplateVars('submission');
		$submissionId = $submission->getId();
		$latestPublication = $submission->getLatestPublication();
		
		$dispatcher = $request->getDispatcher();
		$apiBaseUrl = $dispatcher->url($request, ROUTE_API, $context->getData('urlPath'), '');
		
		$usernameGeonames = $this->getSetting($context->getId(), 'optimetaGeo_geonames_username');
		$templateMgr->assign('usernameGeonames', $usernameGeonames);
		$baseurlGeonames = $this->getSetting($context->getId(), 'optimetaGeo_geonames_baseurl');
		$templateMgr->assign('baseurlGeonames', $baseurlGeonames);

		$form = new PublicationForm(
            $apiBaseUrl . 'submissions/' . $submissionId . '/publications/' . $latestPublication->getId(),
            $latestPublication,
            __('plugins.generic.optimetaGeo.publication.success'));

		$state = $templateMgr->getTemplateVars($this->versionSpecificNameState);
		$state['components'][OPTIMETA_GEO_FORM_NAME] = $form->getConfig();
		$templateMgr->assign($this->versionSpecificNameState, $state);
		
		$templateMgr->assign('submissionId', $submissionId);

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
		$schema->properties->{OPTIMETA_GEO_DB_FIELD_TIME_PERIODS} = json_decode($timePeriods);

		$spatialProperties = '{
			"type": "string",
			"multilingual": false,
			"apiSummary": true,
			"validation": [
				"nullable"
			]
		}';
		$schema->properties->{OPTIMETA_GEO_DB_FIELD_SPATIAL} = json_decode($spatialProperties);

		$administrativeUnits = '{
			"type": "string",
			"multilingual": false,
			"apiSummary": true,
			"validation": [
				"nullable"
			]
		}';
		$schema->properties->{OPTIMETA_GEO_DB_FIELD_ADMINUNIT} = json_decode($administrativeUnits);

		return false;
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
		$params = $params[2];

		$temporalProperties = $_POST[OPTIMETA_GEO_DB_FIELD_TIME_PERIODS];
		$spatialProperties =  $_POST[OPTIMETA_GEO_DB_FIELD_SPATIAL];
		$administrativeUnit = $_POST[OPTIMETA_GEO_DB_FIELD_ADMINUNIT];
		
		// null if there is no possibility to input data (metadata input before Schedule for Publication)
		if ($spatialProperties !== null) {
			$newPublication->setData(OPTIMETA_GEO_DB_FIELD_SPATIAL, $spatialProperties);
		}

		if ($temporalProperties !== null && $temporalProperties !== "") {
			$newPublication->setData(OPTIMETA_GEO_DB_FIELD_TIME_PERIODS, $temporalProperties);
		}

		if ($administrativeUnit !== null) {
			$newPublication->setData(OPTIMETA_GEO_DB_FIELD_ADMINUNIT, $administrativeUnit);

			// turn admin units into string then save in Coverage field
			$administrativeUnitNames = array_map(function ($unit) {
				return $unit->name;
			}, json_decode($administrativeUnit));
			$administrativeUnitNames = implode(', ', $administrativeUnitNames);

			$journal = Application::get()->getRequest()->getJournal();
			$newPublication->setData('coverage', $administrativeUnitNames, $journal->getPrimaryLocale());
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
		return __('plugins.generic.optimetaGeo.name');
	}

	/**
	 * Provide a description for this plugin (plugin gallery) 
	 *
	 * The description will appear in the Plugin Gallery where editors can
	 * install, enable and disable plugins.
	 */
	public function getDescription()
	{
		return __('plugins.generic.optimetaGeo.description');
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
