import {t, Selector} from 'testcafe';
import log from 'npmlog';

class SnackBarPage {

  constructor() {
    this.mainSnackBar = Selector('#mainSnackBar');
  }

  async verifySnackBarText(text) {
    await t.expect(this.mainSnackBar.innerText).contains(text);
    log.info(`Snack bar text found:: ${text}`);
  }

}

export default SnackBarPage;
