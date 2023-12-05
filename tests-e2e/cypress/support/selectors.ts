export default {
  accessUsersPage: {
    manageSchoolButton: '#manageSchoolButton',
    schoolSelectorBox: 'div[role="listbox"]',
    selectSchoolDropdown: '#selectInstituteName',
    accessUserFeedback: '.accessUserFeedback'
  },
  dashboard: {
    dataCollectionsTile: '#studentDataCollectionCard',
    dataCollectionsTileTitle: '#studentDataCollectionCard > div.v-row.pl-4 > div.v-col.mt-2 > div:nth-child(1) > div > h4',
    districtContactsCard: '#districtContactsCard',
    districtDetailsCard: '#districtDetailsCard',
    districtUserSchoolContactsCard: '#districtUserSchoolContactsCard',
    schoolContactsCard: '#schoolContactsCard',
    schoolDetailsCard: '#schoolDetailsCard',
    secureMessageTile: '#secureMessageInboxCard',
    title: '#navTitle > div'
  },
  dataCollectionsLanding: {
    continue: '.navigate',
    title: '#navTitle > div'
  },
  datePicker: {
    nextArrow: 'div.dp__month_year_row > button:nth-child(3)',
    day: '.dp__calendar_row:nth-child(2) > .dp__calendar_item:nth-child(1)'
  },
  districtContacts: {
    deleteCancelButton: '#rejectBtn',
    deleteConfirmButton: '#resolveBtn',
    deleteContactButton: '#removeContactButton',
    editContactFirstNameInput: '#editContactFirstNameInput',
    editContactLastNameInput: '#editContactLastNameInput',
    editDistrictContactButton: '#editContactButton',
    filterContactClearButton: '#district-clear-button',
    listItem: '.v-list-item',
    newContactButton: '#newContactButton',
    newContactEffectiveDateTextField: '#newContactEffectiveDateTextField',
    newContactEmailInput: '#newContactEmailInput',
    newContactFirstNameInput: '#newContactFirstNameInput',
    newContactLastNameInput: '#newContactLastNameInput',
    newContactPhoneNumberInput: '#newContactPhoneNumberInput',
    newContactPostBtn: '#newContactPostBtn',
    newContactTypeDropdown: '#newContactDropdown',
    saveChangesToDistrictContactButton: '#saveChangesToDistrictContactButton',
    searchContactButton: '#district-search-button',
    searchContactFirstNameInput: '#first-name-search-text-field',
    searchContactLastNameInput: '#last-name-search-text-field',
    searchContactTypeDropdown: '#status-select-field',
    subjectHeading: 'h2.subjectHeading',

  },
  districtDetails: {
    addWebsiteLink: '#addWebsiteLink',
    districtDetailsWebsite: '#districtDetailsWebsite',
    editAddressMailCity: '#mailAddressCity',
    editAddressPostalCode: '#mailAddressPostal',
    editDistrictDetailsButton: '#editButton',
    editDistrictEmail: '#districtEmail',
    editDistrictPhone: '#districtPhone',
    editDistrictFax: '#districtFax',
    editMailingAddressCountry: '#mailAddressCountry',
    editMailingAddressLine1: '#mailAddressLine1',
    editMailingAddressProvince: '#mailAddressProvince',
    editPopupConfirmButton: '#resolveBtn',
    editPopupReturnButton: '#rejectBtn',
    editSaveButton: '#saveButton',
  },
  documentUpload: { //common component
    selectFileInput: '#selectFileInput',
    uploadDocumentButton: '#upload_form',
    uploadDocumentTypeCodeSelect: '#uploadDocumentTypeCodeSelect',
    stepThreeNextButton: '#nextButton',
  },
  dropdown: { //common component
    listItem: '.v-list-item'
  },
  frenchComponent: {
    tab: '#frenchTab',
    summaryButton: '#frenchSummaryButton',
    headcountHeaderList: '.french-headcount-header',
    headcountHeaderColumn: '.french-headcount-header-column'
  },
  fteComponent: {
    tab: '#enrollmentTab',
    summaryButton: '#fteSummaryButton',
    headcountHeaderList: '.enrollment-headcount-header',
    headcountHeaderColumn: '.enrollment-headcount-header-column'

  },
  hamburgerMenu: {
    administrationMenuOption: '#AdministrationMenuBtn',
    districtUserManagementOption: '#DistrictUserManagementMenuBtn',
    edxAccessMenuLink: '#UserManagementMenuBtn',
    hamburgerMenuButton: '#menuBtn',
    schoolUserManagementOption: '#SchoolUserManagementMenuBtn',
    secureMessagingInboxMenuButton: '#SecureMessagingInboxMenuBtn'
  },
  indigenousSupportComponent: {
    tab: '#indProgTab',
    summaryButton: '#indProgSummaryButton'
  },
  invitationSelection: {
    loginButtonBCeID: '#login-button-bceid',
    loginButtonMicrosoft: '#login-button-microsoft',
  },
  loginPage: {
    loginUsername: '#user',
    loginPassword: '#password',
    loginContinueButton: 'input[name="btnSubmit"][value="Continue"]',
  },
  logoutPage: {
    logoutText: '#logout_text'
  },
  newUserInvites: {
    emailInput: '#newUserEmail',
    firstNameInput: '#newUserFirstName',
    generateNewCode: "#doGeneratePrimaryEdxActivationCodeButton",
    lastNameInput: '#newUserLastName',
    newUserButton: '#new-user-button',
    newUserInviteVCard: '#newUserInviteVCard',
    primaryActivationCode: "#primaryEdxActivationCode",
    rolesSelectorBox: '#instituteNewUserRolesListBox',
    rolesSelectorDropdown: '#instituteNewUserRolesSelect',
    sendInviteButton: '#newUserInvitePostBtn',
    toggleGenerateNewCode: "#toggleGenerateNewPrimaryEdxActivationCodeDialogVisibilityButton",
    noActivationCodeBanner: "#no-activation-code-banner"
  },
  schoolContacts: {
    cancelContactButton: '#cancelContactBtn',
    deleteCancelButton: '#rejectBtn',
    deleteConfirmButton: '#resolveBtn',
    deleteContactButton: '#removeContactButton',
    editContactButton: '#editContactButton',
    editContactEmailInput: '#editContactEmailInput',
    editContactFirstNameInput: '#editContactFirstNameInput',
    editContactLastNameInput: '#editContactLastNameInput',
    editContactPhoneNumberInput: '#editContactPhoneNumberInput',
    editContactSaveButton: '#editContactPostBtn',
    listItem: '.v-list-item',
    newContactButton: '#addSchoolContactBtn',
    newContactEffectiveDateTextField: '#newContactEffectiveDatePicker',
    newContactEmailInput: '#newContactEmailInput',
    newContactFirstNameInput: '#newContactFirstNameInput',
    newContactLastNameInput: '#newContactLastNameInput',
    newContactPhoneNumberInput: '#newContactPhoneNumberInput',
    newContactPostBtn: '#newContactPostBtn',
    newContactTypeDropdown: '#newContactDropdown',
    subjectHeading: 'h2.subjectHeading',
    resolveButton:'#resolveBtn'
  },
  schoolDetails: {
    addAddressButton: '#addAddressButton',
    addWebsiteLink: '#addWebsiteLink',
    editableFieldAlert: '.v-alert__content',
    editAddressMailCity: '#mailAddressCity',
    editAddressPostalCode: '#mailAddressPostal',
    editButton: '#schoolDetailsEditButton',
    editMailingAddressCountry: '#mailAddressCountry',
    editMailingAddressLine1: '#mailAddressLine1',
    editMailingAddressProvince: '#mailAddressProvince',
    editPopupConfirmButton: '#resolveBtn',
    editPopupReturnButton: '#rejectBtn',
    editSaveButton: '#saveButton',
    resolveBtn: '#resolveBtn',
    resolveButton:'#resolveBtn',
    saveButton: '#saveButton',
    schoolDetailsEmail: '#schoolDetailsEmail',
    schoolDetailsNlc: '#schoolDetailsNlc',
    schoolDetailsPhoneNumber: '#schoolDetailsPhoneNumber',
    schoolDetailsWebsite: '#schoolDetailsWebsite',
    schoolDisplayNameTitle: "#schoolDisplayNameTitle",
    schoolGradesDropdown: '#schoolGrades',
    schoolGradesValue: '#schoolGradesValue',
    schoolMincodeTitle: "#schoolMincodeTitle",
    schoolNameNoSpecialChars: '#schoolNameNoSpecialChars',
    subjectHeading: 'h2.subjectHeading',
    viewContactsButton: '#viewContactsButton',
  },
  schoolList: {
    viewFirstSchoolContactsButton: '#viewContactsButton0',
    schoolRow: '.hoverTable'
  },
  sdcSchoolStudentCollection: {
    sdcCollectionStepTwo: {
      removeRecord: '#removeRecord',
      removeRecordRejectButton: '#rejectBtn',
      removeRecordConfirmButton: '#resolveBtn',
    }
  },

  secureExchangeDetail: {
    addAttachmentConvButton: '#addAttachmentConvButton',
    addStudentConvButton: '#addStudentConvButton',
    editOptionsMenu: '#editOptionsMenu',
    newMessagePostBtn: '#newMessagePostBtn',
    newMessageToConvBtn: '#newMessageToConvBtn',
    newMessageToConvTextArea: '#newMessageToConvTextArea',
    timelineConfirmYesButton: '.v-btn',
    timelineContent: '.v-timeline-item__body',
    timelineRemoveButton: 'div.v-card-actions > button'
  },
  secureExchangeInbox: {
    addAttachmentButton: '#addAttachmentConvButton',
    filterSearchButton: '#searchButton',
    filterSubjectInput: '#subjectInput',
    filtersButton: '#filterid',
    newMessageButton: '#newMessageBtn',
    newMessageTextArea: '#newMessageTextArea',
    secureExchangeResults: '.v-data-table__tbody',
    uploadDocumentTypeCodeSelect: '#uploadDocumentTypeCodeSelect'
  },
  secureExchangeNewMessage: {
    addStudentToNewMessageBtn: '#addStudentID',
    attachFileID: '#attachFileID',
    newMessagePostBtn: '#newMessagePostBtn',
    newMessageTextArea: '#newMessageTextArea',
    subjectTxtField: '#subjectTxtField',
    toInputDropdown: '#schoolNameTxtField'
  },
  secureExchangeStudentUpload: { //common component
    addStudentID: '#addStudentToNewMessageBtn',
    searchPenBtn: '#searchPenBtn',
    studentPenTextField: '#studentPenTextField'
  },
  snackbar: {
    mainSnackBar: '#mainSnackBar'
  },
  specialEducationComponent: {
    tab: '#specialEdTab',
    summaryButton: '#specialEdSummaryButton'
  },
  studentLevelData: {
    detailsLoadingBar: 'div[class*=\'v-progress-linear--active\']',
    documentUploadButton: '#uploadButton',
    documentReUploadButton: '#uploadAgainButton',
    formHint: 'p.form-hint',
    legalLastNameValidationTextInput: '#legalLastNameValidationTextInput',
    nextButton: '#nextButton',
    postalCodeValidationTextInput: '#postalCodeValidationTextInput',
    removeRecord: '#removeRecord',
    saveRecordButton: '#saveRecord',
    stepFive:'#step-5',
    stepFour:'#step-4',
    stepOne:'#step-1',
    stepSix:'#step-6',
    stepThree:'#step-3',
    stepTwo:'#step-2',
    studentsFound: '#studentsFound',
    warningAndErrorSummary: '#warningAndErrorSummary',
    totalStudentsWithIssues: '#totalStudentsWithIssues',
    totalStudentsWithIssuesCount: '#totalStudentsWithIssuesCount',
    infoWarningCount: '#infoWarningCount',
    errorCount: '#errorCount',
    fundingWarningCount: '#fundingWarningCount',
    fixSelected: '#fixSelected',
    fixAll: '#fixAll',
    selectStudentCheckbox: 'td.v-data-table__td.v-data-table-column--no-padding.v-data-table-column--align-start > div',
    selectedStudentsPaginator: '.footer-text',
    backToDataIssues: 'div.v-col.v-col-6.mt-1.d-flex.justify-start > a'
  },
  userActivationPage: {
    mincodeInput: '#instituteIdentifierTextField',
    primaryTextActivationCodeInput: '#primaryEdxCodeTextField',
    personalActivationCodeInput: '#personalActivationCodeTextField',
    userActivationSubmitButton: '#edxUserActivationSubmitBtn',
    userActivationSnackBar: '.v-snackbar__content',
    userActivationErrorMessaageSnackBar: '#user_activation_error_message',
    acceptTermsCheckbox: '#acceptTOU'
  }
}