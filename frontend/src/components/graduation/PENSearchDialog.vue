<template>
  <v-dialog
    v-model="dialog"
    max-width="40%"
    @keydown.esc="cancel"
  >
    <v-card>
      <v-card-title class="header pt-1 pb-1">
        <slot name="title">
          PEN Search Results
        </slot>
      </v-card-title>
      <v-card-text :class="[options.messagePadding, { 'black--text': !options.dark }]">
        <div>
          <v-row
            no-gutters
            align="center"
          >
            <v-col
              cols="3"
              class="key-col"
            >
              Name:
            </v-col>
            <v-col cols="9">
              {{ student.fullName }}
            </v-col>
          </v-row>

          <v-row
            no-gutters
            align="center"
          >
            <v-col
              cols="3"
              class="key-col"
            >
              Local ID:
            </v-col>
            <v-col cols="9">
              {{ student.localID }}
            </v-col>
          </v-row>

          <v-row
            no-gutters
            align="center"
          >
            <v-col
              cols="3"
              class="key-col"
            >
              DOB:
            </v-col>
            <v-col cols="9">
              {{ student.dob }}
            </v-col>
          </v-row>
          <v-row
            no-gutters
            align="center"
          >
            <v-col
              cols="3"
              class="key-col"
            >
              Gender:
            </v-col>
            <v-col cols="9">
              {{ student.gender }}
            </v-col>
          </v-row>
        </div>
      </v-card-text>
      <v-card-actions class="pt-0">
        <v-spacer />
        <PrimaryButton
          id="rejectBtn"
          secondary
          text="Cancel"
          :click-action="cancel"
        />
        <PrimaryButton
          id="resolveBtn"
          :text="downloadMessage"
          :click-action="downloadDocument"
          :loading="isLoading"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import PrimaryButton from '../util/PrimaryButton.vue';
import ApiService from '../../common/apiService';
import {ApiRoutes} from '../../utils/constants';
import alertMixin from '../../mixins/alertMixin';
import {docTypeFilename} from '../../utils/gdc/gradReports';

export default {
  name: 'PENSearchDialog',
  components: {
    PrimaryButton
  },
  mixins: [alertMixin],
  props: {
    student: {
      type: Object,
      required: true,
      default: () => ({})
    },
    downloadType:{
      type: String,
      required: true,
      default: ''
    },
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'update:modelValue'],
  data: () => ({
    resolve: null,
    reject: null,
    isLoading: false,
    options: {
      color: 'primary',
      width: 290,
      zIndex: 2000000,
      dark: true,
      dense: true,
      messagePadding: 'pa-4',
      titleBold: false,
      subtitle: false,
      resolveDisabled: false,
    },
  }),
  computed: {
    dialog: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
    },
    downloadMessage() {
      return 'View ' + docTypeFilename(this.downloadType);
    },
  },
  methods: {
    async downloadDocument() {
      this.isLoading = true;
      const url = `${ApiRoutes.gradReports.BASE_URL}/student/report`;

      try {
        const response = await ApiService.apiAxios.get(url, {
          params: {
            pen: this.student['pen'],
            docType: this.downloadType,
          },
          responseType: 'blob'
        });

        const blob = response.data;
        const blobURL = window.URL.createObjectURL(blob);

        const newTab = window.open(blobURL, '_blank');
        if (newTab) {
          newTab.focus();
        } else {
          alert('Please allow pop-ups for this site to view the document.');
        }

        let successMsg = `${docTypeFilename(this.downloadType)} opened for student`;
        this.setSuccessAlert(successMsg);

      } catch (error) {
        console.error('Error downloading file:', error);
        let errorMsg;

        if(error.code === 'ERR_BAD_REQUEST'){
          errorMsg = `${docTypeFilename(this.downloadType)} not found for student`;
        } else {
          errorMsg = 'Error encountered while attempting to retrieve document';
        }

        this.setFailureAlert(errorMsg);

      } finally {
        this.isLoading = false;
        this.$emit('close');
      }
    },
    cancel() {
      this.$emit('close');
      this.$emit('update:modelValue', false);
    },
  }
};
</script>

<style scoped>

.header {
  background-color: #003366;
  color: white;
  font-size: medium !important;
  font-weight: bolder !important;
}

.key-col {
  font-weight: bold;
}
</style>
