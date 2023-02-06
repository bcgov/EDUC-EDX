import Dashboard from '../../../page_models/dashboard';
const log = require('npmlog');
const {getToken} = require('../../../helpers/oauth-utils');

import {
  deleteActivationCode,
  setUpDataForUserActivation,
  submitDetailsOnUserActivationForm,
  login,
  deleteEdxUser
} from '../../../services/edx-api-service';

const dashboard = new Dashboard();

fixture`edx-user-activate-success-scenario`
  .before(async ctx => {
    await setUpDataForUserActivation(ctx,'DISTRICT','998');
  })
  .after(async ctx => {
    const data = await getToken();
    await deleteEdxUser(data.access_token, 'TESTAUTOMATIONUSERFIRSTNAME', 'TESTAUTOMATIONUSERLASTNAME');
    await deleteActivationCode(data.access_token, ctx.acCode1);

  }).beforeEach(async t => {
  await t.resizeWindow(1920, 1080);
});


test('when_url_visited_user_redirected_to_login_page_and_db_updated', async t => {
  await login(t);
  await submitDetailsOnUserActivationForm(t, '998', t.fixtureCtx.primaryCode, t.fixtureCtx.personalCode);
  await t.expect(dashboard.districtContactsCard.exists).ok({timeout: 60000});
  log.info('User could activate account successfully');
});
