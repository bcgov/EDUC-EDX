<template>
  <v-card class="document-upload">

    <v-card-title><h3>Document Upload</h3></v-card-title>
    <!-- <v-card-text> -->
    <v-form
      ref="form"
      v-model="validForm"
    >
      <v-select
        color="#003366"
        v-model="documentTypeCode"
        required
        :rules="requiredRules"
        outlined
        :eager="eager"
        :items="documentTypes"
        label="Document Type"
      ></v-select>
      <v-file-input
        color="#003366"
        :rules="fileRules"
        :accept="fileAccept"
        placeholder="Select your file"
        :error-messages="fileInputError"
        @change="selectFile"
      ></v-file-input>
      <p class="bottom-text">{{fileFormats}} files supported</p>


      </v-form>
      <v-alert
        dense
        outlined
        dismissible
        v-model="alert"
        :class="alertType"
        class="mb-3"
      >
         {{ alertMessage }}
      </v-alert>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="#003366"
          class="white--text"
          id="upload_form"
          @click="submitRequest"
          :disabled="!dataReady"
          :loading="active"
          :key="buttonKey"
        >
          Upload
        </v-btn>
        <v-btn
          color="#003366"
          class="white--text"
          @click="closeForm"
        >
          Close
        </v-btn>
      </v-card-actions>


  </v-card>
</template>

<script>
import { humanFileSize, getFileNameWithMaxNameLength } from '@/utils/file';
import ApiService from '@/common/apiService';
import { mapGetters } from 'vuex';
import { sortBy } from 'lodash';

export default {
  props: {
    eager: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      fileRules: [ ],
      fileAccept: '',
      fileFormats: 'PDF, JPEG, and PNG',
      requiredRules: [v => !!v || 'Required'],
      validForm: true,
      fileInputError: [],
      documentTypeCode: null,
      file: null,
      active: false,
      buttonKey: 0,

      alert: false,
      alertMessage: null,
      alertType: null

    };
  },
  created() {
    this.getFileRules().catch(e => {
      console.log(e);
      this.setErrorAlert('Sorry, an unexpected error seems to have occured. You can upload files later.');
    });
  },
  watch: {
    dataReady() {
      //force re-renders of the button to solve the color issue
      this.buttonKey += 1;
    },
  },
  computed: {
    ...mapGetters(['requestType']),
    documentTypeCodes() {
      return this.$store.getters[`${this.requestType}/documentTypeCodes`];
    },
    requestID() {
      return this.$store.getters[`${this.requestType}/requestID`];
    },
    dataReady () {
      return this.validForm && this.file;
    },
    documentTypes() {
      return sortBy(this.documentTypeCodes, ['displayOrder']).map(code =>
        ({text: code.label, value: code.documentTypeCode}));
    }
  },
  methods: {
    setUploadedDocument(document) {
      this.$store.commit(`${this.requestType}/setUploadedDocument`, document);
    },
    closeForm() {
      this.resetForm();
      this.$emit('close:form');
    },
    resetForm() {
      this.$refs.form.reset();
      this.fileInputError = [];
      this.alert = false;
      this.active = false;
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
      this.file = file;
      if(!this.file && !this.active) {
        this.fileInputError = 'Required';
      } else {
        this.fileInputError = [];
        this.alert = false;
      }
    },
    validate() {
      this.$refs.form.validate();
    },
    submitRequest() {
      if(this.dataReady){
        try {
          if(this.file.name && this.file.name.match('^[\\u0080-\\uFFFF\\w,\\s-_]+\\.[A-Za-z]{3,4}$')){
            this.active = true;
            const reader = new FileReader();
            reader.onload = this.uploadFile;
            reader.onabort = this.handleFileReadErr;
            reader.onerror = this.handleFileReadErr;
            reader.readAsBinaryString(this.file);
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
    uploadFile(env) {
      let document = {
        documentTypeCode: this.documentTypeCode,
        fileName: getFileNameWithMaxNameLength(this.file.name),
        fileExtension: this.file.type,
        fileSize: this.file.size,
        documentData: btoa(env.target.result)
      };

      return ApiService.uploadFile(this.requestID, document, this.requestType).then(response => {
        this.setUploadedDocument(response.data);
        this.resetForm();
        this.setSuccessAlert();
      }).catch(() => {
        this.handleFileReadErr();
      });
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
    async getFileRules() {
      const response = await ApiService.getFileRequirements(this.requestType);
      const fileRequirements = response.data;
      const maxSize = fileRequirements.maxSize;
      this.fileRules = [
        value => !value || value.size < maxSize || `File size should not be larger than ${humanFileSize(maxSize)}!`,
        value => !value || fileRequirements.extensions.includes(value.type) || `File formats should be ${this.fileFormats}.`,
      ];
      this.fileAccept = fileRequirements.extensions.join();
      this.fileFormats = this.makefileFormatList(fileRequirements.extensions);
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
  padding-top: 10px
}
ul{
  width: 100%
}

.v-input{
  padding-bottom: 0;
}
.bottom-text{
  /* margin-top: -0.7rem; */
  padding-top: 0;
  color: #666666;
  margin-left: 1.7rem;
  font-size: 0.8rem
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
