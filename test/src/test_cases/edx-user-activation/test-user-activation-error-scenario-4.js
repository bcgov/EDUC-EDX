import UserActivation from '../../page_models/user-activation';

const log = require('npmlog');
const {getToken} = require('../../helpers/oauth-utils');
const {deleteActivationCode, generateCode,createFixtureSetupForEdxUserActivation,submitDetailsOnUserActivationForm,login} = require('../../services/edx-api-service');
const userActivationPage = new UserActivation();



fixture`edx-user-activate-error-scenario-incorrect-activation-details-input-five-times-submit-click`
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

test('when_url_visited_incorrect_activation_details_input_submit_clicked_five_times_error_is_shown_to_user', async t => {
  await login(t);
  const randomCodes= await generateCode();
  await t.expect(userActivationPage.submitUserActivationButton().hasAttribute('disabled')).ok();
  await submitDetailsOnUserActivationForm(t, '00899178', randomCodes[0], randomCodes[1]);
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


