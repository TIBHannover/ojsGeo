/**
 * @file cypress.config.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 */

const { defineConfig } = require("cypress");
const { dotenv } = require("dotenv").config({
  path: 'cypress/.env'
});
const fs = require("fs");

console.log(process.env);

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
        readdir({ path }) {
          return fs.readdirSync(path, { withFileTypes: true })
            .filter((item) => item.isDirectory())
            .map((item) => item.name);
        }
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
    "contextTitles": {
      "en_US": "Journal of Geolocations",
    },
    "contextDescriptions": {
      "en_US": "The Journal of Geolocations is a very spatial journal.",
    },
    "contextAcronyms": {
      "en_US": "JGL"
    },
    "defaultGenre": "Article Text",
    "contextPath": "geolocation",
  },
});
