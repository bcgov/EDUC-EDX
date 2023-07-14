import dotenv from 'dotenv';
dotenv.config();

import { getDistrictIdByDistrictNumber, getSchoolByMincode } from './src/instituteUtils';
import { getPrimaryActivationCodeForInstitute } from './src/edxUtils';
import { UserRecord, createCSVReadStream, isUserRecord } from './src/csvParser';
import { makeMessage, sendMail } from './src/mailUtils';

async function onboardUser(record: UserRecord, instituteType: InstituteTypeCode) {
  const institute = instituteType === 'SCHOOL' ?
    await getSchoolByMincode(record.mincode) :
    await getDistrictIdByDistrictNumber(record.mincode);

  if (institute !== undefined) {
    const instituteId = instituteType === 'SCHOOL' ? (institute as SchoolEntity).schoolId : institute.districtId;
    const primaryCodeEntity = await getPrimaryActivationCodeForInstitute(instituteType, instituteId);

    const message = makeMessage(record, {
      displayName: institute.displayName,
      primaryCode: primaryCodeEntity.activationCode
    });

    const response = await sendMail({to: record.email, message});
    if (response.status === 201) {
      return true;
    }
    return false;
  } else {
    console.log(`Institute Entity could not be found for mincode: ${record.mincode}`)
    return false;
  }
}

async function main(instituteType: InstituteTypeCode) {
  const userRecordStream = createCSVReadStream('./user-records.csv');
  let totalUsers = 0;
  let usersOnboarded = 0;

  console.log(`::: Begin Onboarding for ${instituteType} Users:::`)
  for await (const record of userRecordStream) {
    totalUsers++;

    if (isUserRecord(record)) {
      const onboarded = await onboardUser(record, instituteType);
      if (onboarded) usersOnboarded++;
    } else {
      console.log(`Malformed data in CSV row: ${JSON.stringify(record)}`);
    }
  }
  console.log(`::: Users Onboarded: ${usersOnboarded}/${totalUsers}:::`);
}

if (process.env.ONBOARDING_INSTITUTE_TYPE) {
  main(process.env.ONBOARDING_INSTITUTE_TYPE);
}
