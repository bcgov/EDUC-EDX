import log from 'npmlog';
import UserActivation from '../../page_models/user-activation';

const { getToken } = require('../../helpers/oauth-utils');
const {
  deleteActivationCode,
  setUpDataForUserActivation,
  login,
  deleteEdxUser
} = require('../../services/edx-api-service');

const userActivation = new UserActivation();

fixture `edx-user-test-activation-form`
  .before(async ctx => {
    await setUpDataForUserActivation(ctx,'DISTRICT','998');
  })
  .after(async ctx => {
    const data = await getToken();
    await deleteActivationCode(data.access_token, ctx.acCode1);
  })
  .beforeEach(async t => {
    await t.resizeWindow(1920, 1080);
  });


test('edx-user-activation-form-validation', async t => {
  const {
    mincodeInput,
    primaryActivationCodeInput,
    personalActivationCodeInput
  } = userActivation;
  const { primaryCode, personalCode } = t.fixtureCtx;

  await login(t);

  log.info('phase 1:', 'All fields should be invalid, the post button should be disabled.');
  await userActivation.verifyFieldIsInvalid(mincodeInput, 'Mincode');
  await userActivation.verifyFieldIsInvalid(primaryActivationCodeInput, 'Primary code');
  await userActivation.verifyFieldIsInvalid(personalActivationCodeInput, 'Personal code');
  await userActivation.verifySubmitIsDisabled();

  log.info('phase 2:', 'Validate all fields and verify we can post');
  await userActivation.typeTextInField(mincodeInput, '998', 'Mincode');
  await userActivation.typeTextInField(primaryActivationCodeInput, primaryCode, 'Primary code');
  await userActivation.typeTextInField(personalActivationCodeInput, personalCode, 'Personal code');
  await userActivation.verifySubmitIsEnabled();

  log.info('phase 3:', 'Re-invalidate fields and make sure validators catch it.');
  await userActivation.clearTextField(mincodeInput, 'Mincode');
  await userActivation.clearTextField(primaryActivationCodeInput, 'Primary code');
  await userActivation.clearTextField(personalActivationCodeInput, 'Personal code');
  await userActivation.verifySubmitIsDisabled();
});
