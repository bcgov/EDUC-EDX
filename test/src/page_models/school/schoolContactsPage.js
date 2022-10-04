import { Selector, t } from 'testcafe';
import log from 'npmlog';
import {DateTimeFormatter, LocalDate} from "@js-joda/core";
import DistrictContacts from "../../page_models/district/district-contacts-page";

const {getSchoolPrincipalDetails} = require('../../helpers/school-set-up-utils');
const districtContacts = new DistrictContacts();

class SchoolContactsPage {
    constructor() {
        this.schoolContactsButton = Selector('#schoolContacts').nth(0);
    }

    async verifyPrincipalContact(schoolNumber){
        //Verify the Principal and data is loaded
        let schoolPrincipalContact = await getSchoolPrincipalDetails(schoolNumber);
        await t.expect(districtContacts.superContactHeader.innerText).contains('Principal');
        let principalDisplayName = schoolPrincipalContact.firstName + ' '+ schoolPrincipalContact.lastName;
        await t.expect(Selector('strong').withText(principalDisplayName).innerText).contains(principalDisplayName);
        let principalEffectiveDate = new LocalDate.parse(schoolPrincipalContact.effectiveDate, DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss')).toString();
        principalEffectiveDate = ' '+ principalEffectiveDate.replace(/-/g, '/');
        await t.expect(Selector('span').withText(principalEffectiveDate).innerText).contains(principalEffectiveDate);
        log.info('Principal contact information verified.');
    }

}

export default SchoolContactsPage;