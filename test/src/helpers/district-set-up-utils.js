const {getToken} = require('./oauth-utils');
const {getDistrictIdByDistrictNumber} = require('../services/institute-api-service');

const constants = require('../config/constants');
const restUtils = require('./rest-utils');
import {DateTimeFormatter, LocalDate} from '@js-joda/core';

const districtSetUpUtils = {

    async getDistrictDetails(districtNumber){

        const data = await getToken();
        const token = data.access_token;
        let districtID = await getDistrictIdByDistrictNumber(districtNumber);
        const url = `${constants.institute_base_url}/api/v1/institute/district/${districtID}`;
        return await restUtils.getData(token, url);
    },
    async getDistrictSuperintendentDetails(districtNumber){
        let districtSuperintendent = '';
        let districtDetails = await districtSetUpUtils.getDistrictDetails(districtNumber);
        for (const disContact of districtDetails.contacts){
            if(disContact.districtContactTypeCode === 'SUPER'){
                let parsedExpiryDate = null;
                if (disContact.expiryDate) {
                    parsedExpiryDate = new LocalDate.parse(disContact.expiryDate, DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss'));
                }
                if (parsedExpiryDate === null) {
                    districtSuperintendent = disContact;
                }
            }
        }
        return districtSuperintendent;
    },
    async deleteDistrictContact(districtNumber){
        const data = await getToken();
        const token = data.access_token;
        let districtSuperintendent = '';
        let districtDetails = await districtSetUpUtils.getDistrictDetails(districtNumber);
        let districtID = districtDetails.districtId;

        districtSuperintendent = districtDetails.contacts.filter(contact => contact.districtContactTypeCode === 'SUPER'
            && contact.expiryDate === null && contact.firstName === 'Tony' && contact.lastName === 'Hawk');

        for (const i of districtSuperintendent) {
            let contactID = i.districtContactId;
            const url = `${constants.institute_base_url}/api/v1/institute/district/${districtID}/contact/${contactID}`;
            await restUtils.deleteData(token, url);
        }
    }

};

module.exports = districtSetUpUtils;