/**
 * Tests to run against the school inbox page
 */
import { base_url } from '../../config/constants';
import { getToken } from "../../helpers/oauth-utils";
import { createSecureExchange } from "../../services/edx-api-service";
import { deleteSecureExchange } from "../../services/edx-api-service";

import log from "npmlog";
import SecureExchange from "../../model/SecureExchange";
import SecureExchangeComment from "../../model/SecureExchangeComment";
import Inbox from "../../page_models/inbox";

const studentAdmin = require('../../auth/Roles');
const inbox = new Inbox();
let token = '';
let testExchange = createTestExchange();

fixture `school-inbox`
    .page(base_url + '/inbox')
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
        await t.useRole(studentAdmin);
    });

/**
 * login
 */
test('login', async t => {
    await t.expect(inbox.navTitle.innerText).contains('Inbox');
});

/**
 * navigate to inbox
 * test('click-view-inbox', async t => {
    log.info("Going to inbox.");
});
 */


/**
 * view 'Active Only'
 * test('view-active-only', async t => {
    log.info("Viewing Active Only.");
});
 */


/**
 * view 'All'
 * test('view-all', async t => {
    log.info("Viewing All.");
});
 */


/**
 * toggle filters
 * test('toggle-filters', async t => {
    log.info("toggling filters.");
});
 */


/**
 * filter by subject
 * test('filter-by-subject', async t => {
    log.info("filtering by subject.");
});
 */


/**
 * filter by message date
 * test('filter-by-date', async t => {
    log.info("filtering messages by date.");
});
 */


/**
 * filter by status
 * test('filter-by-status', async t => {
    log.info("filtering by status.");
});
 */


/**
 * mixed filtering
 * test('mixed-filtering', async t => {
    log.info("testing mixed filtering.");
});
 */


/**
 * clear filters
 * test('clear-filters', async t => {
    log.info("clearing filters.");
});
 */


/**
 * ****************
 * Helper methods *
 * ****************
 */

function createTestExchange() {
    const USERNAME = 'AUTOTEST';
    let secureExchange = new SecureExchange();
    let comment = new SecureExchangeComment();
    secureExchange.contactIdentifier = '00899178';
    secureExchange.ministryOwnershipTeamID = '62b226c9-76a3-4e4a-8463-5d5ebe605cdb';
    secureExchange.secureExchangeContactTypeCode = 'SCHOOL'
    secureExchange.createUser = USERNAME;
    secureExchange.updateUser = USERNAME;
    secureExchange.secureExchangeStatusCode = 'NEW';
    secureExchange.reviewer = 'CDITCHER';
    secureExchange.subject = 'Created by test automation';
    secureExchange.isReadByMinistry = 'N';
    secureExchange.isReadByExchangeContact = 'N';
    comment.commentUserName = USERNAME;
    comment.content = 'This was created using an automation test';
    comment.createUser = USERNAME;
    comment.updateUser = USERNAME;
    secureExchange.addComment(comment);
    return secureExchange;
}