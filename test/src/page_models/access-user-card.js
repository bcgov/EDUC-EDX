import {Selector, t} from "testcafe";
import log from "npmlog";

class AccessUserCard {
    constructor(edxUserID) {
        this.edxUserCard = Selector(`#edxUser-${edxUserID}`);
        this.removeEdxUserButton = Selector(`#user-remove-button-${edxUserID}`);
        this.deleteEdxUserConfirmationDialog = Selector(`#edxUser-${edxUserID} .deleteEdxUserConfirmationDialog`);
        this.cancelUserDeleteButton = Selector(`#edxUser-${edxUserID} .cancelUserDeleteButton`);
        this.confirmUserDeleteButton = Selector(`#edxUser-${edxUserID} .confirmUserDeleteButton`);
        this.editEdxUserButton =  Selector(`#user-edit-button-${edxUserID}`);
        this.schoolAdminRoleCheckbox = Selector('div').withText('EDX School Administrator');
        this.secureExchangeRoleCheckbox = Selector('div').withText('Secure Exchange');
        this.editRoleSaveButton = Selector('button').withText('Save');
    }

    async verifyEdxUserCardExists() {
        await t.expect(this.edxUserCard.exists).ok();
        log.info('Verified that the EDX User Card exists.');
    }

    async verifyEdxUserCardDoesNotExists() {
        await t.expect(this.edxUserCard.exists).notOk();
        log.info('Verified that the EDX User Card does not exist.');
    }

    async verifyRemoveEdxUserButtonExists() {
        await t.expect(this.removeEdxUserButton.exists).ok();
        log.info('Verified that the Remove EDX User Button exists.');
    }

    async verifyRemoveEdxUserButtonDoesNotExists() {
        await t.expect(this.removeEdxUserButton.exists).notOk();
        log.info('Verified that the Remove EDX User Button does not exist.');
    }

    async clickRemoveEdxUserButton() {
        await t.click(this.removeEdxUserButton);
        log.info('Clicked the user\'s remove button.');
    }

    async verifyDeleteEdxUserConfirmationDialogExists() {
        await t.expect(this.deleteEdxUserConfirmationDialog.exists).ok();
        log.info('Verified that the EDX User Delete Confirmation Dialog exists.');
    }

    async verifyDeleteEdxUserConfirmationDialogDoesNotExists() {
        await t.expect(this.deleteEdxUserConfirmationDialog.exists).notOk();
        log.info('Verified that the Delete EDX User Confirmation Dialog does not exist.');
    }

    async verifyCancelUserDeleteButtonExists() {
        await t.expect(this.cancelUserDeleteButton.exists).ok();
        log.info('Verified that the Cancel User Deletion Button exists.');
    }

    async verifyCancelUserDeleteButtonDoesNotExists() {
        await t.expect(this.cancelUserDeleteButton.exists).notOk();
        log.info('Verified that the Cancel User Deletion Button does not exist.');
    }

    async clickCancelUserDeleteButton() {
        await t.click(this.cancelUserDeleteButton);
        log.info('Clicked the user\'s Cancel User Deletion button.');
    }

    async verifyConfirmUserDeleteButtonExists() {
        await t.expect(this.confirmUserDeleteButton.exists).ok();
        log.info('Verified that the Confirm User Deletion Button exists.');
    }

    async verifyConfirmUserDeleteButtonDoesNotExists() {
        await t.expect(this.confirmUserDeleteButton.exists).notOk();
        log.info('Verified that the Confirm User Deletion Button does not exist.');
    }

    async clickConfirmUserDeleteButton() {
        await t.click(this.confirmUserDeleteButton);
        log.info('Clicked the user\'s Confirm User Deletion button.');
    }

    async verifyEditEdxUserButtonExists() {
        await t.expect(this.editEdxUserButton.exists).ok();
        log.info('Verified that the Edit EDX User Button exists.');
    }

    async clickEditEdxUserButton() {
        await t.click(this.editEdxUserButton);
        log.info('Clicked the user\'s edit button.');
    }

    async uncheckExistingRoleFromList() {
        await t.click(this.schoolAdminRoleCheckbox);
        log.info('Unchecked School administrator checkbox.');
    }

    async checkNewRoleFromList() {
        await t.click(this.secureExchangeRoleCheckbox);
        log.info('Unchecked School administrator checkbox.');
    }

    async clickSaveRoleButton() {
        await t.click(this.editRoleSaveButton);
        log.info('Clicked save button.');
    }

    
}

export default AccessUserCard;