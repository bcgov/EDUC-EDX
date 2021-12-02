import { Selector, t } from 'testcafe'

class MailsacPage {

    constructor() {

        this.username = Selector('input[placeholder=username]')
        this.password = Selector('input[placeholder=password]')
        this.submitButton = Selector('button.btn.btn-primary')
        this.myInboxTextBox = Selector('input[placeholder=anything]')
        this.checkTheEmailButton = Selector('button.btn.btn-primary.btn-block')
        this.expectEmail = Selector('tr').withText('activate')
        this.clickActivateLink = Selector('a').withText('https://pen')
        this.deleteMailButton = Selector('button.btn.btn-primary.btn-xs')
        this.permanentlyDeleteButton = Selector('button').withText('Permanently delete')

    }


    async setUsername(data) {
        await t.typeText(this.username, data)
    }

    async setPassword(data) {
        await t.typeText(this.password, data)
    }

    async clickSubmitButton() {
        await t.click(this.submitButton)
    }

    async setMyInboxTextBox(data) {
        await t.typeText(this.myInboxTextBox, data)
    }

    async clickCheckTheEmailButton() {
        await t.click(this.checkTheEmailButton)
    }

    async mailsacLogin(credentials){
        await t.typeText(this.username, credentials.username)
        await t.typeText(this.password, credentials.password)
        await t.click(this.submitButton)
    }


    async activatePenRequest() {
        for (let i = 0; i < 2; i++) {
            try {
                (await t.expect((this.expectEmail).innerText).contains('activate'))
                console.log("Element found, breaking the loop")
                break;
            }
            catch (err) {
                await t.wait(10000)
                await t.eval(() => location.reload(true));
            }
        }
        await t.click(this.expectEmail)
        const link = this.clickActivateLink.innerText;
        console.log(await link);
        await t.click(this.deleteMailButton)
        await t.wait(3000)
        await t.click(this.permanentlyDeleteButton)
        await t.navigateTo(await link)
        await t.wait(3000)
    }


}

export default MailsacPage