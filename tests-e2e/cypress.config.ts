import {InstituteSetupUtils} from "./cypress/helpers/institute-set-up-utils";
import {CollectionSetupUtils} from "./cypress/helpers/collection-set-up-utils";
import {EdxApiService} from "./cypress/services/edx-api-service";
import {UserSetupUtils} from "./cypress/helpers/user-set-up-utils";
import {defineConfig} from "cypress";
import { InstituteOptions, SchoolOptions } from "./cypress/services/institute-api-service";

export type AppSetupData = {school: SchoolEntity, district: DistrictEntity};
const loadAppSetupData = (
  config: Cypress.PluginConfigOptions,
  options?: InstituteOptions
): Promise<AppSetupData> => {
  return new Promise(async (resolve, reject) => {
    let response = await new InstituteSetupUtils(config).setupInstituteEntities(options || {
      districtOptions: {
        includeDistrictAddress: true
      },
      schoolOptions: {
        includeTombstoneValues: false,
        includeSchoolAddress: true,
        includeSchoolContact: false,
        schoolStatus: 'Open'
      }
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
        'dataLoad': async (options: InstituteOptions) => {
          return await loadAppSetupData(config, options);
        },
        'recreate-school': async (schoolOptions: SchoolOptions)=> {
          await new InstituteSetupUtils(config).recreateSchool(schoolOptions);
          return null;
        },
        'cleanup-secure-exchange': async (subject: string) => {
          await new EdxApiService(config).deleteAllSecureExchangeBySubject(subject);
          return null;
        },
        'setup-collections': async (schoolId) => {
          await new CollectionSetupUtils(config).setUpSchoolCollection(schoolId);
          return null;
        },
        'setup-schoolUser': async (schoolUserOptions: SchoolUserOptions) => {
          return await new UserSetupUtils(config).setupSchoolUser(schoolUserOptions);
        },
        'setup-districtUser': async (districtUserOptions: DistrictUserOptions) => {
          return await new UserSetupUtils(config).setupDistrictUser(districtUserOptions);
        },
        'setup-userActivation': async (schoolNumber) => {
          await new EdxApiService(config).setUpDataForUserActivation({}, 'SCHOOL', schoolNumber);
          return null;
        },
        'teardown-edxUser': async (edxUserId: string) => {
          await new EdxApiService(config).deleteEdxUser(edxUserId);
          return null;
        }
      })
    },
  }
})
