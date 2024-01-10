/**
 * @type {({sdcSchoolCollectionStatusCode: string, index: number, title: string}|{sdcSchoolCollectionStatusCode: string, index: number, title: string}|{sdcSchoolCollectionStatusCode: string, index: number, title: string}|{sdcSchoolCollectionStatusCode: string, index: number, title: string}|{sdcSchoolCollectionStatusCode: string, index: number, title: string})[]}
 * index refers to the stepper window index which starts at 0
 * example: step-1 of the collection process is at index 0
 */
export const SDC_STEPS_SCHOOL = Object.freeze([
  {
    title: 'Upload Data',
    index: 0,
    sdcSchoolCollectionStatusCode: 'NEW'
  },
  {
    title: 'Review & Fix Data Issues',
    index: 1,
    sdcSchoolCollectionStatusCode: 'LOADED'
  },
  {
    title: 'Edit/Verify Data Issues',
    index: 2,
    sdcSchoolCollectionStatusCode: 'REVIEWED'
  },
  {
    title: 'Verify School Details (1601)',
    index: 3,
    sdcSchoolCollectionStatusCode: 'SCH_D_VRFD'
  },
  {
    title: 'Verify School Contacts (1601)',
    index: 4,
    sdcSchoolCollectionStatusCode: 'SCH_C_VRFD'
  },
  {
    title: 'Submit Data',
    index: 5,
    sdcSchoolCollectionStatusCode: 'TO_BE_CONFIRMED' //confirm this step when implemented
  },
]);
