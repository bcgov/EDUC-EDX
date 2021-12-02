import BceidLoginPage from '../pageObjects/BceidLoginPage';
import PenRequestForm from '../pageObjects/PenRequestForm';
import { credentials, fullStudent, BceidLoginUrl } from '../helpers/constants';


const penRequestForm = new PenRequestForm()
const bceidLoginPage = new BceidLoginPage()

fixture`Bceid Login and Fill Pen request form`
  .page(BceidLoginUrl)
  .beforeEach(async t => {
    await t.maximizeWindow().setTestSpeed(1)
  })

test('basic bceid login', async t => {

  await bceidLoginPage.bceidLogin(t, credentials);

  await penRequestForm.fillRequestForm(t, fullStudent, false);

  //await t.takeScreenshot();

});
