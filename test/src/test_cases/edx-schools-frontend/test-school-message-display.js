import { Role } from 'testcafe';
import { getToken } from "../../helpers/oauth-utils";
import { createSecureExchange, deleteSecureExchange } from "../../services/edx-api-service";
import { createTestExchange } from "../../helpers/secure-exchange-utils";
import log from "npmlog";
import {base_url} from "../../config/constants";
import MessageDisplay from "../../page_models/message-display";

const studentAdmin = require("../../auth/Roles");

let messageDisplay = new MessageDisplay();
let token = '';
let testExchange = createTestExchange();

fixture`school-message-display`
    .before(async t => {
        // data provisioning
        getToken().then(async (data) => {
            token = data.access_token;
            testExchange = await createSecureExchange(token, JSON.stringify(testExchange));
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

test('test-school-message-display', async t => {
    //Verify header information.
    await t.navigateTo(base_url + '/exchange/' + testExchange.secureExchangeID);
    await t.expect(messageDisplay.navTitle.innerText).contains('View Message');
    await t.expect(messageDisplay.subjectHeading.innerText).eql(testExchange.subject);
    await t.expect((await messageDisplay.ministryOwnershipTeamName.innerText).length > 0).ok();
    await t.expect((await messageDisplay.createDate.innerText).length > 0).ok();
    await t.expect((await messageDisplay.secureExchangeStatusCode.innerText).toLowerCase()).eql(testExchange.secureExchangeStatusCode.toLowerCase());
    await t.expect(messageDisplay.sequenceNumber.innerText).eql(testExchange.sequenceNumber);

    //Verify action buttons
    await t.expect(((testExchange.secureExchangeStatusCode === 'COMPLETE') && (messageDisplay.editOptionsMenu.exists))).notOk();
    await t.expect(((testExchange.secureExchangeStatusCode !== 'COMPLETE') && (messageDisplay.editOptionsMenu.exists))).ok();
    //The mark as button text reflects the read state to which the secure exchange will be set.
    //IE: the button reading Unread signifies that the secure exchange will be marked as unread when the button is clicked.
    await t.expect(messageDisplay.markAsSpan.innerText).eql('Unread');
    testExchange.isReadByExchangeContact = true;
    await t.click(messageDisplay.markAsButton).expect(messageDisplay.markAsSpan.innerText).eql('Read');
    await t.click(messageDisplay.markAsButton);
    await t.expect(messageDisplay.markAsSpan.innerText).eql('Unread');

    //Verify action timeline
    if (testExchange.commentsList.length > 0) {
        await t.expect(messageDisplay.lastActivity.exists).ok();
        await t.expect((await messageDisplay.activityTitle.innerText).length > 0).ok();
        await t.expect((await messageDisplay.activityDisplayDate.innerText).length > 0).ok();
        await t.expect(await messageDisplay.activityContent.innerText).eql(testExchange.commentsList[testExchange.commentsList.length - 1].content);
    }
});