import {Role, Selector} from 'testcafe';
import {getToken} from '../../helpers/oauth-utils';
import {createSecureExchange, deleteSecureExchange} from '../../services/edx-api-service';
import {createTestExchange} from '../../helpers/secure-exchange-utils';
import log from 'npmlog';
import {base_url} from '../../config/constants';
import MessageDisplay from '../../page_models/message-display';
import Dashboard from '../../page_models/dashboard';
import Inbox from '../../page_models/inbox';
import DocumentUploadPage from '../../page_models/common/documentUploadPage';

const studentAdmin = require('../../auth/Roles');

const dashboard = new Dashboard();
const inbox = new Inbox();
const documentUpload = new DocumentUploadPage();

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
      log.error('Failure during test setup: ' + error);
    }));
  })
  .after(async ctx => {
    await deleteSecureExchange(token, testExchange.secureExchangeID);
    log.info('Performing tear-down operation');
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
  log.info('verifying header information');
  await t.navigateTo(base_url + '/exchange/' + testExchange.secureExchangeID);
  await t.expect(messageDisplay.navTitle.innerText).contains('Secure Message');
  await t.expect(messageDisplay.subjectHeading.innerText).eql(testExchange.subject);
  await t.expect((await messageDisplay.ministryOwnershipTeamName.innerText).length > 0).ok();
  await t.expect((await messageDisplay.createDate.innerText).length > 0).ok();
  await t.expect((await messageDisplay.secureExchangeStatusCode.innerText).toLowerCase()).eql(testExchange.secureExchangeStatusCode.toLowerCase());
  await t.expect(messageDisplay.sequenceNumber.innerText).eql(testExchange.sequenceNumber);

  //Verify action timeline
  if (testExchange.commentsList.length > 0) {
    log.info('verifying edx message timeline');
    await t.expect(messageDisplay.lastActivity.exists).ok();
    await t.expect((await messageDisplay.activityTitle.innerText).length > 0).ok();
    await t.expect((await messageDisplay.activityDisplayDate.innerText).length > 0).ok();
    await t.expect(await messageDisplay.activityContent.innerText).eql(testExchange.commentsList[testExchange.commentsList.length - 1].content);
  }

  //Verify action buttons
  log.info('verifying message display buttons');
  await t.expect(((testExchange.secureExchangeStatusCode === 'COMPLETE') && (messageDisplay.editOptionsMenu.exists))).notOk();
  await t.expect(((testExchange.secureExchangeStatusCode !== 'COMPLETE') && (messageDisplay.editOptionsMenu.exists))).ok();
  await t.expect(messageDisplay.markAsSpan.innerText).eql('Mark As Unread');
  await t.click(messageDisplay.markAsButton);
  //once we mark message as unread, we should go back to the inbox page.
  await t.expect(messageDisplay.navTitle.innerText).contains('Secure Messaging Inbox');
});

test('test-school-message-display-new-message', async t => {
  //Verify header information.
  log.info('verifying header information');
  await t.navigateTo(base_url + '/exchange/' + testExchange.secureExchangeID);
  await t.expect(messageDisplay.navTitle.innerText).contains('Secure Message');
  await t.click(messageDisplay.editOptionsMenuButton);
  await t.click(messageDisplay.newMessageButton);
  await t.click(messageDisplay.newMessageTextArea).typeText(messageDisplay.newMessageTextArea(), 'Message To Test', {timeout: 20000});
  await t.click(messageDisplay.sendMessageButton);
  await t.expect(Selector('#mainSnackBar').innerText).contains('Success! The message has been sent.');

});

test('test-attach-document-to-existing-message', async t => {
  await t.navigateTo(base_url);
  await dashboard.clickSchoolInboxCard();

  //find the message
  await inbox.clickFiltersToggle();
  await inbox.inputSubject('Created by test automation');
  await inbox.selectContactName('PEN Team');
  await inbox.selectStatus('Open');
  await inbox.clickSearchButton();
  await inbox.clickNthTableRow(0);

  //message detail
  await messageDisplay.clickEditOptionsMenuButton();
  await messageDisplay.clickAddAttachmentMenuButton();

  //add attachment
  await documentUpload.clickDocumentTypeSelect();
  await documentUpload.selectDocumentTypeByName('Canadian Citizenship Card')
  await documentUpload.uploadDocument('../../uploads/BC.jpg');
  await documentUpload.clickUploadButton();

  //verify message detail
  await messageDisplay.verifyTimelineAttachmentByText('BC.jpg');
});