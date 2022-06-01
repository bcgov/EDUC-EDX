/**
 * Tests to run against the school inbox page
 */
import { base_url } from '../../config/constants';
import { Role, Selector } from 'testcafe';
import { getToken } from "../../helpers/oauth-utils";
import { createSecureExchange } from "../../services/edx-api-service";
import { deleteSecureExchange } from "../../services/edx-api-service";
import { createTestExchange } from "../../helpers/secure-exchange-utils";

import log from "npmlog";
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
            testExchange = await createSecureExchange(token, JSON.stringify(testExchange));
            //testExchange.secureExchangeID = exchange.secureExchangeID;
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
    // select status
    await inbox.selectStatus('New');
    // search again
    await inbox.clickSearchButton();
});

/**test('clickNewMessage', async t => {
    await t.navigateTo(base_url + '/inbox');
    await inbox.clickNewMessageButton();
});**/