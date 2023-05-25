export const FTE = Object.freeze(
  {
    defaultFilter: '',
    tableHeaders: [
      { title: 'select' },
      { title: 'FTE', key: 'fte', align:'start' },
      { title: 'PEN', key: 'studentPen', subHeader: {title: 'Local ID', key: 'localID'}},
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: {title: 'Usual Surname, Given (Middle)', key: 'usualName'}},
      { title: 'Adult', key: 'isAdult', subHeader: {title: 'Grad', key: 'grad'}},
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: {title: 'Funding Code', key: 'schoolFundingCode'}},
      { title: 'Courses For Grad', key: 'numberOfCourses', subHeader: {title: 'Support Blocks', key: 'supportBlocks'}},
    ],
  }  
);

export const FRENCH_PR = Object.freeze(
  {
    defaultFilter: 'Has French Program',
    tableHeaders: [
      { title: 'select' },
      { title: 'FTE', key: 'fte', align:'start', subHeader: {title: 'Program Eligible', key: 'programEligible'} },
      { title: 'PEN', key: 'studentPen', subHeader: {title: 'Local ID', key: 'localID'}},
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: {title: 'Usual Surname, Given (Middle)', key: 'usualName'}},
      { title: 'Adult', key: 'isAdult', subHeader: {title: 'Grad', key: 'grad'}},
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: {title: 'Funding Code', key: 'schoolFundingCode'}},
      { title: 'French Program', key: 'frenchProgram'},
    ],
  }  
);

export const CAREER_PR = Object.freeze(
  {
    defaultFilter: 'Has Career Program',
    tableHeaders: [
      { title: 'select' },
      { title: 'FTE', key: 'fte', align:'start', subHeader: {title: 'Program Eligible', key: 'programEligible'} },
      { title: 'PEN', key: 'studentPen', subHeader: {title: 'Local ID', key: 'localID'}},
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: {title: 'Usual Surname, Given (Middle)', key: 'usualName'}},
      { title: 'Adult', key: 'isAdult', subHeader: {title: 'Grad', key: 'grad'}},
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: {title: 'Funding Code', key: 'schoolFundingCode'}},
      { title: 'Career Program', key: 'careerProgram', subHeader: {title: 'Career Code', key: 'careerProgramCode'}},
    ],
  }  
);

export const INDSUPPORT_PR = Object.freeze(
  {
    defaultFilter: 'Has Indigenous Support Program',
    tableHeaders: [
      { title: 'select' },
      { title: 'FTE', key: 'fte', align:'start', subHeader: {title: 'Program Eligible', key: 'programEligible'} },
      { title: 'PEN', key: 'studentPen', subHeader: {title: 'Local ID', key: 'localID'}},
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: {title: 'Usual Surname, Given (Middle)', key: 'usualName'}},
      { title: 'Adult', key: 'isAdult', subHeader: {title: 'Grad', key: 'grad'}},
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: {title: 'Funding Code', key: 'schoolFundingCode'}},
      { title: 'Indigenous Ancestry', key: 'nativeAncestryInd', subHeader: {title: 'Band Code', key: 'bandCode'}},
      { title: 'Indigenous Support Program', key: 'suppProg'},
    ],
  }  
);

export const SPECIALED_PR = Object.freeze(
  {
    defaultFilter: 'Has Special Education Category',
    tableHeaders: [
      { title: 'select' },
      { title: 'FTE', key: 'fte', align:'start', subHeader: {title: 'Program Eligible', key: 'programEligible'} },
      { title: 'PEN', key: 'studentPen', subHeader: {title: 'Local ID', key: 'localID'}},
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: {title: 'Usual Surname, Given (Middle)', key: 'usualName'}},
      { title: 'Adult', key: 'isAdult', subHeader: {title: 'Grad', key: 'grad'}},
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: {title: 'Funding Code', key: 'schoolFundingCode'}},
      { title: 'Special Education Category', key: 'specialEducationCategoryCode'},
    ],
  }  
);

export const ELL = Object.freeze(
  {
    defaultFilter: 'English Language Learner',
    tableHeaders: [
      { title: 'select' },
      { title: 'FTE', key: 'fte', align:'start', subHeader: {title: 'Program Eligible', key: 'programEligible'} },
      { title: 'PEN', key: 'studentPen', subHeader: {title: 'Local ID', key: 'localID'}},
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: {title: 'Usual Surname, Given (Middle)', key: 'usualName'}},
      { title: 'Adult', key: 'isAdult', subHeader: {title: 'Grad', key: 'grad'}},
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: {title: 'Funding Code', key: 'schoolFundingCode'}},
      { title: 'Language Program', key: 'langProg', subHeader: {title: 'Years in ELL', key: 'years'}},
    ],
  }  
);

export const REFUGEE = Object.freeze(
  {
    defaultFilter: '16-Newcomer Refugee',
    tableHeaders: [
      { title: 'select' },
      { title: 'FTE', key: 'fte', align:'start', subHeader: {title: 'Funding Eligible', key: 'fundingEligible'} },
      { title: 'PEN', key: 'studentPen', subHeader: {title: 'Local ID', key: 'localID'}},
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: {title: 'Usual Surname, Given (Middle)', key: 'usualName'}},
      { title: 'Adult', key: 'isAdult', subHeader: {title: 'Grad', key: 'grad'}},
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: {title: 'Funding Code', key: 'schoolFundingCode'}}
    ],
  }  
);
