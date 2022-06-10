import {Selector} from 'testcafe';
import UserActivation from '../../page_models/user-activation';

const log = require('npmlog');
const {getToken} = require('../../helpers/oauth-utils');
const {deleteActivationCode, generateCode,createFixtureSetupForEdxUserActivation,submitDetailsOnUserActivationForm,login} = require('../../services/edx-api-service');
const userActivationPage = new UserActivation();



fixture`edx-user-activate-error-scenario-activation-url-visited-twice`
  .beforeEach(t => t.maximizeWindow())
  .before(async ctx => {
    const codes= await generateCode();
    await createFixtureSetupForEdxUserActivation(ctx,codes[0],codes[1]);
  })
  .after(async ctx => {
    const data = await getToken();
    await deleteActivationCode(data.access_token, ctx.acCode1);
    await deleteActivationCode(data.access_token, ctx.acCode2);
  });

test('when_url_visited_twice_user_gets_error_link_expired', async t => {
  await t.navigateTo(t.fixtureCtx.activationUrl[0]);
  await t.navigateTo(t.fixtureCtx.activationUrl[0]);
  const errorText = await Selector('#user_activation_error_message').innerText;
  await t.expect(errorText).contains('Your activation link is expired; the activation link should only be usable one time. Please contact your administrator for a new activation code.');
  log.info('activation link expired on double click on activation url is verified');
});




