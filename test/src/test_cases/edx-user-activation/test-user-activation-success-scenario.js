import {Selector} from 'testcafe';
import {base_url} from '../../config/constants';
const log = require('npmlog');
const {getToken} = require('../../helpers/oauth-utils');
const {deleteActivationCode, generateCode,createFixtureSetupForEdxUserActivation,submitDetailsOnUserActivationForm,login, deleteEdxUser} = require('../../services/edx-api-service');

fixture`edx-user-activate-success-scenario`
  .beforeEach(t => t.maximizeWindow())
  .before(async ctx => {
    const codes= await generateCode();
    await createFixtureSetupForEdxUserActivation(ctx,codes[0],codes[1]);
  })
  .after(async ctx => {
    const data = await getToken();
    await deleteEdxUser(data.access_token, 'UserActivationFirstName', 'UserActivationLastName');
    await deleteActivationCode(data.access_token, ctx.acCode1);
    await deleteActivationCode(data.access_token, ctx.acCode2);

  });


test('when_url_visited_user_redirected_to_login_page_and_db_updated', async t => {
  const getLocation = await login(t);
  await submitDetailsOnUserActivationForm(t, '00899178', t.fixtureCtx.primaryCode, t.fixtureCtx.personalCode);
  await t.wait(5000)
  const text = await Selector('#mainSnackBar').innerText;
  await t.expect(text).contains('User Activation Completed Successfully. You will be redirected to your Dashboard Shortly!');
  await t.wait(5000)
    .expect(getLocation()).contains(base_url);
  log.info('User could activate account successfully');
});
