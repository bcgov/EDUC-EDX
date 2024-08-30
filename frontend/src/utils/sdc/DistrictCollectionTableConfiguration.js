/**
 * Filters
 */

import {
  ANCESTRY_FILTER,
  BAND_FILTER,
  CAREER_CODE_FILTER, CAREER_FUNDING_FILTER,
  CAREER_PROGRAM_FILTER,
  COURSE_FILTER,
  ELL_FUNDING_FILTER,
  ELL_YEARS_FILTER,
  ENGLISH_PROGRAMS_FILTER,
  FRENCH_FUNDING_FILTER,
  FRENCH_PROGRAMS_FILTER,
  FTE_FILTER,
  FTE_ZERO_FILTER,
  FUNDING_TYPE_FILTER,
  GRADE_FILTER,
  INDIGENOUS_FUNDING_FILTER,
  INDIGENOUS_PROGRAM_FILTER,
  REFUGEE_FUNDING_FILTER,
  SPED_FILTER,
  SPED_FUNDING_FILTER,
  STUDENT_TYPE_FILTER,
  SUPPORT_BLOCKS_FILTER,
  WARNING_FILTER
} from './TableConfiguration';

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
      { title: 'Career Program', key: 'mappedCareerProgram', subHeader: { title: 'Career Code', key: 'mappedCareerProgramCode' } },
      { title: 'Indigenous Ancestry', key: 'mappedAncestryIndicator', subHeader: { title: 'Band Code', key: 'mappedBandCode' } },
      { title: 'Indigenous Support Program', key: 'mappedIndigenousEnrolledProgram', subHeader: { title: 'Inclusive Education Category', key: 'mappedSpedCode' } },
    ],
    summaryReport: [
      { tableID: 'eligEnrolmentFTE', title: 'Eligible Enrolment & Eligible FTE', endpoint:'enrollment'},
      { tableID: 'eligEnrolmentFTEPerSchool', title: 'Grade Enrolment & FTE per School', endpoint:'grade-enrollment'}
    ],
    allowedFilters: {
      studentType: STUDENT_TYPE_FILTER,
      fte: FTE_FILTER,
      grade: GRADE_FILTER,
      fundingType: FUNDING_TYPE_FILTER,
      warnings: WARNING_FILTER,
      courses: COURSE_FILTER,
      support: SUPPORT_BLOCKS_FILTER,
      fteZero: FTE_ZERO_FILTER,
      frenchProgram: {
        ...FRENCH_PROGRAMS_FILTER,
        filterOptions: [
          ...FRENCH_PROGRAMS_FILTER.filterOptions,
          {
            title: '05 - Programme Francophone',
            id: 'french05',
            value: '05'
          },
          {
            title: 'No French Programs',
            id: 'noFrenchProgram',
            value: 'noFrenchPrograms'
          }
        ]
      },
      englishProgram: ENGLISH_PROGRAMS_FILTER,
      ellYears: ELL_YEARS_FILTER,
      careerPrograms: {
        ...CAREER_PROGRAM_FILTER,
        filterOptions: [
          ...CAREER_PROGRAM_FILTER.filterOptions,
          {
            title: 'No Career Programs',
            id: 'noCareerProgram',
            value: 'noCareerPrograms'
          }
        ]
      },
      careerCode: {
        ...CAREER_CODE_FILTER,
        filterOptions: [
          ...CAREER_CODE_FILTER.filterOptions,
          {
            title: 'No Career Code',
            id: 'noCareerCode',
            value: 'noCareerCodes'
          }
        ]
      },
      indigenousPrograms: {
        ...INDIGENOUS_PROGRAM_FILTER,
        filterOptions: [
          ...INDIGENOUS_PROGRAM_FILTER.filterOptions,
          {
            title: 'No Indigenous Support Programs',
            id: 'noIndigenousPrograms',
            value: 'noIndigenousPrograms'
          }
        ]
      },
      bandCode: BAND_FILTER,
      ancestry: ANCESTRY_FILTER,
      sped: {
        ...SPED_FILTER,
        filterOptions: [
          ...SPED_FILTER.filterOptions,
          {
            title: 'No Inclusive Education Category',
            id: 'noSpedCategory',
            value: 'noSpedCode'
          }
        ]
      }
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
      {tableID: 'eligFrenchHeadcounts', title: 'Eligible French Program Headcount', endpoint: 'french'},
      {tableID: 'eligFrenchHeadcountsPerSchool', title: 'Eligible French Program Headcount per School', endpoint: 'french-per-school'}
    ],
    allowedFilters: {
      studentType: STUDENT_TYPE_FILTER,
      fte: FTE_FILTER,
      grade: GRADE_FILTER,
      fundingType: FUNDING_TYPE_FILTER,
      frenchProgram: {
        ...FRENCH_PROGRAMS_FILTER,
        filterOptions: [
          ...FRENCH_PROGRAMS_FILTER.filterOptions,
          {
            title: '05 - Programme Francophone',
            id: 'french05',
            value: '05'
          }
        ]
      },
      frenchFunding: FRENCH_FUNDING_FILTER,
      warnings: WARNING_FILTER
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
      { tableID: 'eligEnrolmentCareerProgForDistrict', title: 'Eligible Career Program Headcount for District', endpoint:'career'},
      { tableID: 'eligEnrolmentCareerProgPerSchool', title: 'Eligible Career Program Headcount per School', endpoint:'career-per-school'}
    ],
    allowedFilters: {
      studentType: STUDENT_TYPE_FILTER,
      fte: FTE_FILTER,
      grade: GRADE_FILTER,
      fundingType: FUNDING_TYPE_FILTER,
      careerPrograms: CAREER_PROGRAM_FILTER,
      careerCode: CAREER_CODE_FILTER,
      careerProgramsFunding: CAREER_FUNDING_FILTER,
      warnings: WARNING_FILTER
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
      { tableID: 'eligIndigenousSupportHeadcount', title: 'Eligible Indigenous Support Program Headcount', endpoint:'indigenous'},
      { tableID: 'eligIndigenousSupportHeadcountPerSchool', title: 'Eligible Indigenous Support Program Headcount per School', endpoint:'indigenous-per-school'},
      { tableID: 'eligBandOfResidenceHeadcount', title: 'Eligible Band of Residence Headcount', endpoint:'band-codes'},
      { tableID: 'eligBandOfResidenceHeadcountPerSchool', title: 'Eligible Band of Residence Headcount per School', endpoint:'band-codes-per-school'}
    ],
    allowedFilters: {
      studentType: STUDENT_TYPE_FILTER,
      fte: FTE_FILTER,
      grade: GRADE_FILTER,
      fundingType: FUNDING_TYPE_FILTER,
      indigenousPrograms: INDIGENOUS_PROGRAM_FILTER,
      bandCode: BAND_FILTER,
      ancestry: ANCESTRY_FILTER,
      indigenousProgramsFunding: INDIGENOUS_FUNDING_FILTER,
      warnings: WARNING_FILTER
    }
  }
);

export const SPECIALED_PR = Object.freeze(
  {
    defaultFilter: { label: 'SPECIALED_PR', description: 'Has Inclusive Education Category' },
    tableHeaders: [
      { title: 'select', key: 'select' },
      { key: 'sdcSchoolCollectionStudentStatusCode' },
      { title: 'School', key: 'schoolName' },
      { title: 'FTE', key: 'fte', align: 'start', subHeader: { title: 'Program Eligible', key: 'spedProgramEligible' } },
      { title: 'PEN', key: 'studentPen', subHeader: { title: 'Local ID', key: 'localID' } },
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: { title: 'Usual Surname, Given (Middle)', key: 'usualName' } },
      { title: 'Adult', key: 'isAdult', subHeader: { title: 'Grad', key: 'isGraduated' } },
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: { title: 'Funding Code', key: 'mappedSchoolFunding' } },
      { title: 'Inclusive Education Category', key: 'mappedSpedCode' },
    ],
    summaryReport: [
      { tableID: 'eligSpecialEdHeadcount', title: 'Eligible Inclusive Education Headcount', endpoint:'special-ed'},
      { tableID: 'eligSpecialEdHeadcountPerSchool', title: 'Eligible Inclusive Education Headcount per School', endpoint:'special-ed-per-school'},
      { tableID: 'eligSpecialEdHeadcountCatPerSchool', title: 'Eligible Inclusive Education Category Headcount per School', endpoint:'special-ed-cat-per-school'}
    ],
    allowedFilters: {
      studentType: STUDENT_TYPE_FILTER,
      fte: FTE_FILTER,
      grade: GRADE_FILTER,
      fundingType: FUNDING_TYPE_FILTER,
      sped: SPED_FILTER,
      spedFunding: SPED_FUNDING_FILTER,
      warnings: WARNING_FILTER
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
      { tableID: 'eligELLHeadcountForDistrict', title: 'English Language Learners Headcount for District', endpoint:'ell'},
      { tableID: 'eligELLHeadcountPerSchool', title: 'English Language Learners Headcount per school', endpoint:'ell-per-school'}
    ],
    allowedFilters: {
      studentType: STUDENT_TYPE_FILTER,
      fte: FTE_FILTER,
      grade: GRADE_FILTER,
      fundingType: FUNDING_TYPE_FILTER,
      ellYears: ELL_YEARS_FILTER,
      ellFunding: ELL_FUNDING_FILTER,
      warnings: WARNING_FILTER
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
      { title: 'FTE', key: 'fte', align: 'start', subHeader: { title: 'Funding Eligible', key: 'fundingEligibleRefugee' } },
      { title: 'PEN', key: 'studentPen', subHeader: { title: 'Local ID', key: 'localID' } },
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: { title: 'Usual Surname, Given (Middle)', key: 'usualName' } },
      { title: 'Adult', key: 'isAdult', subHeader: { title: 'Grad', key: 'isGraduated' } },
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: { title: 'Funding Code', key: 'mappedSchoolFunding' } }
    ],
    summaryReport: [
      { tableID: 'eligRefugeePerSchool', title: 'Eligible Newcomer Refugees by School', endpoint:'refugee-per-school'},
    ],
    allowedFilters: {
      studentType: STUDENT_TYPE_FILTER,
      fte: FTE_FILTER,
      grade: GRADE_FILTER,
      refugeeFunding: REFUGEE_FUNDING_FILTER,
      warnings: WARNING_FILTER
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
            title: '1701 Data Not Uploaded',
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
            title: 'Not Submitted to District',
            id: 'notSubmittedToDistrict',
            value: 'notSubmittedToDistrict'
          }
        ]
      }
    }
  }
);

export const DISTRICT_STUDENT_DIFFERENCES = Object.freeze(
  {
    tableHeaders: [
      { title: '', key: 'type' },
      { title: 'Local ID', key: 'localID', subHeader: { title: 'Birthdate', key: 'dob' } },
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: { title: 'Usual Surname, Given (Middle)', key: 'usualName' } },
      { title: 'Gender', key: 'gender', subHeader: { title: 'Postal Code', key: 'postalCode' } },
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: { title: 'Funding Code', key: 'mappedSchoolFunding' } },
      { title: 'Language Program', key: 'mappedLanguageEnrolledProgram', subHeader: { title: 'Years in ELL', key: 'yearsInEll' } },
      { title: 'Career Program', key: 'mappedCareerProgram', subHeader: { title: 'Career Code', key: 'mappedCareerProgramCode' } },
      { title: 'Indigenous Ancestry', key: 'mappedAncestryIndicator', subHeader: { title: 'Band Code', key: 'mappedBandCode' } },
      { title: 'Indigenous Support Program', key: 'mappedIndigenousEnrolledProgram', subHeader: { title: 'Inclusive Education Category', key: 'mappedSpedCode' } },
      { title: 'Courses For Grad', key: 'mappedNoOfCourses', subHeader: { title: 'Support Blocks', key: 'supportBlocks' } },
      { title: 'Other Courses', key: 'otherCourses' }
    ],
    allowedFilters: {
      studentType: STUDENT_TYPE_FILTER,
      fte: FTE_FILTER,
      grade: GRADE_FILTER,
      fundingType: FUNDING_TYPE_FILTER,
      warnings: WARNING_FILTER,
      courses: COURSE_FILTER,
      support: SUPPORT_BLOCKS_FILTER,
      fteZero: FTE_ZERO_FILTER,
      frenchProgram: {
        ...FRENCH_PROGRAMS_FILTER,
        filterOptions: [
          ...FRENCH_PROGRAMS_FILTER.filterOptions,
          {
            title: '05 - Programme Francophone',
            id: 'french05',
            value: '05'
          },
          {
            title: 'No French Programs',
            id: 'noFrenchProgram',
            value: 'noFrenchPrograms'
          }
        ]
      },
      englishProgram: ENGLISH_PROGRAMS_FILTER,
      ellYears: ELL_YEARS_FILTER,
      careerPrograms: {
        ...CAREER_PROGRAM_FILTER,
        filterOptions: [
          ...CAREER_PROGRAM_FILTER.filterOptions,
          {
            title: 'No Career Programs',
            id: 'noCareerProgram',
            value: 'noCareerPrograms'
          }
        ]
      },
      careerCode: {
        ...CAREER_CODE_FILTER,
        filterOptions: [
          ...CAREER_CODE_FILTER.filterOptions,
          {
            title: 'No Career Code',
            id: 'noCareerCode',
            value: 'noCareerCodes'
          }
        ]
      },
      indigenousPrograms: {
        ...INDIGENOUS_PROGRAM_FILTER,
        filterOptions: [
          ...INDIGENOUS_PROGRAM_FILTER.filterOptions,
          {
            title: 'No Indigenous Support Programs',
            id: 'noIndigenousPrograms',
            value: 'noIndigenousPrograms'
          }
        ]
      },
      bandCode: BAND_FILTER,
      ancestry: ANCESTRY_FILTER,
      sped: {
        ...SPED_FILTER,
        filterOptions: [
          ...SPED_FILTER.filterOptions,
          {
            title: 'No Inclusive Education Category',
            id: 'noSpedCategory',
            value: 'noSpedCode'
          }
        ]
      }
    }
  }
);

export const SCHOOL_STUDENT_DIFFERENCES = Object.freeze(
  {
    tableHeaders: [
      { title: '', key: 'type' },
      { title: 'Local ID', key: 'localID', subHeader: { title: 'Birthdate', key: 'dob' } },
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: { title: 'Usual Surname, Given (Middle)', key: 'usualName' } },
      { title: 'Gender', key: 'gender', subHeader: { title: 'Postal Code', key: 'postalCode' } },
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: { title: 'Funding Code', key: 'mappedSchoolFunding' } },
      { title: 'Language Program', key: 'mappedLanguageEnrolledProgram', subHeader: { title: 'Years in ELL', key: 'yearsInEll' } },
      { title: 'Career Program', key: 'mappedCareerProgram', subHeader: { title: 'Career Code', key: 'mappedCareerProgramCode' } },
      { title: 'Indigenous Ancestry', key: 'mappedAncestryIndicator', subHeader: { title: 'Band Code', key: 'mappedBandCode' } },
      { title: 'Indigenous Support Program', key: 'mappedIndigenousEnrolledProgram', subHeader: { title: 'Inclusive Education Category', key: 'mappedSpedCode' } },
      { title: 'Courses For Grad', key: 'mappedNoOfCourses', subHeader: { title: 'Support Blocks', key: 'supportBlocks' } },
      { title: 'Other Courses', key: 'otherCourses' }
    ],
    allowedFilters: {
      studentType: STUDENT_TYPE_FILTER,
      fte: FTE_FILTER,
      grade: GRADE_FILTER,
      fundingType: FUNDING_TYPE_FILTER,
      warnings: WARNING_FILTER,
      courses: COURSE_FILTER,
      support: SUPPORT_BLOCKS_FILTER,
      fteZero: FTE_ZERO_FILTER,
      frenchProgram: {
        ...FRENCH_PROGRAMS_FILTER,
        filterOptions: [
          ...FRENCH_PROGRAMS_FILTER.filterOptions,
          {
            title: '05 - Programme Francophone',
            id: 'french05',
            value: '05'
          },
          {
            title: 'No French Programs',
            id: 'noFrenchProgram',
            value: 'noFrenchPrograms'
          }
        ]
      },
      englishProgram: ENGLISH_PROGRAMS_FILTER,
      ellYears: ELL_YEARS_FILTER,
      careerPrograms: {
        ...CAREER_PROGRAM_FILTER,
        filterOptions: [
          ...CAREER_PROGRAM_FILTER.filterOptions,
          {
            title: 'No Career Programs',
            id: 'noCareerProgram',
            value: 'noCareerPrograms'
          }
        ]
      },
      careerCode: {
        ...CAREER_CODE_FILTER,
        filterOptions: [
          ...CAREER_CODE_FILTER.filterOptions,
          {
            title: 'No Career Code',
            id: 'noCareerCode',
            value: 'noCareerCodes'
          }
        ]
      },
      indigenousPrograms: {
        ...INDIGENOUS_PROGRAM_FILTER,
        filterOptions: [
          ...INDIGENOUS_PROGRAM_FILTER.filterOptions,
          {
            title: 'No Indigenous Support Programs',
            id: 'noIndigenousPrograms',
            value: 'noIndigenousPrograms'
          }
        ]
      },
      bandCode: BAND_FILTER,
      ancestry: ANCESTRY_FILTER,
      sped: {
        ...SPED_FILTER,
        filterOptions: [
          ...SPED_FILTER.filterOptions,
          {
            title: 'No Inclusive Education Category',
            id: 'noSpedCategory',
            value: 'noSpedCode'
          }
        ]
      }
    }
  }
);

export const IN_DISTRICT_DUPLICATES = Object.freeze(
  {
    nonAllowableTableHeaders: [
      { title: 'School', key: 'schoolName' },
      { title: 'Local ID', key: 'localID', subHeader: { title: 'Birthdate', key: 'dob' } },
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: { title: 'Usual Surname, Given (Middle)', key: 'usualName' } },
      { title: 'Adult', key: 'isAdult', subHeader: { title: 'Grad', key: 'isGraduated' } },
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: { title: 'Funding Code', key: 'mappedSchoolFunding' } },
      { title: 'Courses For Grad', key: 'mappedNoOfCourses', subHeader: { title: 'Support Blocks', key: 'supportBlocks' } },
      { title: 'Language Program', key: 'mappedLanguageEnrolledProgram', subHeader: { title: 'Years in ELL', key: 'yearsInEll' } },
      { title: 'Career Program', key: 'mappedCareerProgram', subHeader: { title: 'Career Code', key: 'mappedCareerProgramCode' } },
      { title: 'Indigenous Ancestry', key: 'mappedAncestryIndicator', subHeader: { title: 'Band Code', key: 'mappedBandCode' } },
      { title: 'Indigenous Support Program', key: 'mappedIndigenousEnrolledProgram', subHeader: { title: 'Inclusive Education Category', key: 'mappedSpedCode' } },
      { title: 'Resolution', key: 'resolution' },
    ],
    allowableTableHeaders: [
      { title: 'School', key: 'schoolName' },
      { title: 'Local ID', key: 'localID', subHeader: { title: 'Birthdate', key: 'dob' } },
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: { title: 'Usual Surname, Given (Middle)', key: 'usualName' } },
      { title: 'Adult', key: 'isAdult', subHeader: { title: 'Grad', key: 'isGraduated' } },
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: { title: 'Funding Code', key: 'mappedSchoolFunding' } },
      { title: 'Courses For Grad', key: 'mappedNoOfCourses', subHeader: { title: 'Support Blocks', key: 'supportBlocks' } },
      { title: 'Language Program', key: 'mappedLanguageEnrolledProgram', subHeader: { title: 'Years in ELL', key: 'yearsInEll' } },
      { title: 'Career Program', key: 'mappedCareerProgram', subHeader: { title: 'Career Code', key: 'mappedCareerProgramCode' } },
      { title: 'Indigenous Ancestry', key: 'mappedAncestryIndicator', subHeader: { title: 'Band Code', key: 'mappedBandCode' } },
      { title: 'Indigenous Support Program', key: 'mappedIndigenousEnrolledProgram', subHeader: { title: 'Inclusive Education Category', key: 'mappedSpedCode' } },
    ],
    resolvedTableHeaders: [
      { title: 'School', key: 'schoolName' },
      { title: 'Local ID', key: 'localID', subHeader: { title: 'Birthdate', key: 'dob' } },
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: { title: 'Usual Surname, Given (Middle)', key: 'usualName' } },
      { title: 'Adult', key: 'isAdult', subHeader: { title: 'Grad', key: 'isGraduated' } },
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: { title: 'Funding Code', key: 'mappedSchoolFunding' } },
      { title: 'Courses For Grad', key: 'mappedNoOfCourses', subHeader: { title: 'Support Blocks', key: 'supportBlocks' } },
      { title: 'Language Program', key: 'mappedLanguageEnrolledProgram', subHeader: { title: 'Years in ELL', key: 'yearsInEll' } },
      { title: 'Career Program', key: 'mappedCareerProgram', subHeader: { title: 'Career Code', key: 'mappedCareerProgramCode' } },
      { title: 'Indigenous Ancestry', key: 'mappedAncestryIndicator', subHeader: { title: 'Band Code', key: 'mappedBandCode' } },
      { title: 'Indigenous Support Program', key: 'mappedIndigenousEnrolledProgram', subHeader: { title: 'Inclusive Education Category', key: 'mappedSpedCode' } },
      { title: 'Resolution', key: 'resolution' },
    ],
    resolvedProgramDuplicateTableHeaders: [
      { title: 'School', key: 'schoolName' },
      { title: 'Local ID', key: 'localID', subHeader: { title: 'Birthdate', key: 'dob' } },
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: { title: 'Usual Surname, Given (Middle)', key: 'usualName' } },
      { title: 'Adult', key: 'isAdult', subHeader: { title: 'Grad', key: 'isGraduated' } },
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: { title: 'Funding Code', key: 'mappedSchoolFunding' } },
      { title: 'Courses For Grad', key: 'mappedNoOfCourses', subHeader: { title: 'Support Blocks', key: 'supportBlocks' } },
      { title: 'Language Program', key: 'mappedLanguageEnrolledProgram', subHeader: { title: 'Years in ELL', key: 'yearsInEll' } },
      { title: 'Career Program', key: 'mappedCareerProgram', subHeader: { title: 'Career Code', key: 'mappedCareerProgramCode' } },
      { title: 'Indigenous Ancestry', key: 'mappedAncestryIndicator', subHeader: { title: 'Band Code', key: 'mappedBandCode' } },
      { title: 'Indigenous Support Program', key: 'mappedIndigenousEnrolledProgram', subHeader: { title: 'Inclusive Education Category', key: 'mappedSpedCode' } }
    ],
  }
);

export const DISTRICT_PROVINCIAL_DUPLICATES = Object.freeze(
  {
    nonAllowableTableHeaders: [
      { title: 'District', key: 'districtName' },
      { title: 'School', key: 'schoolName' },
      { title: 'Local ID', key: 'localID', subHeader: { title: 'Birthdate', key: 'dob' } },
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: { title: 'Usual Surname, Given (Middle)', key: 'usualName' } },
      { title: 'Adult', key: 'isAdult', subHeader: { title: 'Grad', key: 'isGraduated' } },
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: { title: 'Funding Code', key: 'mappedSchoolFunding' } },
      { title: 'Courses For Grad', key: 'mappedNoOfCourses', subHeader: { title: 'Support Blocks', key: 'supportBlocks' } },
      { title: 'Language Program', key: 'mappedLanguageEnrolledProgram', subHeader: { title: 'Years in ELL', key: 'yearsInEll' } },
      { title: 'Career Program', key: 'mappedCareerProgram', subHeader: { title: 'Career Code', key: 'mappedCareerProgramCode' } },
      { title: 'Indigenous Ancestry', key: 'mappedAncestryIndicator', subHeader: { title: 'Band Code', key: 'mappedBandCode' } },
      { title: 'Indigenous Support Program', key: 'mappedIndigenousEnrolledProgram', subHeader: { title: 'Inclusive Education Category', key: 'mappedSpedCode' } },
      { title: 'FTE', key: 'fte' },
      { title: 'Resolution', key: 'resolution' },
    ],
    allowableTableHeaders: [
      { title: 'District', key: 'districtName' },
      { title: 'School', key: 'schoolName' },
      { title: 'Local ID', key: 'localID', subHeader: { title: 'Birthdate', key: 'dob' } },
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: { title: 'Usual Surname, Given (Middle)', key: 'usualName' } },
      { title: 'Adult', key: 'isAdult', subHeader: { title: 'Grad', key: 'isGraduated' } },
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: { title: 'Funding Code', key: 'mappedSchoolFunding' } },
      { title: 'Courses For Grad', key: 'mappedNoOfCourses', subHeader: { title: 'Support Blocks', key: 'supportBlocks' } },
      { title: 'Language Program', key: 'mappedLanguageEnrolledProgram', subHeader: { title: 'Years in ELL', key: 'yearsInEll' } },
      { title: 'Career Program', key: 'mappedCareerProgram', subHeader: { title: 'Career Code', key: 'mappedCareerProgramCode' } },
      { title: 'Indigenous Ancestry', key: 'mappedAncestryIndicator', subHeader: { title: 'Band Code', key: 'mappedBandCode' } },
      { title: 'Indigenous Support Program', key: 'mappedIndigenousEnrolledProgram', subHeader: { title: 'Inclusive Education Category', key: 'mappedSpedCode' } },
      { title: 'FTE', key: 'fte' }
    ],
    resolvedTableHeaders: [
      { title: 'District', key: 'districtName' },
      { title: 'School', key: 'schoolName' },
      { title: 'Local ID', key: 'localID', subHeader: { title: 'Birthdate', key: 'dob' } },
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: { title: 'Usual Surname, Given (Middle)', key: 'usualName' } },
      { title: 'Adult', key: 'isAdult', subHeader: { title: 'Grad', key: 'isGraduated' } },
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: { title: 'Funding Code', key: 'mappedSchoolFunding' } },
      { title: 'Courses For Grad', key: 'mappedNoOfCourses', subHeader: { title: 'Support Blocks', key: 'supportBlocks' } },
      { title: 'Language Program', key: 'mappedLanguageEnrolledProgram', subHeader: { title: 'Years in ELL', key: 'yearsInEll' } },
      { title: 'Career Program', key: 'mappedCareerProgram', subHeader: { title: 'Career Code', key: 'mappedCareerProgramCode' } },
      { title: 'Indigenous Ancestry', key: 'mappedAncestryIndicator', subHeader: { title: 'Band Code', key: 'mappedBandCode' } },
      { title: 'Indigenous Support Program', key: 'mappedIndigenousEnrolledProgram', subHeader: { title: 'Inclusive Education Category', key: 'mappedSpedCode' } },
      { title: 'FTE', key: 'fte' },
      { title: 'Resolution', key: 'resolution' },
    ],
    resolvedProgramDuplicateTableHeaders: [
      { title: 'District', key: 'districtName' },
      { title: 'School', key: 'schoolName' },
      { title: 'Local ID', key: 'localID', subHeader: { title: 'Birthdate', key: 'dob' } },
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: { title: 'Usual Surname, Given (Middle)', key: 'usualName' } },
      { title: 'Adult', key: 'isAdult', subHeader: { title: 'Grad', key: 'isGraduated' } },
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: { title: 'Funding Code', key: 'mappedSchoolFunding' } },
      { title: 'Courses For Grad', key: 'mappedNoOfCourses', subHeader: { title: 'Support Blocks', key: 'supportBlocks' } },
      { title: 'Language Program', key: 'mappedLanguageEnrolledProgram', subHeader: { title: 'Years in ELL', key: 'yearsInEll' } },
      { title: 'Career Program', key: 'mappedCareerProgram', subHeader: { title: 'Career Code', key: 'mappedCareerProgramCode' } },
      { title: 'Indigenous Ancestry', key: 'mappedAncestryIndicator', subHeader: { title: 'Band Code', key: 'mappedBandCode' } },
      { title: 'Indigenous Support Program', key: 'mappedIndigenousEnrolledProgram', subHeader: { title: 'Inclusive Education Category', key: 'mappedSpedCode' } },
      { title: 'FTE', key: 'fte' }
    ],
  }
);

export const SCHOOL_PROVINCIAL_DUPLICATES = Object.freeze(
  {
    nonAllowableTableHeaders: [
      { title: 'District', key: 'districtName' },
      { title: 'School', key: 'schoolNameNoLink' },
      { title: 'Local ID', key: 'localID', subHeader: { title: 'Birthdate', key: 'dob' } },
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: { title: 'Usual Surname, Given (Middle)', key: 'usualName' } },
      { title: 'Adult', key: 'isAdult', subHeader: { title: 'Grad', key: 'isGraduated' } },
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: { title: 'Funding Code', key: 'mappedSchoolFunding' } },
      { title: 'Courses For Grad', key: 'mappedNoOfCourses', subHeader: { title: 'Support Blocks', key: 'supportBlocks' } },
      { title: 'Language Program', key: 'mappedLanguageEnrolledProgram', subHeader: { title: 'Years in ELL', key: 'yearsInEll' } },
      { title: 'Career Program', key: 'mappedCareerProgram', subHeader: { title: 'Career Code', key: 'mappedCareerProgramCode' } },
      { title: 'Indigenous Ancestry', key: 'mappedAncestryIndicator', subHeader: { title: 'Band Code', key: 'mappedBandCode' } },
      { title: 'Indigenous Support Program', key: 'mappedIndigenousEnrolledProgram', subHeader: { title: 'Inclusive Education Category', key: 'mappedSpedCode' } },
      { title: 'FTE', key: 'fte' },
      { title: 'Resolution', key: 'resolution' },
    ],
    allowableTableHeaders: [
      { title: 'District', key: 'districtName' },
      { title: 'School', key: 'schoolNameNoLink' },
      { title: 'Local ID', key: 'localID', subHeader: { title: 'Birthdate', key: 'dob' } },
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: { title: 'Usual Surname, Given (Middle)', key: 'usualName' } },
      { title: 'Adult', key: 'isAdult', subHeader: { title: 'Grad', key: 'isGraduated' } },
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: { title: 'Funding Code', key: 'mappedSchoolFunding' } },
      { title: 'Courses For Grad', key: 'mappedNoOfCourses', subHeader: { title: 'Support Blocks', key: 'supportBlocks' } },
      { title: 'Language Program', key: 'mappedLanguageEnrolledProgram', subHeader: { title: 'Years in ELL', key: 'yearsInEll' } },
      { title: 'Career Program', key: 'mappedCareerProgram', subHeader: { title: 'Career Code', key: 'mappedCareerProgramCode' } },
      { title: 'Indigenous Ancestry', key: 'mappedAncestryIndicator', subHeader: { title: 'Band Code', key: 'mappedBandCode' } },
      { title: 'Indigenous Support Program', key: 'mappedIndigenousEnrolledProgram', subHeader: { title: 'Inclusive Education Category', key: 'mappedSpedCode' } },
      { title: 'FTE', key: 'fte' }
    ],
    resolvedTableHeaders: [
      { title: 'District', key: 'districtName' },
      { title: 'School', key: 'schoolNameNoLink' },
      { title: 'Local ID', key: 'localID', subHeader: { title: 'Birthdate', key: 'dob' } },
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: { title: 'Usual Surname, Given (Middle)', key: 'usualName' } },
      { title: 'Adult', key: 'isAdult', subHeader: { title: 'Grad', key: 'isGraduated' } },
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: { title: 'Funding Code', key: 'mappedSchoolFunding' } },
      { title: 'Courses For Grad', key: 'mappedNoOfCourses', subHeader: { title: 'Support Blocks', key: 'supportBlocks' } },
      { title: 'Language Program', key: 'mappedLanguageEnrolledProgram', subHeader: { title: 'Years in ELL', key: 'yearsInEll' } },
      { title: 'Career Program', key: 'mappedCareerProgram', subHeader: { title: 'Career Code', key: 'mappedCareerProgramCode' } },
      { title: 'Indigenous Ancestry', key: 'mappedAncestryIndicator', subHeader: { title: 'Band Code', key: 'mappedBandCode' } },
      { title: 'Indigenous Support Program', key: 'mappedIndigenousEnrolledProgram', subHeader: { title: 'Inclusive Education Category', key: 'mappedSpedCode' } },
      { title: 'FTE', key: 'fte' },
      { title: 'Resolution', key: 'resolution' },
    ],
    resolvedProgramDuplicateTableHeaders: [
      { title: 'District', key: 'districtName' },
      { title: 'School', key: 'schoolNameNoLink' },
      { title: 'Local ID', key: 'localID', subHeader: { title: 'Birthdate', key: 'dob' } },
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: { title: 'Usual Surname, Given (Middle)', key: 'usualName' } },
      { title: 'Adult', key: 'isAdult', subHeader: { title: 'Grad', key: 'isGraduated' } },
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: { title: 'Funding Code', key: 'mappedSchoolFunding' } },
      { title: 'Courses For Grad', key: 'mappedNoOfCourses', subHeader: { title: 'Support Blocks', key: 'supportBlocks' } },
      { title: 'Language Program', key: 'mappedLanguageEnrolledProgram', subHeader: { title: 'Years in ELL', key: 'yearsInEll' } },
      { title: 'Career Program', key: 'mappedCareerProgram', subHeader: { title: 'Career Code', key: 'mappedCareerProgramCode' } },
      { title: 'Indigenous Ancestry', key: 'mappedAncestryIndicator', subHeader: { title: 'Band Code', key: 'mappedBandCode' } },
      { title: 'Indigenous Support Program', key: 'mappedIndigenousEnrolledProgram', subHeader: { title: 'Inclusive Education Category', key: 'mappedSpedCode' } },
      { title: 'FTE', key: 'fte' }
    ],
  }
);
