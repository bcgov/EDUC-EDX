import { Selector, ClientFunction, t } from 'testcafe';
import { base_url } from '../config/constants';

const log = require('npmlog');
/**
 * Represents the login page(s)
 */
class LoginPage {

    constructor() {
        this.loginButton = Selector('#login-button');
        this.userNameInput = Selector('#user');
        this.passwordInput = Selector('#password');
        this.submitCredentialsButton = Selector('input[name="btnSubmit"][value="Continue"]');
    }

    async login(credentials){
        try {
            // click login button
            await t.click(this.loginButton);
            // expect redirection to https://logontest7.gov.bc.ca/
            const getLocation = ClientFunction(() => document.location.href);
            await t.expect(getLocation()).contains('logontest7.gov.bc.ca');
            // log in, assert return to baseurl
            await t.typeText(this.userNameInput, credentials.username, { timeout: 20000 })
                .typeText(this.passwordInput, credentials.password, { timeout: 20000 })
                .click(this.submitCredentialsButton)
                .expect(getLocation()).contains(base_url);
            log.info("login successful");
        } catch (error) {
            log.error(error);
        }
    }

}
export default LoginPage;