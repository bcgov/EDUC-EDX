<template>
  <v-card class="document-upload">
    <v-card-title class="pb-8">
      <h3>Document Upload</h3>
    </v-card-title>
    <v-card-text>
      <v-form
        ref="documentForm"
        v-model="validForm"
      >
        <v-row style="min-width: 50em">
          <v-col>
            <v-select
              id="uploadDocumentTypeCodeSelect"
              v-model="documentTypeCode"
              color="#003366"
              required
              variant="underlined"
              :rules="requiredRules"
              outlined
              item-title="text"
              class="pb-0 mb-0"
              :eager="eager"
              :items="documentTypes"
              label="Document Type"
            />
            <v-file-input
              id="selectFileInput"
              v-model="uploadFileValue"
              color="#003366"
              variant="underlined"
              :accept="fileAccept"
              :disabled="hasReadOnlyRoleAccess()"
              hint="JPEG, PNG, and PDF files supported"
              :error-messages="fileInputError"
              placeholder="Select your file"
              :rules="fileRules"
            />
          </v-col>
        </v-row>

        <!--^^^ @click event to solve issue when adding 2 files with the same name back to back-->
        <!--https://stackoverflow.com/questions/54124977/vuejs-input-file-selection-event-not-firing-upon-selecting-the-same-file-->
      </v-form>
      <v-alert
        v-model="alert"
        dense
        outlined
        dismissible
        :class="alertType"
        class="mb-3"
      >
        {{ alertMessage }}
      </v-alert>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <PrimaryButton
        id="cancelUploadButton"
        secondary
        text="Cancel"
        :click-action="closeForm"
      />
      <PrimaryButton
        id="upload_form"
        :key="buttonKey"
        :loading="active"
        :disabled="!dataReady"
        text="Upload"
        width="7rem"
        :click-action="submitRequest"
      />
    </v-card-actions>
  </v-card>
</template>

<script>
import {getFileNameWithMaxNameLength, humanFileSize} from '../../utils/file';
import { edxStore } from '../../store/modules/edx';
import { mapState } from 'pinia';
import {sortBy} from 'lodash';
import PrimaryButton from '../util/PrimaryButton.vue';

export default {
  components: {PrimaryButton},
  props: {
    eager: {
      type: Boolean,
      default: false
    },
  },
  emits: ['close:form', 'upload'],
  data() {
    return {
      fileAccept: '.pdf,.png,.jpg',
      requiredRules: [v => !!v || 'Required'],
      fileRules: [],
      filesAccept: '',
      validForm: false,
      fileInputError: [],
      documentTypeCode: null,
      uploadFileValue: null,
      active: false,
      buttonKey: 0,
      alert: false,
      alertMessage: null,
      alertType: null
    };
  },
  computed: {
    ...mapState(edxStore,['secureExchangeDocumentTypes', 'fileRequirements']),
    dataReady() {
      return this.validForm && this.uploadFileValue;
    },
    documentTypes() {
      return sortBy(this.secureExchangeDocumentTypes, ['displayOrder'])
        .map(code => ({text: code.label, value: code.secureExchangeDocumentTypeCode}));
    }
  },
  watch: {
    dataReady() {
      //force re-renders of the button to solve the color issue
      this.buttonKey += 1;
    },
  },
  async created() {
    await edxStore().getSecureExchangeDocumentTypes();
    await edxStore().getFileRequirements();

    this.getFileRules();
    await this.validateForm();
  },
  methods: {
    hasReadOnlyRoleAccess() {
      return false;
    },
    closeForm() {
      this.resetForm();
      this.$emit('close:form');
    },
    resetForm() {
      this.$refs.documentForm.reset();
      this.fileInputError = [];
      this.uploadFileValue = null;
      this.alert = false;
      this.active = false;
      this.alertMessage = null;
      this.documentTypeCode = null;
      this.validateForm();
    },
    setSuccessAlert() {
      this.alertMessage = 'File upload successful.';
      this.alertType = 'bootstrap-success';
      this.alert = true;
    },
    setErrorAlert(alertMessage) {
      this.alertMessage = alertMessage;
      this.alertType = 'bootstrap-error';
      this.alert = true;
    },
    selectFile(file) {
      this.uploadFileValue = file;
      if(!this.uploadFileValue && !this.active) {
        this.fileInputError = 'Required';
      } else {
        this.fileInputError = [];
        this.alert = false;
      }
    },
    submitRequest() {
      if(this.dataReady){
        try {
          if(this.uploadFileValue[0].name && this.uploadFileValue[0].name.match('^[\\u0080-\\uFFFF\\w,\\s-_]+\\.[A-Za-z]{3,4}$')){
            this.active = true;
            const reader = new FileReader();
            reader.onload = this.uploadFile;
            reader.onabort = this.handleFileReadErr;
            reader.onerror = this.handleFileReadErr;
            reader.readAsBinaryString(this.uploadFileValue[0]);
          }else{
            this.active = false;
            this.setErrorAlert('Please remove spaces and special characters from file name and try uploading again.');
          }
        } catch (e) {
          this.handleFileReadErr();
          throw e;
        }
      }
    },
    handleFileReadErr() {
      this.active = false;
      this.setErrorAlert('Sorry, an unexpected error seems to have occurred. Try uploading your files later.');
    },
    async validateForm() {
      const valid = await this.$refs.documentForm.validate();
      this.isFormValid = valid.valid;
    },
    async uploadFile(env) {
      let document = {
        fileName: getFileNameWithMaxNameLength(this.uploadFileValue[0].name),
        fileExtension: this.uploadFileValue[0].type,
        fileSize: this.uploadFileValue[0].size,
        documentTypeCode: this.documentTypeCode,
        documentData: btoa(env.target.result)
      };
      this.$emit('upload', document);
      this.resetForm();
      this.$emit('close:form');
    },
    makefileFormatList(extensions) {
      extensions = extensions.map(v => v.split(new RegExp('/'))[1]).filter(v => v).map(v => v.toUpperCase());
      if(extensions.length <= 2) {
        return extensions.join(' and ');
      } else {
        const lastTwo = extensions.splice(-2, 2).join(', and ');
        extensions.push(lastTwo);
        return extensions.join(', ');
      }
    },
    getFileRules() {
      const maxSize = this.fileRequirements.maxSize;
      this.fileRules = [
        value => {
          if(value){
            return true;
          }
          return 'Required';
        },
        value => {
          return !value || !value.length || value[0].size < maxSize || `File size should not be larger than ${humanFileSize(maxSize)}!`;
        },
        value => {
          return !value || !value.length || this.fileRequirements.extensions.includes(value[0].type) || `File formats should be ${this.fileFormats}.`;
        }
      ];
      this.fileAccept = this.fileRequirements.extensions.join();
      this.fileFormats = this.makefileFormatList(this.fileRequirements.extensions);
    },
  },
};
</script>

<style scoped>
.document-upload{
  padding: 1.1rem;
  max-width: 50rem;
  min-width: 10rem;
}

.v-dialog > .v-card > .v-card__text {
  padding: 24px 24px 20px;
}

p{
  padding-top: 10px;
}
ul{
  width: 100%;
}

.v-input >>> .v-input__slot{
  padding-top: 0;
}

.v-input{
  padding-bottom: 0;
}
.bottom-text{
  /* margin-top: -0.7rem; */
  padding-top: 0;
  color: #666666;
  margin-left: 1.7rem;
  font-size: 0.8rem;
}

.v-text-field__details{
  display: none !important;
  height: 0 !important;
  min-height: 0 !important;
}
.v-messages{
  min-height: 0 !important;
  height: 0 !important;
}

h3 {
  font-size: 1.2rem
}

.v-alert {
  font-size: 1.05rem;
}

</style>
