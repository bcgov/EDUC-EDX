const { defineConfig } = require('cypress')

module.exports = defineConfig({
  chromeWebSecurity: false,
  fixturesFolder: 'cypress/fixtures',
  screenshotsFolder: 'cypress/screenshots',
  videosFolder: 'cypress/videos',
  video: true,
  screenshotOnRunFailure: false,
  e2e: {
    baseUrl: 'https://dev.educationdataexchange.gov.bc.ca',
  }
})