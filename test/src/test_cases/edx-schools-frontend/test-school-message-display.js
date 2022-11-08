import {Role, Selector} from 'testcafe';
import {getToken} from '../../helpers/oauth-utils';
import {createSecureExchange,  deleteSecureExchange} from '../../services/edx-api-service';
import {createTestExchange} from '../../helpers/secure-exchange-utils';
import log from 'npmlog';
import {base_url, student_penList,credentials} from '../../config/constants';
import MessageDisplay from '../../page_models/message-display';
import Dashboard from '../../page_models/dashboard';
import Inbox from '../../page_models/inbox';
import DocumentUploadPage from '../../page_models/common/documentUploadPage';
import AddStudent from '../../page_models/common/addStudent';
import LoginPage from '../../page_models/login-page';
const {setUpEdxSchoolUserWithAllAvailableRoles,deleteSetUpEdxUser} =  require('../../helpers/user-set-up-utils');

const studentAdmin = require('../../auth/Roles');

const dashboard = new Dashboard();
const inbox = new Inbox();
const documentUpload = new DocumentUploadPage();
const addStudent = new AddStudent();
const loginPage = new LoginPage();

let messageDisplay = new MessageDisplay();
let token = '';
let testExchange = createTestExchange();

fixture`school-message-display`
  .before(async t => {
    // data provisioning
    await setUpEdxSchoolUserWithAllAvailableRoles(['99178'])
    getToken().then(async (data) => {
      token = data.access_token;
      testExchange = await createSecureExchange(token, JSON.stringify(testExchange));
    }).catch((error => {
      log.error('Failure during test setup: ' + error);
    }));
  })
  .after(async ctx => {
    await deleteSecureExchange(token, testExchange.secureExchangeID);
    await deleteSetUpEdxUser();
    log.info('Performing tear-down operation');
  })
  .beforeEach(async t => {
    // log in as studentAdmin
    await t.resizeWindow(1920, 1080);
  }).afterEach(async t => {
  // logout
  await t.navigateTo(base_url + '/logout');
});

test('test-school-message-display', async t => {
  //Verify header information.
  log.info('verifying header information');
  await t.navigateTo(base_url);
  await loginPage.login(credentials.adminCredentials);
  await t.navigateTo(base_url + '/exchange/' + testExchange.secureExchangeID);
  await t.expect(messageDisplay.navTitle.innerText).contains('Secure Message');
  await messageDisplay.verifySubjectHeadingByText(testExchange.subject);
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
  await t.expect(messageDisplay.markAsSpan.innerText).eql('MARK AS UNREAD');
  await t.click(messageDisplay.markAsButton);
  //once we mark message as unread, we should go back to the inbox page.
  await t.expect(messageDisplay.navTitle.innerText).contains('Secure Messaging Inbox');
});

test('test-school-message-display-new-message', async t => {
  //Verify header information.
  log.info('verifying header information');
  await t.navigateTo(base_url);
  await loginPage.login(credentials.adminCredentials);
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
  await loginPage.login(credentials.adminCredentials);
  await testMessageDisplayHelper(t);
  await uploadDocument('Canadian Citizenship Card', '../../uploads/BC.jpg');
  //verify message detail
  await messageDisplay.verifyTimelineAttachmentByText('BC.jpg');
});

test('test-attach-jpg-document-to-existing-message-displays', async t => {
  await t.navigateTo(base_url);
  await loginPage.login(credentials.adminCredentials);
  await testMessageDisplayHelper(t);
  await uploadDocument('Canadian Citizenship Card', '../../uploads/BC.jpg');
  await messageDisplay.clickDocumentToDisplayByName('BC.jpg');
  await messageDisplay.verifyImageCanvasDisplay();
});

test('test-attach-pdf-document-to-existing-message-displays', async t => {
  await t.navigateTo(base_url);
  await loginPage.login(credentials.adminCredentials);
  await testMessageDisplayHelper(t);
  await uploadDocument('Canadian Passport', '../../uploads/BC.pdf');
  await messageDisplay.clickDocumentToDisplayByName('BC.pdf');
  await messageDisplay.verifyPDFCanvasDisplay();
});

test('test-school-message-display-add-student', async t => {
  await t.navigateTo(base_url);
  await loginPage.login(credentials.adminCredentials);
  await testMessageDisplayHelper(t);
  await messageDisplay.clickEditOptionsMenuButton();
  await messageDisplay.clickAddStudentMenuButton();
  await messageDisplay.verifyAddStudentDialogIsAvailable();

  await addStudent.testInvalidPENInput('123456789');

  await addStudent.clearPenSearchText();

  await addStudent.testValidPENInput(student_penList[0]);
  await addStudent.clickAddStudentButton();
  await messageDisplay.verifyStudentAddedToMessageWithPEN(student_penList[0]);

  await messageDisplay.clickEditOptionsMenuButton();
  await messageDisplay.clickAddStudentMenuButton();
  await messageDisplay.verifyAddStudentDialogIsAvailable();
  await addStudent.assertAlertMessageAtAddStudent('Additional students should only be added if the details are relevant to this request. Requests for separate students should be sent in a new message.');
  await addStudent.testValidPENInput(student_penList[1]);
  await addStudent.clickAddStudentButton();
  await messageDisplay.verifyStudentAddedToMessageWithPEN(student_penList[1]);

  await messageDisplay.clickEditOptionsMenuButton();
  await messageDisplay.clickAddStudentMenuButton();
  await messageDisplay.verifyAddStudentDialogIsAvailable();
  await addStudent.assertAlertMessageAtAddStudent('Additional students should only be added if the details are relevant to this request. Requests for separate students should be sent in a new message.');
  await addStudent.testNonExistingPENInput(student_penList[2]);
  await addStudent.clickCancelAddStudentButton();
});

/**
 * Helper method for opening test message
 * @returns {Promise<void>}
 */
async function testMessageDisplayHelper(t){
  await navigateToMessages(t);
  await findMessageAndOpen('Created by test automation', 'PEN Team', 'Open');
}

/**
 * Finds a message and opens it (if exists)
 * @param subject
 * @param contact
 * @param status
 * @returns {Promise<void>}
 */
async function findMessageAndOpen(subject, contact, status){
  await inbox.clickFiltersToggle();
  await inbox.inputSubject(subject);
  await inbox.selectContactName(contact);
  await inbox.selectStatus(status);
  await inbox.clickSearchButton();
  await inbox.clickNthTableRow(0);
}

/**
 * Navigates to message page from baseurl
 * @returns {Promise<void>}
 */
async function navigateToMessages(t){
  await t.navigateTo(base_url);
  await dashboard.clickSchoolInboxCard();
}

/**
 * Assumes you are in message display context
 * @param documentType Drivers Licence, etc
 * @param documentPath Path to upload file
 * @returns {Promise<void>}
 */
async function uploadDocument(documentType, documentPath) {
  //message detail
  await messageDisplay.clickEditOptionsMenuButton();
  await messageDisplay.clickAddAttachmentMenuButton();

  //add attachment
  await documentUpload.clickDocumentTypeSelect();
  await documentUpload.selectDocumentTypeByName(documentType)
  await documentUpload.uploadDocument(documentPath);
  await documentUpload.clickUploadButton();
}
