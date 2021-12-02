import { Selector, t } from 'testcafe'

class BceidLoginPage {


    constructor() {

        this.username = Selector('#user')
        this.password = Selector('#password')
        this.submitButton = Selector('input[name=\'btnSubmit\']')


    }

    async  bceidLogin(t, credentials) {
        await t
            //.click(Selector('#zocial-bceid'))  
            .expect(this.password.count).eql(1)
            .typeText(this.username, credentials.username)
            .typeText(this.password, credentials.password)
            .click(this.submitButton);
    }
}

export default BceidLoginPage