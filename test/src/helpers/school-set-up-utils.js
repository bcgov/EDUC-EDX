const {getToken} = require('./oauth-utils');
const {getSchoolIDBySchoolCode} = require('../services/institute-api-service');

const constants = require('../config/constants');
const restUtils = require('./rest-utils');
import {DateTimeFormatter, LocalDateTime} from '@js-joda/core';

const schoolSetUpUtils = {

    async getSchoolDetails(schoolNumber){
        const data = await getToken();
        const token = data.access_token;
        let schoolID = await getSchoolIDBySchoolCode(schoolNumber);
        const url = `${constants.institute_base_url}/api/v1/institute/school/${schoolID}`;
        return await restUtils.getData(token, url);
    },
    async getSchoolPrincipalDetails(schoolNumber){
        let schoolDetails = await schoolSetUpUtils.getSchoolDetails(schoolNumber);
        const currentDate = LocalDateTime.now();
        return schoolDetails.contacts.filter(sc => {
            let parsedExpiryDate = sc.expiryDate ? new LocalDateTime.parse(sc.expiryDate, DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss')) : null;
            return sc.schoolContactTypeCode === 'PRINCIPAL' && (parsedExpiryDate === null || parsedExpiryDate < currentDate);
        });
    },
    async cleanUpSchoolContactRecord(schoolNumber, contactFirstName, contactLastName) {
        const data = await getToken();
        const token = data.access_token;
        let schoolDetails = await schoolSetUpUtils.getSchoolDetails(schoolNumber);
        let schoolContactsToCleanup = schoolDetails.contacts.filter(sc => {
           return sc.firstName === contactFirstName && sc.lastName === contactLastName;
        });
        for (let schoolContact of schoolContactsToCleanup) {
            await restUtils.deleteData(token, `${constants.institute_base_url}/api/v1/institute/school/${schoolDetails.schoolId}/contact/${schoolContact.schoolContactId}`);
        }
    }
};

module.exports = schoolSetUpUtils;