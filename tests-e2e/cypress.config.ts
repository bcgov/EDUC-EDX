import {setupInstituteEntities, setUpSchoolCollection} from "./cypress/helpers/institute-set-up-utils";
const { defineConfig } = require('cypress');

export default defineConfig({
  chromeWebSecurity: false,
  fixturesFolder: 'cypress/fixtures',
  screenshotsFolder: 'cypress/screenshots',
  videosFolder: 'cypress/videos',
  video: false,
  screenshotOnRunFailure: false,
  e2e: {
    baseUrl: 'https://dev.educationdataexchange.gov.bc.ca',
    setupNodeEvents(on, config) {
      on('task', {
        'defaults:db': async() => {
          let response = await setupInstituteEntities(config, true, true, true);
          await setUpSchoolCollection(response.school.schoolId, config);
          return null;
        },
      })
    },
  }
})