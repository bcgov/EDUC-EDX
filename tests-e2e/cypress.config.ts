import {InstituteSetupUtils} from './cypress/helpers/institute-set-up-utils';
import {CollectionSetupUtils} from './cypress/helpers/collection-set-up-utils';
import {EdxApiService} from './cypress/services/edx-api-service';
import {UserSetupUtils} from './cypress/helpers/user-set-up-utils';
import {defineConfig} from 'cypress';
import { InstituteOptions, SchoolOptions } from './cypress/services/institute-api-service';
import { UserActivationUtils } from './cypress/helpers/user-activation-utils';
import { SchoolCollectionOptions } from './cypress/services/sdc-collection-api-service';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

export type AppSetupData = {school: SchoolEntity, district: DistrictEntity};
const loadAppSetupData = (
  config: Cypress.PluginConfigOptions,
  options?: InstituteOptions
): Promise<AppSetupData> => {
  return new Promise((resolve, reject) => {
    new InstituteSetupUtils(config).setupInstituteEntities(options || {
      districtOptions: {
        includeDistrictAddress: true,
        withPrimaryActivationCode: true
      },
      schoolOptions: {
        includeTombstoneValues: true,
        includeSchoolAddress: true,
        includeSchoolContact: true,
        schoolStatus: 'Open',
        withPrimaryActivationCode: true,
        isIndependentSchool: false
      }
    }).then(response => {
      if (response){
        resolve(response);
      } else {
        reject();
      }
    });
  });
};

export default defineConfig({
  chromeWebSecurity: false,
  fixturesFolder: 'cypress/fixtures',
  screenshotsFolder: 'cypress/screenshots',
  videosFolder: 'cypress/videos',
  video: false,
  screenshotOnRunFailure: false,
  viewportHeight: 1080,
  viewportWidth: 1920,
  defaultCommandTimeout: 10000,
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
        'setup-collections': async (schoolCollection: SchoolCollectionOptions) => {
          return new CollectionSetupUtils(config).setUpSchoolCollection(schoolCollection);
        },
        'setup-student-ells': async (ells: SdcStudentEll[]) => {
          return new CollectionSetupUtils(config).setUpStudentElls(ells);
        },
        'setup-schoolUser': async (schoolUserOptions: SchoolUserOptions) => {
          return new UserSetupUtils(config).setupSchoolUser(schoolUserOptions);
        },
        'setup-districtUser': async (districtUserOptions: DistrictUserOptions) => {
          return new UserSetupUtils(config).setupDistrictUser(districtUserOptions);
        },
        'setup-userActivation': async (userActivationOptions: UserActivationOptions) => {
          return new UserSetupUtils(config).setupEdxUser(userActivationOptions);
        },
        'teardown-edxUser': async (edxUserId: string) => {
          await new UserActivationUtils(config).deleteUserActivationCodes(edxUserId);
          await new EdxApiService(config).deleteEdxUser(edxUserId);
          return null;
        },
        'teardown-userActivationCode': async (activationCodeId: string) => {
          await new EdxApiService(config).deleteActivationCode(activationCodeId);
          return null;
        },
        'downloadFile': async ({ url, directory, cookies, fileName }) => {
          const cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');

          const response = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: {
              Cookie: cookieString,
            },
          });

          const dirPath = path.resolve(directory);
          if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
          }

          const filePath = path.join(dirPath, fileName);
          fs.writeFileSync(filePath, response.data);

          return `File downloaded successfully to ${filePath}`;
        }
      });
    },
  }
});
