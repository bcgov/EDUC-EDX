import StaffLoginPage from '../pageObjects/StaffLoginPage';
import PenRetrievalRequestPage from '../pageObjects/PenRetrievalRequestsPage'
import { IDIRcredentials, StaffLoginUrl } from '../helpers/constants';
import studentData from '../config/studentData.json';
import staffData from '../config/staffData.json'

const staffLoginPage = new StaffLoginPage()
const penRetrievalRequestPage = new PenRetrievalRequestPage()

fixture`Staff login`
    .page(StaffLoginUrl)
    .beforeEach(async t => {
        await t.maximizeWindow().setTestSpeed(1)
    })

test('Staff login', async t => {

    await staffLoginPage.stafflogin(t, IDIRcredentials)

    await penRetrievalRequestPage.setStatusSearchBar(staffData.Status)

    await penRetrievalRequestPage.setFirstNameSearchBar(studentData.legalFirstName)

    await penRetrievalRequestPage.setLastNameSearchBar(studentData.legalLastName)

    await penRetrievalRequestPage.clickStatusResultFirstElement()

    //await t.takeScreenshot();

});

