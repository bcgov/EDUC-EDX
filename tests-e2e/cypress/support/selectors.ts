export default {
  snackbar: {
    mainSnackBar: '#mainSnackBar'
  },
  hamburgerMenu: {
    hamburgerMenuButton: '#menuBtn',
    secureMessagingInboxMenuButton: '#SecureMessagingInboxMenuBtn',
    administrationMenuOption: '#AdministrationMenuBtn',
    schoolUserManagementOption: '#SchoolUserManagementMenuBtn',
    districtUserManagementOption: '#DistrictUserManagementMenuBtn',
    edxAccessMenuLink: '#UserManagementMenuBtn',
  },
  dropdown: { //common component
    listItem: '.v-list-item',
  },
  documentUpload: { //common component
    selectFileInput: '#selectFileInput',
    uploadDocumentTypeCodeSelect: '#uploadDocumentTypeCodeSelect',
    uploadDocumentButton: '#upload_form',
  },
  dashboard: {
    dataCollectionsTile: '#studentDataCollectionCard',
    dataCollectionsTileTitle: '#studentDataCollectionCard > div.v-row.pl-4 > div.v-col.mt-2 > div:nth-child(1) > div > h4',
    districtContactsCard: '#districtContactsCard',
    districtDetailsCard: '#districtDetailsCard',
    districtUserSchoolContactsCard: '#districtUserSchoolContactsCard',
    secureMessageTile: '#secureMessageInboxCard',
    schoolContactsCard: '#schoolContactsCard',
    schoolDetailsCard: '#schoolDetailsCard',
    title: '#navTitle > div'
  },
  accessUsersPage: {
    selectSchoolDropdown: '#selectInstituteName',
    schoolSelectorBox: 'div[role="listbox"]',
    manageSchoolButton: '#manageSchoolButton'
  },
  newUserInvites: {
    newUserButton: '#new-user-button',
    newUserInviteVCard: '#newUserInviteVCard',
    firstNameInput: '#newUserFirstName',
    lastNameInput: '#newUserLastName',
    emailInput: '#newUserEmail',
    rolesSelectorDropdown: '#instituteNewUserRolesSelect',
    rolesSelectorBox: 'div[role="listbox"]',
    sendInviteButton: '#newUserInvitePostBtn'
  },
  dataCollectionsLanding: {
    continue: '.navigate',
    title: '#navTitle > div',
  },
  districtContacts: {
    listItem: '.v-list-item',
    newContactButton: '#newContactButton',
    newContactCalendar: '.dp__outer_menu_wrap',
    newContactEffectiveDateTextField: '#newContactEffectiveDateTextField',
    newContactEmailInput: '#newContactEmailInput',
    newContactLastNameInput: '#newContactLastNameInput',
    newContactPhoneNumberInput: '#newContactPhoneNumberInput',
    newContactPostBtn: '#newContactPostBtn',
    newContactTypeDropdown: '#newContactDropdown',
    subjectHeading: 'h2.subjectHeading',
  },
  districtDetails: {
    addWebsiteLink: '#addWebsiteLink',
    districtDetailsWebsite: '#districtDetailsWebsite',
    editDetailsButton: '#editButton'
  },
  schoolContacts: {
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
  },
  schoolDetails: {
    addWebsiteLink: '#addWebsiteLink',
    editButton: '#schoolDetailsEditButton',
    resolveBtn: '#resolveBtn',
    saveButton: '#saveButton',
    schoolDetailsEmail: '#schoolDetailsEmail',
    schoolDetailsPhoneNumber: '#schoolDetailsPhoneNumber',
    schoolDetailsWebsite: '#schoolDetailsWebsite',
    subjectHeading: 'h2.subjectHeading'
  },
  schoolList: {
    viewFirstSchoolContactsButton: '#viewContactsButton0'
  },
  secureExchangeDetail: {
    addAttachmentConvButton: '#addAttachmentConvButton',
    addStudentConvButton: '#addStudentConvButton',
    newMessageToConvBtn: '#newMessageToConvBtn',
    newMessageToConvTextArea: '#newMessageToConvTextArea',
    newMessagePostBtn: '#newMessagePostBtn',
    timelineConfirmYesButton: '.v-btn',
    timelineContent: '.v-timeline-item__body',
    timelineRemoveButton: 'div.v-card-actions > button',
  },
  secureExchangeInbox: {
    addAttachmentButton: '#addAttachmentConvButton',
    filtersButton: '#filterid',
    filterSearchButton: '#searchButton',
    filterSubjectInput: '#subjectInput',
    newMessageButton: '#newMessageBtn',
    newMessageTextArea: '#newMessageTextArea',
    secureExchangeResults: '.v-data-table__tbody',
    uploadDocumentTypeCodeSelect: '#uploadDocumentTypeCodeSelect',
  },
  secureExchangeNewMessage: {
    addStudentToNewMessageBtn: '#addStudentID',
    attachFileID: '#attachFileID',
    newMessagePostBtn: '#newMessagePostBtn',
    newMessageTextArea: '#newMessageTextArea',
    subjectTxtField: '#subjectTxtField',
    toInputDropdown: '#schoolNameTxtField',
  },
  secureExchangeStudentUpload: { //common component
    addStudentID: '#addStudentToNewMessageBtn',
    searchPenBtn: '#searchPenBtn',
    studentPenTextField: '#studentPenTextField',
  },
  stepOneSchoolDetails: {
    formHint: 'p.form-hint',
    nextButton: '#nextButton',
  },
  stepTwoSchoolContacts: {
    formHint: 'p.form-hint',
    nextButton: '#nextButton',
  }
}
