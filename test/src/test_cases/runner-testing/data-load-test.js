/**
 * Testing data load and environment for self-hosted runner
 */
import { Role, ClientFunction } from 'testcafe';
import { getToken } from "../../helpers/oauth-utils";
import {createSecureExchange} from '../../services/edx-api-service';
import { deleteSecureExchange } from "../../services/edx-api-service";
import { findAllPaginated } from "../../services/edx-api-service";
import { createTestExchange } from "../../helpers/secure-exchange-utils";

import log from "npmlog";

const studentAdmin = require('../../auth/Roles');
const testExchangeSubject = 'Created by test automation';
let token = '';
let testExchange = createTestExchange();

fixture `data-load`
    .before(async t => {
       getToken().then(async (data) => {
            token = data.access_token;
            testExchange = await createSecureExchange(token, JSON.stringify(testExchange));
        }).catch((error => {
            log.error("Failure during test setup: " + error);
        }));
    })
    .after(async ctx => {
        log.info("Performing tear-down operation");
        await deleteMessagesBySubject(testExchangeSubject);
    })
    .beforeEach(async t => {
        // log in as studentAdmin
        await t.useRole(studentAdmin);
    }).afterEach(async t => {
        // logout
        await t.useRole(Role.anonymous());
    });

test('testPageLoad', async t => {
    const getLocation = ClientFunction(() => window.location.href);
    await t.expect(getLocation()).contains('about:blank');
});

test('testConfigMapEnv', async t => {
    //console.log('Development mode: ', process.env);
});

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

async function findMessagesBySubject(subject){
    let params = {
        params: {
            searchCriteriaList: '[{"key": "subject", "value": "' + subject + '", "operation": "like_ignore_case", "valueType": "STRING"}]'
        }
    }
    let response = await findAllPaginated(token, params);
    return response;
}
