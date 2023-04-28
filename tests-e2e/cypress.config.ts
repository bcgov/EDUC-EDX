import {InstituteSetupUtils} from "./cypress/helpers/institute-set-up-utils";
import {CollectionSetupUtils} from "./cypress/helpers/collection-set-up-utils";

const { defineConfig } = require('cypress');

export default defineConfig({
  chromeWebSecurity: false,
  fixturesFolder: 'cypress/fixtures',
  screenshotsFolder: 'cypress/screenshots',
  videosFolder: 'cypress/videos',
  video: false,
  screenshotOnRunFailure: false,
  viewportHeight: 1080,
  viewportWidth: 1920,
  e2e: {
    baseUrl: 'https://dev.educationdataexchange.gov.bc.ca',
    setupNodeEvents(on, config) {
      on('task', {
        'defaults:db': async() => {
          const instituteSetupUtils = new InstituteSetupUtils(config);
          const collectionSetupUtils = new CollectionSetupUtils(config);
          let response = await instituteSetupUtils.setupInstituteEntities({includeTombstoneValues: false, includeSchoolAddress: true, includeSchoolContact: false, includeDistrictAddress: true});
          await collectionSetupUtils.setUpSchoolCollection(response.school.schoolId);
          return null;
        },
      })
    },
  }
})