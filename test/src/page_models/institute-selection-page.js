import {t, Selector} from 'testcafe';
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
    return await httpUtils.urlContains('/institute-selection');
  }

  async clickItemFromSchoolDashboardBasedOnTitle(title) {
    const schDashSelection = Selector(this.schoolDashboard).find('h3').withExactText(title);
    await t.click(schDashSelection);
    log.info('Clicked schools dash item with text: ' + title);
  }

}

export default InstituteSelectionPage;
