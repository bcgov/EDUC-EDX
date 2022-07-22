import { Selector, t } from 'testcafe';
const log = require('npmlog');

class NavBarPage {

  constructor() {

    this.navTitle = Selector('#navTitle');
  }

  async verifyNavTitleByText(text){
    await t.expect(this.navTitle.innerText).contains(text);
    log.info(`Nav title contains ${text}`);
  }

} export default NavBarPage
