import { t, Selector } from 'testcafe';
import log from 'npmlog';

class FormWithFields {
  /** @param {string} submitSelector */
  constructor(submitSelector) {
    this.submitButton = Selector(submitSelector);
  }

  /**
   * @param {Selector} field - The message Selector field to test
   * @param {string} [name] - A name for the npmlog
   */
  async verifyFieldIsValid(field, name) {
    await t.expect(field.parent('div.v-input').hasClass('error--text')).notOk();
    log.info('pass:', name ? `${name} field is valid` : 'field is valid');
  }

  /**
   * @param {Selector} field - The message Selector field to test
   * @param {string} [name] - A name for the npmlog
   */
  async verifyFieldIsInvalid(field, name) {
    await t.expect(field.parent('div.v-input').hasClass('error--text')).ok();
    log.info('pass:', name ? `${name} field is invalid` : 'field is invalid');
  }

  /**
   * @param {Selector} field - The field to clear
   * @param {string} [name] - A name for the npmlog
   */
  async clearTextField(field, name) {
    await t.selectText(field).pressKey('delete');
    log.info( 'input:', name ? `${name} field has been cleared` : 'field has been cleared');
  }

  async verifySubmitIsDisabled() {
    await t.expect(this.submitButton.hasAttribute('disabled')).ok();
    log.info('pass:', 'The submit button is disabled');
  }

  async verifySubmitIsEnabled() {
    await t.expect(this.submitButton.hasAttribute('disabled')).notOk();
    log.info('pass:', 'The submit button is enabled');
  }
}

export default FormWithFields;
