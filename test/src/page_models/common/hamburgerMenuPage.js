import { Selector, t } from 'testcafe';
const log = require('npmlog');

class StaffHamburgerMenuPage {

    constructor() {

        this.hamburgerMenuButton = Selector('#menuBtn');
        this.administrationMenuOption = Selector('#AdministrationMenuBtn');
        this.edxAccessMenuLink = Selector('#UserManagementMenuBtn');
    }

    async clickHamburgerMenu(){
        await t.click(this.hamburgerMenuButton);
        log.info("Hamburger menu button is clicked");
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
