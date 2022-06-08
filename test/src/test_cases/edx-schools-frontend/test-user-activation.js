import {base_url, credentials} from '../../config/constants';
import {ClientFunction, Selector} from 'testcafe';
import LoginPage from '../../page_models/login-page';
import UserActivation from '../../page_models/user-activation';
import faker from 'faker';
import generator from 'generate-password';

const jsonwebtoken = require('jsonwebtoken');
const log = require('npmlog');
const {getToken} = require('../../helpers/oauth-utils');
const {createUserActivationUrl, deleteActivationCode, deleteEdxUser} = require('../../services/edx-api-service');
const loginPage = new LoginPage();
const userActivationPage = new UserActivation();

async function generateCode(){
  return  generator.generateMultiple(2,{
    length: faker.datatype.number({ 'min': 7, 'max': 7 }),
    numbers: true,
    uppercase: true,
    });
}
async function login(t) {
  await t.navigateTo(t.fixtureCtx.activationUrl[0]);
  log.info('EDX Login page loaded successfully!');
  // log in, assert return to baseurl
  const getLocation = ClientFunction(() => document.location.href);
  await t.typeText(loginPage.userNameInput(), credentials.activateUserCredentials.username, {timeout: 20000})
    .typeText(loginPage.passwordInput(), credentials.activateUserCredentials.password, {timeout: 20000})
    .click(loginPage.submitCredentialsButton());
  log.info('User could login successfully!');
  return getLocation;
}

async function createFixtureSetupForEdxUserActivation(ctx,primaryCode,personalCode) {
  try {
    const data = await getToken();
    ctx.activationUrl = await createUserActivationUrl(data.access_token,primaryCode,personalCode);
    ctx.acCode1 = ctx.activationUrl[1].edxActivationCodeId;
    ctx.acCode2 = ctx.activationUrl[2].edxActivationCodeId;
    ctx.primaryCode= primaryCode;
    ctx.personalCode= personalCode;
  } catch (e) {
    console.error(e);
  }
}

async function submitDetailsOnUserActivationForm(t, mincode, primaryActivationCode, personalActivationCode) {
  await t.typeText(userActivationPage.mincodeInput(), mincode, {timeout: 20000})
    .typeText(userActivationPage.primaryActivationCodeInput(), primaryActivationCode, {timeout: 20000})
    .typeText(userActivationPage.personalActivationCodeInput(), personalActivationCode, {timeout: 20000})
    .click(userActivationPage.submitUserActivationButton());
}

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


/*
fixture`edx-user-activate-error-scenario-incorrect-activation-details-input`
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

test('when_url_visited_incorrect_activation_details_input_error_is_shown_to_user', async t => {
  await login(t);
  log.info('User could login successfully!');
  const randomCodes= await generateCode();
  await submitDetailsOnUserActivationForm(t, '00899178', randomCodes[0], randomCodes[1]);
  await t.wait(500);
  const text = await userActivationPage.activationSnackBar().innerText;
  await t.expect(text).contains('Incorrect activation details have been entered. Please try again.');
});

fixture`edx-user-activate-error-scenario-activation-url-visited-twice`
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

fixture`edx-user-activate-error-scenario-incorrect-activation-details-input`
  .before(async ctx => {
  const codes= await generateCode();
    await createFixtureSetupForEdxUserActivation(ctx,codes[0],codes[1]);
  })
  .after(async ctx => {
    const data = await getToken();
    await deleteActivationCode(data.access_token, ctx.acCode1);
    await deleteActivationCode(data.access_token, ctx.acCode2);
  });

test('when_url_visited_incorrect_activation_details_input_error_is_shown_to_user', async t => {
  await login(t);
  const randomCodes= await generateCode();
  await submitDetailsOnUserActivationForm(t, '00899178', randomCodes[0], randomCodes[1]);
  const text = await userActivationPage.activationSnackBar().innerText;
  await t.expect(text).contains('Incorrect activation details have been entered. Please try again.');
});

fixture`edx-user-activate-error-scenario-incorrect-activation-details-input-five-times-submit-click`
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
*/

