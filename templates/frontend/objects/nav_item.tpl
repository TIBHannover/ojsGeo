{**
 * templates/frontend/objects/nav_item.tpl
 *
 * Copyright (c) 2022 OPTIMETA project
 * Copyright (c) 2022 Daniel Nüst
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * @brief View of a map for all articles of an issue
 *
 * @uses $liClass
 * @uses $optimetageo_mapUrlPath
 *}

<li class="{$liClass|escape}">
	<a href="{url page="{$optimetageo_mapUrlPath}" op=""}">
		{translate key="plugins.generic.optimetaGeo.journal.mapMenu"}
	</a>
</li>