
/**
 * stepStatus values: 'in-progress', 'not-started', 'complete'
 */
export const SDC_VERIFY_TABS = Object.freeze(
  [
    'All Students',
    'French Programs',
    'Career Programs',
    'Indigenous Students & Support Programs',
    'Inclusive Education',
    'English Language Learning',
    'Refugee'
  ]
);

/**
 * This is an supportive props object to allow changing the UX info for tabs.
 */
export const SDC_VERIFY_TAB_PROPS = Object.freeze(
  [
    {name: 'All Students', label:'All \n Students'},
    {name: 'French Programs', label:'French \n Programs'},
    {name: 'Career Programs', label:'Career \n Programs'},
    {name: 'Indigenous Students & Support Programs', label:'Indigenous Students \n & Support Programs'},
    {name: 'Inclusive Education', label:'Inclusive \n Education'},
    {name: 'English Language Learning', label:'English Language \n Learning'},
    {name: 'Refugee', label:'Refugee'},
  ]
);

export function getSdcVerifyTabLabel(name) {
  return SDC_VERIFY_TAB_PROPS.find(a => a.name === name)?.label;
}
