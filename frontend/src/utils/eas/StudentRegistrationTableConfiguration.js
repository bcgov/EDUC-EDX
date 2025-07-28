export const SESSION_CODE_FILTER = Object.freeze(
  {
    heading: 'Session',
    id: 'sessionTypeCode',
    multiple: false,
    key: 'sessionTypeCode',
    filterOptions: [
    ]
  }
);

export const ASSESSMENT_TYPE_CODE_FILTER = Object.freeze(
  {
    heading: 'Assessment / Course',
    id: 'assessmentTypeCode',
    multiple: true,
    key: 'assessmentTypeCode',
    filterOptions: [
    ]
  }
);

export const PROFICIENCY_SCORE_RANGE_FILTER = Object.freeze(
  {
    heading: 'Score',
    id: 'proficiencyScoreValue',
    multiple: true,
    key: 'proficiencyScoreValue',
    filterOptions: [
      {
        title: '1',
        id: '1',
        value: '1'
      },
      {
        title: '2',
        id: '2',
        value: '2'
      },
      {
        title: '3',
        id: '3',
        value: '3'
      },
      {
        title: '4',
        id: '4',
        value: '4'
      },
      {
        title: 'No Score',
        id: 'N',
        value: 'N'
      }
    ]
  }
);

export const SPECIAL_CASE_FILTER = Object.freeze(
  {
    heading: 'Special Case',
    id: 'provincialSpecialCaseCode',
    multiple: true,
    key: 'provincialSpecialCaseCode',
    filterOptions: [
      {
        title: 'Aegrotat',
        id: 'A',
        value: 'A'
      },
      {
        title: 'Disqualification',
        id: 'Q',
        value: 'Q'
      },
      {
        title: 'Exempt',
        id: 'E',
        value: 'E'
      },
      {
        title: 'Not Completed',
        id: 'X',
        value: 'X'
      },
      {
        title: 'No Special Case',
        id: 'N',
        value: 'N'
      }
    ]
  }
);


export const SCHOOL_YEAR_REGISTRATIONS_VIEW_DISTRICT = Object.freeze(
  {
    tableHeaders: [
      { title: 'select', key: 'select' },
      { title: 'Session', key: 'session'},
      { title: 'School', key: 'schoolName_desc' },
      { title: 'PEN', key: 'pen' },
      { title: 'Assessment Center', key: 'assessmentCenterName_desc' },
      { title: 'Local ID', key: 'localID' },
      { title: 'Surname, Given Name', key: 'name' },
      { title: 'Assessment Code', key: 'assessmentTypeCode' },
      { title: 'Score', key: 'proficiencyScore' },
      { title: 'Special Case', key: 'provincialSpecialCaseName_desc' },
      { title: 'ISR', key: 'isr' },
    ],
    allowedFilters: {
      session: SESSION_CODE_FILTER,
      assessmentTypeCode: ASSESSMENT_TYPE_CODE_FILTER,
      proficiencyScoreValue: PROFICIENCY_SCORE_RANGE_FILTER,
      provincialSpecialCaseCode: SPECIAL_CASE_FILTER,
    }
  });

export const SCHOOL_YEAR_REGISTRATIONS_VIEW_SCHOOL = Object.freeze(
  {
    tableHeaders: [
      { title: 'select', key: 'select' },
      { title: 'Session', key: 'session'},
      { title: 'PEN', key: 'pen' },
      { title: 'Assessment Center', key: 'assessmentCenterName_desc' },
      { title: 'Local ID', key: 'localID' },
      { title: 'Surname, Given Name', key: 'name' },
      { title: 'Assessment Code', key: 'assessmentTypeCode' },
      { title: 'Score', key: 'proficiencyScore' },
      { title: 'Special Case', key: 'provincialSpecialCaseName_desc' },
      { title: 'ISR', key: 'isr' },
    ],
    allowedFilters: {
      session: SESSION_CODE_FILTER,
      assessmentTypeCode: ASSESSMENT_TYPE_CODE_FILTER,
      proficiencyScoreValue: PROFICIENCY_SCORE_RANGE_FILTER,
      provincialSpecialCaseCode: SPECIAL_CASE_FILTER,
    }
  });

