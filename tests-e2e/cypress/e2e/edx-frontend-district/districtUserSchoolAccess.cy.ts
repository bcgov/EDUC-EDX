import selectors from "../../support/selectors";

before(() => {
    cy.task('dataLoad').then(() => {
        cy.task('setup-districtUser', {districtRoles: ['EDX_DISTRICT_ADMIN'], districtCodes: ['998']});
    });
})

describe('District User School Access Tests', () => {
    beforeEach(() => {
        cy.login();
        cy.visit('/');
    })

    after(() => {
        cy.logout();
    })

    describe('District User Opening School Tests', () => {
        before(() => {
            cy.task('recreate-school', { schoolStatus: 'Opening' });
        })
        it('Add User to an Opening School within the District', testSendingNewUserInvites)
    })
    describe('District User Open School Tests', () => {
        before(() => {
            cy.task('recreate-school', { schoolStatus: 'Open' });
        })
        it('Add User to an Opening School within the District', testSendingNewUserInvites)
    })
    describe('District User Closing School Tests', () => {
        before(() => {
            cy.task('recreate-school', { schoolStatus: 'Closing' });
        })
        it('Add User to an Opening School within the District', testSendingNewUserInvites)
    })

    function testSendingNewUserInvites() {
        cy.get(selectors.hamburgerMenu.hamburgerMenuButton).click();
        cy.get(selectors.hamburgerMenu.schoolUserManagementOption).click();
        cy.get(selectors.accessUsersPage.selectSchoolDropdown).click();
        cy.get(selectors.accessUsersPage.schoolSelectorBox).should('exist');
        cy.get(selectors.accessUsersPage.schoolSelectorBox).find('div').contains('EDX Automation Testing School').click();
        cy.get(selectors.accessUsersPage.manageSchoolButton).click();

        cy.get(selectors.newUserInvites.newUserButton).click();
        cy.get(selectors.newUserInvites.newUserInviteVCard).should('exist');

        cy.get(selectors.newUserInvites.firstNameInput).type('TestUserFirstName');
        cy.get(selectors.newUserInvites.lastNameInput).type('TestUserLastName');
        cy.get(selectors.newUserInvites.emailInput).type('penemail@mailsac.com');
        cy.get(selectors.newUserInvites.rolesSelectorDropdown).click({force: true});
        cy.get(selectors.newUserInvites.rolesSelectorBox).should('exist');
        cy.get(selectors.newUserInvites.rolesSelectorBox).find('div').contains('EDX School Administrator').click();
        cy.get(selectors.newUserInvites.sendInviteButton).click();
        cy.get(selectors.snackbar.mainSnackBar).should('include.text', 'Success! The request is being processed.');
    }
})
