const { defineConfig } = require("cypress");
const { dotenv } = require("dotenv").config({
  path: 'cypress/.env'
});

console.log(process.env);

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: "http://localhost:" + process.env.OJS_PORT,
  },
  env: {
    DBTYPE: process.env.OJS_DB_DRIVER,
    DBNAME: process.env.OJS_DB_NAME,
    DBUSERNAME: process.env.OJS_DB_USER,
    DBPASSWORD: process.env.OJS_DB_PASSWORD,
    DBHOST: process.env.OJS_DB_HOST,
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
