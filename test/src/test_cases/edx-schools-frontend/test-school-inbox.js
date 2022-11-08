/**
 * Tests to run against the school inbox page
 */
import { base_url,credentials } from '../../config/constants';
import { Role, Selector } from 'testcafe';
import { getToken } from "../../helpers/oauth-utils";
import {createSecureExchange} from '../../services/edx-api-service';
import { deleteSecureExchange } from "../../services/edx-api-service";
import { findAllPaginated } from "../../services/edx-api-service";
import { createTestExchange } from "../../helpers/secure-exchange-utils";
const {setUpEdxSchoolUserWithAllAvailableRoles,deleteSetUpEdxUser} =  require('../../helpers/user-set-up-utils');

import log from "npmlog";
import Inbox from "../../page_models/inbox";
import HamburgerMenuPage from "../../page_models/common/hamburgerMenuPage";
import LoginPage from '../../page_models/login-page';

const testExchangeSubject = 'Created by test automation';
const inbox = new Inbox();
const hamburgerMenu = new HamburgerMenuPage();
const loginPage = new LoginPage();
let token = '';
let testExchange = createTestExchange();

fixture `school-inbox`
    .before(async t => {
        await setUpEdxSchoolUserWithAllAvailableRoles(['99178'])
       getToken().then(async (data) => {
            token = data.access_token;
            // make sure there are no artifact messages from previous runs 
            await deleteMessagesBySubject(testExchangeSubject);
            // data provisioning
            // add a message via api
            testExchange = await createSecureExchange(token, JSON.stringify(testExchange));
        }).catch((error => {
            log.error("Failure during test setup: " + error);
        }));
    })
    .after(async ctx => {
        // find all test automation artifacts produced and remove them
        log.info("Performing tear-down operation");
        await deleteMessagesBySubject(testExchangeSubject);
        await deleteSetUpEdxUser();
    })
    .beforeEach(async t => {
        // log in as studentAdmin
        await t.resizeWindow(1920, 1080);
    }).afterEach(async t => {
        // logout
    await t.navigateTo(base_url + '/logout');
    });

test('testPage', async t => {
    // navigate to /inbox, expect title
    await t.navigateTo(base_url);
    await loginPage.login(credentials.adminCredentials);
    await t.navigateTo(base_url + '/inbox')
           .expect(inbox.navTitle.innerText).contains('Secure Messaging Inbox');
    // click filtersToggle
    await inbox.clickFiltersToggle();
    // type in a subject
    await inbox.inputSubject(testExchangeSubject);
    // check name
    await inbox.selectContactName('PEN Team');
    // select status
    await inbox.selectStatus('Open');
    // search
    await inbox.clickSearchButton();
    // check that our exchange is found by subject heading
    await confirmMessage(t);
    // select the date
    await inbox.selectMessageDate();
    // search again
    await inbox.clickSearchButton();
    // check that our exchange is found by subject heading
    await confirmMessage(t);
    // check message id
    await inbox.inputMessageId(testExchange.sequenceNumber);
    // search again
    await inbox.clickSearchButton();
    // check that our exchange is found by subject heading
    await confirmMessage(t);
    // create a new message
    await inbox.createANewMessage(testExchangeSubject);
    await inbox.clickNewMessagePostButton();
    // make sure there are now two messages
    let messageResponse = await findMessagesBySubject(testExchangeSubject);
    await t.expect(messageResponse.content.length).eql(2, 'Message created');
    log.info("Message created.");
});

test('test-navigation-to-school-inbox', async t => {
    await t.navigateTo(base_url);
    await loginPage.login(credentials.adminCredentials);
    await t.navigateTo(base_url);
    hamburgerMenu.clickHamburgerMenu();
    hamburgerMenu.verifySecureMessagingInboxMenuButtonIsAvailable();
    hamburgerMenu.clickSecureMessagingInboxMenuButton();
    await t.expect(inbox.navTitle.innerText).contains('Secure Messaging Inbox');
});

async function confirmMessage(t) {
    await t.expect(Selector('span.subjectHeading').textContent).contains(testExchangeSubject);
}

/**
 * Returns a response object containing any
 * messages by subject
 * @param subject
 * @returns {Promise<*>}
 */
async function findMessagesBySubject(subject){
    let params = {
        params: {
            searchCriteriaList: '[{"key": "subject", "value": "' + subject + '", "operation": "like_ignore_case", "valueType": "STRING"}]'
        }
    }
    let response = await findAllPaginated(token, params);
    return response;
}

/**
 * Given a subject, will delete messages from the api
 * which contain that subject
 * @param subject
 * @returns {Promise<void>}
 */
async function deleteMessagesBySubject(subject){
    let response = await findMessagesBySubject(subject);
    if(response != null) {
        for (let i = 0; i < response.content.length; i++) {
            await deleteSecureExchange(token, response.content[i].secureExchangeID);
            log.info("Removing message by subject: " + subject);
        }
    }
}
