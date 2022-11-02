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
            await t.navigateTo(base_url + '/login');
            // click login button
            await t.click(this.loginButton);

            await t.typeText(this.userNameInput, credentials.username, { timeout: 20000 })
                .typeText(this.passwordInput, credentials.password, { timeout: 20000 })
                .click(this.submitCredentialsButton);
            log.info("login successful");
        } catch (error) {
            log.error(error);
        }
    }

}
export default LoginPage;
