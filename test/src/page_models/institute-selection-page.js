import {t, Selector, ClientFunction} from 'testcafe';
import log from 'npmlog';

const httpUtils = require('../helpers/http-utils');

class InstituteSelectionPage {

  constructor() {
    this.schoolDashboard = Selector('#schools-dashboard-items');
    this.districtDashboard = Selector('#schools-district-items');
  }

  async schoolsDashboardExists() {
    const schoolsDashExists = Selector(this.schoolDashboard).exists;
    await t.expect(schoolsDashExists).ok();
  }

  async districtDashboardExists() {
    const distDashExists = Selector(this.districtDashboard).exists;
    await t.expect(distDashExists).ok();
  }

  async isInstituteSelectionPage() {
    let url = httpUtils.getPageUrl();
    log.info(url);
    return url.indexOf('/institute-selection') > -1;
  }

  async clickItemFromSchoolDashboardBasedOnTitle(title) {
    const distDashExists = Selector(this.districtDashboard).find('h3').withExactText(title);
    await t.click(distDashExists());
    log.info('Clicked schools dash item with text: ' + title);
  }

}

export default InstituteSelectionPage;
