import { base_url } from '../../config/constants';
import { screen } from '@testing-library/testcafe';

const log = require('npmlog');
const { getToken } = require('../../helpers/oauth-utils');
import { getAllMinistryTeams } from '../../services/edx-api-service';

fixture `edx-login`
    .page(base_url)
    .before(tkn => {
        getToken().then(async (data) => {
        const getMinistryTeams = await getAllMinistryTeams(data.access_token);
        log.info("Setup complete");
    }).catch((error => {
        log.error(error);
        throw new Error("Setup failed");
    }))})
    .after(async ctx => {
        log.info("Performing tear-down operation");
    });

/**
 * Test concept for:
 * 1. Getting token from keycloak
 * 2. Simulate data loading directly to API (GET request in this case)
 * 3. Loading a page from the front-end
 */
test('get_Token_Load_From_API_Then_Hit_Main_Page', async t => {
    // hit the login screen and see if it loads
    await t.click(screen.getByText('Welcome to the Education Data Exchange!'));
    log.info("EDX Login page loaded successfully!");
    });
