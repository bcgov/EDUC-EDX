import { base_url, student_penList, credentials } from '../../config/constants';
import { getToken } from '../../helpers/oauth-utils';

import log from 'npmlog';
import Inbox from '../../page_models/inbox';
import InstituteSelectionPage from '../../page_models/institute-selection-page';
import DocumentUploadPage  from '../../page_models/common/documentUploadPage';
import MessageDisplay from '../../page_models/message-display';
import AddStudent from '../../page_models/common/addStudent';
import LoginPage from '../../page_models/login-page';

const {
  setUpEdxSchoolUserWithAllAvailableRoles,
  deleteSetUpEdxUser
} =  require('../../helpers/user-set-up-utils');

const testExchangeSubject = 'Created by test automation';
const inbox = new Inbox();
const addStudent = new AddStudent();
const documentUpload = new DocumentUploadPage();
const messageDisplay = new MessageDisplay();
const loginPage = new LoginPage();
const instituteSelectionPage = new InstituteSelectionPage();
const schoolTitle = 'Camosun College';

fixture `school-inbox-new-message`
  .before(async () => {
    await setUpEdxSchoolUserWithAllAvailableRoles(['99998'])
    getToken().then(async (data) => {
      const token = data.access_token;
      await inbox.deleteMessagesBySubject(testExchangeSubject, token);
    }).catch((error => {
      log.error('Failure during test setup: ' + error);
    }));
  })
  .after(async () => {
    log.info('phase:', 'Tear-down');
    const data = await getToken();
    await inbox.deleteMessagesBySubject(testExchangeSubject, data.access_token);
    await deleteSetUpEdxUser();

  })
  .beforeEach(async t => {
    await loginPage.login(credentials.adminCredentials);
    await t.resizeWindow(1920, 1080)
  })
  .afterEach(async t => {
    await t.navigateTo(base_url + '/logout');
  });

test('test-send-new-message-with-students', async t => {
  if (await instituteSelectionPage.isInstituteSelectionPage()) {
    await instituteSelectionPage.clickItemFromSchoolDashboardBasedOnTitle(schoolTitle);
  }

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
  await addStudent.assertAlertMessageAtAddStudent(
    'Additional students should only be added if the details are relevant to this request.' +
    ' Requests for separate students should be sent in a new message.'
  );
  await addStudent.testValidPENInput(penArr[1]);
  await addStudent.clickAddStudentButton();
  await inbox.studentAddedToNewMessageWithPen(penArr[1]);

  await inbox.clickOnAddStudentButtonInNewMessage();
  await addStudent.assertAlertMessageAtAddStudent(
    'Additional students should only be added if the details are relevant to this request. ' +
    'Requests for separate students should be sent in a new message.'
  );
  await addStudent.testNonExistingPENInput(penArr[2]);
  await addStudent.clickCancelAddStudentButton();

  await inbox.clickNewMessagePostButton();
  log.info('Message created.');
});

test('test-send-new-message-with-attachment', async t => {
  if (await instituteSelectionPage.isInstituteSelectionPage()) {
    await instituteSelectionPage.clickItemFromSchoolDashboardBasedOnTitle(schoolTitle);
  }

  await t.navigateTo(base_url + '/inbox');

  await inbox.createANewMessage(testExchangeSubject);
  await inbox.clickAttachFileButton();

  await documentUpload.clickDocumentTypeSelect();
  await documentUpload.selectDocumentTypeByName('Canadian Citizenship Card')
  await documentUpload.uploadDocument('../../uploads/BC.jpg');
  await documentUpload.clickUploadButton();
  await inbox.clickNewMessagePostButton();

  await inbox.clickFiltersToggle();
  await inbox.inputSubject('Created by test automation');
  await inbox.selectContactName('PEN Team');
  await inbox.selectStatus('Open');
  await inbox.clickSearchButton();
  await inbox.clickNthTableRow(0);

  await messageDisplay.verifyTimelineAttachmentByText('BC.jpg');
});




