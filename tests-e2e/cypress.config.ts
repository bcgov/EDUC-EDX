import {InstituteSetupUtils} from "./cypress/helpers/institute-set-up-utils";
import {CollectionSetupUtils} from "./cypress/helpers/collection-set-up-utils";
import {EdxApiService} from "./cypress/services/edx-api-service";
import {UserSetupUtils} from "./cypress/helpers/user-set-up-utils";
import {defineConfig} from "cypress";

export type AppSetupData = {school: SchoolEntity, district: DistrictEntity};
const loadAppSetupData = (config: Cypress.PluginConfigOptions): Promise<AppSetupData> => {
  return new Promise(async (resolve, reject) => {
    let response = await new InstituteSetupUtils(config).setupInstituteEntities({
      includeTombstoneValues: false,
      includeSchoolAddress: true,
      includeSchoolContact: false,
      includeDistrictAddress: true
    });
    if (response){
      resolve(response)
    } else {
      reject();
    }
  })
}

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
        'dataLoad': async () => {
          let appLoad = await loadAppSetupData(config);
          return appLoad;
        },
        'setup-collections': async (schoolId) => {
          await new CollectionSetupUtils(config).setUpSchoolCollection(schoolId);
          return null;
        },
        'setup-schoolUser': async (schoolCodes) => {
          await new UserSetupUtils(config).setupSchoolUser(schoolCodes);
          return null;
        },
        'setup-userActivation': async (schoolNumber) => {
          await new EdxApiService(config).setUpDataForUserActivation({}, 'SCHOOL', schoolNumber);
          return null;
        }
      })
    },
  }
})
