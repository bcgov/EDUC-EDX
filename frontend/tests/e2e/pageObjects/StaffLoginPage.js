import { Selector, t } from 'testcafe'

class StaffLoginPage {

    constructor() {

        this.login = Selector('#login-button')
        this.username = Selector('#user')
        this.password = Selector('#password')
        this.submitButton = Selector('input[name=\'btnSubmit\']')


    }


    async stafflogin(t, credentials) {

        await t.click(this.login)
            .typeText(this.username, credentials.username)
            .typeText(this.password, credentials.password)
            .click(this.submitButton);

    }
}

export default StaffLoginPage