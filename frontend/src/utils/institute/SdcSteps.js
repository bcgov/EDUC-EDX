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
    sdcSchoolCollectionStatusCode: 'NEW'
  },
  {
    id: 'step-2',
    title: 'Review & Fix Data Issues',
    step: 2,
    sdcSchoolCollectionStatusCode: 'LOADED'
  },
  {
    id: 'step-3',
    title: 'Review & Fix Duplicates',
    step: 3,
    sdcSchoolCollectionStatusCode: 'SCH_DUPLI'
  },
  {
    id: 'step-4',
    title: 'Edit/Verify Data Issues',
    step: 4,
    sdcSchoolCollectionStatusCode: 'REVIEWED'
  },
  {
    id: 'step-5',
    title: 'Verify School Details (1601)',
    step: 5,
    sdcSchoolCollectionStatusCode: 'SCH_D_VRFD'
  },
  {
    id: 'step-6',
    title: 'Verify School Contacts (1601)',
    step: 6,
    sdcSchoolCollectionStatusCode: 'SCH_C_VRFD'
  },
  {
    id: 'step-7',
    title: 'Submit Data',
    step: 7,
    sdcSchoolCollectionStatusCode: 'SUBMITTED'
  },
]);

export const SDC_STEPS_DISTRICT = Object.freeze([
  {
    id: 'step-1',
    title: 'Upload Data',
    step: 1,
    sdcDistrictCollectionStatusCode: 'NEW'
  },
  {
    id: 'step-2',
    title: 'Monitor School Submissions',
    step: 2,
    sdcDistrictCollectionStatusCode: 'MONITORING'
  },
]);
