import UserActivation from '../../../page_models/user-activation';
import {base_url} from "../../../config/constants";

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
    await setUpDataForUserActivation(ctx,'SCHOOL','99998');
  })
  .after(async ctx => {
    const data = await getToken();
    await deleteActivationCode(data.access_token, ctx.acCode1);
  }).beforeEach(async t => {
  // log in as studentAdmin
  await login(t);
  await t.resizeWindow(1920, 1080);
}).afterEach(async t => {
  // logout
  await t.navigateTo(base_url + '/logout');
});

test('when_url_visited_incorrect_activation_details_input_submit_clicked_five_times_error_is_shown_to_user', async t => {
  const submitUserClicks = 5;
  const randomCodes= await generateCode();
  await t.expect(userActivationPage.submitUserActivationButton().hasAttribute('disabled')).ok();
  await submitDetailsOnUserActivationForm(t, '00899178', randomCodes[0], randomCodes[1]);
  for (let i = 0; i < submitUserClicks; i++) {
    await t.click(userActivationPage.submitUserActivationButton());
    await t.wait(500);
  }
  const text = await userActivationPage.activationSnackBar().innerText;
  await t.expect(text).contains('You have exceeded the number of activation attempts allowed.');
  await t.wait(500);
  await t.expect(userActivationPage.mincodeInput().hasAttribute('disabled')).ok();
  await t.expect(userActivationPage.personalActivationCodeInput().hasAttribute('disabled')).ok();
  await t.expect(userActivationPage.primaryActivationCodeInput().hasAttribute('disabled')).ok();
  await t.expect(userActivationPage.submitUserActivationButton().hasAttribute('disabled')).ok();
});


