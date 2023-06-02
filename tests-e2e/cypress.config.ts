import {InstituteSetupOptions, InstituteSetupUtils} from "./cypress/helpers/institute-set-up-utils";
import {CollectionSetupUtils} from "./cypress/helpers/collection-set-up-utils";
import {EdxApiService} from "./cypress/services/edx-api-service";
import {UserSetupUtils} from "./cypress/helpers/user-set-up-utils";
import {defineConfig} from "cypress";

export type AppSetupData = {school: SchoolEntity, district: DistrictEntity};
const loadAppSetupData = (
  config: Cypress.PluginConfigOptions,
  options: InstituteSetupOptions = {}
): Promise<AppSetupData> => {
  return new Promise(async (resolve, reject) => {
    let response = await new InstituteSetupUtils(config).setupInstituteEntities(options);
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
        'dataLoad': async (options: InstituteSetupOptions) => {
          return await loadAppSetupData(config, options);
        },
        'cleanup-secure-exchange': async (subject: string) => {
          await new EdxApiService(config).deleteAllSecureExchangeBySubject(subject);
          return null;
        },
        'setup-collections': async (schoolId) => {
          await new CollectionSetupUtils(config).setUpSchoolCollection(schoolId);
          return null;
        },
        'setup-schoolUser': async (schoolCodes) => {
          await new UserSetupUtils(config).setupSchoolUser(schoolCodes);
          return null;
        },
        'setup-districtUser': async (districtUserOptions: DistrictUserOptions) => {
          await new UserSetupUtils(config).setupDistrictUser(districtUserOptions);
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
