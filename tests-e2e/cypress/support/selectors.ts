export default {
  accessUsersPage: {
    manageSchoolButton: '#manageSchoolButton',
    schoolSelectorBox: 'div[role="listbox"]',
    selectSchoolDropdown: '#selectInstituteName',
    accessUserFeedback: '.v-alert__content',
    confirmationDialog: '.v-overlay__content'
  },
  activeFiltersDrawer: {
    drawer: '.v-navigation-drawer--active',
  },
  bandSummaryComponent: {
    headcountTableSubHeading: '.section-header'
  },
  careerProgramComponent: {
    tab: '#careerTab',
    filterButton: '#filters',
    summaryButton: '#careerSummaryButton',
    headcountCard: '.career-headcount-card',
    headcountHeader: '.career-headcount-header',
    headcountColumnData: '.career-headcount-column-data',
    headcountTableSubHeading: '.section-header'
  },
  collectionSummary: {
    stepsComplete: '.steps > span',
    continue: '.navigate'
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
    title: '#navTitle'
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
    addWebsiteLink: 'a.editField',
    districtDetailsWebsite: '#districtDetailsWebsite',
    editAddressMailCity: '#mailAddressCity',
    editAddressPostalCode: '#mailAddressPostal',
    editDistrictDetailsButton: '#districtDetailsEditButton',
    editDistrictEmail: '#districtDetailsEmail',
    editDistrictPhone: '#districtDetailsPhoneNumber',
    editDistrictFax: '#districtDetailsFaxNumber',
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
  ellComponent: {
    tab: '#engLangTab',
    filterButton: '#filters',
    summaryButton: '#engLangSummaryButton',
    headcountCard: '.ell-headcount-card',
    headcountHeader: '.ell-headcount-header',
    headcountColumnData: '.ell-headcount-column-data'
  },
  frenchComponent: {
    tab: '#frenchTab',
    filterButton: '#filters',
    summaryButton: '#frenchSummaryButton',
    headcountReport: '#eligFrenchHeadcounts',
    headcountReportPerSchool: '#eligFrenchHeadcountsPerSchool',
    headcountCard: '.french-headcount-card',
    headcountHeader: '.french-headcount-header',
    headcountColumnData: '.french-headcount-column-data',
    table: '.v-table',
    tableWrapper: '.v-table__wrapper',
    thead: 'thead',
    tbody: 'tbody',
    coreFrenchTotal: ':nth-child(1) > :last-child > div > span',
    coreFrenchSchoolAged: ':nth-child(2) > td:nth-child(18) > div > span',
    earlyFrenchTotal: ':nth-child(4) > :last-child > div > span',
    earlyFrenchSchoolAged: ':nth-child(5) > :last-child > div > span',
    allFrenchTotal: ':nth-child(10) > :last-child > div > span',
    allFrenchSchoolAged: ':nth-child(11) > :last-child > div > span',
    allFrenchAdult: ':nth-child(12) > :last-child > .zero-cell'
  },
  fteComponent: {
    tab: '#enrollmentTab',
    filterButton: '#filters',
    summaryButton: '#fteSummaryButton',
    headcountCard: '.enrollment-headcount-card',
    headcountHeader: '.enrollment-headcount-header',
    headcountColumnData: '.enrollment-headcount-column-data',
    table: '.v-table',
    tableWrapper: '.v-table__wrapper',
    schoolAgedHeadcount: ':nth-child(2) > :nth-child(19) > div > span',
    schoolAgedEligibleFTE : ':nth-child(3) > :nth-child(19) > div > span',
    schoolAgedTotal: ':nth-child(4) > :nth-child(19) > div > span',
    adultHeadcount: ':nth-child(6) > :nth-child(19) > .zero-cell',
    adultEligibleFTE: ':nth-child(7) > :nth-child(19) > .zero-cell',
    adultTotal: ':nth-child(8) > :nth-child(19) > .zero-cell',
    allHeadcount: ':nth-child(10) > :nth-child(19) > div > span',
    allEligibleFTE: ':nth-child(11) > :nth-child(19) > div > span',
    allTotal: ':nth-child(12) > :nth-child(19) > div > span',
    districtSchoolAgedHeadcount: ':nth-child(2) > :nth-child(19) > div > span',
    districtSchoolAgedEligibleFTE : ':nth-child(3) > :nth-child(19) > div > span',
    districtSchoolAgedTotal: ':nth-child(4) > :nth-child(19) > div > span',
    districtAdultHeadcount: ':nth-child(6) > :nth-child(19) > .zero-cell',
    districtAdultEligibleFTE: ':nth-child(7) > :nth-child(19) > .zero-cell',
    districtAdultTotal: ':nth-child(8) > :nth-child(19) > .zero-cell',
    districtAllHeadcount: ':nth-child(10) > :nth-child(19) > div > span',
    districtAllEligibleFTE: ':nth-child(11) > :nth-child(19) > div > span',
    districtAllTotal: ':nth-child(12) > :nth-child(19) > div > span',
    school1Headcount: ':nth-child(2) > :nth-child(19) > div > span',
    school1FTETotal: ':nth-child(3) > :nth-child(19) > div > span',
    school2Headcount: ':nth-child(5) > :nth-child(19) > div > span',
    school2FTETotal: ':nth-child(6) > :nth-child(19) > div > span',
    allSchoolHeadcount: ':nth-child(8) > :nth-child(19) > div > span',
    allSchoolFTETotal: ':nth-child(9) > :nth-child(19) > div > span',
    availableReports: '#reports'
  },
  refugeeComponent: {
    filterButton: '#filters',
    refugeeHeadcountReportPerSchool: '#eligRefugeePerSchool',
    summaryButton: '#refugeeSummaryButton',
    pdfDownloadLink: '#downloadReport',
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
    filterButton: '#filters',
    summaryButton: '#indProgSummaryButton',
    headcountReport: '#eligIndigenousSupportHeadcount',
    headcountReportPerSchool: '#eligIndigenousSupportHeadcountPerSchool',
    bandHeadcountReport: '#eligBandOfResidenceHeadcount',
    bandHeadcountReportPerSchool: '#eligBandOfResidenceHeadcountPerSchool',
    headcountCard: '.indigenous-headcount-card',
    headcountHeader: '.indigenous-headcount-header',
    headcountColumnData: '.indigenous-headcount-column-data',
    reportDropdown: '#reports'
  },
  provincialDuplicatesComponent : {
    enrollmentDuplicatesTab: 'button[value="Enrollment Duplicates"]',
    programDuplicatesTab: 'button[value="Program Duplicates"]',
    nonAllowableEnrollmentTab: '#nonAllowableenrollmentButton',
    nonAllowableProgramTab: '#nonAllowableprogramButton',
    resolvedEnrollmentTab: '#resolvedenrollmentButton',
    resolvedProgramTab: '#resolvedprogramButton',
    allowableTab: '#allowableButton',
  },
  filters: {
    applyPenLocalIdNameFilterBtn: '#applyPenLocalIdNameFilter',
    clearFilter: '#clear-filter',
    studentType: '#studentType', 
    warnings: '#warnings',
    cancelBtn: '#cancel',
    fte: '#fte',
    fundingtype: '#fundingtype',
    grade: '#grade',
    isSchoolAged: '#isSchoolAged',
    isAdult: '#isAdult',
    fteEq0: '#fteEq0',
    fteGt0: '#fteGt0',
    fteLt1: '#fteLt1',
    grade8: '#grade8',
    grade9: '#grade9',
    hasIndiAncestry: '#hasIndiAncestry',
    hasBandCode: '#hasBandCode',
    bandCodeSelector: '#bandCode',
    bandCodeAutoCompleteSelector: 'div.v-list-item__content > div > span.v-autocomplete__mask',
    hasSupportBlocks: '#hasSupportBlocks',
    noSupportBlocks: '#noSupportBlocks',
    career40: '#career40',
    career41: '#career41',
    codeXH: '#codeXH',
    codeXA: '#codeXA',
    refugeeFundingEligible: '#refugeeFundingEligible',
    refugeeFundingNotEligible: '#refugeeFundingNotEligible'
  },
  independent1601: {
    stepper: '.v-stepper-header',
    steps: {
      step1: '#step-1 .v-stepper-item__title',
      step2: '#step-2 .v-stepper-item__title',
      step3: '#step-3 .v-stepper-item__title',
      step4: '#step-4 .v-stepper-item__title',
      step5: '#step-5 .v-stepper-item__title',
      step6: '#step-6 .v-stepper-item__title',
      step7: '#step-7 .v-stepper-item__title',
      step8: '#step-8 .v-stepper-item__title',
      step9: '#step-9 .v-stepper-item__title',
    },
    verifySchoolDetails: {
      schoolDetails: '.ministryLine',
    },
    verifySchoolContacts: {
      contactName: '.contactName',
      contactEffectiveDate: '#contactEffectiveDate',
      contactEmailBreak: '.contactEmailBreak',
      contactPhoneNumber: '#contactPhoneNumber',
      contactAlternatePhoneNumber: '#contactAlternatePhoneNumber',
    }
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
    generateNewCode: '#doGeneratePrimaryEdxActivationCodeButton',
    lastNameInput: '#newUserLastName',
    newUserButton: '#new-user-button',
    newUserInviteVCard: '#newUserInviteVCard',
    primaryActivationCode: '#primaryEdxActivationCode',
    rolesSelectorBox: '#instituteNewUserRolesListBox',
    rolesSelectorDropdown: '#instituteNewUserRolesSelect',
    sendInviteButton: '#newUserInvitePostBtn',
    toggleGenerateNewCode: '#toggleGenerateNewPrimaryEdxActivationCodeDialogVisibilityButton',
    noActivationCodeBanner: '#no-activation-code-banner'
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
    resolveButton:'#resolveBtn',
    activeTab: '#schoolContactsTab',
  },
  schoolDetails: {
    addAddressButton: '#addAddressButton',
    addWebsiteLink: 'a.editField',
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
    schoolDisplayNameTitle: '#displayName',
    schoolGradesDropdown: '#schoolGrades',
    schoolGradesValue: '#schoolGradesValue',
    schoolMincodeTitle: '#schoolMincodeTitle',
    schoolNameNoSpecialChars: 'div.safe-name',
    subjectHeading: 'h2.subjectHeading'
  },
  schoolList: {
    schoolRow: '.hoverTable'
  },
  sdcDistrictCollection: {
    monitoringStep: {
      checkIcon: '.mdi-check-circle-outline',
      closeIcon: '.mdi-close-circle-outline',
      dataErrorValue: '#dataErrorValue',
      dataInfoWarnValue: '#dataInfoWarnValue',
      dataFundingWarnValue: '#dataFundingWarnValue',
      filters: {
        filtersBtn: '#filters',
        cancelBtn: '#cancel'
      },
      hasUploadedValue: '#hasUploadedValue',
      missingUploadedValue: '#missingUploadedValue',

      monitoringLinkToSdcSchoolCollection: '.linkToSdcSchoolCollection',
      monitoringNextBtn: '#step-2-next-button-district',
      monitoringTable: '#monitoring-table',
      monitoringTableRows: '#monitoring-table tbody tr',
      notSubmittedValue: '#notSubmittedValue',
      schoolNotSubmittedWarning: '#schoolNotSubmittedWarning',
      submittedValue: '#submittedValue'
    }
  },
  sdcDocumentUploadStep: {
    fteTab: '[data-cy="fteTab"]',
    careerTab: '[data-cy="careerTab"]',
    careerTabButton: '[data-cy="Career Programs"]',
    errorBanner: '#headcount-error-banner',
    indigenousReportRows: '[data-cy="indigenous-report-row"]',
    indigenousTab: '[data-cy="indigenousTab"]',
    indigenousTabButton: '[data-cy="Indigenous Students & Support Programs"]',
    ellTab: '[data-cy="ellTab"]',
    ellTabButton: '[data-cy="English Language Learning"]',
    infoNote: 'p.text-medium-emphasis.font-italic',
    spedTab: '[data-cy="spedTab"]',
    spedTabButton: '[data-cy="Inclusive Education"]',
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
    mainSnackBar: '#mainSnackBar',
    mainSnackBarCloseButton: '#mainSnackBar > div > div.v-snackbar__actions > button > span.v-btn__content'
  },
  specialEducationComponent: {
    tab: '#specialEdTab',
    summaryButton: '#specialEdSummaryButton',
    headcountReport: '#eligSpecialEdHeadcount',
    headcountReportPerSchool: '#eligSpecialEdHeadcountPerSchool',
    headcountCard: '.special-ed-headcount-card',
    headcountHeader: '.special-ed-headcount-header',
    headcountColumnData: '.special-ed-headcount-column-data',
    filterButton: '#filters',
  },
  stepThreeTabSlider: {
    careerProgramsButton: 'button[value="Career Programs"]',
    englishLanguageLearningButton: 'button[value="English Language Learning"]',
    frenchProgramsButton: 'button[value="French Programs"]',
    indigenousStudentsButton: 'button[value="Indigenous Students & Support Programs"]',
    specialEducationButton: 'button[value="Inclusive Education"]',
    refugeeButton: 'button[value="Refugee"]'
  },
  studentLevelData: {
    detailsLoadingBar: 'div[class*=\'v-progress-linear--active\']',
    documentUploadButton: '#uploadButton',
    documentReUploadButton: '#uploadAgainButton',
    formHint: 'p.form-hint',
    legalLastNameValidationTextInput: '#legalLastNameValidationTextInput',
    stepOneNextButton: '#step-1-next-button-school',
    stepTwoNextButton: '#step-2-next-button-school',
    stepThreeNextButton: '#step-3-next-button-school',
    stepFourNextButton: '#step-4-next-button-school',
    stepFiveNextButton: '#step-5-next-button-school',
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
    selectedStudentsPaginator: '.v-pagination',
    backToDataIssues: 'div.v-col.v-col-6.mt-1.d-flex.justify-start > a',
    stepThreeSearchField: '#searchInput',
    stepThreeSearchBtn: '#search',
    stepThreeClearBtn: '#clear',
    stepThreeFirstRow: '.v-data-table__tbody > tr:first-child',
    stepThreeStudentsFound: '#studentsFound',
    stepTwoNameFilter: '#legalUsualNameSearch',
    stepTwoPenLocalIdFilter: '#penSearch',
    stepTwoSearchButton: '#searchButton',
    stepTwoTableFirstRow: 'div > div.v-table__wrapper > table > tbody > tr > td:nth-child(4)',
    stepTwoTableAllRows: 'div > div.v-table__wrapper > table > tbody > tr',
    stepTwoClearSearchFilter: '#clear-filter',
    duplicatePenFilter: '#duplicatePenFilter',
    editStudentClearfilter: '#clearFilters',
    stepTwoSearchField: '#searchInput',
    filterButton: '#filters',
    tableResultsSelect: '.v-data-table__tbody > tr > :nth-child(1)',
    remove: '#remove',
    removeConfirm: '#resolveBtn',
    editStudentRow: 'tbody > tr > td:nth-child(5) > div > div > div',
    editStudentRowByPen: 'tbody > tr > td:nth-child(4) > div > span',
    viewStudentCardTitle: '#viewStudentCardTitle',
    fteBanner: '#eligible-fte-banner',
    nativeAncestryIndValidationDropdown: '#nativeAncestryIndValidationDropdown',
    saveEditStudentRecord: '#saveRecord',
    graduatedFlag:'#graduatedFlag',
    adultFlag: '#adultFlag',
    addStudent: '#add',
    legalLastName: '#legalLastName',
    dobPicker: '#dobPicker',
    gender: '#gender',
    enrolledGradeCode: '#enrolledGradeCode',
    nativeAncestryInd: '#nativeAncestryInd',
    schoolFundingCodes: '#schoolFundingCode',
    numberofCourses: '#numberOfCourses',
    studentPen: '#studentPen',
    assignedPen: '#assignedPen',
    assignedPenTooltip: '#assignedPenTooltip',
    cancelButton: '#cancel',
    compareSwitch: '#compare-switch',
    collectionSubmission: '#collection-submission',
    csvDownloadLink: '#studentsFound ~ a',
    pdfDownloadLink: '#downloadReport',
    collectionTypeYear: '#collectionTypeYear'
  },
  userActivationPage: {
    mincodeInput: '#instituteIdentifierTextField',
    primaryTextActivationCodeInput: '#primaryEdxCodeTextField',
    personalActivationCodeInput: '#personalActivationCodeTextField',
    userActivationSubmitButton: '#edxUserActivationSubmitBtn',
    userActivationSnackBar: '.v-snackbar__content',
    userActivationErrorMessageSnackBar: '#user_activation_error_message',
    acceptTermsCheckbox: '#acceptTOU'
  }
};
