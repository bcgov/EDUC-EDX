export const FTE = Object.freeze(
  {
    defaultFilter: {label: 'DEFAULT_VALUE' ,description: ''},
    tableHeaders: [
      { title: 'select' },
      { title: 'FTE', key: 'fte', align:'start' },
      { title: 'PEN', key: 'studentPen', subHeader: {title: 'Local ID', key: 'localID'}},
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: {title: 'Usual Surname, Given (Middle)', key: 'usualName'}},
      { title: 'Adult', key: 'isAdult', subHeader: {title: 'Grad', key: 'isGraduated'}},
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: {title: 'Funding Code', key: 'mappedSchoolFunding'}},
      { title: 'Courses For Grad', key: 'mappedNoOfCourses', subHeader: {title: 'Support Blocks', key: 'supportBlocks'}},
    ],
    headcountEndpoint: 'enroll'
  }  
);

export const FRENCH_PR = Object.freeze(
  {
    defaultFilter: {label: 'FRENCH_PR', description:'Has French Program', enrolledProgramCodeValues: '05,08,11,14'},
    tableHeaders: [
      { title: 'select' },
      { title: 'FTE', key: 'fte', align:'start', subHeader: {title: 'Program Eligible', key: 'programEligible'} },
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
      { title: 'select' },
      { title: 'FTE', key: 'fte', align:'start', subHeader: {title: 'Program Eligible', key: 'programEligible'} },
      { title: 'PEN', key: 'studentPen', subHeader: {title: 'Local ID', key: 'localID'}},
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: {title: 'Usual Surname, Given (Middle)', key: 'usualName'}},
      { title: 'Adult', key: 'isAdult', subHeader: {title: 'Grad', key: 'isGraduated'}},
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: {title: 'Funding Code', key: 'mappedSchoolFunding'}},
      { title: 'Career Program', key: 'careerProgram', subHeader: {title: 'Career Code', key: 'careerProgramCode'}},
    ],
  }  
);

export const INDSUPPORT_PR = Object.freeze(
  {
    defaultFilter: {label: 'INDSUPPORT_PR', description: 'Has Indigenous Support Program', enrolledProgramCodeValues: '29,33,36'},
    tableHeaders: [
      { title: 'select' },
      { title: 'FTE', key: 'fte', align:'start', subHeader: {title: 'Program Eligible', key: 'programEligible'} },
      { title: 'PEN', key: 'studentPen', subHeader: {title: 'Local ID', key: 'localID'}},
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: {title: 'Usual Surname, Given (Middle)', key: 'usualName'}},
      { title: 'Adult', key: 'isAdult', subHeader: {title: 'Grad', key: 'isGraduated'}},
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: {title: 'Funding Code', key: 'mappedSchoolFunding'}},
      { title: 'Indigenous Ancestry', key: 'nativeAncestryInd', subHeader: {title: 'Band Code', key: 'bandCode'}},
      { title: 'Indigenous Support Program', key: 'mappedIndegenousEnrolledProgram'},
    ],
  }  
);

export const SPECIALED_PR = Object.freeze(
  {
    defaultFilter: {label: 'SPECIALED_PR', description: 'Has Special Education Category'},
    tableHeaders: [
      { title: 'select' },
      { title: 'FTE', key: 'fte', align:'start', subHeader: {title: 'Program Eligible', key: 'programEligible'} },
      { title: 'PEN', key: 'studentPen', subHeader: {title: 'Local ID', key: 'localID'}},
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: {title: 'Usual Surname, Given (Middle)', key: 'usualName'}},
      { title: 'Adult', key: 'isAdult', subHeader: {title: 'Grad', key: 'isGraduated'}},
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: {title: 'Funding Code', key: 'mappedSchoolFunding'}},
      { title: 'Special Education Category', key: 'specialEducationCategoryCode'},
    ],
  }  
);

export const ELL = Object.freeze(
  {
    defaultFilter: {label: 'ELL', description: 'English Language Learner' },
    tableHeaders: [
      { title: 'select' },
      { title: 'FTE', key: 'fte', align:'start', subHeader: {title: 'Program Eligible', key: 'programEligible'} },
      { title: 'PEN', key: 'studentPen', subHeader: {title: 'Local ID', key: 'localID'}},
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: {title: 'Usual Surname, Given (Middle)', key: 'usualName'}},
      { title: 'Adult', key: 'isAdult', subHeader: {title: 'Grad', key: 'isGraduated'}},
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: {title: 'Funding Code', key: 'mappedSchoolFunding'}},
      { title: 'Language Program', key: 'langProg', subHeader: {title: 'Years in ELL', key: 'years'}},
    ],
  }  
);

export const REFUGEE = Object.freeze(
  {
    defaultFilter: { label: 'REFUGEE', description: '16-Newcomer Refugee'},
    tableHeaders: [
      { title: 'select' },
      { title: 'FTE', key: 'fte', align:'start', subHeader: {title: 'Funding Eligible', key: 'fundingEligible'} },
      { title: 'PEN', key: 'studentPen', subHeader: {title: 'Local ID', key: 'localID'}},
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: {title: 'Usual Surname, Given (Middle)', key: 'usualName'}},
      { title: 'Adult', key: 'isAdult', subHeader: {title: 'Grad', key: 'isGraduated'}},
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: {title: 'Funding Code', key: 'mappedSchoolFunding'}}
    ],
  }  
);
