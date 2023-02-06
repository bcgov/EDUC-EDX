import generator from "generate-password";

const restUtils = require("../helpers/rest-utils");
const constants = require("../config/constants");
import faker from "faker";
import { ClientFunction } from "testcafe";
import { credentials } from "../config/constants";
import { getToken } from "../helpers/oauth-utils";
import { createEdxActivationCode } from "../helpers/user-activation-utils";

import LoginPage from "../page_models/login-page";
import UserActivation from "../page_models/user-activation";
import { getSchoolIDBySchoolCode, getDistrictIdByDistrictNumber } from "./institute-api-service";
import HttpStatus from "http-status-codes";
const loginPage = new LoginPage();
const userActivationPage = new UserActivation();

const log = require("npmlog");
const EXCHANGE_ENDPOINT = `${constants.edx_api_base_url}api/v1/edx/exchange`;
const EXCHANGE_ENDPOINT_PAGINATED = `${EXCHANGE_ENDPOINT}/paginated`;

async function getPrimaryActivationCodeForInstitute(token, instituteTypeCode, instituteID) {
  try {
    const endpoint =
      "api/v1/edx/users/activation-code/primary/" +
      instituteTypeCode.toString().toUpperCase() +
      "/" +
      instituteID;
    const url = `${constants.edx_api_base_url}${endpoint}`;
    return await restUtils.getData(token, url);
  } catch (e) {
    if (e?.response?.status === 404) {
      const generateEndpoint =
        "api/v1/edx/users/activation-code/primary/" +
        instituteTypeCode.toString().toUpperCase() +
        "/" +
        instituteID;
      const edxActivationCode = createEdxActivationCode(
        "true",
        "",
        "",
        instituteTypeCode,
        instituteID
      );
      const url = `${constants.edx_api_base_url}${generateEndpoint}`;
      return restUtils.postData(token, url, edxActivationCode);
    }
  }
}

async function createEdxActivationCodes(token, personalCode, instituteTypeCode, instituteID) {
  const endpoint = "api/v1/edx/users/activation-code";
  const url = `${constants.edx_api_base_url}${endpoint}`;
  const roles = await getAllEdxUserRoleForInstitute(token, instituteTypeCode);
  const edxActivationPersonalCode = createEdxActivationCode(
    "false",
    roles,
    personalCode,
    instituteTypeCode,
    instituteID
  );
  const edxActivationPrimaryCode = await getPrimaryActivationCodeForInstitute(
    token,
    instituteTypeCode,
    instituteID
  );
  const res1 = await restUtils.postData(token, url, edxActivationPersonalCode);
  return [res1, edxActivationPrimaryCode];
}

// Exported functions

export async function getAllEdxUserRoleForInstitute(token, instituteTypeCode) {
  const endpoint = "api/v1/edx/users/roles?instituteType=" + instituteTypeCode;
  const url = `${constants.edx_api_base_url}${endpoint}`;
  return restUtils.getData(token, url);
}

export async function findAllPaginated(token, params) {
  return restUtils.getData(token, EXCHANGE_ENDPOINT_PAGINATED, params);
}

/**
 * @param token
 * @param secureExchange
 * @returns {Promise<*>}
 */
export async function createSecureExchange(token, secureExchange) {
  return restUtils.postData(token, EXCHANGE_ENDPOINT, secureExchange, "");
}

export async function deleteSecureExchange(token, secureExchangeID) {
  const url = EXCHANGE_ENDPOINT + "/" + secureExchangeID;
  return restUtils.deleteData(token, url, "");
}

/**
 * Retrieves ministry teams from the following endpoint:
 * /api/v1/edx/users/ministry-teams
 * @param token
 * @returns {Promise<*>}
 */
export async function getAllMinistryTeams(token) {
  const endpoint = "api/v1/edx/users/ministry-teams";
  const url = `${constants.edx_api_base_url}${endpoint}`;
  return restUtils.getData(token, url, "");
}

/**
 * Retrieves all the Roles from API:
 */
export async function createUserActivationUrl(token, personalCode, instituteTypeCode, instituteID) {
  const endpoint = "/api/edx/activate-user-verification?validationCode=";
  const activationCodes = await createEdxActivationCodes(
    token,
    personalCode,
    instituteTypeCode,
    instituteID
  );
  const activationUrl = `${constants.base_url}${endpoint}${activationCodes[0].validationCode}`;
  return [activationUrl, activationCodes[0], activationCodes[1]];
}

export async function deleteActivationCode(token, activationCodeId) {
  const endpoint = "api/v1/edx/users/activation-code";
  const url = `${constants.edx_api_base_url}${endpoint}/${activationCodeId}`;
  await restUtils.deleteData(token, url);
}

export async function deleteEdxUser(token, firstName, lastName) {
  const edxUser = await getEdxUserFromFirstNameLastName(token, firstName, lastName);
  const endpoint = "api/v1/edx/users";
  const url = `${constants.edx_api_base_url}${endpoint}/${edxUser?.edxUserID}`;
  await restUtils.deleteData(token, url);
}

export async function generateCode() {
  return generator.generate({
    length: faker.datatype.number({ min: 7, max: 7 }),
    numbers: true,
    uppercase: true,
  });
}

export async function login(t) {
  await t.navigateTo(t.fixtureCtx.activationUrl[0]);
  log.info(t.fixtureCtx.activationUrl[0]);
  log.info("EDX Login page loaded successfully!");
  // log in, assert return to baseurl
  const getLocation = ClientFunction(() => document.location.href);
  await t
    .typeText(loginPage.userNameInput(), credentials.activateUserCredentials.username, {
      timeout: 20000,
    })
    .typeText(loginPage.passwordInput(), credentials.activateUserCredentials.password, {
      timeout: 20000,
    })
    .click(loginPage.submitCredentialsButton());
  log.info("User could login successfully!");
  return getLocation;
}

export async function createFixtureSetupForEdxUserActivation(
  ctx,
  personalCode,
  instituteTypeCode,
  instituteID
) {
  try {
    const data = await getToken();
    ctx.activationUrl = await createUserActivationUrl(
      data.access_token,
      personalCode,
      instituteTypeCode,
      instituteID
    );
    ctx.acCode1 = ctx.activationUrl[1].edxActivationCodeId;
    ctx.acCode2 = ctx.activationUrl[2].edxActivationCodeId;
    ctx.primaryCode = ctx.activationUrl[2].activationCode;
    ctx.personalCode = personalCode;
  } catch (e) {
    console.error(e);
  }
}

export async function submitDetailsOnUserActivationForm(
  t,
  mincode,
  primaryActivationCode,
  personalActivationCode
) {
  await t
    .typeText(userActivationPage.mincodeInput(), mincode, { timeout: 20000 })
    .typeText(userActivationPage.primaryActivationCodeInput(), primaryActivationCode, {
      timeout: 20000,
    })
    .typeText(userActivationPage.personalActivationCodeInput(), personalActivationCode, {
      timeout: 20000,
    })
    .click(userActivationPage.submitUserActivationButton());
}

export async function setUpDataForUserActivation(ctx, instituteTypeCode, instituteIdentifier) {
  const code = await generateCode();
  let instituteID = "";
  if (instituteTypeCode.toString().toUpperCase() === "SCHOOL") {
    instituteID = await getSchoolIDBySchoolCode(instituteIdentifier);
  } else {
    instituteID = await getDistrictIdByDistrictNumber(instituteIdentifier);
  }
  await createFixtureSetupForEdxUserActivation(
    ctx,
    code,
    instituteTypeCode,
    instituteID
  );
}

export async function getEdxUserFromFirstNameLastName(token, firstName, lastName) {
  const endpoint = "api/v1/edx/users";
  const url = `${constants.edx_api_base_url}${endpoint}`;

  const searchParams = {
    params: {
      firstName,
      lastName,
    },
  };
  const responseBody = await restUtils.getData(token, url, searchParams);

  return responseBody[0];
}

export async function verifyInstituteActivationCodes(districtID, schoolID) {
  const data = await getToken();
  const token = data.access_token;
  const endpoint = "api/v1/edx/users";
  const schoolActivationCodeUrl =
    `${constants.edx_api_base_url}${endpoint}/activation-code/primary/SCHOOL/${schoolID}`;

  try {
    await restUtils.getData(token, schoolActivationCodeUrl);
    log.info("school Activation code found");
  } catch (e) {
    if (e.response.status === HttpStatus.NOT_FOUND) {
      //generate school activation code if it doesn't exist
      const schoolActivationCodePayload = {
        createUser: "EDXAT",
        updateUser: "EDXAT",
        createDate: null,
        updateDate: null,
        districtID: null,
        schoolID: schoolID,
      };
      await restUtils.postData(token, schoolActivationCodeUrl, schoolActivationCodePayload, "");
      log.info("district Activation code created");
    }
  }

  const districtActivationCodeUrl =
    `${constants.edx_api_base_url}${endpoint}/activation-code/primary/DISTRICT/${districtID}`;

  try {
    await restUtils.getData(token, districtActivationCodeUrl);
    console.log("district Activation code found");
  } catch (e) {
    if (e.response.status === HttpStatus.NOT_FOUND) {
      //generate school activation code if it doesn't exist
      const districtActivationCodePayload = {
        createUser: "EDXAT",
        updateUser: "EDXAT",
        createDate: null,
        updateDate: null,
        districtID: districtID,
        schoolID: null,
      };
      await restUtils.postData(token, districtActivationCodeUrl, districtActivationCodePayload, "");
      log.info("district Activation code created");
    }
  }
}
