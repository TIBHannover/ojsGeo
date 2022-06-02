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

class JournalMapHandler extends Handler
{
    public function index($args, $request)
    {
        $plugin = PluginRegistry::getPlugin('generic', 'optimetageoplugin');
        $templateMgr = TemplateManager::getManager($request);

        $templateMgr->assign('optimeta_journalJS', $request->getBaseUrl() . '/' . $plugin->getPluginPath() . '/js/journal.js');

        $journal = $request->getContext();
        if (!$journal) return false;

        // Get limit settings?
        //$displayItems = $this->_parentPlugin->getSetting($journal->getId(), 'displayItems');

        $publicationsGeodata = [];
        $publications = Services::get('publication')->getMany([
            'contextId' => $journal->getId(),
            'status' => STATUS_PUBLISHED,
            'count' => 9999, // large upper limit - make configurable?
        ]);

        $userGroupDao = DAORegistry::getDAO('UserGroupDAO');
		$userGroups = $userGroupDao->getByContextId($journal->getId())->toArray();	

        foreach ($publications as $publication) {
            $id = $publication->getData('id');

            $issue = "";
            if ($publication->getData('issueId')) {
                $issueDao = DAORegistry::getDAO('IssueDAO');
                $issue = $issueDao->getById($publication->getData('issueId'));
                $issue = $issue->getIssueIdentification();
            }
            
            $publicationsGeodata[$id] = [
                'id' => $publication->getData('id'),
                'title' => strip_tags($publication->getLocalizedData('title')),
                'spatial' => $publication->getData('optimetaGeo::spatialProperties'),
                'temporal' => $publication->getData('optimetaGeo::temporalProperties'),
                'coverage' => $publication->getLocalizedData('coverage', 'en_US'),
                'abstract' => strip_tags($publication->getLocalizedData('abstract')),
                'authors' => $publication->getAuthorString($userGroups),
                'issue' => $issue,
            ];
        }

        // https://stackoverflow.com/a/11722121/261210
        $publicationsGeodata = array_values($publicationsGeodata);

        $templateMgr->assign(array(
            'publications' => json_encode($publicationsGeodata),
            'context' => $journal->getLocalizedName(),
        ));

        return $templateMgr->display($plugin->getTemplateResource('frontend/pages/journal_map.tpl'));
    }
}
