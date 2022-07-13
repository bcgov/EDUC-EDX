<template>
  <v-card class="document-upload">
    <v-card-title class="pb-8"><h3>Document Upload</h3></v-card-title>
    <v-card-text>
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
            class="pb-0 mb-0"
            :eager="eager"
            :items="documentTypes"
            label="Document Type"
        ></v-select>
        <v-file-input
            color="#003366"
            class="pt-0"
            :accept="fileAccept"
            :disabled="hasReadOnlyRoleAccess()"
            :rules="fileRules"
            placeholder="Select your file"
            hint="JPEG, PNG, and PDF files supported"
            :error-messages="fileInputError"
            @change="selectFile"
            @click="$event.target.value=''"
        ></v-file-input>
        <!--^^^ @click event to solve issue when adding 2 files with the same name back to back-->
        <!--https://stackoverflow.com/questions/54124977/vuejs-input-file-selection-event-not-firing-upon-selecting-the-same-file-->
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
    </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <PrimaryButton id="cancelMessage" secondary text="Cancel"
                       @click.native="closeForm"></PrimaryButton>
        <PrimaryButton :key="buttonKey" :loading="active" :disabled="!dataReady" id="upload_form"
                       text="Upload" width="7rem" @click.native="submitRequest"></PrimaryButton>
      </v-card-actions>


  </v-card>
</template>

<script>
import {getFileNameWithMaxNameLength, humanFileSize} from '@/utils/file';
import { mapGetters } from 'vuex';
import {sortBy} from 'lodash';
import PrimaryButton from '../util/PrimaryButton';

export default {
  components: {PrimaryButton},
  props: {
    eager: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      fileAccept: '.pdf,.png,.jpg',
      requiredRules: [v => !!v || 'Required'],
      fileRules: [],
      filesAccept: '',
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
  watch: {
    dataReady() {
      //force re-renders of the button to solve the color issue
      this.buttonKey += 1;
    },
  },
  async created() {
    await this.$store.dispatch('edx/getSecureExchangeDocumentTypes');
    await this.$store.dispatch('edx/getFileRequirements');

    this.getFileRules().catch(e => {
      console.log(e);
      this.setErrorAlert('Error obtaining file requirements occurred. You can upload files later.');
    });
  }
  ,
  computed: {
    ...mapGetters('edx',['secureExchangeDocumentTypes', 'fileRequirements']),
    dataReady () {
      return this.validForm && this.file;
    },
    documentTypes() {
      return sortBy(this.secureExchangeDocumentTypes, ['displayOrder'])
        .map(code => ({text: code.label, value: code.secureExchangeDocumentTypeCode}));
    }
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
      this.$refs.form.reset();
      this.fileInputError = [];
      this.file = null;
      this.alert = false;
      this.active = false;
      this.alertMessage = null;
      this.documentTypeCode = null;
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
    async uploadFile(env) {
      let document = {
        fileName: getFileNameWithMaxNameLength(this.file.name),
        fileExtension: this.file.type,
        fileSize: this.file.size,
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
    async getFileRules() {
      const maxSize = this.fileRequirements.maxSize;
      this.fileRules = [
        value => !value || value.size < maxSize || `File size should not be larger than ${humanFileSize(maxSize)}!`,
        value => !value || this.fileRequirements.extensions.includes(value.type) || `File formats should be ${this.fileFormats}.`,
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
