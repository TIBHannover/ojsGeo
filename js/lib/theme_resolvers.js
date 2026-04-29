/**
 * js/lib/theme_resolvers.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * @brief Per-theme resolvers that map each issue-TOC hidden `articleId` input
 *        to its article-summary wrapper and title anchor.
 *
 *        The `Templates::Issue::Issue::Article` hook fires inside every theme's
 *        article-summary wrapper, so our hidden `<input class="geoMetadata_data
 *        articleId">` is always a descendant of that wrapper. Themes disagree
 *        on wrapper class names and title-anchor selectors, so we walk from
 *        the input up to the wrapper (`.closest(...)`) and then down to the
 *        title (`.querySelector(...)`) using a per-theme selector pair.
 *
 *        `geoMetadata_resolveArticleAnchor(inputEl)` tries each resolver in
 *        turn and returns the first match, or null. Consumers:
 *
 *        - `js/issue.js` — uses { wrapper } to add/remove the
 *          `.geoMetadata_title_hover` class on map → TOC highlight.
 *        - `js/issue.js` — uses { titleAnchor, titleContainer } to inject the
 *          "show on map" icon next to the title (issue #158).
 *
 *        === Adding support for a third-party theme ===
 *
 *        Copy the template below, change the two selectors, and push the
 *        resolver onto `geoMetadata_articleAnchorResolvers` before any of the
 *        above consumers run — easiest way is to load a small JS snippet of
 *        your own via OJS theme hooks.
 *
 *        // geoMetadata_articleAnchorResolvers.push(function yourTheme(input) {
 *        //     var wrapper = input.closest('.your-article-summary-class');
 *        //     if (!wrapper) return null;
 *        //     var titleAnchor = wrapper.querySelector('.your-title-selector a');
 *        //     if (!titleAnchor) return null;
 *        //     return {
 *        //         wrapper:        wrapper,
 *        //         titleAnchor:    titleAnchor,
 *        //         titleContainer: titleAnchor.parentElement
 *        //     };
 *        // });
 *
 *        Report missing themes at
 *        https://github.com/TIBHannover/geoMetadata/issues.
 */

var geoMetadata_articleAnchorResolvers = [
    // default theme (pkp/ojs core) + defaultManuscript (child of default) +
    // individualizeTheme (inherits default) + gopher + material.
    // Wrapper: <div class="obj_article_summary">
    // Title:   <h? class="title"><a id="article-<id>">
    function defaultFamily(input) {
        var wrapper = input.closest('.obj_article_summary');
        if (!wrapper) return null;
        var titleAnchor = wrapper.querySelector('.title a');
        if (!titleAnchor) return null;
        return {
            wrapper:        wrapper,
            titleAnchor:    titleAnchor,
            titleContainer: titleAnchor.parentElement
        };
    },

    // pkp/bootstrap3 + openjournalteam/academicFree.
    // Wrapper: <div class="article-summary media">
    // Title:   <h3 class="media-heading"><a href="...">
    function bootstrap3Family(input) {
        var wrapper = input.closest('.article-summary.media');
        if (!wrapper) return null;
        var titleAnchor = wrapper.querySelector('.media-heading a, .media-body h3 a');
        if (!titleAnchor) return null;
        return {
            wrapper:        wrapper,
            titleAnchor:    titleAnchor,
            titleContainer: titleAnchor.parentElement
        };
    },

    // pkp/classic.
    // Wrapper: <article class="article_summary">
    // Title:   <h? class="summary_title_wrapper"><a class="summary_title">
    function classicFamily(input) {
        var wrapper = input.closest('.article_summary');
        if (!wrapper) return null;
        var titleAnchor = wrapper.querySelector('.summary_title');
        if (!titleAnchor) return null;
        return {
            wrapper:        wrapper,
            titleAnchor:    titleAnchor,
            titleContainer: titleAnchor.parentElement
        };
    },

    // pkp/healthSciences.
    // Wrapper: <div class="article-summary">   (note: no .media)
    // Title:   <div class="article-summary-title"><a href="...">
    function healthSciencesFamily(input) {
        var wrapper = input.closest('.article-summary');
        if (!wrapper) return null;
        var titleAnchor = wrapper.querySelector('.article-summary-title a');
        if (!titleAnchor) return null;
        return {
            wrapper:        wrapper,
            titleAnchor:    titleAnchor,
            titleContainer: titleAnchor.parentElement
        };
    },

    // pkp/immersion + pkp/pragma.
    // Wrapper: <article class="article"> (immersion) / <article class="row article"> (pragma)
    // Title:   <h4 class="article__title"><a href="...">
    function immersionPragmaFamily(input) {
        var wrapper = input.closest('article.article');
        if (!wrapper) return null;
        var titleAnchor = wrapper.querySelector('.article__title a');
        if (!titleAnchor) return null;
        return {
            wrapper:        wrapper,
            titleAnchor:    titleAnchor,
            titleContainer: titleAnchor.parentElement
        };
    }
];

function geoMetadata_resolveArticleAnchor(input) {
    if (!input) return null;
    for (var i = 0; i < geoMetadata_articleAnchorResolvers.length; i++) {
        var resolved = geoMetadata_articleAnchorResolvers[i](input);
        if (resolved) return resolved;
    }
    return null;
}
