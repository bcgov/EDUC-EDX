/**
 * Tests to run against the school inbox page
 */
import {base_url, student_penList} from '../../config/constants';
import {Role} from 'testcafe';
import {getToken} from '../../helpers/oauth-utils';

import log from 'npmlog';
import Inbox from '../../page_models/inbox';
import Dashboard from "../../page_models/dashboard";
import DocumentUploadPage  from '../../page_models/common/documentUploadPage';
import MessageDisplay from '../../page_models/message-display';
import AddStudent from '../../page_models/common/addStudent';
const {setUpEdxSchoolUserWithAllAvailableRoles,deleteSetUpEdxUser} =  require('../../helpers/user-set-up-utils');

const studentAdmin = require('../../auth/Roles');
const testExchangeSubject = 'Created by test automation';
const inbox = new Inbox();
const dashboard = new Dashboard();
const addStudent = new AddStudent();
const documentUpload = new DocumentUploadPage();
const messageDisplay = new MessageDisplay();
let token = '';

fixture`school-inbox-new-message`
  .before(async async => {
    await setUpEdxSchoolUserWithAllAvailableRoles(['99178'])
    getToken().then(async (data) => {
      token = data.access_token;
      // make sure there are no artifact messages from previous runs
      await inbox.deleteMessagesBySubject(testExchangeSubject, token);
    }).catch((error => {
      log.error('Failure during test setup: ' + error);
    }));
  })
  .after(async ctx => {
    // find all test automation artifacts produced and remove them
    log.info('Performing tear-down operation');
    const data = await getToken();
    await inbox.deleteMessagesBySubject(testExchangeSubject, data.access_token);
    await deleteSetUpEdxUser();

  })
  .beforeEach(async t => {
    // log in as studentAdmin
    await t.useRole(studentAdmin);
    await t.maximizeWindow();
  }).afterEach(async t => {
  // logout
  await t.useRole(Role.anonymous());
});

test('test-send-new-message-with-students', async t => {
  // navigate to /inbox, expect title
  await t.navigateTo(base_url + '/inbox');
  await inbox.createANewMessage(testExchangeSubject);
  const penArr = student_penList;

  await inbox.clickOnAddStudentButtonInNewMessage();
  await addStudent.testInvalidPENInput('123456789');

  await addStudent.clearPenSearchText();

  await addStudent.testValidPENInput(penArr[0]);
  await addStudent.clickAddStudentButton();
  await inbox.studentAddedToNewMessageWithPen(penArr[0]);

  await inbox.clickOnAddStudentButtonInNewMessage();
  await addStudent.assertAlertMessageAtAddStudent('Additional students should only be added if the details are relevant to this request. Requests for separate students should be sent in a new message.');
  await addStudent.testValidPENInput(penArr[1]);
  await addStudent.clickAddStudentButton();
  await inbox.studentAddedToNewMessageWithPen(penArr[1]);

  await inbox.clickOnAddStudentButtonInNewMessage();
  await addStudent.assertAlertMessageAtAddStudent('Additional students should only be added if the details are relevant to this request. Requests for separate students should be sent in a new message.');
  await addStudent.testNonExistingPENInput(penArr[2]);
  await addStudent.clickCancelAddStudentButton();

  await inbox.clickNewMessagePostButton();
  log.info('Message created.');
});

test('test-send-new-message-with-attachment', async t => {
  await t.navigateTo(base_url);
  await t.navigateTo(base_url + '/inbox');

  await inbox.createANewMessage(testExchangeSubject);
  await inbox.clickAttachFileButton();

  //attach document
  await documentUpload.clickDocumentTypeSelect();
  await documentUpload.selectDocumentTypeByName('Canadian Citizenship Card')
  await documentUpload.uploadDocument('../../uploads/BC.jpg');
  await documentUpload.clickUploadButton();
  await inbox.clickNewMessagePostButton();

  //find the message
  await inbox.clickFiltersToggle();
  await inbox.inputSubject('Created by test automation');
  await inbox.selectContactName('PEN Team');
  await inbox.selectStatus('Open');
  await inbox.clickSearchButton();
  await inbox.clickNthTableRow(0);

  //verify message detail
  await messageDisplay.verifyTimelineAttachmentByText('BC.jpg');
});




