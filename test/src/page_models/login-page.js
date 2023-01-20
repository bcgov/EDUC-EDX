import { Selector, ClientFunction, t } from 'testcafe';
import { base_url } from '../config/constants';
import Dashboard from './dashboard';

const dashboard = new Dashboard;
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
        for (let i=1; i<10; i++) {
            try {
                await t.navigateTo(base_url + '/login');
                // click login button
                await t.click(this.loginButton);

                await t.typeText(this.userNameInput, credentials.username, { timeout: 20000 })
                .typeText(this.passwordInput, credentials.password, { timeout: 20000 })
                .click(this.submitCredentialsButton);
                await t.expect(dashboard.secureMessageInboxCard.exists).ok({timeout: 20000});
                log.info("login successful");
                break;
            } catch (error) {
                log.error(error.errMsg);
                log.info(`login failed ${i}/10 times.`);
            }
        }
    }

}
export default LoginPage;
