export const vInputParentOf = (selector: () => Cypress.Chainable<JQuery<HTMLElement>>) =>
  () => selector().parents('.v-input');

