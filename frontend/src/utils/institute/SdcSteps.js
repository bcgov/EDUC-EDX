/**
 * @type {({sdcSchoolCollectionStatusCode: string, step: number, title: string}|{sdcSchoolCollectionStatusCode: string, step: number, title: string}|{sdcSchoolCollectionStatusCode: string, step: number, title: string}|{sdcSchoolCollectionStatusCode: string, step: number, title: string}|{sdcSchoolCollectionStatusCode: string, step: number, title: string})[]}
 * step refers to the stepper window step which starts at 1
 * example: step-1 of the collection process is at step 1
 */
export const SDC_STEPS_SCHOOL = Object.freeze([
  {
    title: 'Upload Data',
    step: 1,
    sdcSchoolCollectionStatusCode: 'NEW'
  },
  {
    title: 'Review & Fix Data Issues',
    step: 2,
    sdcSchoolCollectionStatusCode: 'LOADED'
  },
  {
    title: 'Edit/Verify Data Issues',
    step: 3,
    sdcSchoolCollectionStatusCode: 'REVIEWED'
  },
  {
    title: 'Verify School Details (1601)',
    step: 4,
    sdcSchoolCollectionStatusCode: 'SCH_D_VRFD'
  },
  {
    title: 'Verify School Contacts (1601)',
    step: 5,
    sdcSchoolCollectionStatusCode: 'SCH_C_VRFD'
  },
  {
    title: 'Submit Data',
    step: 6,
    sdcSchoolCollectionStatusCode: 'TO_BE_CONFIRMED' //confirm this step when implemented
  },
]);
