import {Selector} from 'testcafe';

const log = require('npmlog');
const {getToken} = require('../../../helpers/oauth-utils');
const {deleteActivationCode, setUpDataForUserActivation} = require('../../../services/edx-api-service');



fixture`edx-user-activate-error-scenario-activation-url-visited-twice`
  .beforeEach(t => t.maximizeWindow())
  .before(async ctx => {
    await setUpDataForUserActivation(ctx,'DISTRICT','006');
  })
  .after(async ctx => {
    const data = await getToken();
    await deleteActivationCode(data.access_token, ctx.acCode1);
  });

test('when_url_visited_twice_user_gets_error_link_expired', async t => {
  await t.navigateTo(t.fixtureCtx.activationUrl[0]);
  await t.navigateTo(t.fixtureCtx.activationUrl[0]);
  const errorText = await Selector('#user_activation_error_message').innerText;
  await t.expect(errorText).contains('Your activation link is expired; the activation link should only be usable one time. Please contact your administrator for a new activation code.');
  log.info('activation link expired on double click on activation url is verified');
});




