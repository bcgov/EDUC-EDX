/**
 * Tests to run against the school inbox page
 */
import { base_url } from '../../config/constants';
import { Role, Selector } from 'testcafe';
import { getToken } from "../../helpers/oauth-utils";
import { createSecureExchange } from "../../services/edx-api-service";
import { deleteSecureExchange } from "../../services/edx-api-service";
import { findAllPaginated } from "../../services/edx-api-service";
import { createTestExchange } from "../../helpers/secure-exchange-utils";

import log from "npmlog";
import Inbox from "../../page_models/inbox";
import {isEmpty, omitBy} from "lodash";

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
        //await deleteSecureExchange(token, testExchange.secureExchangeID);
        // find all test automation artifacts produced and remove them
        log.info("Performing tear-down operation");
        // let params = {
        //         params: {
        //             searchCriteriaList: '[{"key": "subject", "value": "' + testExchangeSubject + '", "operation": "like_ignore_case", "valueType": "STRING"}]'
        //     }
        // }
        let response = await findMessagesBySubject(testExchangeSubject);
        //log.info("RESPONSE: " + JSON.stringify(response, null, 4));
        if(response != null){
            for(let i = 0; i<response.content.length; i++){
                await deleteSecureExchange(token, response.content[i].secureExchangeID);
                log.info("Removing message by subject: " + testExchangeSubject);
            }
        } else {
            log.error("Teardown could not retrieve any produced messages!");
        }
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
    await t.navigateTo(base_url + 'inbox')
           .expect(inbox.navTitle.innerText).contains('Inbox');
    // click filtersToggle
    await inbox.clickFiltersToggle();
    // type in a subject
    await inbox.inputSubject(testExchangeSubject);
    // check name
    await inbox.selectContactName('PEN Team');
    // select status
    await inbox.selectStatus('New');
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
    await inbox.clickNewMessageButton();
    // create new message
    await inbox.inputSubjectTextField(testExchangeSubject);
    await inbox.inputNewMessage('This is a super awesome message.');
    await inbox.inputSchoolNameTextField('PEN Team');
    await inbox.clickNewMessagePostButton();
    // make sure there are now two messages
    let messageResponse = await findMessagesBySubject(testExchangeSubject);
    await t.expect(messageResponse.content.length).eql(2, 'Message created');
});

async function confirmMessage(t) {
    await t.expect(Selector('h3.subjectHeading').textContent).contains(testExchangeSubject);
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

/**test('clickNewMessage', async t => {
    await t.navigateTo(base_url + '/inbox');
    await inbox.clickNewMessageButton();
});**/