/**
 * Tests to run against the districts contact page
 */
import { base_url } from '../../config/constants';
import { Role, Selector } from 'testcafe';
import { getToken } from "../../helpers/oauth-utils";
let token = '';
import log from "npmlog";
import studentAdmin from "../../auth/Roles";
import Schools from "../../page_models/schools-page";
import DistrictContacts from "../../page_models/district/district-contacts-page";
import {DateTimeFormatter, LocalDate} from "@js-joda/core";

const {setUpEdxDistrictUserWithAllAvailableRoles,deleteSetUpEdxUser} =  require('../../helpers/user-set-up-utils');
const schools = new Schools();
const districtContacts = new DistrictContacts();
const {getSchoolPrincipalDetails} = require('../../helpers/school-set-up-utils');

fixture `school-contacts`
    .before(async t => {
        await setUpEdxDistrictUserWithAllAvailableRoles(['006'])
        getToken().then(async (data) => {
            token = data.access_token;
        }).catch((error => {
            log.error("Failure during test setup: " + error);
        }));
    })
    .after(async ctx => {
        // find all test automation artifacts produced and remove them
        log.info("Performing tear-down operation");
        await deleteSetUpEdxUser();
    })
    .beforeEach(async t => {
        // log in as studentAdmin
        await t.useRole(studentAdmin);
    }).afterEach(async t => {
    // logout
    await t.useRole(Role.anonymous());
});

test('testPage', async t => {
    // navigate to /schools, expect title
    await t.navigateTo(base_url + '/schools');
    await schools.clickSchoolContactsButton();
    await t.expect(districtContacts.navTitle.innerText).contains('School Contacts');

    //Verify the Principal and data is loaded
    let schoolPrincipalContact = await getSchoolPrincipalDetails('03005');
    console.log(schoolPrincipalContact);
    await t.expect(districtContacts.superContactHeader.innerText).contains('Principal');
    let principalDisplayName = schoolPrincipalContact.firstName + ' '+ schoolPrincipalContact.lastName;
    await t.expect(Selector('strong').withText(principalDisplayName).innerText).contains(principalDisplayName);
    let principalEffectiveDate = new LocalDate.parse(schoolPrincipalContact.effectiveDate, DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss')).toString();
    principalEffectiveDate = ' '+ principalEffectiveDate.replace(/-/g, '/');
    await t.expect(Selector('span').withText(principalEffectiveDate).innerText).contains(principalEffectiveDate);
});
