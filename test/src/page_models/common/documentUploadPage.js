import { Selector, t } from 'testcafe';
const log = require('npmlog');

class DocumentUploadPage {
  constructor() {

    //buttons
    this.uploadFormButton = Selector('#upload_form');
    this.closeFormButton = Selector('#cancelUploadButton');

    //inputs
    this.selectFile = Selector('#selectFileInput');
    this.documentTypeSelect = Selector('#uploadDocumentTypeCodeSelect').parent('div[role="button"]');

    //response fields
    this.uploadAlert = Selector('.v-messages__message');
  }

  async clickUploadButton() {
    await t.click(this.uploadFormButton);
    log.info("Upload button is clicked");
  }

  async clickCancelButton() {
    await t.click(this.closeFormButton);
    log.info("Cancel button is clicked");
  }

  async clickDocumentTypeSelect() {
    await t.click(this.documentTypeSelect);
    log.info("Document type selector clicked");
  }

  async selectDocumentTypeByName(name) {
    const documentTypeOption = await Selector('div.v-select-list .v-list-item__content').withExactText(name);
    const documentTypeOptionSelectedText = await documentTypeOption.innerText;
    await t.click(documentTypeOption);
    log.info(`Document type option ${documentTypeOptionSelectedText} selected`);
  }

  async uploadDocument(data) {
    await t.setFilesToUpload((this.selectFile), [data]);
    log.info('File uploaded');
  }

  async verifyMaxFileSizeError() {
    await t.expect(this.uploadAlert.innerText).eql("File size should not be larger than 10 MB!");
    log.info('File size should not be larger than 10 MB! text verified');
  }
}

export default DocumentUploadPage