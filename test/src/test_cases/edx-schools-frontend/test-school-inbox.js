/**
 * Tests to run against the school inbox page
 */
import { base_url, test_exchange_object } from '../../config/constants';
import { Role, Selector } from 'testcafe';
import { getToken } from "../../helpers/oauth-utils";
import { createSecureExchange } from "../../services/edx-api-service";
import { deleteSecureExchange } from "../../services/edx-api-service";

import log from "npmlog";
import SecureExchange from "../../model/SecureExchange";
import SecureExchangeComment from "../../model/SecureExchangeComment";
import Inbox from "../../page_models/inbox";

const studentAdmin = require('../../auth/Roles');
const testExchangeSubject = 'Created by test automation';
const inbox = new Inbox();
let token = '';
let testExchange = createTestExchange();

fixture `school-inbox`
    .before(async t => {
        // data provisioning
       getToken().then(async (data) => {
            token = data.access_token;
            const exchange = await createSecureExchange(token, JSON.stringify(testExchange));
            testExchange.secureExchangeID = exchange.secureExchangeID;
        }).catch((error => {
            log.error("Failure during test setup: " + error);
        }));
    })
    .after(async ctx => {
        await deleteSecureExchange(token, testExchange.secureExchangeID);
        log.info("Performing tear-down operation");
    })
    .beforeEach(async t => {
        // log in as studentAdmin
        await t.useRole(studentAdmin);
        await t.maximizeWindow();
    }).afterEach(async t => {
        // logout
        await t.useRole(Role.anonymous());
    });

/**
 * login
 */
test('testPage', async t => {
    // navigate to /inbox, expect title
    await t.navigateTo(base_url + '/inbox')
          .expect(inbox.navTitle.innerText).contains('Inbox');
    // click filtersToggle
    await inbox.clickFiltersToggle();
    // type in a subject
    await inbox.inputSubject(testExchangeSubject);
    // search
    await inbox.clickSearchButton();
    // check that our exchange is found by subject heading
    await t.expect(Selector('h3.subjectHeading').textContent).contains(testExchangeSubject);
});

/**test('clickNewMessage', async t => {
    await t.navigateTo(base_url + '/inbox');
    await inbox.clickNewMessageButton();
});**/




/**
 * ****************
 * Helper methods *
 * ****************
 */

function createTestExchange() {
    const USERNAME = 'AUTOTEST';
    let secureExchange = new SecureExchange();
    let comment = new SecureExchangeComment();
    secureExchange.contactIdentifier = test_exchange_object.contactIdentifier;
    secureExchange.ministryOwnershipTeamID = test_exchange_object.ministryOwnershipTeamID;
    secureExchange.secureExchangeContactTypeCode = 'SCHOOL'
    secureExchange.createUser = USERNAME;
    secureExchange.updateUser = USERNAME;
    secureExchange.secureExchangeStatusCode = 'NEW';
    secureExchange.reviewer = 'CDITCHER';
    secureExchange.subject = testExchangeSubject;
    secureExchange.isReadByMinistry = 'false';
    secureExchange.isReadByExchangeContact = 'false';
    comment.commentUserName = USERNAME;
    comment.content = 'This was created using an automation test';
    comment.createUser = USERNAME;
    comment.updateUser = USERNAME;
    secureExchange.addComment(comment);
    return secureExchange;
}