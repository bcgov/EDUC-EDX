/**
 * Tests to run against the districts contact page
 */
import { base_url } from '../../config/constants';
import { Role, Selector } from 'testcafe';
import { getToken } from "../../helpers/oauth-utils";

import log from "npmlog";
import studentAdmin from "../../auth/Roles";
let token = '';
import DistrictContacts from "../../page_models/district/district-contacts-page";
import {DateTimeFormatter, LocalDate} from "@js-joda/core";

const {setUpEdxDistrictUserWithAllAvailableRoles,deleteSetUpEdxUser} =  require('../../helpers/user-set-up-utils');
const districtContacts = new DistrictContacts();
const {getDistrictSuperintendentDetails} = require('../../helpers/district-set-up-utils');

fixture `district-contacts`
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
        //await t.maximizeWindow();
    }).afterEach(async t => {
    // logout
    await t.useRole(Role.anonymous());
});

test('testPage', async t => {
    // navigate to /districtContacts, expect title
    await t.navigateTo(base_url + '/districtContacts')
        .expect(districtContacts.navTitle.innerText).contains('District Contacts');
    //Verify the Superintendent and all data is loaded
    let districtSuperContact = await getDistrictSuperintendentDetails('006');
    await t.expect(districtContacts.superContactHeader.innerText).contains('Superintendent');
    let superDisplayName = districtSuperContact.firstName + ' '+ districtSuperContact.lastName;
    await t.expect(Selector('strong').withText(superDisplayName).innerText).contains(superDisplayName);
    await t.expect(Selector('strong').withText(districtSuperContact.jobTitle).innerText).contains(districtSuperContact.jobTitle);
    await t.expect(Selector('span').withText(districtSuperContact.email).innerText).contains(districtSuperContact.email);
    let superPHNumber = districtSuperContact.phoneNumber.replace(/(\d)(\d)(\d)(\d)(\d)(\d)(\d)(\d)(\d)(\d)/, '$1$2$3-$4$5$6-$7$8$9$10');
    await t.expect(Selector('span').withText(superPHNumber).innerText).contains(superPHNumber);
    let superPhExtNumber = ' ext. ' + districtSuperContact.phoneExtension;
    await t.expect(Selector('span').withText(superPhExtNumber).innerText).contains(superPhExtNumber);
    let superEffectiveDate = new LocalDate.parse(districtSuperContact.effectiveDate, DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss')).toString();
    superEffectiveDate = ' '+ superEffectiveDate.replace(/-/g, '/');
    await t.expect(Selector('span').withText(superEffectiveDate).innerText).contains(superEffectiveDate);
});
