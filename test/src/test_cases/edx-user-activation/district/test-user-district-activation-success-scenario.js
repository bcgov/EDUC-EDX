import {Selector} from 'testcafe';
import {base_url} from '../../../config/constants';
const log = require('npmlog');
const {getToken} = require('../../../helpers/oauth-utils');
const {deleteActivationCode,setUpDataForUserActivation,submitDetailsOnUserActivationForm,login, deleteEdxUser} = require('../../../services/edx-api-service');

fixture`edx-user-activate-success-scenario`
  .before(async ctx => {
    await setUpDataForUserActivation(ctx,'DISTRICT','006');
  })
  .after(async ctx => {
    const data = await getToken();
    await deleteEdxUser(data.access_token, 'TESTAUTOMATIONUSERFIRSTNAME', 'TESTAUTOMATIONUSERLASTNAME');
    await deleteActivationCode(data.access_token, ctx.acCode1);

  }).beforeEach(async t => {
  // log in as studentAdmin
  await t.resizeWindow(1920, 1080);
});


test('when_url_visited_user_redirected_to_login_page_and_db_updated', async t => {
  const getLocation = await login(t);
  await submitDetailsOnUserActivationForm(t, '006', t.fixtureCtx.primaryCode, t.fixtureCtx.personalCode);
  await t.wait(5000)
  const text = await Selector('#mainSnackBar').innerText;
  await t.expect(text).contains('User Activation Completed Successfully. Redirecting to your Dashboard...');
  await t.wait(5000)
    .expect(getLocation()).contains(base_url);
  log.info('User could activate account successfully');
});
