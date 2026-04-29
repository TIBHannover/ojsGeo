<?php
/**
 * @file classes/components/forms/PublicationForm.php
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * @class PublicationForm
 *
 * @brief A preset form for setting a publication's spatio-temporal metadata.
 */

namespace geoMetadata\classes\Components\Forms;

import('lib.pkp.classes.form.Form');

use FormValidatorPost;
use FormValidatorCSRF;
use Application;
use TemplateManager;
use NotificationManager;
use Throwable;

/**
 * Form for the geoMetadata settings. 
 */
class SettingsForm extends \Form
{
    public $plugin;
    
    /**
     * @desc Array of variables saved in the database
     * @var string[]
     */
    private $settings = [
        'geoMetadata_geonames_username',
        'geoMetadata_geonames_baseurl',
        'geoMetadata_showDownloadSidebar',
        'geoMetadata_showArticleMap',
        'geoMetadata_showArticleTemporal',
        'geoMetadata_showArticleAdminUnit',
        'geoMetadata_showIssueMap',
        'geoMetadata_showJournalMap',
        'geoMetadata_showIssueTimeline',
        'geoMetadata_showJournalTimeline',
        'geoMetadata_timelineCollapsedByDefault',
        'geoMetadata_timelineShowInstructions',
        'geoMetadata_timelineHeight',
        'geoMetadata_timelineClusterMaxItems',
        'geoMetadata_submission_enableSpatial',
        'geoMetadata_submission_enableTemporal',
        'geoMetadata_submission_enableAdminUnit',
        'geoMetadata_workflow_enableSpatial',
        'geoMetadata_workflow_enableTemporal',
        'geoMetadata_workflow_enableAdminUnit',
        'geoMetadata_workflow_protectRawFields',
        'geoMetadata_emitMetaDublinCore',
        'geoMetadata_emitMetaGeoNames',
        'geoMetadata_emitMetaGeoCoords',
        'geoMetadata_emitMetaISO19139',
        'geoMetadata_emitSchemaOrg',
        'geoMetadata_enableGeocoderSearch',
        'geoMetadata_showEsriBaseLayer',
        'geoMetadata_submissionMapDefaultLat',
        'geoMetadata_submissionMapDefaultLng',
        'geoMetadata_submissionMapDefaultZoom',
        'geoMetadata_mapFeatureColor',
        'geoMetadata_mapFeatureColorHighlight',
        'geoMetadata_adminUnitOverlayColor',
        'geoMetadata_adminUnitOverlayFillOpacity',
        'geoMetadata_markerHueRotation',
        'geoMetadata_markerHueRotationHighlight',
        'geoMetadata_enableSyncedHighlight',
        'geoMetadata_showIssueMapIcon',
        'geoMetadata_overlapPicker'
    ];

    /**
     * Non-boolean settings with a reasonable stored default when no value has been saved.
     * Read by both initData() and GeoMetadataPlugin::getSettingOrDefault().
     */
    public static $settingDefaults = [
        'geoMetadata_submissionMapDefaultLat'     => '0',
        'geoMetadata_submissionMapDefaultLng'     => '0',
        'geoMetadata_submissionMapDefaultZoom'    => '2',
        'geoMetadata_mapFeatureColor'             => '#1E6292',
        'geoMetadata_mapFeatureColorHighlight'    => '#FF0000',
        'geoMetadata_adminUnitOverlayColor'       => '#000000',
        'geoMetadata_adminUnitOverlayFillOpacity' => '0.15',
        'geoMetadata_markerHueRotation'           => '0',
        'geoMetadata_markerHueRotationHighlight'  => '150',
        'geoMetadata_timelineHeight'              => '200',
        'geoMetadata_timelineClusterMaxItems'     => '1',
    ];

    public static function getDefault(string $key): ?string
    {
        return self::$settingDefaults[$key] ?? null;
    }

    /**
     * Settings that are booleans defaulting to ON when no value has been saved yet.
     * Keeps initData/readInputData/plugin-hook null-handling consistent.
     */
    private $booleanDefaultOnSettings = [
        'geoMetadata_showDownloadSidebar',
        'geoMetadata_showArticleMap',
        'geoMetadata_showArticleTemporal',
        'geoMetadata_showArticleAdminUnit',
        'geoMetadata_showIssueMap',
        'geoMetadata_showJournalMap',
        'geoMetadata_showIssueTimeline',
        'geoMetadata_showJournalTimeline',
        'geoMetadata_timelineShowInstructions',
        'geoMetadata_submission_enableSpatial',
        'geoMetadata_submission_enableTemporal',
        'geoMetadata_submission_enableAdminUnit',
        'geoMetadata_workflow_enableSpatial',
        'geoMetadata_workflow_enableTemporal',
        'geoMetadata_workflow_enableAdminUnit',
        'geoMetadata_workflow_protectRawFields',
        'geoMetadata_emitMetaDublinCore',
        'geoMetadata_emitMetaGeoNames',
        'geoMetadata_emitMetaGeoCoords',
        'geoMetadata_emitMetaISO19139',
        'geoMetadata_emitSchemaOrg',
        'geoMetadata_enableGeocoderSearch',
        'geoMetadata_showEsriBaseLayer',
        'geoMetadata_enableSyncedHighlight',
        'geoMetadata_showIssueMapIcon',
        'geoMetadata_overlapPicker'
    ];

    public function __construct($plugin)
    {

        // Define the settings template and store a copy of the plugin object
        parent::__construct($plugin->getTemplateResource('settings.tpl'));
        $this->plugin = $plugin;

        // Always add POST and CSRF validation to secure your form.
        $this->addCheck(new FormValidatorPost($this));
        $this->addCheck(new FormValidatorCSRF($this));
    }

    /**
     * Load settings already saved in the database
     *
     * Settings are stored by context, so that each journal or press
     * can have different settings.
     */
    public function initData()
    {
        $context = Application::get()->getRequest()->getContext();
        $contextId = $context ? $context->getId() : CONTEXT_SITE;
        foreach($this->settings as $key){
            $value = $this->plugin->getSetting($contextId, $key);
            if ($value === null) {
                if (in_array($key, $this->booleanDefaultOnSettings, true)) {
                    $value = true;
                } elseif (array_key_exists($key, self::$settingDefaults)) {
                    $value = self::$settingDefaults[$key];
                }
            }
            $this->setData($key, $value);
        }

        parent::initData();
    }

    /**
     * Load data that was submitted with the form
     */
    public function readInputData()
    {
        foreach($this->settings as $key){
            $this->readUserVars([$key]);
        }
        // Unchecked checkboxes are absent from POST; coerce to '0' so null-from-getSetting()
        // later unambiguously means "never saved, default on".
        foreach ($this->booleanDefaultOnSettings as $key) {
            if ($this->getData($key) === null) {
                $this->setData($key, '0');
            }
        }
        parent::readInputData();
    }

    /**
     * Fetch any additional data needed for your form.
     *
     * Data assigned to the form using $this->setData() during the
     * initData() or readInputData() methods will be passed to the
     * template.
     */
    public function fetch($request, $template = null, $display = false)
    {

        // Pass the plugin name to the template so that it can be
        // used in the URL that the form is submitted to
        $templateMgr = TemplateManager::getManager($request);
        $templateMgr->assign('pluginName', $this->plugin->getName());

        return parent::fetch($request, $template, $display);
    }

    /**
     * Run the standard form validators, then probe the configured GeoNames credentials.
     * Mirror the JS-side gazetteer reasons so submission and settings show the same text.
     */
    public function validate($callHooks = true)
    {
        $valid = parent::validate($callHooks);

        $baseurl  = trim((string) $this->getData('geoMetadata_geonames_baseurl'));
        $username = trim((string) $this->getData('geoMetadata_geonames_username'));

        if ($baseurl === '' || $username === '') {
            return $valid;
        }

        $reasonKey = $this->probeGeonames($baseurl, $username);
        if ($reasonKey !== null) {
            $message = __('plugins.generic.geoMetadata.gazetteer.unavailable.reason.' . $reasonKey);
            $this->addError('geoMetadata_geonames_username', $message);
            $this->addErrorField('geoMetadata_geonames_username');
            return false;
        }

        return $valid;
    }

    /**
     * Ping GeoNames /searchJSON with the supplied credentials.
     * Returns null when the call yields valid data, otherwise a reason key from the
     * gazetteer.unavailable.reason.* set: invalidCredentials, quotaExceeded, externalError.
     */
    protected function probeGeonames(string $baseurl, string $username): ?string
    {
        $url = rtrim($baseurl, '/') . '/searchJSON';
        try {
            $response = Application::get()->getHttpClient()->request('GET', $url, [
                'query'           => ['name_equals' => 'Münster', 'username' => $username, 'maxRows' => 1],
                'timeout'         => 5,
                'connect_timeout' => 5,
                'http_errors'     => false,
            ]);
        } catch (Throwable $e) {
            return 'invalidCredentials';
        }

        if ($response->getStatusCode() >= 400) {
            return 'invalidCredentials';
        }

        $body = json_decode((string) $response->getBody(), true);
        if (!is_array($body)) {
            return 'externalError';
        }
        if (isset($body['status']['value'])) {
            return $body['status']['value'] === 19 ? 'quotaExceeded' : 'externalError';
        }
        return null;
    }

    /**
     * Save the settings
     */
    public function execute(...$functionArgs)
    {
        $context = Application::get()->getRequest()->getContext();
        $contextId = $context ? $context->getId() : CONTEXT_SITE;

        foreach($this->settings as $key){
            $this->plugin->updateSetting( $contextId, $key, $this->getData($key));
        }
        
        // Tell the user that the save was successful.
        import('classes.notification.NotificationManager');
        $notificationMgr = new NotificationManager();
        $notificationMgr->createTrivialNotification(
            Application::get()->getRequest()->getUser()->getId(),
            NOTIFICATION_TYPE_SUCCESS,
            ['contents' => __('common.changesSaved')]
        );

        return parent::execute();
    }
}
