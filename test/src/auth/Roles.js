import { Role } from 'testcafe';
import { base_url, credentials } from '../config/constants';

const studentAdmin = Role(base_url + '/api/auth/login', async t => {
    await t
        .typeText('#user', credentials.adminCredentials.username)
        .typeText('#password', credentials.adminCredentials.password)
        .click('input[name="btnSubmit"][value="Continue"]');
});
module.exports = studentAdmin;