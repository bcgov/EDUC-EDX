

/**
 * Tables
 */
export const FTE = Object.freeze(
  {
    tableHeaders: [
      { title: 'select', key: 'select' },
      { key: 'sdcSchoolCollectionStudentStatusCode' },
      { title: 'School', key: 'schoolName' },
      { title: 'FTE', key: 'fte', align: 'start' },
      { title: 'Assigned PEN', key: 'assignedPen', subHeader: { title: 'Local ID', key: 'localID' } },
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: { title: 'Usual Surname, Given (Middle)', key: 'usualName' } },
      { title: 'Adult', key: 'isAdult', subHeader: { title: 'Grad', key: 'isGraduated' } },
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: { title: 'Funding Code', key: 'mappedSchoolFunding' } },
      { title: 'Courses For Grad', key: 'mappedNoOfCourses', subHeader: { title: 'Support Blocks', key: 'supportBlocks' } },
      { title: 'Language Program', key: 'mappedLanguageEnrolledProgram', subHeader: { title: 'Years in ELL', key: 'yearsInELL' } },
      { title: 'Career Program', key: 'mappedCareerProgram', subHeader: { title: 'Career Code', key: 'mappedCareerProgramCode' } },
      { title: 'Indigenous Ancestry', key: 'mappedAncestryIndicator', subHeader: { title: 'Band Code', key: 'mappedBandCode' } },
      { title: 'Indigenous Support Program', key: 'mappedIndigenousEnrolledProgram', subHeader: { title: 'Special Education Category', key: 'mappedSpedCode' } },
    ],
    summaryReport: [
      { title: 'Eligible Enrolment & Eligible FTE', endpoint:'enrollment'},
      { title: 'Grade Enrolment & Eligible per FTE', endpoint:'grade-enrollment'}
    ],
    allowedFilters: {

    }
  }
);

export const FRENCH_PR = Object.freeze(
  {
    defaultFilter: { label: 'FRENCH_PR', description: 'Has French Program' },
    tableHeaders: [
      { title: 'select', key: 'select' },
      { key: 'sdcSchoolCollectionStudentStatusCode' },
      { title: 'School', key: 'schoolName' },
      { title: 'FTE', key: 'fte', align: 'start', subHeader: { title: 'Program Eligible', key: 'frenchProgramEligible' } },
      { title: 'PEN', key: 'studentPen', subHeader: { title: 'Local ID', key: 'localID' } },
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: { title: 'Usual Surname, Given (Middle)', key: 'usualName' } },
      { title: 'Adult', key: 'isAdult', subHeader: { title: 'Grad', key: 'isGraduated' } },
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: { title: 'Funding Code', key: 'mappedSchoolFunding' } },
      { title: 'French Program', key: 'mappedFrenchEnrolledProgram' },
    ],
    summaryReport: [
      {title: 'Eligible French Program Headcount', endpoint: 'french'}, 
      {title: 'Eligible French Program Headcount per School', endpoint: 'french-per-school'}
    ],
    allowedFilters: {
     
    }
  }
);

export const CAREER_PR = Object.freeze(
  {
    defaultFilter: { label: 'CAREER_PR', description: 'Has Career Program' },
    tableHeaders: [
      { title: 'select', key: 'select' },
      { key: 'sdcSchoolCollectionStudentStatusCode' },
      { title: 'School', key: 'schoolName' },
      { title: 'FTE', key: 'fte', align: 'start', subHeader: { title: 'Program Eligible', key: 'careerProgramEligible' } },
      { title: 'PEN', key: 'studentPen', subHeader: { title: 'Local ID', key: 'localID' } },
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: { title: 'Usual Surname, Given (Middle)', key: 'usualName' } },
      { title: 'Adult', key: 'isAdult', subHeader: { title: 'Grad', key: 'isGraduated' } },
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: { title: 'Funding Code', key: 'mappedSchoolFunding' } },
      { title: 'Career Program', key: 'mappedCareerProgram', subHeader: { title: 'Career Code', key: 'mappedCareerProgramCode' } },
    ],
    summaryReport: [
     
    ],
    allowedFilters: {
   
    }
  }
);

export const INDSUPPORT_PR = Object.freeze(
  {
    defaultFilter: { label: 'INDSUPPORT_PR', description: 'Has Indigenous Support Program' },
    tableHeaders: [
      { title: 'select', key: 'select' },
      { key: 'sdcSchoolCollectionStudentStatusCode' },
      { title: 'School', key: 'schoolName' },
      { title: 'FTE', key: 'fte', align: 'start', subHeader: { title: 'Program Eligible', key: 'indProgramEligible' } },
      { title: 'PEN', key: 'studentPen', subHeader: { title: 'Local ID', key: 'localID' } },
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: { title: 'Usual Surname, Given (Middle)', key: 'usualName' } },
      { title: 'Adult', key: 'isAdult', subHeader: { title: 'Grad', key: 'isGraduated' } },
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: { title: 'Funding Code', key: 'mappedSchoolFunding' } },
      { title: 'Indigenous Ancestry', key: 'mappedAncestryIndicator', subHeader: { title: 'Band Code', key: 'mappedBandCode' } },
      { title: 'Indigenous Support Program', key: 'mappedIndigenousEnrolledProgram' },
    ],
    summaryReport: [
     
    ],
    allowedFilters: {

    }
  }
);

export const SPECIALED_PR = Object.freeze(
  {
    defaultFilter: { label: 'SPECIALED_PR', description: 'Has Special Education Category' },
    tableHeaders: [
      { title: 'select', key: 'select' },
      { key: 'sdcSchoolCollectionStudentStatusCode' },
      { title: 'School', key: 'schoolName' },
      { title: 'FTE', key: 'fte', align: 'start', subHeader: { title: 'Program Eligible', key: 'spedProgramEligible' } },
      { title: 'PEN', key: 'studentPen', subHeader: { title: 'Local ID', key: 'localID' } },
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: { title: 'Usual Surname, Given (Middle)', key: 'usualName' } },
      { title: 'Adult', key: 'isAdult', subHeader: { title: 'Grad', key: 'isGraduated' } },
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: { title: 'Funding Code', key: 'mappedSchoolFunding' } },
      { title: 'Special Education Category', key: 'mappedSpedCode' },
    ],
    summaryReport: [
      { title: 'Eligible Special Education Headcount', endpoint:'special-ed'}, 
      { title: 'Eligible Special Education Headcount per School', endpoint:'special-ed-per-school'}
    ],
    allowedFilters: {
    }
  }
);

export const ELL = Object.freeze(
  {
    defaultFilter: { label: 'ELL_PR', description: 'English Language Learner' },
    tableHeaders: [
      { title: 'select', key: 'select' },
      { key: 'sdcSchoolCollectionStudentStatusCode' },
      { title: 'School', key: 'schoolName' },
      { title: 'FTE', key: 'fte', align: 'start', subHeader: { title: 'Program Eligible', key: 'ellProgramEligible' } },
      { title: 'PEN', key: 'studentPen', subHeader: { title: 'Local ID', key: 'localID' } },
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: { title: 'Usual Surname, Given (Middle)', key: 'usualName' } },
      { title: 'Adult', key: 'isAdult', subHeader: { title: 'Grad', key: 'isGraduated' } },
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: { title: 'Funding Code', key: 'mappedSchoolFunding' } },
      { title: 'Language Program', key: 'mappedEllEnrolledProgram', subHeader: { title: 'Years in ELL', key: 'yearsInELL' } },
    ],
    summaryReport: [
     
    ],
    allowedFilters: {
    }
  }
);

export const REFUGEE = Object.freeze(
  {
    defaultFilter: { label: 'REFUGEE', description: '16-Newcomer Refugee' },
    tableHeaders: [
      { title: 'select', key: 'select' },
      { key: 'sdcSchoolCollectionStudentStatusCode' },
      { title: 'School', key: 'schoolName' },
      { title: 'FTE', key: 'fte', align: 'start', subHeader: { title: 'Funding Eligible', key: 'fundingEligible' } },
      { title: 'PEN', key: 'studentPen', subHeader: { title: 'Local ID', key: 'localID' } },
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: { title: 'Usual Surname, Given (Middle)', key: 'usualName' } },
      { title: 'Adult', key: 'isAdult', subHeader: { title: 'Grad', key: 'isGraduated' } },
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: { title: 'Funding Code', key: 'mappedSchoolFunding' } }
    ],
    summaryReport: [

    ],
    allowedFilters: {

    }
  }
);

export const MONITORING = Object.freeze(
  {
    allowedFilters: {
      uploadDataFilter: {
        heading: 'Upload Data',
        id: 'uploadDataFilter',
        multiple: false,
        key: 'uploadDataFilter',
        filterOptions: [
          {
            title: '1701 Data Uploaded',
            id: 'uploadDate',
            value: 'uploadDate'
          },
          {
            title: '1701 Data NOT Uploaded',
            id: 'notUploadDate',
            value: 'notUploadDate'
          }
        ]
      },
      issuesFilter: {
        heading: 'Errors & Warnings',
        id: 'issuesFilter',
        multiple: true,
        key: 'issuesFilter',
        filterOptions: [
          {
            title: 'Errors',
            id: 'errors',
            value: 'errors'
          },
          {
            title: 'Info Warnings',
            id: 'infoWarnings',
            value: 'infoWarnings'
          },
          {
            title: 'Funding Warnings',
            id: 'fundingWarnings',
            value: 'fundingWarnings'
          }
        ]
      },
      detailsFilter: {
        heading: 'School Details Confirmed',
        id: 'detailsFilter',
        multiple: false,
        key: 'detailsFilter',
        filterOptions: [
          {
            title: 'School Details Confirmed',
            id: 'detailsConfirmed',
            value: 'detailsConfirmed'
          },
          {
            title: 'School Details NOT Confirmed',
            id: 'notDetailsConfirmed',
            value: 'notDetailsConfirmed'
          }
        ]
      },
      contactsFilter: {
        heading: 'School Contacts Confirmed',
        id: 'contactsFilter',
        multiple: false,
        key: 'contactsFilter',
        filterOptions: [
          {
            title: 'School Contacts Confirmed',
            id: 'contactsConfirmed',
            value: 'contactsConfirmed'
          },
          {
            title: 'School Contacts NOT Confirmed',
            id: 'notContactsConfirmed',
            value: 'notContactsConfirmed'
          }
        ]
      },
      submittedFilter: {
        heading: 'Submitted to District',
        id: 'submittedFilter',
        multiple: false,
        key: 'submittedFilter',
        filterOptions: [
          {
            title: 'Submitted to District',
            id: 'submittedToDistrict',
            value: 'submittedToDistrict'
          },
          {
            title: 'NOT Submitted to District',
            id: 'notSubmittedToDistrict',
            value: 'notSubmittedToDistrict'
          }
        ]
      }
    }
  }
);
