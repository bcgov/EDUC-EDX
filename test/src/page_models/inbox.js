import { Selector, ClientFunction, t } from 'testcafe';

/**
 * Represents the inbox page
 */
class Inbox {

    constructor() {
        this.navTitle = Selector('#navTitle');
    }

}
export default Inbox;