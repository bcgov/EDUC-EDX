import MailsacPage from '../pageObjects/MailsacPage'
import { MailsacUrl, MailsackCredentials } from '../helpers/constants'


const mailsacPage = new MailsacPage()


fixture`mailsac`
    .page(MailsacUrl)

test('mailsac login test', async t => {

    await t.setTestSpeed(0.5)

    await mailsacPage.mailsacLogin(MailsackCredentials)

    await mailsacPage.clickSubmitButton()

    await mailsacPage.setMyInboxTextBox(MailsackCredentials.username)

    await mailsacPage.clickCheckTheEmailButton()

    await mailsacPage.activatePenRequest()

});