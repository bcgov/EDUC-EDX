import UserActivation from '../../../page_models/user-activation';

const log = require('npmlog');
const {getToken} = require('../../../helpers/oauth-utils');
const {deleteActivationCode, generateCode,setUpDataForUserActivation,submitDetailsOnUserActivationForm,login} = require('../../../services/edx-api-service');
const userActivationPage = new UserActivation();

fixture`edx-user-activate-error-scenario-incorrect-activation-details-input`
  .before(async ctx => {
    await setUpDataForUserActivation(ctx,'SCHOOL','99178');
  })
  .after(async ctx => {
    const data = await getToken();
    await deleteActivationCode(data.access_token, ctx.acCode1);
  }).beforeEach(async t => {
  // log in as studentAdmin
  await t.resizeWindow(1920, 1080);
});

test('when_url_visited_incorrect_activation_details_input_error_is_shown_to_user', async t => {
  await login(t);
  const randomCodes= await generateCode();
  await submitDetailsOnUserActivationForm(t, '00899178', randomCodes[0], randomCodes[1]);
  const text = await userActivationPage.activationSnackBar().innerText;
  await t.expect(text).contains('Incorrect activation details have been entered. Please try again.');
});




