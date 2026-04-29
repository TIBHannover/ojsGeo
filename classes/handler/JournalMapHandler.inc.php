<?php
/**
 * @file classes/handler/JournalMapHandler.inc.php
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * @class JournalMapHandler
 * @brief Show all articles of a journal on one map.
 */

import('classes.handler.Handler');
import('lib.pkp.classes.submission.PKPSubmission'); // imports STATUS_PUBLISHED

class JournalMapHandler extends Handler
{
    public function index($args, $request)
    {
        $plugin = PluginRegistry::getPlugin('generic', 'geometadataplugin');

        $templateMgr = TemplateManager::getManager($request);

        // Propagate plugin-wide template parameters first so the per-handler assigns below
        // take precedence over any clashing keys (notably pluginStylesheetURL — the plugin
        // default has no trailing slash, the page template here expects one).
        $templateMgr->assign($plugin->templateParameters);
        $templateMgr->assign('geoMetadata_journalJS', $request->getBaseUrl() . '/' . $plugin->getPluginPath() . '/js/journal.js');
        $templateMgr->assign('pluginStylesheetURL', $request->getBaseUrl() . '/' . $plugin->getPluginPath() . '/css/');
        $templateMgr->assign('geoMetadata_showEsriBaseLayer', $plugin->isFeatureEnabled('geoMetadata_showEsriBaseLayer'));
        $templateMgr->assign('geoMetadata_showGeocoder', $plugin->isFeatureEnabled('geoMetadata_enableGeocoderSearch'));
        
        $context = $request->getContext();
        if (!$context) return false;

        // Get limit settings?
        //$displayItems = $this->_parentPlugin->getSetting($journal->getId(), 'displayItems');

        $publicationsGeodata = [];
        $publications = Services::get('publication')->getMany([
            'contextIds' => $context->getId(),
            'status' => STATUS_PUBLISHED, // FIXME
            'count' => 9999, // large upper limit - make configurable?
        ]);

        $userGroupDao = DAORegistry::getDAO('UserGroupDAO');
		$userGroups = $userGroupDao->getByContextId($context->getId())->toArray();	

        // Keep one entry per submission (the latest version). When an article
        // has multiple published versions, the publications service returns
        // each one — without this dedupe the journal map paints overlapping
        // copies of the same article and the timeline would reject duplicate
        // ids.
        $latestBySubmission = [];
        foreach ($publications as $publication) {
            if ($publication->getData('status') != STATUS_PUBLISHED) continue;
            $sid = $publication->getData('submissionId');
            $version = (int) $publication->getData('version');
            if (!isset($latestBySubmission[$sid])
                || $version > (int) $latestBySubmission[$sid]->getData('version')) {
                $latestBySubmission[$sid] = $publication;
            }
        }

        foreach ($latestBySubmission as $publication) {
            $id = $publication->getData('id');

            $issue = "";
            if ($publication->getData('issueId')) {
                $issueDao = DAORegistry::getDAO('IssueDAO');
                $issue = $issueDao->getById($publication->getData('issueId'));
                $issue = $issue->getIssueIdentification();
            }

            $publicationsGeodata[$id] = [
                'publicationId' => $publication->getData('id'),
                'submissionId' => $publication->getData('submissionId'),
                'title' => strip_tags($publication->getLocalizedData('title')),
                'spatial' => $publication->getData($plugin->dbFields['spatial']),
                'temporal' => $publication->getData($plugin->dbFields['temporal']),
                'coverage' => $publication->getLocalizedData('coverage', $context->getPrimaryLocale()),
                'abstract' => strip_tags($publication->getLocalizedData('abstract')),
                'authors' => $publication->getAuthorString($userGroups),
                'issue' => $issue,
            ];
        }

        // https://stackoverflow.com/a/11722121/261210
        $publicationsGeodata = array_values($publicationsGeodata);

        $templateMgr->assign(array(
            'publications' => json_encode($publicationsGeodata),
            'context' => $context->getLocalizedName(),
        ));

        return $templateMgr->display($plugin->getTemplateResource('frontend/pages/journal_map.tpl'));
    }
}
