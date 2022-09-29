import { Selector, t } from 'testcafe';
import log from 'npmlog';

class DistrictContactsPage {
    constructor() {
        this.navTitle = Selector('#navTitle');
        this.superContactHeader = Selector('.containerSetup').child('div').child('div')
            .child('div').child('h2');
    }

}

export default DistrictContactsPage;