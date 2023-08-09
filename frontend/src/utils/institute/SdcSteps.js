
/**
 * stepStatus values: 'in-progress', 'not-started', 'complete'
 */
export const SDC_STEPS = Object.freeze(
  [
    {
      label: 'STEP-1',
      name: 'Upload Data',
      id: 'step-1',
      route: 'step-1',
      next: 'step-2',
      index: 0,
      isStarted: false,
      isComplete: false
    }, {
      label: 'STEP-2',
      name: 'Review & Fix Data Issues',
      id: 'step-2',
      route: 'step-2',
      next: 'step-3',
      index: 1,
      isStarted: false,
      isComplete: false
    }, {
      label: 'STEP-3',
      name: 'Edit/Verify Data',
      id: 'step-3',
      route: 'step-3',
      next: 'step-4',
      index: 2,
      isStarted: false,
      isComplete: false
    }, {
      label: 'STEP-4',
      name: 'Verify School Details (1601)',
      id: 'step-4',
      route: 'step-4',
      next: 'step-5',
      index: 3,
      isStarted: false,
      isComplete: false
    }, {
      label: 'STEP-5',
      name: 'Verify School Contacts(1601)',
      id: 'step-5',
      index: 4,
      route: 'step-5',
      isStarted: false,
      isComplete: false
    }, {
      label: 'STEP-6',
      name: 'Submit Data',
      id: 'step-6',
      index: 5,
      route: 'step-5',
      isStarted: false,
      isComplete: false
    }
  ]
);
