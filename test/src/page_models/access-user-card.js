import {Selector, t} from "testcafe";
import log from "npmlog";

class AccessUserCard {
    constructor(edxUserID) {
        this.edxUserCard = Selector(`#edxUser-${edxUserID}`);
        this.removeEdxUserButton = Selector(`#edxUser-${edxUserID} .removeEdxUserButton`);
        this.deleteEdxUserConfirmationDialog = Selector(`#edxUser-${edxUserID} .deleteEdxUserConfirmationDialog`);
        this.cancelUserDeleteButton = Selector(`#edxUser-${edxUserID} .cancelUserDeleteButton`);
        this.confirmUserDeleteButton = Selector(`#edxUser-${edxUserID} .confirmUserDeleteButton`);
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
}

export default AccessUserCard;