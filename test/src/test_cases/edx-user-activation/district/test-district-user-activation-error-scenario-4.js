import UserActivation from '../../../page_models/user-activation';

import log from 'npmlog';
const {getToken} = require('../../../helpers/oauth-utils');

import {
  deleteActivationCode,
  generateCode,
  setUpDataForUserActivation,
  submitDetailsOnUserActivationForm,
  login
} from '../../../services/edx-api-service';

const userActivationPage = new UserActivation();



fixture`edx-user-activate-error-scenario-incorrect-activation-details-input-five-times-submit-click`
  .before(async ctx => {
    await setUpDataForUserActivation(ctx,'DISTRICT','006');
  })
  .after(async ctx => {
    const data = await getToken();
    await deleteActivationCode(data.access_token, ctx.acCode1);
  }).beforeEach(async t => {
  // log in as studentAdmin
  await t.resizeWindow(1920, 1080);
});

test('when_url_visited_incorrect_activation_details_input_submit_clicked_five_times_error_is_shown_to_user', async t => {
  await login(t);
  const randomCode= await generateCode();
  await t.expect(userActivationPage.submitUserActivationButton().hasAttribute('disabled')).ok();
  await submitDetailsOnUserActivationForm(t, '006', randomCode, randomCode);
  await t.click(userActivationPage.submitUserActivationButton());
  await t.wait(500);
  await t.click(userActivationPage.submitUserActivationButton());
  await t.wait(500);
  await t.click(userActivationPage.submitUserActivationButton());
  await t.wait(500);
  await t.click(userActivationPage.submitUserActivationButton());
  await t.wait(500);
  await t.click(userActivationPage.submitUserActivationButton());
  await t.wait(500);
  const text = await userActivationPage.activationSnackBar().innerText;
  await t.expect(text).contains('You have exceeded the number of activation attempts allowed. Please contact your administrator for a new activation code.');
  await t.wait(500);
  await t.expect(userActivationPage.mincodeInput().hasAttribute('disabled')).ok();
  await t.expect(userActivationPage.personalActivationCodeInput().hasAttribute('disabled')).ok();
  await t.expect(userActivationPage.primaryActivationCodeInput().hasAttribute('disabled')).ok();
  await t.expect(userActivationPage.submitUserActivationButton().hasAttribute('disabled')).ok();
});


