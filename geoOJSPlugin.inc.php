<?php
// import of genericPlugin
import('lib.pkp.classes.plugins.GenericPlugin');
/**
 * Each plugin must extend one of the plugin category classes that exist in OJS and OMP. 
 * In our case its the genericPlugin class. 
 * 
 */
class geoOJSPlugin extends GenericPlugin
{
	public function register($category, $path, $mainContextId = NULL)
	{

		// Register the plugin even when it is not enabled
		$success = parent::register($category, $path, $mainContextId);
		// important to check if plugin is enabled before registering the hook, cause otherwise plugin will always run no matter enabled or disabled! 
		if ($success && $this->getEnabled()) {

			/* 
			Hooks are the possibility to intervene the application. By the corresponding function which is named in the HookRegistery, the application
			can be changed. 
			Further information here: https://docs.pkp.sfu.ca/dev/plugin-guide/en/categories#generic 
			*/
			HookRegistry::register('Templates::Submission::SubmissionMetadataForm::AdditionalMetadata', array($this, 'extendTemplate'));
			HookRegistry::register('Templates::Submission::SubmissionMetadataForm::AdditionalMetadata', array($this, 'doSomething'));
			HookRegistry::register('Templates::Submission::SubmissionMetadataForm::AdditionalMetadata', array($this, 'map'));

			
			$request = Application::get()->getRequest();
			$templateMgr = TemplateManager::getManager($request);
			
			/*
			To respect the enable_cdn configuration setting. When this is off, 
			plugins should not load any scripts or styles from a third-party website.
			*/ 
			if (Config::getVar('general', 'enable_cdn')) {
				$urlLeafletCSS = 'https://unpkg.com/leaflet@1.6.0/dist/leaflet.css';
				$urlLeafletJS = 'https://unpkg.com/leaflet@1.6.0/dist/leaflet.js'; 
				$urlLeafletDrawCSS = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css';
				$urlLeafletDrawJS = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js';
				// $urlJqueryJS = 'https://code.jquery.com/jquery-3.2.1.js';
				// jquery no need to load, already loaded here: ojs/lib/pkp/classes/template/PKPTemplateManager.inc.php 
				$urlMomentJS = 'https://cdn.jsdelivr.net/momentjs/latest/moment.min.js'; 
				$urlDaterangepickerJS = 'https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.min.js'; 
				$urlDaterangepickerCSS = 'https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.css';
			  } else {
				$urlLeafletCSS = $request->getBaseUrl() . '/' . $this->getPluginPath() . '/enable_cdn_Off/leaflet/leaflet.css';
				$urlLeafletJS = $request->getBaseUrl() . '/' . $this->getPluginPath() . '/enable_cdn_Off/leaflet/leaflet.js'; 
				$urlLeafletDrawCSS = $request->getBaseUrl() . '/' . $this->getPluginPath() . '/enable_cdn_Off/leaflet-draw/leaflet.draw.css';
				$urlLeafletDrawJS = $request->getBaseUrl() . '/' . $this->getPluginPath() . '/enable_cdn_Off/leaflet-draw/leaflet.draw.js';
				// $urlJqueryJS = $request->getBaseUrl() . '/' . $this->getPluginPath() . '/enable_cdn_Off/daterangepicker/jquery.min.js';
				// jquery no need to load, already loaded here: ojs/lib/pkp/classes/template/PKPTemplateManager.inc.php 
				$urlMomentJS = $request->getBaseUrl() . '/' . $this->getPluginPath() . '/enable_cdn_Off/daterangepicker/moment.min.js';
				$urlDaterangepickerJS = $request->getBaseUrl() . '/' . $this->getPluginPath() . '/enable_cdn_Off/daterangepicker/daterangepicker.min.js';
				$urlDaterangepickerCSS = $request->getBaseUrl() . '/' . $this->getPluginPath() . '/enable_cdn_Off/daterangepicker/daterangepicker.css';
			  }
			
			/*
			Here further scripts like JS and CSS are included, 
			these are included by the following lines and need not be referenced (e.g. in .tbl files).
			Further information can be found here: https://docs.pkp.sfu.ca/dev/plugin-guide/en/examples-styles-scripts
			*/ 
			/*
			loading the leaflet scripts
			source: https://leafletjs.com/examples/quick-start/
			*/
			$templateMgr->addStyleSheet('leafletCSS', $urlLeafletCSS, array('contexts' => array('frontend', 'backend')));
			$templateMgr->addJavaScript('leafletJS', $urlLeafletJS, array('contexts' => array('frontend', 'backend')));
			
			/* 
			loading the leaflet draw scripts 
			source: https://www.jsdelivr.com/package/npm/leaflet-draw?path=dist
			*/
			$templateMgr->addStyleSheet("leafletDrawCSS", $urlLeafletDrawCSS, array('contexts' => array('frontend', 'backend')));
			$templateMgr->addJavaScript("leafletDrawJS", $urlLeafletDrawJS, array('contexts' => array('frontend', 'backend')));

			
			/*
			loading the daterangepicker scripts 
			source: https://www.daterangepicker.com/#example2 
			*/
			//$templateMgr->addJavaScript("jqueryJS", $urlJqueryJS, array('contexts' => array('frontend', 'backend')));
			// jquery no need to load, already loaded here: ojs/lib/pkp/classes/template/PKPTemplateManager.inc.php 
			$templateMgr->addJavaScript("momentJS", $urlMomentJS, array('contexts' => array('frontend', 'backend')));
			$templateMgr->addJavaScript("daterangepickerJS", $urlDaterangepickerJS, array('contexts' => array('frontend', 'backend')));
			$templateMgr->addStyleSheet("daterangepickerCSS", $urlDaterangepickerCSS, array('contexts' => array('frontend', 'backend')));


			// main js script for loading leaflet
			$templateMgr->assign('geoOJSScript', $request->getBaseUrl() . '/' . $this->getPluginPath() . '/js/ojs.js');

		}
		return $success;
	}


	/**
	 * function which extends the sumbmissionMetadataFormFields template 
	 */
	public function extendTemplate($hookName, $args)
	{
		
		$request = Application::get()->getRequest(); // alternativ auch "&$args[0];" aber dann geht "$request->getUserVar('submissionId');" nicht
		$issue = &$args[1]; // wird auch genannt: smarty 
		$article = &$args[2]; // wird auch genannt: output
		
		/*
		This way templates are loaded. 
		Its important that the corresponding hook is activated. 
		If you want to override a template you need to create a .tpl-file which is in the plug-ins template path which the same 
		path it got in the regular ojs structure. E.g. if you want to override/ add something to this template 
		/Users/tomniers/Desktop/ojs_stuff/ojs/lib/pkp/templates/submission/submissionMetadataFormTitleFields.tpl
		you have to store in in the plug-ins template path under this path submission/form/submissionMetadataFormFields.tpl. 
		Further details can be found here: https://docs.pkp.sfu.ca/dev/plugin-guide/en/templates
		Where are templates located: https://docs.pkp.sfu.ca/pkp-theming-guide/en/html-smarty
		*/
		$templateMgr = TemplateManager::getManager($request); 
		$templateMgr->display($this->getTemplateResource('submission/form/submissionMetadataFormFields.tpl'));
	
		return false;
	}

	/**
	 * function to write sth. into the page 
	 */
	public function doSomething($hookName, $args)
	{
		$request = Application::get()->getRequest(); // alternativ auch "&$args[0];" aber dann geht "$request->getUserVar('submissionId');" nicht
		$issue = &$args[1]; // wird auch genannt: smarty 
		$article = &$args[2]; // wird auch genannt: output
		
		// to get the Id of the actual submission
		$submissionId = $request->getUserVar('submissionId');

		$article .= $submissionId;

		$article .= "<p> Hier könnte Ihre Werbung stehen </p> <p> Nö </p>";

	
		return false;
	}

	/**
	 * Provide a name for this plugin (plugin gallery)
	 *
	 * The name will appear in the Plugin Gallery where editors can
	 * install, enable and disable plugins.
	 */
	public function getDisplayName()
	{
		return __('plugins.generic.geoOJS.name');
	}

	/**
	 * Provide a description for this plugin (plugin gallery) 
	 *
	 * The description will appear in the Plugin Gallery where editors can
	 * install, enable and disable plugins.
	 */
	public function getDescription()
	{
		return __('plugins.generic.geoOJS.description');	
	}
}
