import { Selector, t } from 'testcafe';
const log = require('npmlog');

class HamburgerMenuPage {

    constructor() {

        this.hamburgerMenuButton = Selector('#menuBtn');
        this.secureMessagingInboxMenuButton = Selector("#SecureMessagingInboxMenuBtn");
        this.administrationMenuOption = Selector('#AdministrationMenuBtn');
        this.schoolUserManagementOption = Selector('#SchoolUserManagementMenuBtn');
        this.districtUserManagementOption = Selector('#DistrictUserManagementMenuBtn')
        this.edxAccessMenuLink = Selector('#UserManagementMenuBtn');
    }

    async clickHamburgerMenu(){
        await t.click(this.hamburgerMenuButton);
        log.info("Hamburger menu button is clicked");
    }

    async verifySecureMessagingInboxMenuButtonIsAvailable() {
        await t.expect(this.secureMessagingInboxMenuButton.exists).ok();
        log.info("Verified Secure Messaging Inbox menu button exists.");
    }


    async verifySecureMessagingInboxMenuButtonIsNotAvailable() {
        await t.expect(this.secureMessagingInboxMenuButton.exists).notOk();
        log.info("Verified Secure Messaging Inbox menu button does not exists.");
    }

    async clickSecureMessagingInboxMenuButton() {
        await t.click(this.secureMessagingInboxMenuButton);
        log.info('The Secure Messaging Inbox menu button has been clicked.');
    }

    async clickAdministrationMenuOption(){
        await t.click(this.administrationMenuOption);
        log.info("Administration menu option is clicked");
    }

    async clickEDXAccessMenuLink(){
        await t.click(this.edxAccessMenuLink);
        log.info("Administrative EDX management link is clicked");
    }

    async clickSchoolUserManagementSubMenuLink(){
        await t.click(this.schoolUserManagementOption);
        log.info("School User Management link is clicked");
    }

    async clickDistrictUserManagementSubMenuLink(){
        await t.click(this.districtUserManagementOption);
        log.info("District User Management link is clicked");
    }

} export default HamburgerMenuPage;
