export class Selectors {

    dashboard: any = {
        dataCollectionsTile: '#studentDataCollectionCard',
        dataCollectionsTileTitle: '#studentDataCollectionCard > div.v-row.pl-4 > div.v-col.mt-2 > div:nth-child(1) > div > h4',
        title: '#navTitle > div',
    };

    dataCollectionsLanding: any = {
        continue: '.navigate',
        title: '#navTitle > div',
    };

    schoolContacts: any = {
        listItem: '.v-list-item',
        newContactButton: '#addSchoolContactBtn',
        newContactCalendar: '.dp__outer_menu_wrap',
        newContactEffectiveDateTextField: '#newContactEffectiveDateTextField',
        newContactEmailInput: '#newContactEmailInput',
        newContactLastNameInput: '#newContactLastNameInput',
        newContactPhoneNumberInput: '#newContactPhoneNumberInput',
        newContactPostBtn: '#newContactPostBtn',
        newContactTypeDropdown: '#newContactDropdown',
        subjectHeading: 'h2.subjectHeading',
    };

    schoolDetails: any = {
        editButton: '#schoolDetailsEditButton',
        resolveBtn: '#resolveBtn',
        saveButton: '#saveButton',
        schoolDetailsEmail: '#schoolDetailsEmail',
        schoolDetailsPhoneNumber: '#schoolDetailsPhoneNumber',
        subjectHeading: 'h2.subjectHeading',

    };

    stepOneSchoolDetails: any = {
        formHint: 'p.form-hint',
        nextButton: '#nextButton',
    };

    stepTwoSchoolContacts: any = {
        formHint: 'p.form-hint',
        nextButton: '#nextButton',
    };
}