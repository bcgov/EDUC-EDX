/**
 * Filters
 */

export const WARNING_FILTER = Object.freeze(
  {
    heading: 'Warnings',
    filterGroups: [
      {
        multiple: true,
        key: 'warnings',
        filterOptions: [
          {
            title: 'Has Funding Warnings',
            value: 'FUNDING_WARNING'
          },
          {
            title: 'Has Info Warnings',
            value: 'INFO_WARNING'
          }
        ]
      }
    ]
  }
);

export const STUDENT_TYPE_FILTER = Object.freeze(
  {
    heading: 'Student Type',
    filterGroups: [
      {
        multiple: true,
        key: 'studentType',
        filterOptions: [
          {
            title: 'School Aged',
            value: 'isSchoolAged'
          },
          {
            title: 'Adult',
            value: 'isAdult'
          }
        ]
      }
    ]
  },
);

export const FTE_FILTER = Object.freeze(
  {
    heading: 'FTE',
    filterGroups: [
      {
        multiple: true,
        key: 'fte',
        filterOptions: [
          {
            title: 'FTE = 0',
            value: 'fteEq0'
          },
          {
            title: 'FTE < 1',
            value: 'fteLt1'
          },
          {
            title: 'FTE > 0',
            value: 'fteGt0'
          }
        ]
      }
    ]
  },
);

export const FUNDING_TYPE_FILTER = Object.freeze(
  {
    heading: 'Funding Type',
    filterGroups: [
      {
        multiple: true,
        key: 'fundingType',
        filterOptions: [
          {
            title: '14 - Out of Province/International',
            value: '14'
          },
          {
            title: '20 - Living on Reserve',
            value: '20'
          },
          {
            title: '16 - Newcomer Refugee',
            value: '16'
          },
          {
            title: 'No Funding Code',
            value: 'No Funding'
          }
        ]
      }
    ]
  },
);

export const GRADE_FILTER = Object.freeze(
  {
    heading: 'Grade',
    filterGroups: [
      {
        multiple: true,
        key: 'grade',
        filterOptions: [
          {
            title: 'Kind. Half',
            value: 'KH'
          },
          {
            title: 'Kind. Full',
            value: 'KF'
          },
          {
            title: 'Gr. 1',
            value: '01'
          },
          {
            title: 'Gr. 2',
            value: '02'
          },
          {
            title: 'Gr. 3',
            value: '03'
          },
          {
            title: 'Gr. 4',
            value: '04'
          },
          {
            title: 'Gr. 5',
            value: '05'
          },
          {
            title: 'Gr. 6',
            value: '06'
          },
          {
            title: 'Gr. 7',
            value: '07'
          },
          {
            title: 'Elem. Ungraded',
            value: 'EU'
          },
          {
            title: 'Gr. 8',
            value: '08'
          },
          {
            title: 'Gr. 9',
            value: '09'
          },
          {
            title: 'Gr. 10',
            value: '10'
          },
          {
            title: 'Gr. 11',
            value: '11'
          },
          {
            title: 'Gr. 12',
            value: '12'
          },
          {
            title: 'Sec. Ungraded',
            value: 'SU'
          },
          {
            title: 'Graduated Adult',
            value: 'GA'
          },
          {
            title: 'Home School',
            value: 'HS'
          },
        ]
      }
    ]
  },
);

export const SUPPORT_BLOCKS_FILTER = Object.freeze(
  {
    heading: 'Support Blocks',
    filterGroups: [
      {
        multiple: false,
        key: 'support',
        filterOptions: [
          {
            title: 'Has Support Blocks',
            value: 'hasSupportBlocks'
          },
          {
            title: 'No Support Blocks',
            value: 'noSupportBlocks'
          }
        ]
      }
    ]
  }
);

export const FTE_ZERO_FILTER = Object.freeze(
  {
    heading: 'Reasons for FTE = 0 ',
    filterGroups: [
      {
        multiple: true,
        key: 'fteZero',
        filterOptions: [
          {
            title: 'Out of Province International ',
            value: 'OUTOFPROV'
          },
          {
            title: 'Nominal Roll Eligible',
            value: 'NOMROLL'
          },
          {
            title: 'Student Too Young',
            value: 'TOOYOUNG'
          },
          {
            title: 'Graduated Adult',
            value: 'INDYADULT'
          },
          {
            title: 'No new active courses',
            value: 'INACTIVE'
          },
          {
            title: 'District already received funding',
            value: 'DISTDUP'
          },
          {
            title: 'Authority already received funding',
            value: 'AUTHDUP'
          }
        ]
      }
    ]
  }
);

export const FRENCH_PROGRAMS_FILTER = Object.freeze(
  {
    heading: 'French Programs',
    filterGroups: [
      {
        multiple: true,
        key:'frenchProgram',
        filterOptions: [
          {
            title: '11 - Early French Immersion',
            value: '11'
          },
          {
            title: '14 - Late French Immersion',
            value: '14'
          },
          {
            title: '08 - Core French',
            value: '08'
          }
        ]
      }
    ]
  }
);

export const FRENCH_FUNDING_FILTER = Object.freeze(
  {
    heading: 'French Program Funding Eligibility',
    filterGroups: [
      {
        multiple: false,
        key: 'frenchFunding',
        filterOptions: [
          {
            title: 'Funding Eligible',
            value: 'true'
          },
          {
            title: 'Not Funding Eligible',
            value: 'false'
          }
        ]
      }
    ]
  },
);

export const CAREER_CODE_FILTER = Object.freeze(
  {
    heading: 'Career Code',
    filterGroups: [
      {
        multiple: true,
        key: 'careerCode',
        filterOptions: [
          {
            title: 'XA - Business & Applied Business',
            value: 'XA'
          },
          {
            title: 'XB - Fine Arts, Design, & Media',
            value: 'XB'
          },
          {
            title: 'XC - Fitness & Recreation',
            value: 'XC'
          },
          {
            title: 'XD - Health & Human Services',
            value: 'XD'
          },
          {
            title: 'XE - Liberal Arts & Humanities',
            value: 'XE'
          },
          {
            title: 'XF - Science & Applied Science ',
            value: 'XF'
          },
          {
            title: 'XG - Tourism, Hospitality, & Foods',
            value: 'XG'
          },
          {
            title: 'XH - Trades & Technology',
            value: 'XH'
          }
        ]
      }
    ]
  },
);

export const CAREER_PROGRAM_FILTER = Object.freeze(
  {
    heading: 'Career Programs',
    filterGroups: [
      {
        multiple: true,
        key: 'careerPrograms',
        filterOptions: [
          {
            title: '40 - Career Preparation',
            value: '40'
          },
          {
            title: '41 - Co-Operative Education',
            value: '41'
          },
          {
            title: '42 - Apprenticeship',
            value: '42'
          },
          {
            title: '43 - Career Technical or Youth Train in Trades', 
            value: '43'
          },
        ]
      }
    ]
  },
);

export const CAREER_FUNDING_FILTER = Object.freeze(
  {
    heading: 'Career Program Funding Eligibility',
    filterGroups: [
      {
        multiple: false,
        key: 'careerProgramsFunding',
        filterOptions: [
          {
            title: 'Funding Eligible',
            value: 'isCareerFundingEligible'
          },
          {
            title: 'Not Funding Eligible',
            value: 'isNotCareerFundingEligible'
          }
        ]
      }
    ]
  },
);

export const INDIGENOUS_PROGRAM_FILTER = Object.freeze(
  {
    heading: 'Indigenous Support Programs',
    filterGroups: [
      {
        multiple: true,
        key: 'indigenousPrograms',
        filterOptions: [
          {
            title: '29 - Language & Culture',
            value: '29'
          },
          {
            title: '33 - Support Services',
            value: '33'
          },
          {
            title: '36 - Other Approved Programs',
            value: '36'
          },
        ]
      }
    ]
  },
);

export const ANCESTRY_FILTER = Object.freeze(
  {
    heading: 'Indigenous Ancestry',
    filterGroups: [
      {
        multiple: false,
        key: 'ancestry',
        filterOptions: [
          {
            title: 'Has Indigenous Ancestry',
            value: 'true'
          },
          {
            title: 'No Indigenous Ancestry',
            value: 'false'
          }
        ]
      }
    ]
  },
);

export const INDIGENOUS_FUNDING_FILTER = Object.freeze(
  {
    heading: 'Indigenous Support Program Funding Eligibility',
    filterGroups: [
      {
        multiple: false,
        key: 'indigenousProgramsFunding',
        filterOptions: [
          {
            title: 'Funding Eligible',
            value: 'true'
          },
          {
            title: 'Not Funding Eligible',
            value: 'false'
          }
        ]
      }
    ]
  },
);

export const BAND_FILTER = Object.freeze(
  {
    heading: 'Band of Residence',
    filterGroups: [
      {
        multiple: true,
        key: 'bandCode',
        filterOptions: [
          {
            title: 'Has Band Code',
            value: 'true'
          },
          {
            title: 'No Band Code',
            value: 'false'
          },
        ]
      }
    ]
  },
);

export const SPED_FILTER = Object.freeze(
  {
    heading: 'Special Education',
    filterGroups: [
      {
        multiple: true,
        key: 'sped',
        filterOptions: [
          {
            title: 'A - Physically Dependent',
            value: 'A'
          },
          {
            title: 'B - Deafblind',
            value: 'B'
          },
          {
            title: 'C - Moderate to Profound Intellectual Disability',
            value: 'C'
          },
          {
            title: 'F - Deaf or Hard of Hearing',
            value: 'F'
          },
          {
            title: 'G - Autism Spectrum Disorder',
            value: 'G'
          },
          {
            title: 'H - Intensive Behaviour Intervention/Serious Mental Illness',
            value: 'H'
          },
          {
            title: 'K - Mild Intellectual Disability',
            value: 'K'
          },
          {
            title: 'P - Gifted',
            value: 'P'
          },
          {
            title: 'Q - Learning Disability',
            value: 'Q'
          },
          {
            title: 'R - Moderate Behaviour Support/Mental Illness',
            value: 'R'
          },
        ]
      }
    ]
  },
);

export const SPED_FUNDING_FILTER = Object.freeze(
  {
    heading: 'Special Education Funding Eligibility',
    filterGroups: [
      {
        multiple: false,
        key: 'spedFunding',
        filterOptions: [
          {
            title: 'Funding Eligible',
            value: 'true'
          },
          {
            title: 'Not Funding Eligible',
            value: 'false'
          }
        ]
      }
    ]
  },
);

export const ELL_FUNDING_FILTER = Object.freeze(
  {
    heading: 'English Language Learning Funding Eligibility',
    filterGroups: [
      {
        multiple: false,
        key: 'ellFunding',
        filterOptions: [
          {
            title: 'Funding Eligible',
            value: 'true'
          },
          {
            title: 'Not Funding Eligible',
            value: 'false'
          }
        ]
      }
    ]
  },
);

export const ELL_YEARS_FILTER = Object.freeze(
  {
    heading: 'Years in ELL',
    filterGroups: [
      {
        multiple: true,
        key: 'ellYears',
        filterOptions: [
          {
            title: '1-5 years in ELL',
            value: 'ell1Between5'
          },
          {
            title: '6+ years in ELL',
            value: 'ellGtEq6'
          }
        ]
      }
    ]
  },
);

/**
 * Tables
 */
export const FTE = Object.freeze(
  {
    defaultFilter: {label: 'DEFAULT_VALUE' ,description: ''},
    tableHeaders: [
      { title: 'select', key: 'select' },
      { key: 'sdcSchoolCollectionStudentStatusCode'},
      { title: 'FTE', key: 'fte', align:'start' },
      { title: 'PEN', key: 'studentPen', subHeader: {title: 'Local ID', key: 'localID'}},
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: {title: 'Usual Surname, Given (Middle)', key: 'usualName'}},
      { title: 'Adult', key: 'isAdult', subHeader: {title: 'Grad', key: 'isGraduated'}},
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: {title: 'Funding Code', key: 'mappedSchoolFunding'}},
      { title: 'Courses For Grad', key: 'mappedNoOfCourses', subHeader: {title: 'Support Blocks', key: 'supportBlocks'}},
    ],
    headcountEndpoint: 'enrollment',
    allowedFilters: [
      STUDENT_TYPE_FILTER,
      FTE_FILTER,
      GRADE_FILTER,
      FUNDING_TYPE_FILTER,
      SUPPORT_BLOCKS_FILTER,
      FTE_ZERO_FILTER,
      WARNING_FILTER
    ]
  }
);

export const FRENCH_PR = Object.freeze(
  {
    defaultFilter: {label: 'FRENCH_PR', description:'Has French Program' },
    tableHeaders: [
      { title: 'select', key: 'select' },
      { key: 'sdcSchoolCollectionStudentStatusCode'},
      { title: 'FTE', key: 'fte', align:'start', subHeader: {title: 'Program Eligible', key: 'frenchProgramEligible'} },
      { title: 'PEN', key: 'studentPen', subHeader: {title: 'Local ID', key: 'localID'}},
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: {title: 'Usual Surname, Given (Middle)', key: 'usualName'}},
      { title: 'Adult', key: 'isAdult', subHeader: {title: 'Grad', key: 'isGraduated'}},
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: {title: 'Funding Code', key: 'mappedSchoolFunding'}},
      { title: 'French Program', key: 'mappedFrenchEnrolledProgram'},
    ],
    headcountEndpoint: 'french',
    allowedFilters: [
      STUDENT_TYPE_FILTER,
      FTE_FILTER,
      GRADE_FILTER,
      FUNDING_TYPE_FILTER,
      FRENCH_PROGRAMS_FILTER,
      FRENCH_FUNDING_FILTER,
      WARNING_FILTER
    ]
  }
);

export const CAREER_PR = Object.freeze(
  {
    defaultFilter: {label: 'CAREER_PR' ,description: 'Has Career Program' },
    tableHeaders: [
      { title: 'select', key: 'select' },
      { key: 'sdcSchoolCollectionStudentStatusCode'},
      { title: 'FTE', key: 'fte', align:'start', subHeader: {title: 'Program Eligible', key: 'careerProgramEligible'} },
      { title: 'PEN', key: 'studentPen', subHeader: {title: 'Local ID', key: 'localID'}},
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: {title: 'Usual Surname, Given (Middle)', key: 'usualName'}},
      { title: 'Adult', key: 'isAdult', subHeader: {title: 'Grad', key: 'isGraduated'}},
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: {title: 'Funding Code', key: 'mappedSchoolFunding'}},
      { title: 'Career Program', key: 'careerProgram', subHeader: {title: 'Career Code', key: 'careerProgramCode'}},
    ],
    headcountEndpoint: 'career',
    allowedFilters: [
      STUDENT_TYPE_FILTER,
      FTE_FILTER,
      GRADE_FILTER,
      FUNDING_TYPE_FILTER,
      CAREER_PROGRAM_FILTER,
      CAREER_CODE_FILTER,
      CAREER_FUNDING_FILTER,
      WARNING_FILTER
    ]
  }
);

export const INDSUPPORT_PR = Object.freeze(
  {
    defaultFilter: {label: 'INDSUPPORT_PR', description: 'Has Indigenous Support Program'},
    tableHeaders: [
      { title: 'select', key: 'select' },
      { key: 'sdcSchoolCollectionStudentStatusCode'},
      { title: 'FTE', key: 'fte', align:'start', subHeader: {title: 'Program Eligible', key: 'indProgramEligible'} },
      { title: 'PEN', key: 'studentPen', subHeader: {title: 'Local ID', key: 'localID'}},
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: {title: 'Usual Surname, Given (Middle)', key: 'usualName'}},
      { title: 'Adult', key: 'isAdult', subHeader: {title: 'Grad', key: 'isGraduated'}},
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: {title: 'Funding Code', key: 'mappedSchoolFunding'}},
      { title: 'Indigenous Ancestry', key: 'mappedAncestryIndicator', subHeader: {title: 'Band Code', key: 'mappedBandCode'}},
      { title: 'Indigenous Support Program', key: 'mappedIndigenousEnrolledProgram'},
    ],
    headcountEndpoint: 'indigenous',
    allowedFilters: [
      STUDENT_TYPE_FILTER,
      FTE_FILTER,
      GRADE_FILTER,
      FUNDING_TYPE_FILTER,
      INDIGENOUS_PROGRAM_FILTER,
      BAND_FILTER,
      ANCESTRY_FILTER,
      INDIGENOUS_FUNDING_FILTER,
      WARNING_FILTER
    ]
  }
);

export const SPECIALED_PR = Object.freeze(
  {
    defaultFilter: {label: 'SPECIALED_PR', description: 'Has Special Education Category'},
    tableHeaders: [
      { title: 'select', key: 'select' },
      { key: 'sdcSchoolCollectionStudentStatusCode'},
      { title: 'FTE', key: 'fte', align:'start', subHeader: {title: 'Program Eligible', key: 'spedProgramEligible'} },
      { title: 'PEN', key: 'studentPen', subHeader: {title: 'Local ID', key: 'localID'}},
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: {title: 'Usual Surname, Given (Middle)', key: 'usualName'}},
      { title: 'Adult', key: 'isAdult', subHeader: {title: 'Grad', key: 'isGraduated'}},
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: {title: 'Funding Code', key: 'mappedSchoolFunding'}},
      { title: 'Special Education Category', key: 'mappedSpedCode'},
    ],
    headcountEndpoint: 'special-ed',
    allowedFilters: [
      STUDENT_TYPE_FILTER,
      FTE_FILTER,
      GRADE_FILTER,
      FUNDING_TYPE_FILTER,
      SPED_FILTER,
      SPED_FUNDING_FILTER,
      WARNING_FILTER
    ]
  }
);

export const ELL = Object.freeze(
  {
    defaultFilter: { label: 'ELL_PR', description: 'English Language Learner' },
    tableHeaders: [
      { title: 'select', key: 'select' },
      { key: 'sdcSchoolCollectionStudentStatusCode'},
      { title: 'FTE', key: 'fte', align:'start', subHeader: {title: 'Program Eligible', key: 'ellProgramEligible'} },
      { title: 'PEN', key: 'studentPen', subHeader: {title: 'Local ID', key: 'localID'}},
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: {title: 'Usual Surname, Given (Middle)', key: 'usualName'}},
      { title: 'Adult', key: 'isAdult', subHeader: {title: 'Grad', key: 'isGraduated'}},
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: {title: 'Funding Code', key: 'mappedSchoolFunding'}},
      { title: 'Language Program', key: 'mappedEllEnrolledProgram', subHeader: {title: 'Years in ELL', key: 'yearsInEll'}},
    ],
    headcountEndpoint: 'ell',
    allowedFilters: [
      STUDENT_TYPE_FILTER,
      FTE_FILTER,
      GRADE_FILTER,
      FUNDING_TYPE_FILTER,
      ELL_YEARS_FILTER,
      ELL_FUNDING_FILTER,
      WARNING_FILTER
    ]
  }
);

export const REFUGEE = Object.freeze(
  {
    defaultFilter: { label: 'REFUGEE', description: '16-Newcomer Refugee'},
    tableHeaders: [
      { title: 'select', key: 'select' },
      { key: 'sdcSchoolCollectionStudentStatusCode'},
      { title: 'FTE', key: 'fte', align:'start', subHeader: {title: 'Funding Eligible', key: 'fundingEligible'} },
      { title: 'PEN', key: 'studentPen', subHeader: {title: 'Local ID', key: 'localID'}},
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: {title: 'Usual Surname, Given (Middle)', key: 'usualName'}},
      { title: 'Adult', key: 'isAdult', subHeader: {title: 'Grad', key: 'isGraduated'}},
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: {title: 'Funding Code', key: 'mappedSchoolFunding'}}
    ],
    allowedFilters: [
      STUDENT_TYPE_FILTER,
      FTE_FILTER,
      GRADE_FILTER,
      FUNDING_TYPE_FILTER,
      WARNING_FILTER
    ]
  }
);
