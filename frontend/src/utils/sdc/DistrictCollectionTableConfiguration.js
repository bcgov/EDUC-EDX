

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
      { title: 'Language Program', key: 'mappedLanguageEnrolledProgram', subHeader: { title: 'Years in ELL', key: 'yearsInEll' } },
      { title: 'Career Program', key: 'careerProgram', subHeader: { title: 'Career Code', key: 'careerProgramCode' } },
      { title: 'Indigenous Ancestry', key: 'mappedAncestryIndicator', subHeader: { title: 'Band Code', key: 'mappedBandCode' } },
      { title: 'Indigenous Support Program', key: 'mappedIndigenousEnrolledProgram', subHeader: { title: 'Special Education Category', key: 'mappedSpedCode' } },
    ],
    summaryReport: [
     
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
      { title: 'Career Program', key: 'careerProgram', subHeader: { title: 'Career Code', key: 'careerProgramCode' } },
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
      { title: 'Language Program', key: 'mappedEllEnrolledProgram', subHeader: { title: 'Years in ELL', key: 'yearsInEll' } },
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