
/**
 * stepStatus values: 'in-progress', 'not-started', 'complete'
 */
export const SLD_STEPS = Object.freeze(
  [
    {
      label: 'STEP-1',
      name: 'Verify School Details (1601)',
      route: 'step-1',
      next: 'step-2',
      index: 0,
      isComplete: false
    }, {
      label: 'STEP-2',
      name: 'Verify School Contacts (1601)',
      route: 'step-2',
      next: 'step-3',
      index: 1,
      isComplete: false
    }, {
      label: 'STEP-3',
      name: 'Upload Data',
      route: 'step-3',
      next: 'step-4',
      index: 2,
      isComplete: false
    }, {
      label: 'STEP-4',
      name: 'Review & Fix Data Issues',
      route: 'step-4',
      next: 'step-5',
      index: 3,
      isComplete: false
    }, {
      name: 'Edit/Verify Data & Submit',
      index: 4,
      isComplete: false
    }
  ]
);
