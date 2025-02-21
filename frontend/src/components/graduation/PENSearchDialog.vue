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
          <v-row no-gutters align="center">
            <v-col cols="3" class="key-col">Name:</v-col>
            <v-col cols="9">{{ student['fullName'] }}</v-col>
          </v-row>

          <v-row no-gutters align="center">
            <v-col cols="3" class="key-col">Local ID:</v-col>
            <v-col cols="9">{{ student['localID']}}</v-col>
          </v-row>

          <v-row no-gutters align="center">
            <v-col cols="3" class="key-col">DOB:</v-col>
            <v-col cols="9">{{ student['dob'] }}</v-col>
          </v-row>
          <v-row no-gutters align="center">
            <v-col cols="3" class="key-col">Gender:</v-col>
            <v-col cols="9">{{ student['gender'] }}</v-col>
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
            :loading="isLoading"  />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import PrimaryButton from "../util/PrimaryButton.vue";
import ApiService from "../../common/apiService";
import {ApiRoutes} from "../../utils/constants";
import alertMixin from "../../mixins/alertMixin";

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
    }
  },
  emits: ['close'],
  data: () => ({
    dialog: false,
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
    downloadMessage() {
      return "Download " + this.downloadType;
    }
  },
  methods: {
    open(title, message, options) {
      this.dialog = true;
      this.title = title;
      this.message = message;
      this.options = Object.assign(this.options, options);
      return new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
    },
    async downloadDocument() {
      this.isLoading = true;
      let url = `${ApiRoutes.gradReports.BASE_URL}`;

      if(this.downloadType === "Transcript"){
        url += `/transcript`;
      } else if(this.downloadType === "XML"){
        url += `/xml`;
      } else if(this.downloadType === "TVR"){
        url += `/tvr`;
      }

      try {
        const response = await ApiService.apiAxios.get(url, {
          params: {
            pen: this.student['pen']
          },
          responseType: 'blob'
        })

        const contentDisposition = response.headers['content-disposition'];
        let filename = this.student['pen'] + '_' + this.downloadType + '_' + this.getFormattedDate();
        if (contentDisposition) {
          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const matches = filenameRegex.exec(contentDisposition);
          if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
          }
        }

        const blob = response.data;
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);

      } catch (error) {
        console.error("Error downloading file:", error);
        let errorMsg;

        if(error.code === "ERR_BAD_REQUEST"){
          errorMsg = `${this.downloadType} not found for student`;
        } else {
          errorMsg = "Error encountered while attempting to retrieve document"
        }

        this.setFailureAlert(errorMsg);

      } finally {
        this.isLoading = false;
        this.$emit('close');
      }
    },
    cancel() {
      this.$emit('close');
    },
    getFormattedDate() {
      const today = new Date();
      const month = String(today.getMonth() + 1).padStart(2, '0'); // getMonth() is 0-indexed
      const day = String(today.getDate()).padStart(2, '0');
      const year = today.getFullYear();

      return month + day + year;
    }
  }
};
</script>

<style scoped>
:deep(.v-toolbar-title__placeholder){
  overflow: visible;
}

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