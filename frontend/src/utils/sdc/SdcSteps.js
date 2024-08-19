/**
 * @type {({sdcSchoolCollectionStatusCode: string, step: number, title: string}|{sdcSchoolCollectionStatusCode: string, step: number, title: string}|{sdcSchoolCollectionStatusCode: string, step: number, title: string}|{sdcSchoolCollectionStatusCode: string, step: number, title: string}|{sdcSchoolCollectionStatusCode: string, step: number, title: string})[]}
 * step refers to the stepper window step which starts at 1
 * example: step-1 of the collection process is at step 1
 */
export const SDC_STEPS_SCHOOL = Object.freeze([
  {
    id: 'step-1',
    title: 'Upload Data',
    step: 1,
    sdcSchoolCollectionStatusCode: ['NEW', 'DIS_UPLOAD'],
    index: 1,
    showSubmissionDate: false
  },
  {
    id: 'step-2',
    title: 'Review & Fix Data Issues',
    step: 2,
    sdcSchoolCollectionStatusCode: ['LOADED'],
    index: 2,
    showSubmissionDate: false
  },
  {
    id: 'step-3',
    title: 'Edit/Verify Data Issues',
    step: 3,
    sdcSchoolCollectionStatusCode: ['REVIEWED'],
    index: 3,
    showSubmissionDate: false
  },
  {
    id: 'step-4',
    title: 'Review & Fix Identical PENs',
    step: 4,
    sdcSchoolCollectionStatusCode: ['VERIFIED'],
    index: 4,
    showSubmissionDate: false
  },
  {
    id: 'step-5',
    title: 'Submit Data',
    step: 5,
    sdcSchoolCollectionStatusCode: ['DUP_VRFD','SUBMITTED'],
    index: 5,
    showSubmissionDate: true
  },
  {
    id: 'step-6',
    title: 'Resolve Province Duplicates',
    step: 6,
    sdcSchoolCollectionStatusCode: ['P_DUP_POST'],
    index: 6,
    showSubmissionDate: false
  },
  {
    id: 'step-7',
    title: 'Completed',
    step: 7,
    sdcSchoolCollectionStatusCode: ['COMPLETED'],
    index: 7,
    showSubmissionDate: false
  }
]);

export const SDC_STEPS_SUMMER_SCHOOL = Object.freeze([
  {
    id: 'step-1',
    title: 'Upload Data',
    step: 1,
    sdcSchoolCollectionStatusCode: ['NEW', 'DIS_UPLOAD'],
    index: 1,
    showSubmissionDate: false
  },
  {
    id: 'step-2',
    title: 'Review & Fix Data Issues',
    step: 2,
    sdcSchoolCollectionStatusCode: ['LOADED'],
    index: 2,
    showSubmissionDate: false
  },
  {
    id: 'step-3',
    title: 'Edit/Verify Data Issues',
    step: 3,
    sdcSchoolCollectionStatusCode: ['REVIEWED'],
    index: 3,
    showSubmissionDate: false
  },
  {
    id: 'step-4',
    title: 'Review & Fix Identical PENs',
    step: 4,
    sdcSchoolCollectionStatusCode: ['VERIFIED'],
    index: 4,
    showSubmissionDate: false
  },
  {
    id: 'step-5',
    title: 'Submit Data',
    step: 5,
    sdcSchoolCollectionStatusCode: ['DUP_VRFD','SUBMITTED', 'COMPLETED'],
    index: 5,
    showSubmissionDate: true
  }
]);

export const SDC_STEPS_INDP_SCHOOL = Object.freeze([
  {
    id: 'step-1',
    title: 'Upload Data',
    step: 1,
    sdcSchoolCollectionStatusCode: ['NEW', 'DIS_UPLOAD'],
    index: 1,
    showSubmissionDate: false
  },
  {
    id: 'step-2',
    title: 'Review & Fix Data Issues',
    step: 2,
    sdcSchoolCollectionStatusCode: ['LOADED'],
    index: 2,
    showSubmissionDate: false
  },
  {
    id: 'step-3',
    title: 'Edit/Verify Data Issues',
    step: 3,
    sdcSchoolCollectionStatusCode: ['REVIEWED'],
    index: 3,
    showSubmissionDate: false
  },
  {
    id: 'step-4',
    title: 'Review & Fix Identical PENs',
    step: 4,
    sdcSchoolCollectionStatusCode: ['VERIFIED'],
    index: 4,
    showSubmissionDate: false
  },
  {
    id: 'step-5',
    title: 'Verify School Details (1601)',
    step: 5,
    sdcSchoolCollectionStatusCode: ['DUP_VRFD'],
    index: 5,
    showSubmissionDate: false
  },
  {
    id: 'step-6',
    title: 'Verify School Contacts (1601)',
    step: 6,
    sdcSchoolCollectionStatusCode: ['SCH_D_VRFD'],
    index: 6,
    showSubmissionDate: false
  },
  {
    id: 'step-7',
    title: 'Submit Data',
    step: 7,
    sdcSchoolCollectionStatusCode: ['SCH_C_VRFD', 'SUBMITTED'],
    index: 7,
    showSubmissionDate: true
  },
  {
    id: 'step-8',
    title: 'Resolve Province Duplicates',
    step: 8,
    sdcSchoolCollectionStatusCode: ['P_DUP_POST'],
    index: 8,
    showSubmissionDate: false
  },
  {
    id: 'step-9',
    title: 'Completed',
    step: 9,
    sdcSchoolCollectionStatusCode: ['COMPLETED'],
    index: 9,
    showSubmissionDate: false
  }
]);

export const SDC_STEPS_SUMMER_INDP_SCHOOL = Object.freeze([
  {
    id: 'step-1',
    title: 'Upload Data',
    step: 1,
    sdcSchoolCollectionStatusCode: ['NEW', 'DIS_UPLOAD'],
    index: 1,
    showSubmissionDate: false
  },
  {
    id: 'step-2',
    title: 'Review & Fix Data Issues',
    step: 2,
    sdcSchoolCollectionStatusCode: ['LOADED'],
    index: 2,
    showSubmissionDate: false
  },
  {
    id: 'step-3',
    title: 'Edit/Verify Data Issues',
    step: 3,
    sdcSchoolCollectionStatusCode: ['REVIEWED'],
    index: 3,
    showSubmissionDate: false
  },
  {
    id: 'step-4',
    title: 'Review & Fix Identical PENs',
    step: 4,
    sdcSchoolCollectionStatusCode: ['VERIFIED'],
    index: 4,
    showSubmissionDate: false
  },
  {
    id: 'step-5',
    title: 'Verify School Details (1601)',
    step: 5,
    sdcSchoolCollectionStatusCode: ['DUP_VRFD'],
    index: 5,
    showSubmissionDate: false
  },
  {
    id: 'step-6',
    title: 'Verify School Contacts (1601)',
    step: 6,
    sdcSchoolCollectionStatusCode: ['SCH_D_VRFD'],
    index: 6,
    showSubmissionDate: false
  },
  {
    id: 'step-7',
    title: 'Submit Data',
    step: 7,
    sdcSchoolCollectionStatusCode: ['SCH_C_VRFD', 'SUBMITTED', 'COMPLETED'],
    index: 7,
    showSubmissionDate: true
  }
]);

export const SDC_STEPS_DISTRICT = Object.freeze([
  {
    id: 'step-1',
    title: 'Upload Data',
    step: 1,
    sdcDistrictCollectionStatusCode: ['NEW'],
    index: 1
  },
  {
    id: 'step-2',
    title: 'Monitor School Submissions',
    step: 2,
    sdcDistrictCollectionStatusCode: ['LOADED'],
    index: 2
  },
  {
    id: 'step-3',
    title: 'Edit/Verify Data',
    step: 3,
    sdcDistrictCollectionStatusCode: ['REVIEWED'],
    index: 3
  },
  {
    id: 'step-4',
    title: 'Resolve In-District Duplicates',
    step: 4,
    sdcDistrictCollectionStatusCode: ['VERIFIED'],
    index: 4
  },
  {
    id: 'step-5',
    title: 'Submit to Ministry',
    step: 5,
    sdcDistrictCollectionStatusCode: ['D_DUP_VRFD', 'SUBMITTED'],
    index: 5
  },
  {
    id: 'step-6',
    title: 'Provincial Duplicates',
    step: 6,
    sdcDistrictCollectionStatusCode: 'P_DUP_POST',
    index: 6
  },
  {
    id: 'step-7',
    title: 'Sign-Off Final Submission',
    step: 7,
    sdcDistrictCollectionStatusCode: ['P_DUP_VRFD', 'COMPLETED'],
    index: 7
  },

]);

export const SDC_STEPS_SUMMER_DISTRICT = Object.freeze([
  {
    id: 'step-1',
    title: 'Upload Data',
    step: 1,
    sdcDistrictCollectionStatusCode: ['NEW'],
    index: 1
  },
  {
    id: 'step-2',
    title: 'Monitor School Submissions',
    step: 2,
    sdcDistrictCollectionStatusCode: ['LOADED'],
    index: 2
  },
  {
    id: 'step-3',
    title: 'Edit/Verify Data',
    step: 3,
    sdcDistrictCollectionStatusCode: ['REVIEWED'],
    index: 3
  },
  {
    id: 'step-4',
    title: 'Submit to Ministry',
    step: 4,
    sdcDistrictCollectionStatusCode: ['REVIEWED', 'SUBMITTED', 'COMPLETED'],
    index: 4
  }

]);
