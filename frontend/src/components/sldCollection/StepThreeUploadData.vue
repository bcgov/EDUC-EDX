<template>
  <v-container 
    class="containerSetup"
    fluid
  >
    <div class="border">
      <v-row>
        <v-col class="mb-3 d-flex justify-center">
          <h1>Upload Student Level Data</h1>
        </v-col>
      </v-row>
      <v-row>
        <v-col offset="4">
          <span class="mr-3" style="font-weight: bold">Option 1:</span>
          <PrimaryButton
            id="uploadButton"
            secondary
            icon="mdi-file-upload"
            text="Upload 1701 Submission"
            :loading="isSelecting"
            :click-action="handleFileImport">
          </PrimaryButton>
        </v-col>
      </v-row>
      <v-row>
        <v-col offset="4">
          <v-row>
            <v-col cols="2">
              <span style="font-weight: bold">Option 2:</span>
            </v-col>
            <v-col class="ml-n12">
              <span>Report a zero enrollment for the school. This should only be used if ...</span>
              <v-checkbox-btn class="ml-n2" label="This school does not have a file for this collection." style="font-style: italic"></v-checkbox-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-file-input
        id="selectFileInput"
        style="display: none"
        ref="uploader"
        v-model="uploadFileValue"
        :accept="fileAccept"
      />
    </div>
  
    <v-row justify="end">
      <PrimaryButton
        id="nextButton"
        class="mr-2 mb-3"           
        icon="mdi-check"
        text="Next"
        :disabled="isDisabled"
        :click-action="next"
      />
    </v-row>
  </v-container>
</template>
    
<script>
import alertMixin from '../../mixins/alertMixin';
import PrimaryButton from '../util/PrimaryButton.vue';
import ApiService from '../../common/apiService';
import {ApiRoutes} from '../../utils/constants';
import {getFileNameWithMaxNameLength} from '../../utils/file';
    
export default {
  name: 'StepThreeUploadData',
  components: {
    PrimaryButton
  },
  mixins: [alertMixin],
  props: {
    sdcSchoolCollectionID: {
      type: String,
      required: false,
      default: '8e2018f5-872a-1d6d-8187-2abe660c0050'
    },
  },
  emits: ['next'],
  data() {
    return {
      fileAccept: '.txt',
      requiredRules: [v => !!v || 'Required'],
      fileRules: [],
      isSelecting: false,
      uploadFileValue: null,
      fileInputError: [],
      isDisabled: true
    };
  },
  computed: {
    dataReady() {
      return this.uploadFileValue;
    },
  },
  created() {
          
  },
  methods: {
    next() {
      this.$emit('next');
    },
    handleFileImport() {
      this.isSelecting = true;

      window.addEventListener('focus', () => {
        this.isSelecting = false;
      }, { once: true });

      this.$refs.uploader.click();
    },
    importFile() {
      let data = null;
      if (!this.uploadFileValue) {
        data = 'No File Chosen';
      }
      var reader = new FileReader();
      reader.readAsText(this.uploadFileValue[0]);
      reader.onload = () => {
        data = reader.result;
        this.uploadFile(data);
      };
    },
    async uploadFile(fileAsString) {
      try{
        let document = {
          fileName: getFileNameWithMaxNameLength(this.uploadFileValue[0].name),
          fileContents: btoa(fileAsString)
        };
        await ApiService.apiAxios.post(ApiRoutes.sld.BASE_URL + '/' + this.sdcSchoolCollectionID + '/file', document);
        this.setSuccessAlert('Your document was uploaded successfully.');
      } catch (e) {
        console.error(e);
        this.setFailureAlert(e.response?.data?.message || e.message);
      } finally {
        this.isSelecting = false;
      }
    }
  },
  watch: {
    dataReady() {
      this.importFile();
    },
  }
};
</script>
      
<style scoped>
 .containerSetup{
    padding-right: 5em !important;
    padding-left: 5em !important;
  }

  .border {
    border: 2px solid grey;
    border-radius: 5px;
    padding: 35px;
    margin-bottom: 2em;
  }

  @media screen and (max-width: 1200px) {
    .containerSetup{
      padding-right: 3em !important;
      padding-left: 3em !important;
    }
  }

  .form-hint{
    color: rgb(56, 89, 138);
    font-size: 14px;
  }
</style>




