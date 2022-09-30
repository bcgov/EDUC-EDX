const {getToken} = require('./oauth-utils');
const {getSchoolIDBySchoolCode} = require('../services/institute-api-service');

const constants = require('../config/constants');
const restUtils = require('./rest-utils');
import {DateTimeFormatter, LocalDate} from '@js-joda/core';

const schoolSetUpUtils = {

    async getSchoolDetails(schoolNumber){

        const data = await getToken();
        const token = data.access_token;
        let schoolID = await getSchoolIDBySchoolCode(schoolNumber);
        const url = `${constants.institute_base_url}/api/v1/institute/school/${schoolID}`;
        return await restUtils.getData(token, url);
    },
    async getSchoolPrincipalDetails(schoolNumber){
        let schoolPrincipal = '';
        let schoolDetails = await schoolSetUpUtils.getSchoolDetails(schoolNumber);
        for (const schoolContact of schoolDetails.contacts){
            if(schoolContact.schoolContactTypeCode === 'PRINCIPAL'){
                let parsedExpiryDate = null;
                if (schoolContact.expiryDate) {
                    parsedExpiryDate = new LocalDate.parse(schoolContact.expiryDate, DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss'));
                }
                if (parsedExpiryDate === null) {
                    schoolPrincipal = schoolContact;
                }
            }
        }
        return schoolPrincipal;
    }

};

module.exports = schoolSetUpUtils;