import { Selector, t } from 'testcafe'
class PenRequestForm {

    constructor() {

        this.topCheckBox = Selector('#input-30')
        this.legaLastlName = Selector('#legalLastName')
        this.legalFirstName = Selector('#legalFirstName')
        this.legalMiddleName = Selector('#legalMiddleNames')
        this.usualLastName = Selector('#usualLastName')
        this.usualFirstName = Selector('#usualFirstName')
        this.usualMiddleName = Selector('#usualMiddleNames')
        this.maidenName = Selector('#maidenName')
        this.pastName = Selector('#pastNames')
        this.email = Selector('#email')
        this.lastBCSchool = Selector('#lastBCSchool')
        this.lastBCStudentNumber = Selector('#lastBCStudentNumber')
        this.currentSchool = Selector('#currentSchool')
        this.bottomCheckBox = Selector('#acceptance_chk')
        this.submitForm = Selector('#submit_form')
    }

    async  fillRequestForm(t, studentData, submitBool) {

        await t.click(this.topCheckBox);

        await t
            .wait(5)
            .expect(this.legaLastlName.count).eql(1);

        if (studentData.legalLastName) {
            await t.typeText(this.legaLastlName, studentData.legalLastName, { paste: true });
        }
        if (studentData.legalFirstName) {
            await t.typeText(this.legalFirstName, studentData.legalFirstName, { paste: true });
        }
        if (studentData.legalMiddleNames) {
            await t.typeText(this.legalMiddleName, studentData.legalMiddleNames, { paste: true });
        }
        if (studentData.usualLastName) {
            await t.typeText(this.usualLastName, studentData.usualLastName, { paste: true });
        }
        if (studentData.usualFirstName) {
            await t.typeText(this.usualFirstName, studentData.usualFirstName, { paste: true });
        }
        if (studentData.usualMiddleNames) {
            await t.typeText(this.usualMiddleName, studentData.usualMiddleNames, { paste: true });
        }
        if (studentData.maidenName) {
            await t.typeText(this.maidenName, studentData.maidenName, { paste: true });
        }
        if (studentData.pastNames) {
            await t.typeText(this.pastName, studentData.pastNames, { paste: true });
        }

        if (studentData.birthdate) {
            console.log(studentData.birthdate);
            const month = studentData.birthdate.getMonth();
            const day = studentData.birthdate.getUTCDate();
            //const year = studentData.birthdate.getYear();
            await t
                .click(Selector('#birthdate'))
                .click(Selector('ul').filter('.v-date-picker-years').nth(-1))
                .click(Selector('div.v-date-picker-table').find('.v-btn__content').nth(month - 1))
                .click(Selector('div.v-date-picker-table').find('.v-btn__content').nth(day - 1));
            //.click(Selector('div.v-select__selections'));
            //.click(Selector('div.v-list-item__content').find('.v-list-item__title').nth(-1));
        }
        if (studentData.gender) {
            await t
                .click(Selector('div.v-select__selections'))
                .click(Selector('div.v-list-item__content').find('.v-list-item__title').nth(studentData.gender));
        }
        if (studentData.email) {
            await t.typeText(this.email, studentData.email, { paste: true });
        }
        if (studentData.lastBCSchool) {
            await t.typeText(this.lastBCSchool, studentData.lastBCSchool, { paste: true });
        }
        if (studentData.lastBCStudentNumber) {
            await t.typeText(this.lastBCStudentNumber, studentData.lastBCStudentNumber, { paste: true });
        }
        if (studentData.currentSchool) {
            await t.typeText(this.currentSchool, studentData.currentSchool);
        }

        await t.click(this.bottomCheckBox);

        //await t.debug();

        if (submitBool === true) {
            await t.click(this.submitForm);
        }
        else {
            //await t.eval(() => location.reload(true));
        }

    }
}


export default PenRequestForm