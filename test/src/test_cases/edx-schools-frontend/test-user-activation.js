import {base_url, credentials} from '../../config/constants';
import {screen} from '@testing-library/testcafe';
import {ClientFunction, Selector, t} from 'testcafe';

const log = require('npmlog');
const {getToken} = require('../../helpers/oauth-utils');
const {createUserActivationUrl,deleteActivationCode} = require('../../services/edx-api-service');


fixture`edx-user-activate-success-scenario`
  .before(async ctx => {
    try {
      const data = await getToken();
      ctx.activationUrl = await createUserActivationUrl(data.access_token);
      ctx.acCode1 = ctx.activationUrl[1].edxActivationCodeId;
      ctx.acCode2 = ctx.activationUrl[2].edxActivationCodeId;
    } catch (e) {
      console.error(e);
    }
  })
  .after(async ctx => {
    const data = await getToken();
    await deleteActivationCode(data.access_token,ctx.acCode1);
    await deleteActivationCode(data.access_token,ctx.acCode2);
  });

test('when_url_visited_user_redirected_to_login_page_and_db_updated', async t => {
  const userNameInput = Selector('#user');
  const passwordInput = Selector('#password');
  const submitCredentialsButton = Selector('input[name="btnSubmit"][value="Continue"]');
  const mincodeInput = Selector('#mincodeTextField');
  const primaryActivationCodeInput = Selector('#primaryEdxCodeTextField');
  const personalActivationCodeInput = Selector('#personalActivationCodeTextField');
  const submitUserActivationButton = Selector('#edxUserActivationSubmitBtn');
  await t.navigateTo(t.fixtureCtx.activationUrl[0]);
  log.info('EDX Login page loaded successfully!');

  // log in, assert return to baseurl
  const getLocation = ClientFunction(() => document.location.href);
  await t.typeText(userNameInput, credentials.adminCredentials.username, { timeout: 20000 })
    .typeText(passwordInput, credentials.adminCredentials.password, { timeout: 20000 })
    .click(submitCredentialsButton);
    //.expect(getLocation()).contains(base_url+'user-activation');

  log.info('User could login successfully!');

  await t.typeText(mincodeInput, '00899178', { timeout: 20000 })
  .typeText(primaryActivationCodeInput, 'QWERTY', { timeout: 20000 })
  .typeText(personalActivationCodeInput, 'ASDFASDF', { timeout: 20000 })
  .click(submitUserActivationButton);
 // .expect(getLocation()).contains(base_url);

  const text = await Selector('#mainSnackBar').innerText;
  log.info(text);
  await t.expect(text).contains('User Activation Completed Successfully. You will be redirected to your Dashboard Shortly!');
  await  t.wait(5000)
    .expect(getLocation()).contains(base_url)
  log.info('User could activate account successfully');

});

/*test('when_url_visited_incorrect_activation_details_input_error_is_shown_to_user', async t => {
  const userNameInput = Selector('#user');
  const passwordInput = Selector('#password');
  const submitCredentialsButton = Selector('input[name="btnSubmit"][value="Continue"]');
  const mincodeInput = Selector('#mincodeTextField');
  const primaryActivationCodeInput = Selector('#primaryEdxCodeTextField');
  const personalActivationCodeInput = Selector('#personalActivationCodeTextField');
  const submitUserActivationButton = Selector('#edxUserActivationSubmitBtn');
  await t.navigateTo(t.fixtureCtx.activationUrl[0]);
  log.info('EDX Login page loaded successfully!');

  // log in, assert return to baseurl
  const getLocation = ClientFunction(() => document.location.href);
  await t.typeText(userNameInput, credentials.adminCredentials.username, { timeout: 20000 })
    .typeText(passwordInput, credentials.adminCredentials.password, { timeout: 20000 })
    .click(submitCredentialsButton);
  //.expect(getLocation()).contains(base_url+'user-activation');

  log.info('User could login successfully!');

  await t.typeText(mincodeInput, '00899178', { timeout: 20000 })
    .typeText(primaryActivationCodeInput, 'XXXYYYYY', { timeout: 20000 })
    .typeText(personalActivationCodeInput, 'ASDFASDF', { timeout: 20000 })
    .click(submitUserActivationButton);
  // .expect(getLocation()).contains(base_url);

  const text = await Selector('#activationSnackBar').innerText;
  log.info(text);
  await t.expect(text).contains('Incorrect activation details have been entered. Please try again.');
  await  t.wait(5000);


});*/

/*
test('when_url_visited_twice_user_gets_error_link_expired', async t => {
  await t.navigateTo(t.fixtureCtx.activationUrl[0]);

  await t.navigateTo(t.fixtureCtx.activationUrl[0]);
  const errorText = await Selector('#user_activation_error_message').innerText;
  await t.expect(errorText).contains('Your activation link is expired; the activation link should only be usable one time. Please contact your administrator for a new activation code.');
  await  t.wait(5000);

  log.info('activation link expired on double click on activation url is verified');

});*/

fixture`edx-user-activate-error-scenario-1`
  .before(async ctx => {
    try {
      const data = await getToken();
      ctx.activationUrl = await createUserActivationUrl(data.access_token);
      ctx.acCode1 = ctx.activationUrl[1].edxActivationCodeId;
      ctx.acCode2 = ctx.activationUrl[2].edxActivationCodeId;
    } catch (e) {
      console.error(e);
    }
  })
  .after(async ctx => {
    const data = await getToken();
    await deleteActivationCode(data.access_token,ctx.acCode1);
    await deleteActivationCode(data.access_token,ctx.acCode2);
  });


test('when_url_visited_incorrect_activation_details_input_error_is_shown_to_user', async t => {
  const userNameInput = Selector('#user');
  const passwordInput = Selector('#password');
  const submitCredentialsButton = Selector('input[name="btnSubmit"][value="Continue"]');
  const mincodeInput = Selector('#mincodeTextField');
  const primaryActivationCodeInput = Selector('#primaryEdxCodeTextField');
  const personalActivationCodeInput = Selector('#personalActivationCodeTextField');
  const submitUserActivationButton = Selector('#edxUserActivationSubmitBtn');
  await t.navigateTo(t.fixtureCtx.activationUrl[0]);
  log.info('EDX Login page loaded successfully!');

  // log in, assert return to baseurl
  const getLocation = ClientFunction(() => document.location.href);
  await t.typeText(userNameInput, credentials.adminCredentials.username, { timeout: 20000 })
    .typeText(passwordInput, credentials.adminCredentials.password, { timeout: 20000 })
    .click(submitCredentialsButton);
  //.expect(getLocation()).contains(base_url+'user-activation');

  log.info('User could login successfully!');

  await t.typeText(mincodeInput, '00899178', { timeout: 20000 })
    .typeText(primaryActivationCodeInput, 'XXXYYYYY', { timeout: 20000 })
    .typeText(personalActivationCodeInput, 'ASDFASDF', { timeout: 20000 })
    .click(submitUserActivationButton);
  // .expect(getLocation()).contains(base_url);

  const text = await Selector('#activationSnackBar').innerText;
  log.info(text);
  await t.expect(text).contains('Incorrect activation details have been entered. Please try again.');
  await  t.wait(5000);


});
