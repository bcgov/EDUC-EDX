import { Selector, ClientFunction, t } from 'testcafe';

/**
 * Represents the Dashboard page
 */
class Dashboard {

    constructor() {
        this.navTitle = Selector('#navTitle');
    }

}
export default Dashboard;