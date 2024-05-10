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
    sdcSchoolCollectionStatusCode: 'NEW',
    index: 0
  },
  {
    id: 'step-2',
    title: 'Review & Fix Data Issues',
    step: 2,
    sdcSchoolCollectionStatusCode: 'LOADED',
    index: 1
  },
  {
    id: 'step-3',
    title: 'Edit/Verify Data Issues',
    step: 3,
    sdcSchoolCollectionStatusCode: 'REVIEWED',
    index: 2
  },
  {
    id: 'step-4',
    title: 'Review & Fix Duplicates',
    step: 4,
    sdcSchoolCollectionStatusCode: 'VERIFIED',
    index: 3
  },
  {
    id: 'step-5',
    title: 'Verify School Details (1601)',
    step: 5,
    sdcSchoolCollectionStatusCode: 'DUP_VRFD',
    index: 4
  },
  {
    id: 'step-6',
    title: 'Verify School Contacts (1601)',
    step: 6,
    sdcSchoolCollectionStatusCode: 'SCH_D_VRFD',
    index: 5
  },
  {
    id: 'step-7',
    title: 'Submit Data',
    step: 7,
    sdcSchoolCollectionStatusCode: 'SCH_C_VRFD',
    index: 6
  },
  {
    id: 'step-7',
    title: 'Submit Data',
    step: 7,
    sdcSchoolCollectionStatusCode: 'SUBMITTED',
    index: 7
  },
]);

export const SDC_STEPS_DISTRICT = Object.freeze([
  {
    id: 'step-1',
    title: 'Upload Data',
    step: 1,
    sdcDistrictCollectionStatusCode: 'NEW',
    index: 0
  },
  {
    id: 'step-2',
    title: 'Monitor School Submissions',
    step: 2,
    sdcDistrictCollectionStatusCode: 'LOADED',
    index: 1
  },
  {
    id: 'step-3',
    title: 'Edit/Verify Data',
    step: 3,
    sdcDistrictCollectionStatusCode: 'REVIEWED',
    index: 2
  },
  {
    id: 'step-4',
    title: 'Resolve In-District Duplicates',
    step: 4,
    sdcDistrictCollectionStatusCode: 'VERIFIED',
    index: 3
  },
  {
    id: 'step-5',
    title: 'Submit to Ministry',
    step: 5,
    sdcDistrictCollectionStatusCode: 'D_DUP_VRFD',
    index: 4
  },
  {
    id: 'step-6',
    title: 'Resolve Province Duplicates',
    step: 6,
    sdcDistrictCollectionStatusCode: 'SUBMITTED',
    index: 5
  },
  {
    id: 'step-7',
    title: 'Review & Sign-Off Final Submission',
    step: 7,
    sdcDistrictCollectionStatusCode: '',
    index: 6
  },

]);
