'use strict';
import { Selector} from 'testcafe';
import {getToken} from '../../helpers/oauth-utils';
import log from 'npmlog';
import {base_url, student_penList,credentials} from '../../config/constants';
import MessageDisplay from '../../page_models/message-display';
import Dashboard from '../../page_models/dashboard';
import Inbox from '../../page_models/inbox';
import DocumentUploadPage from '../../page_models/common/documentUploadPage';
import AddStudent from '../../page_models/common/addStudent';
import LoginPage from '../../page_models/login-page';
import NavBarPage from '../../page_models/common/navBarPage';
const {setUpEdxSchoolUserWithAllAvailableRoles,deleteSetUpEdxUser} =  require('../../helpers/user-set-up-utils');


const dashboard = new Dashboard();
const inbox = new Inbox();
const documentUpload = new DocumentUploadPage();
const addStudent = new AddStudent();
const loginPage = new LoginPage();
const navBar = new NavBarPage();
const messageDisplay = new MessageDisplay();

const testExchangeSubject = 'Created by test automation';

fixture`school-message-display`
  .before(async () => {
    // data provisioning
    try {
      await setUpEdxSchoolUserWithAllAvailableRoles(['99998']);
      let data = await getToken();
      await inbox.deleteMessagesBySubject(testExchangeSubject, data.access_token);
    }catch (e) {
      log.error('Failure during test setup: ' + e);
    }
  })
  .after(async () => {
    const data = await getToken();
    await inbox.deleteMessagesBySubject(testExchangeSubject, data.access_token)
    await deleteSetUpEdxUser();
    log.info('Performing tear-down operation');
  })
  .beforeEach(async t => {
    // log in as studentAdmin
    await loginPage.login(credentials.adminCredentials);
    await t.resizeWindow(1920, 1080);
  }).afterEach(async t => {
  // logout
  await t.navigateTo(base_url + '/logout');
});

test('test-school-message-create-new-message-upload-doc-student', async t => {
  await dashboard.clickSecureMessageInbox();

  //create new message
  await messageDisplay.clickNewMessageButton();
  await messageDisplay.selectToForNewMessage('PEN Team');
  await messageDisplay.enterNewMessageSubjectLine(testExchangeSubject);
  await messageDisplay.enterTextForNewMessage('Message To Test');
  await messageDisplay.clickNewMessageSend();

  //navigate to new message
  await inbox.clickFiltersToggle();
  await inbox.inputSubject(testExchangeSubject);
  await inbox.selectContactName('PEN Team');
  await inbox.selectStatus('Open');
  await inbox.clickSearchButton();
  await inbox.clickNthTableRow(0);
  await t.expect(Selector('#mainSnackBar').innerText).contains('Success! The message has been sent.');

  //upload documents
  await uploadDocument('Canadian Citizenship Card', '../../uploads/BC.jpg');
  await messageDisplay.verifyTimelineAttachmentByText('BC.jpg');
  await messageDisplay.clickDocumentToDisplayByName('BC.jpg');
  await messageDisplay.verifyImageCanvasDisplay();
  await messageDisplay.clickCloseCanvasDisplay();
  await uploadDocument('Canadian Passport', '../../uploads/BC.pdf');
  // await messageDisplay.clickDocumentToDisplayByName('BC.pdf'); //disabled since pdf viewer is not functional due to security issues. Waiting for upgrade to vue 3
  // await messageDisplay.verifyPDFCanvasDisplay();
  // await messageDisplay.clickCloseCanvasDisplay();

  //upload student
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

  //once we mark message as unread, we should go back to the inbox page.
  await messageDisplay.verifyMarkAsSpanText('MARK AS UNREAD');
  await messageDisplay.clickMarkAsButton();
  await navBar.verifyNavTitleByText('Secure Messaging Inbox');
});

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
