<?php
// import of genericPlugin
import('lib.pkp.classes.plugins.GenericPlugin');
/**
 * Each plugin must extend one of the plugin category classes that exist in OJS and OMP. 
 * In our case its the genericPlugin class. 
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
			
			$templateMgr->assign("leafletCSS", 'https://unpkg.com/leaflet@1.6.0/dist/leaflet.css');
			$templateMgr->assign("leafletJS", 'https://unpkg.com/leaflet@1.6.0/dist/leaflet.js');

			$templateMgr->assign('geoOJSScript', $request->getBaseUrl() . '/' . $this->getPluginPath() . '/js/ojs.js');
			$templateMgr->assign("tmplRes", $this->getTemplateResource());

			/* TODO not working (https://docs.pkp.sfu.ca/dev/plugin-guide/en/examples-styles-scripts)
			used instead solution above (source: https://github.com/RBoelter/enhancedMetadata)
			$request = Application::get()->getRequest();
      		$url = $request->getBaseUrl() . '/' . $this->getPluginPath() . '/js/ojs.js';
      		$templateMgr = TemplateManager::getManager($request);
				$templateMgr->addJavaScript('geoOJSScript', $url);*/
		}
		return $success;
	}


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

	public function doSomething($hookName, $args)
	{
		$request = Application::get()->getRequest(); // alternativ auch "&$args[0];" aber dann geht "$request->getUserVar('submissionId');" nicht
		$issue = &$args[1]; // wird auch genannt: smarty 
		$article = &$args[2]; // wird auch genannt: output
		
		// to get the Id of the actual submission
		$submissionId = $request->getUserVar('submissionId');

		$article .= $submissionId;

		$article .= "<p> Hello again ich bins Moin </p> <p> Tschaui </p>";

	
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
		return __('plugins.generic.geoOJS.description');	}
}
