import selectors from "../../support/selectors";

function testSendingNewUserInvites() {
    cy.visit('/', {timeout: 6000});
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

describe('Access School Users Page Tests', () => {
    context('As an EDX district admin', () => {
        before(() => {
            cy.task('dataLoad').then(() => {
                cy.task('setup-districtUser', {districtRoles: ['EDX_DISTRICT_ADMIN'], districtCodes: ['998']});
            });
        });

        after(() => { cy.logout(); });

        beforeEach(() => cy.login());

        context('with an opening school', () => {
            before(() => cy.task('recreate-school', { schoolStatus: 'Opening' }));
            it('can add a user to the opening school', testSendingNewUserInvites)
        });

        context('with an open school', () => {
            before(() => cy.task('recreate-school', { schoolStatus: 'Open' }));
            it('can add a user to the open school', testSendingNewUserInvites)
        });

        context('with a closing school', () => {
            before(() => cy.task('recreate-school', { schoolStatus: 'Closing' }));
            it('can add a user to the closing school', testSendingNewUserInvites)
        });

    });
});
