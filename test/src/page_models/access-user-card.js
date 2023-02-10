import {Selector, t} from "testcafe";
import log from "npmlog";

class AccessUserCard {
    constructor(edxUserID) {
        this.edxUserCard = Selector(`#edxUser-${edxUserID}`);
        this.removeEdxUserButton = Selector(`#user-remove-button-${edxUserID}`);
        this.deleteEdxUserConfirmationDialog = Selector(
            `#edxUser-${edxUserID} .deleteEdxUserConfirmationDialog`
        );
        this.cancelUserDeleteButton = Selector(`#edxUser-${edxUserID} .cancelUserDeleteButton`);
        this.confirmUserDeleteButton = Selector(`#edxUser-${edxUserID} .confirmUserDeleteButton`);
        this.editEdxUserButton =  Selector(`#user-edit-button-${edxUserID}`);
        this.schoolAdminRoleCheckbox = Selector(`#edx_school_admin-role-checkbox-${edxUserID}`)
            .parent('div[role="option"]');
        this.secureExchangeRoleCheckbox = Selector(`#secure_exchange-role-checkbox-${edxUserID}`)
            .parent('div[role="option"]');
        this.editRoleSaveButton = Selector(`#user-save-action-button-${edxUserID}`);
        this.relinkUserButton = Selector(`#user-relink-button-${edxUserID}`);
        this.relinkWarningText = Selector(`#userRelinkWarningText-${edxUserID}`);
        this.relinkCancelButton = Selector(`#user-cancel-relink-button-${edxUserID}`);
        this.relinkActionButton = Selector(`#user-relink-action-button-${edxUserID}`);
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

    async verifyRelinkEdxUserButtonExists() {
        await t.expect(this.relinkUserButton.exists).ok();
        log.info('pass:', 'verified user relink button exists');
    }

    async clickRelinkEdxUserButton() {
        await t.click(this.relinkUserButton);
    }

    async verifyRelinkConfirmationDialog() {
        await t.expect(this.relinkWarningText.exists).ok();
        log.info('pass:', 'relink warning span exists');
    }

    async verifyRelinkWarningMessage() {
        await t.expect(this.relinkWarningText.innerText)
            .eql('Are you sure you want to re-link this account?');
        log.info('pass:', 'user has been warned')
    }

    async verifyRelinkCancelButton() {
        await t.expect(this.relinkCancelButton.exists).ok();
        log.info('pass:', 'relink cancel button exists');
    };

    async verifyRelinkActionButton() {
        await t.expect(this.relinkActionButton.exists).ok();
        log.info('pass:', 'relink action button exists');
    };

    async clickRelinkCancelButton() {
        await t.click(this.relinkCancelButton);
        log.info('click:', 'relink cancel button');
    };

    async verifyRelinkConfirmationDialogDoesNotExist() {
        await t.expect(this.relinkWarningText.exists).notOk();
        log.info('pass:', 'warning text is closed');
    }

    async verifyRelinkCancelButtonDoesNotExist() {
        await t.expect(this.relinkCancelButton.exists).notOk();
        log.info('pass:', 'cancel button gone');
    }

    async verifyRelinkActionButtonDoesNotExist() {
        await t.expect(this.relinkActionButton.exists).notOk();
        log.info('pass:', 'cancel button gone');
    }

    async clickRelinkActionButton() {
        await t.click(this.relinkActionButton);
        log.info('click:', 'relink action button');
    };

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
