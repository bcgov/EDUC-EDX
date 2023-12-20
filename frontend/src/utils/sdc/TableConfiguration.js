export const FTE = Object.freeze(
  {
    defaultFilter: {label: 'DEFAULT_VALUE' ,description: ''},
    tableHeaders: [
      { title: 'select', key: 'select' },
      { title: 'FTE', key: 'fte', align:'start' },
      { title: 'PEN', key: 'studentPen', subHeader: {title: 'Local ID', key: 'localID'}},
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: {title: 'Usual Surname, Given (Middle)', key: 'usualName'}},
      { title: 'Adult', key: 'isAdult', subHeader: {title: 'Grad', key: 'isGraduated'}},
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: {title: 'Funding Code', key: 'mappedSchoolFunding'}},
      { title: 'Courses For Grad', key: 'mappedNoOfCourses', subHeader: {title: 'Support Blocks', key: 'supportBlocks'}},
    ],
    headcountEndpoint: 'enrollment',
    allowedFilters: [
      { 
        heading: 'Student Type',
        multiple: true,
        key:'studentType',
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
      },
      { 
        heading: 'FTE',
        multiple: true,
        key:'fte',
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
      },
      { 
        heading: 'Grade',
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
        ]
      },
      { 
        heading: 'Funding Type',
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
            cvalue: '16'
          },
          {
            title: 'No Funding Code',
            value: 'No Funding'
          }
        ]
      },
      { 
        heading: 'Warnings',
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
      },
    ]
  }  
);

export const FRENCH_PR = Object.freeze(
  {
    defaultFilter: {label: 'FRENCH_PR', description:'Has French Program', enrolledProgramCodeValues: '05,08,11,14'},
    tableHeaders: [
      { title: 'select', key: 'select' },
      { title: 'FTE', key: 'fte', align:'start', subHeader: {title: 'Program Eligible', key: 'frenchProgramEligible'} },
      { title: 'PEN', key: 'studentPen', subHeader: {title: 'Local ID', key: 'localID'}},
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: {title: 'Usual Surname, Given (Middle)', key: 'usualName'}},
      { title: 'Adult', key: 'isAdult', subHeader: {title: 'Grad', key: 'isGraduated'}},
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: {title: 'Funding Code', key: 'mappedSchoolFunding'}},
      { title: 'French Program', key: 'mappedFrenchEnrolledProgram'},
    ],
    headcountEndpoint: 'french'
  }
);

export const CAREER_PR = Object.freeze(
  {
    defaultFilter: {label: 'CAREER_PR' ,description: 'Has Career Program', enrolledProgramCodeValues: '40,41,42,43'},
    tableHeaders: [
      { title: 'select', key: 'select' },
      { title: 'FTE', key: 'fte', align:'start', subHeader: {title: 'Program Eligible', key: 'careerProgramEligible'} },
      { title: 'PEN', key: 'studentPen', subHeader: {title: 'Local ID', key: 'localID'}},
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: {title: 'Usual Surname, Given (Middle)', key: 'usualName'}},
      { title: 'Adult', key: 'isAdult', subHeader: {title: 'Grad', key: 'isGraduated'}},
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: {title: 'Funding Code', key: 'mappedSchoolFunding'}},
      { title: 'Career Program', key: 'careerProgram', subHeader: {title: 'Career Code', key: 'careerProgramCode'}},
    ],
    headcountEndpoint: 'career'
  }  
);

export const INDSUPPORT_PR = Object.freeze(
  {
    defaultFilter: {label: 'INDSUPPORT_PR', description: 'Has Indigenous Support Program', enrolledProgramCodeValues: '29,33,36'},
    tableHeaders: [
      { title: 'select', key: 'select' },
      { title: 'FTE', key: 'fte', align:'start', subHeader: {title: 'Program Eligible', key: 'indProgramEligible'} },
      { title: 'PEN', key: 'studentPen', subHeader: {title: 'Local ID', key: 'localID'}},
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: {title: 'Usual Surname, Given (Middle)', key: 'usualName'}},
      { title: 'Adult', key: 'isAdult', subHeader: {title: 'Grad', key: 'isGraduated'}},
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: {title: 'Funding Code', key: 'mappedSchoolFunding'}},
      { title: 'Indigenous Ancestry', key: 'mappedAncestryIndicator', subHeader: {title: 'Band Code', key: 'mappedBandCode'}},
      { title: 'Indigenous Support Program', key: 'mappedIndigenousEnrolledProgram'},
    ],
  }
);

export const SPECIALED_PR = Object.freeze(
  {
    defaultFilter: {label: 'SPECIALED_PR', description: 'Has Special Education Category', spedCodeValues: 'A,B,C,D,E,F,G,H,K,P,Q,R'},
    tableHeaders: [
      { title: 'select', key: 'select' },
      { title: 'FTE', key: 'fte', align:'start', subHeader: {title: 'Program Eligible', key: 'spedProgramEligible'} },
      { title: 'PEN', key: 'studentPen', subHeader: {title: 'Local ID', key: 'localID'}},
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: {title: 'Usual Surname, Given (Middle)', key: 'usualName'}},
      { title: 'Adult', key: 'isAdult', subHeader: {title: 'Grad', key: 'isGraduated'}},
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: {title: 'Funding Code', key: 'mappedSchoolFunding'}},
      { title: 'Special Education Category', key: 'mappedSpedCode'},
    ],
  }
);

export const ELL = Object.freeze(
  {
    defaultFilter: { label: 'ELL', description: 'English Language Learner' },
    tableHeaders: [
      { title: 'select', key: 'select' },
      { title: 'FTE', key: 'fte', align:'start', subHeader: {title: 'Program Eligible', key: 'ellProgramEligible'} },
      { title: 'PEN', key: 'studentPen', subHeader: {title: 'Local ID', key: 'localID'}},
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: {title: 'Usual Surname, Given (Middle)', key: 'usualName'}},
      { title: 'Adult', key: 'isAdult', subHeader: {title: 'Grad', key: 'isGraduated'}},
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: {title: 'Funding Code', key: 'mappedSchoolFunding'}},
      { title: 'Language Program', key: 'mappedEllEnrolledProgram', subHeader: {title: 'Years in ELL', key: 'yearsInEll'}},
    ],
  }
);

export const REFUGEE = Object.freeze(
  {
    defaultFilter: { label: 'REFUGEE', description: '16-Newcomer Refugee'},
    tableHeaders: [
      { title: 'select', key: 'select' },
      { title: 'FTE', key: 'fte', align:'start', subHeader: {title: 'Funding Eligible', key: 'fundingEligible'} },
      { title: 'PEN', key: 'studentPen', subHeader: {title: 'Local ID', key: 'localID'}},
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: {title: 'Usual Surname, Given (Middle)', key: 'usualName'}},
      { title: 'Adult', key: 'isAdult', subHeader: {title: 'Grad', key: 'isGraduated'}},
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: {title: 'Funding Code', key: 'mappedSchoolFunding'}}
    ],
  }
);
