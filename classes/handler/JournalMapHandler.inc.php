<?php

/**
 * @file classes/handler/JournalMapHandler.inc.php
 *
 * Copyright (c) 2022 OPTIMETA project
 * Copyright (c) 2022 Daniel Nüst
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * @class JournalMapHandler
 * @brief Show all articles of a journal on one map
 */

import('classes.handler.Handler');
import('lib.pkp.classes.submission.PKPSubmission'); // imports STATUS_PUBLISHED

class JournalMapHandler extends Handler
{
    public function index($args, $request)
    {
        $plugin = PluginRegistry::getPlugin('generic', 'optimetageoplugin');

        $templateMgr = TemplateManager::getManager($request);

        $templateMgr->assign('optimetagep_journalJS', $request->getBaseUrl() . '/' . $plugin->getPluginPath() . '/js/journal.js');
        $templateMgr->assign('pluginStylesheetURL', $request->getBaseUrl() . '/' . $plugin->getPluginPath() . '/css/');
        
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

        foreach ($publications as $publication) {
            $id = $publication->getData('id');

            if($publication->getData('status') != STATUS_PUBLISHED) {
                break;
            }

            $issue = "";
            if ($publication->getData('issueId')) {
                $issueDao = DAORegistry::getDAO('IssueDAO');
                $issue = $issueDao->getById($publication->getData('issueId'));
                $issue = $issue->getIssueIdentification();
            }
            
            $publicationsGeodata[$id] = [
                'id' => $publication->getData('id'),
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
