import {Selector, t} from 'testcafe';
import log from 'npmlog';

class AddStudent {
    constructor() {
        this.studentPenTextField = Selector('#studentPenTextField');
        this.searchPenButton = Selector('#searchPenBtn');
        this.addStudentToNewMessageButton = Selector('#addStudentToNewMessageBtn');
        this.addStudentAlert = Selector('#addStudentAlert');
        this.cancelAddStudentButton = Selector('#cancelAddStudentBtn');
    }

    async addStudentPenToSearchInAddStudentComponent(pen) {
        await t.click(this.studentPenTextField);
        await t.typeText(this.studentPenTextField, pen);
        log.info('Pen details input in Add Student');
    }

    async checkSearchPenButtonIsDisabled() {
        await t.expect(this.searchPenButton.visible).ok();
        const button = this.searchPenButton.with({visibilityCheck: true}).withExactText('Search');
        await t.expect(button.hasAttribute('disabled')).ok();
    }

    async checkSearchPenButtonIsEnabled() {
        await t.expect(this.searchPenButton.visible).ok();
        const button = this.searchPenButton.with({visibilityCheck: true}).withExactText('Search');
        await t.expect(button.hasAttribute('disabled')).notOk();
    }

    async checkAddStudentButtonIsDisabled() {
        await t.expect(this.addStudentToNewMessageButton.visible).ok();
        const button = this.addStudentToNewMessageButton.with({visibilityCheck: true}).withExactText('Add');
        await t.expect(button.hasAttribute('disabled')).ok();
    }

    async checkAddStudentButtonIsEnabled() {
        await t.expect(this.addStudentToNewMessageButton.visible).ok();
        const button = this.addStudentToNewMessageButton.with({visibilityCheck: true}).withExactText('Add');
        await t.expect(button.hasAttribute('disabled')).notOk();
    }

    async clickPenSearchButton() {
        await t.click(this.searchPenButton());
        log.info('Pen Search Button Clicked');
    }

    async clearPenSearchText() {
        await t
            .selectText(this.studentPenTextField)
            .pressKey('delete');
        log.info('Pen Details cleared from Search field');
    }

    async clickAddStudentButton() {
        await t.click(this.addStudentToNewMessageButton);
        log.info('Add Student To New Message Button clicked');
    }

    async assertAlertMessageAtAddStudent(message) {
        await t.expect(this.addStudentAlert.innerText).contains(message, {timeout: 10000});
    }

    async clickCancelAddStudentButton() {
        await t.click(this.cancelAddStudentButton());
        log.info('Cancel Add Student button clicked');
    }

    async testInvalidPENInput(pen)  {
        await this.addStudentPenToSearchInAddStudentComponent(pen);
        await this.checkSearchPenButtonIsDisabled();
        await this.checkAddStudentButtonIsDisabled();
    }

    async testValidPENInput(pen) {
        await this.addStudentPenToSearchInAddStudentComponent(pen);
        await this.checkSearchPenButtonIsEnabled();
        await this.checkAddStudentButtonIsDisabled();
        await this.clickPenSearchButton();
        await this.checkAddStudentButtonIsEnabled();
    }

    async testNonExistingPENInput(pen) {
        await this.addStudentPenToSearchInAddStudentComponent(pen);
        await this.clickPenSearchButton();
        await this.assertAlertMessageAtAddStudent('PEN must be a valid PEN associated with a student at the Ministry of Education and Childcare');
        await this.checkAddStudentButtonIsDisabled();
    }
}

export default AddStudent;