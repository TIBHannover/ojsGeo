/**
 * @file cypress.config.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 */

const { defineConfig } = require("cypress");
const { dotenv } = require("dotenv").config({
  path: 'cypress/.env'
});
const fs = require("fs");

console.log(process.env);

// Inserts a published publication directly into the OJS database. Used by the
// second-journal spec (#99) to seed extra published submissions without paying
// the ~3 min per article cost of walking the editorial UI flow.
//
// Connects via env vars OJS_DB_HOST_FOR_CYPRESS / OJS_DB_PORT_FOR_CYPRESS so
// that the cypress runner (on the host) can reach the DB even when OJS_DB_HOST
// resolves to a docker-internal name. Falls back to OJS_DB_HOST / 3306.
async function dbInsertPublishedSubmission({
  contextPath,
  title,
  abstract,
  givenName,
  familyName,
  geoMetadata,
}) {
  const mysql = require('mysql2/promise');
  const conn = await mysql.createConnection({
    host: process.env.OJS_DB_HOST_FOR_CYPRESS || process.env.OJS_DB_HOST,
    port: parseInt(process.env.OJS_DB_PORT_FOR_CYPRESS || '3306', 10),
    user: process.env.OJS_DB_USER,
    password: process.env.OJS_DB_PASSWORD,
    database: process.env.OJS_DB_NAME,
  });

  try {
    const [[journal]] = await conn.query(
      'SELECT journal_id FROM journals WHERE path = ?',
      [contextPath]
    );
    if (!journal) throw new Error(`Journal not found for path "${contextPath}"`);
    const contextId = journal.journal_id;

    const [[section]] = await conn.query(
      'SELECT section_id FROM sections WHERE journal_id = ? ORDER BY section_id ASC LIMIT 1',
      [contextId]
    );
    if (!section) throw new Error(`No section for journal ${contextPath}`);

    const [[authorGroup]] = await conn.query(
      'SELECT user_group_id FROM user_groups WHERE context_id = ? AND role_id = 65536 ORDER BY user_group_id ASC LIMIT 1',
      [contextId]
    );
    if (!authorGroup) throw new Error(`No author user-group for journal ${contextPath}`);

    const [[issue]] = await conn.query(
      'SELECT issue_id FROM issues WHERE journal_id = ? AND published = 1 ORDER BY issue_id ASC LIMIT 1',
      [contextId]
    );
    if (!issue) throw new Error(`No published issue for journal ${contextPath}`);

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const today = now.slice(0, 10);

    const [submissionInsert] = await conn.query(
      `INSERT INTO submissions
        (context_id, date_last_activity, date_submitted, last_modified,
         stage_id, locale, status, submission_progress)
       VALUES (?, ?, ?, ?, 5, 'en_US', 3, 0)`,
      [contextId, now, now, now]
    );
    const submissionId = submissionInsert.insertId;

    const [publicationInsert] = await conn.query(
      `INSERT INTO publications
        (access_status, date_published, last_modified, locale,
         section_id, seq, submission_id, status, version)
       VALUES (1, ?, ?, 'en_US', ?, 0, ?, 3, 1)`,
      [today, now, section.section_id, submissionId]
    );
    const publicationId = publicationInsert.insertId;

    await conn.query(
      'UPDATE submissions SET current_publication_id = ? WHERE submission_id = ?',
      [publicationId, submissionId]
    );

    const settings = [
      [publicationId, 'en_US', 'title', title],
      [publicationId, 'en_US', 'abstract', abstract],
      [publicationId, '', 'issueId', String(issue.issue_id)],
    ];
    if (geoMetadata && geoMetadata.spatial) {
      settings.push([publicationId, '', 'geoMetadata::spatialProperties',
        typeof geoMetadata.spatial === 'string' ? geoMetadata.spatial : JSON.stringify(geoMetadata.spatial)]);
    }
    if (geoMetadata && geoMetadata.temporal) {
      settings.push([publicationId, '', 'geoMetadata::timePeriods', geoMetadata.temporal]);
    }
    if (geoMetadata && geoMetadata.adminUnit) {
      settings.push([publicationId, '', 'geoMetadata::administrativeUnit',
        typeof geoMetadata.adminUnit === 'string' ? geoMetadata.adminUnit : JSON.stringify(geoMetadata.adminUnit)]);
    }
    for (const row of settings) {
      await conn.query(
        'INSERT INTO publication_settings (publication_id, locale, setting_name, setting_value) VALUES (?, ?, ?, ?)',
        row
      );
    }

    const [authorInsert] = await conn.query(
      `INSERT INTO authors
        (email, include_in_browse, publication_id, seq, user_group_id)
       VALUES (?, 1, ?, 0, ?)`,
      [`${givenName.toLowerCase()}.${familyName.toLowerCase()}@example.org`, publicationId, authorGroup.user_group_id]
    );
    const authorId = authorInsert.insertId;

    await conn.query(
      'UPDATE publications SET primary_contact_id = ? WHERE publication_id = ?',
      [authorId, publicationId]
    );

    await conn.query(
      `INSERT INTO author_settings (author_id, locale, setting_name, setting_value) VALUES
        (?, 'en_US', 'givenName', ?),
        (?, 'en_US', 'familyName', ?)`,
      [authorId, givenName, authorId, familyName]
    );

    return { submissionId, publicationId, issueId: issue.issue_id };
  } finally {
    await conn.end();
  }
}

// Enroll an existing user into a role in another journal. The OJS UI for
// enrolling an existing user (vs. creating a new one) is a multi-step flow
// (Users tab → search → edit → tick role); DB is simpler and reliable.
async function dbEnrollUserInContext({ contextPath, username, roleId }) {
  const mysql = require('mysql2/promise');
  const conn = await mysql.createConnection({
    host: process.env.OJS_DB_HOST_FOR_CYPRESS || process.env.OJS_DB_HOST,
    port: parseInt(process.env.OJS_DB_PORT_FOR_CYPRESS || '3306', 10),
    user: process.env.OJS_DB_USER,
    password: process.env.OJS_DB_PASSWORD,
    database: process.env.OJS_DB_NAME,
  });
  try {
    const [[journal]] = await conn.query(
      'SELECT journal_id FROM journals WHERE path = ?',
      [contextPath]
    );
    if (!journal) throw new Error(`Journal not found for path "${contextPath}"`);

    const [[group]] = await conn.query(
      'SELECT user_group_id FROM user_groups WHERE context_id = ? AND role_id = ? ORDER BY user_group_id ASC LIMIT 1',
      [journal.journal_id, roleId]
    );
    if (!group) throw new Error(`No user_group with role_id=${roleId} in journal ${contextPath}`);

    const [[user]] = await conn.query(
      'SELECT user_id FROM users WHERE username = ?',
      [username]
    );
    if (!user) throw new Error(`User "${username}" not found`);

    await conn.query(
      'INSERT IGNORE INTO user_user_groups (user_group_id, user_id) VALUES (?, ?)',
      [group.user_group_id, user.user_id]
    );
    return { userId: user.user_id, userGroupId: group.user_group_id };
  } finally {
    await conn.end();
  }
}

// Delete every submission in a journal whose current-publication title
// matches one of the given titles. Used by the fixture specs (12-…, 12a-…)
// to keep re-runs against a non-fresh OJS stack idempotent — without this,
// each cypress run inserts another copy of every fixture and downstream
// specs that assume one-of-each title break (e.g. 66's single-article popup).
async function dbDeleteSubmissionsByTitle({ contextPath, titles }) {
  if (!Array.isArray(titles) || titles.length === 0) return { deleted: 0 };
  const mysql = require('mysql2/promise');
  const conn = await mysql.createConnection({
    host: process.env.OJS_DB_HOST_FOR_CYPRESS || process.env.OJS_DB_HOST,
    port: parseInt(process.env.OJS_DB_PORT_FOR_CYPRESS || '3306', 10),
    user: process.env.OJS_DB_USER,
    password: process.env.OJS_DB_PASSWORD,
    database: process.env.OJS_DB_NAME,
  });
  try {
    const [[journal]] = await conn.query(
      'SELECT journal_id FROM journals WHERE path = ?',
      [contextPath]
    );
    if (!journal) throw new Error(`Journal not found for path "${contextPath}"`);

    const placeholders = titles.map(() => '?').join(',');
    const [rows] = await conn.query(
      `SELECT DISTINCT s.submission_id
         FROM submissions s
         JOIN publications p ON p.submission_id = s.submission_id
         JOIN publication_settings ps ON ps.publication_id = p.publication_id
        WHERE s.context_id = ?
          AND ps.setting_name = 'title'
          AND ps.setting_value IN (${placeholders})`,
      [journal.journal_id, ...titles]
    );
    const submissionIds = rows.map((r) => r.submission_id);
    if (submissionIds.length === 0) return { deleted: 0 };

    const ids = submissionIds.map(() => '?').join(',');
    // OJS uses InnoDB but the FK graph from submissions is wide; delete the
    // rows we know about and rely on ON DELETE CASCADE for the rest.
    await conn.query(`DELETE FROM publication_settings WHERE publication_id IN (SELECT publication_id FROM publications WHERE submission_id IN (${ids}))`, submissionIds);
    await conn.query(`DELETE FROM authors WHERE publication_id IN (SELECT publication_id FROM publications WHERE submission_id IN (${ids}))`, submissionIds);
    await conn.query(`DELETE FROM publications WHERE submission_id IN (${ids})`, submissionIds);
    await conn.query(`DELETE FROM submissions WHERE submission_id IN (${ids})`, submissionIds);
    return { deleted: submissionIds.length, submissionIds };
  } finally {
    await conn.end();
  }
}

// Look up the first published issue id for a journal. Used by 64-multi-journal-
// isolation: issue ids are global, not per-journal, so the secondary's first
// issue is not id 1.
async function dbGetPublishedIssueId({ contextPath }) {
  const mysql = require('mysql2/promise');
  const conn = await mysql.createConnection({
    host: process.env.OJS_DB_HOST_FOR_CYPRESS || process.env.OJS_DB_HOST,
    port: parseInt(process.env.OJS_DB_PORT_FOR_CYPRESS || '3306', 10),
    user: process.env.OJS_DB_USER,
    password: process.env.OJS_DB_PASSWORD,
    database: process.env.OJS_DB_NAME,
  });
  try {
    const [[row]] = await conn.query(
      `SELECT i.issue_id FROM issues i
         JOIN journals j ON i.journal_id = j.journal_id
        WHERE j.path = ? AND i.published = 1
        ORDER BY i.issue_id ASC LIMIT 1`,
      [contextPath]
    );
    return row ? row.issue_id : null;
  } finally {
    await conn.end();
  }
}

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
        readdir({ path }) {
          return fs.readdirSync(path, { withFileTypes: true })
            .filter((item) => item.isDirectory())
            .map((item) => item.name);
        },
        dbInsertPublishedSubmission,
        dbEnrollUserInContext,
        dbGetPublishedIssueId,
        dbDeleteSubmissionsByTitle,
      });
    },
    baseUrl: "http://localhost:" + process.env.OJS_PORT,
  },
  env: {
    DBTYPE: process.env.OJS_DB_DRIVER,
    DBNAME: process.env.OJS_DB_NAME,
    DBUSERNAME: process.env.OJS_DB_USER,
    DBPASSWORD: process.env.OJS_DB_PASSWORD,
    DBHOST: process.env.OJS_DB_HOST,
    GEONAMES_USERNAME: process.env.GEONAMES_USERNAME,
    GEONAMES_BASEURL: process.env.GEONAMES_BASEURL,
    "defaultGenre": "Article Text",
    "contexts": {
      "primary": {
        "path": "geolocation",
        "titles": { "en_US": "Journal of Geolocations" },
        "descriptions": { "en_US": "The Journal of Geolocations is a very spatial journal." },
        "acronyms": { "en_US": "JGL" },
      },
      "secondary": {
        "path": "cartography",
        "titles": { "en_US": "Journal of Cartography" },
        "descriptions": { "en_US": "The Journal of Cartography is a very spatial journal too." },
        "acronyms": { "en_US": "JoC" },
      },
    },
  },
});
