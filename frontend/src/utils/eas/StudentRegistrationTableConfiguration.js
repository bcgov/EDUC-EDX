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

export const REGISTRATIONS_TRANSFER_FILTER = Object.freeze(
  {
    heading: 'Registrations Transferred to e-Assessment System',
    id: 'transfer',
    multiple: false,
    key: 'transfer',
    filterOptions: [
      {
        title: 'Transferred',
        id: 'transfered',
        value: 'transfered'
      },
      {
        title: 'Not Transferred',
        id: 'notTransfered',
        value: 'notTransfered'
      },
    ]
  }
);


export const SCHOOL_YEAR_REGISTRATIONS_VIEW_DISTRICT = Object.freeze(
  {
    tableHeaders: [
      { title: 'select', key: 'select' },
      { title: '', key: 'alert' },
      { title: 'School', key: 'schoolName_desc' },
      { title: 'Session', key: 'session'},
      { title: 'Assessment Code', key: 'assessmentTypeCode' },
      { title: 'PEN', key: 'pen' },
      { title: 'Local ID', key: 'localID' },
      { title: 'Surname, Given Name', key: 'name' },
      { title: 'Assessment Centre', key: 'assessmentCenterName_desc' }
    ],
    allowedFilters: {
      session: SESSION_CODE_FILTER,
      assessmentTypeCode: ASSESSMENT_TYPE_CODE_FILTER,
      transfer: REGISTRATIONS_TRANSFER_FILTER
    }
  });

export const SCHOOL_YEAR_REGISTRATIONS_VIEW_SCHOOL = Object.freeze(
  {
    tableHeaders: [
      { title: 'select', key: 'select' },
      { title: '', key: 'alert' },
      { title: 'Session', key: 'session'},
      { title: 'Assessment Code', key: 'assessmentTypeCode' },
      { title: 'PEN', key: 'pen' },
      { title: 'Local ID', key: 'localID' },
      { title: 'Surname, Given Name', key: 'name' },
      { title: 'Assessment Centre', key: 'assessmentCenterName_desc' }
    ],
    allowedFilters: {
      session: SESSION_CODE_FILTER,
      assessmentTypeCode: ASSESSMENT_TYPE_CODE_FILTER,
      transfer: REGISTRATIONS_TRANSFER_FILTER
    }
  });

