import { Role } from 'testcafe';
import { base_url, keycloakAdminCredentials } from './constants';

/**
 * For role based access, see: https://testcafe.io/documentation/402845/guides/advanced-guides/authentication
 */
const adminUser = Role(base_url + '/?login=noidir', async t => {
    await t
        .typeText('#username', keycloakAdminCredentials.username)
        .typeText('#password', keycloakAdminCredentials.password)
        .click('#kc-login');
});

module.exports.adminUser = adminUser;