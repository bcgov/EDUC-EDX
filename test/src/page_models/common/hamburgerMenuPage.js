import { Selector, t } from 'testcafe';
const log = require('npmlog');

class StaffHamburgerMenuPage {

    constructor() {

        this.hamburgerMenuButton = Selector('#menuBtn');
        this.secureMessagingMenuButton = Selector("#SecureMessagingMenuBtn");
        this.administrationMenuOption = Selector('#AdministrationMenuBtn');
        this.edxAccessMenuLink = Selector('#UserManagementMenuBtn');
    }

    async clickHamburgerMenu(){
        await t.click(this.hamburgerMenuButton);
        log.info("Hamburger menu button is clicked");
    }

    async verifySecureMessagingMenuButtonIsAvailable() {
        await t.expect(this.secureMessagingMenuButton.exists).ok();
        log.info("Verified Secure Messaging menu button exists.");
    }


    async verifySecureMessagingMenuButtonIsNotAvailable() {
        await t.expect(this.secureMessagingMenuButton.exists).notOk();
        log.info("Verified Secure Messaging menu button does not exists.");
    }

    async clickSecureMessagingMenuButton() {
        await t.click(this.secureMessagingMenuButton);
        log.info('The Secure Messaging menu button has been clicked.');
    }

    async clickAdministrationMenuOption(){
        await t.click(this.administrationMenuOption);
        log.info("Administration menu option is clicked");
    }

    async clickEDXAccessMenuLink(){
        await t.click(this.edxAccessMenuLink);
        log.info("Administrative EDX management link is clicked");
    }

} export default StaffHamburgerMenuPage
