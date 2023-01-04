const log = require('npmlog');
const {getToken} = require('../../../helpers/oauth-utils');
const {deleteActivationCode,setUpDataForUserActivation,submitDetailsOnUserActivationForm,login, deleteEdxUser} = require('../../../services/edx-api-service');
import Dashboard from '../../../page_models/dashboard';

const dashboard = new Dashboard();

fixture`edx-user-activate-success-scenario`
  .before(async ctx => {
    await setUpDataForUserActivation(ctx,'SCHOOL','99998');
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
  await submitDetailsOnUserActivationForm(t, '99899998', t.fixtureCtx.primaryCode, t.fixtureCtx.personalCode);
  await t.expect(dashboard.schoolInboxCard.exists).ok({timeout: 60000});
  log.info('User could activate account successfully');
});
