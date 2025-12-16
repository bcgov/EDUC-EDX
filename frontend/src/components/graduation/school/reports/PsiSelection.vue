<template>
  <v-container fluid>
    <v-row>
      <v-col>
        Lists all students in their final year (Grade 12 or Adult Dogwood) of a current graduation or SCCP program who have made PSI selections in the StudentTranscripts Service in the current reporting period.
      </v-col>
    </v-row>
    <v-row class="mb-1">
      <v-col cols="12">
        <DownloadLink
          :label="'PSI Selections Report ' + currentYearRange"
          :download-action="() => downloadPsiReport()"
        />
      </v-col>
      <v-col cols="10">
        Note: Students are listed in random order; use filters to sort by any column. Students with multiple selections will have multiple rows.
      </v-col>
      <v-col class="d-flex justify-end mr-8">
        <v-menu
          location="bottom"
        >
          <template #activator="{ props }">
            <a
              class="mt-n1 mr-1"
              style="font-weight: bold"
              v-bind="props"
              @click="toggleMoreInfoTooltip"
            >...</a>
            <a
              v-bind="props"
              @click="toggleMoreInfoTooltip"
            >
              More Info
            </a>
          </template>
          <v-card
            style="max-width: 40em;"
            border="sm"
            class="pa-2"
          >
            <div style="font-weight: bold">
              Understanding the PSI Selections Report
            </div>
            <div
              style="font-weight: bold"
              class="mt-4"
            >
              Surname, First Name, and Middle Name
            </div>
            <div>
              The student's Legal Names, as reported to the ministry
            </div>
            <div
              style="font-weight: bold"
              class="mt-4"
            >
              Local ID
            </div>
            <div>
              The student’s Local ID, as last reported to the PEN Registry
            </div>
            <div
              style="font-weight: bold"
              class="mt-4"
            >
              Order Placed
            </div>
            <div>
              Indicates if PSI Selection(s) was made by the student
            </div>
            <div class="mt-1 ml-3">
              <b>Yes</b> = Selection(s) made
            </div>
            <div class="mt-1 ml-3">
              <b>No</b> = no selection made
            </div>
            <div
              style="font-weight: bold"
              class="mt-4"
            >
              PSI Name
            </div>
            <div>
              Name of the Post Secondary Institution selected by the student
            </div>
            <div
              style="font-weight: bold"
              class="mt-4"
            >
              Transmission Mode
            </div>
            <div>
              How the transcript is sent to the PSI
            </div>
            <div class="mt-1 ml-3">
              <b>Paper</b> = regular mail
            </div>
            <div class="mt-1 ml-3">
              <b>XML</b> = electronic data transfer
            </div>
            <div
              style="font-weight: bold"
              class="mt-4"
            >
              Order Type
            </div>
            <div>
              Timing and update rules for transcript delivery
            </div>
            <div class="mt-1 ml-3">
              <b>End of July</b> = paper transcript mailed after all final marks available (end of July)
            </div>
            <div class="mt-1 ml-3">
              <b>Send Now</b> = paper transcript mailed at the time of order (subject to processing and delivery time)
            </div>
            <div class="mt-1 ml-3">
              <b>One-Time</b> = transcript data sent as single transmission at the time of the order; future updates cannot be requested by the PSI
            </div>
            <div class="mt-1 ml-3">
              <b>Ongoing</b> = transcript data and updates may be requested by the PSI until the specified end date
            </div>
            <div class="mt-2">
              <b>Note:</b> Only student PSI selection orders are included. Third-party orders placed by students in the system (including PDFs) are not reflected in this report.
            </div>
          </v-card>
        </v-menu>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import DownloadLink from '../../../common/DownloadLink.vue';
import { mapState } from 'pinia';
import { authStore } from '../../../../store/modules/auth';
import alertMixin from '../../../../mixins/alertMixin';
import {ApiRoutes} from '../../../../utils/constants';
import ApiService from '../../../../common/apiService';

export default {
  name: 'PsiSelection',
  components: { DownloadLink },
  mixins: [alertMixin],
  props: {
    schoolID: {
      type: String,
      required: false,
      default: null
    },
  },
  emits: [],
  data() {
    return {
      currentYearRange: '',
      isLoading: false
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
  },
  created() {
    this.populateYearFields();
  },
  methods: {
    populateYearFields() {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();
      let startingYear = null;
      
      if (currentMonth < 10) {
        startingYear = currentYear - 1;
      } else {
        startingYear = currentYear;
      }
      let endingYear = startingYear + 1;
      this.currentYearRange = startingYear + '/' + endingYear;
    },
    async downloadPsiReport() {
      this.isLoading = true;
      const url = `${ApiRoutes.psiSelection.REPORT}/school/${this.schoolID}`;

      try {
        const res = await ApiService.apiAxios.get(url, {
          responseType: 'blob'
        });

        let filename = 'PSI Selection Report.csv';
        const dispo = res.headers?.['content-disposition'] || res.headers?.['Content-Disposition'];
        if (dispo) {
          const m = dispo.match(/filename\*?=(?:UTF-8''|")(.*?)(?:"|;|$)/i);
          if (m?.[1]) filename = decodeURIComponent(m[1]);
        }

        const urlObj = window.URL.createObjectURL(res.data);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = urlObj;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(urlObj);
      } catch (error) {
        console.error('Error downloading file:', error);
        let errorMsg;

        if (error.code === 'ERR_BAD_REQUEST') {
          errorMsg = `PSI report not found for ${this.schoolID}`;
        } else {
          errorMsg = 'Error encountered while attempting to retrieve PSI report.';
        }

        this.setFailureAlert(errorMsg);
      } finally {
        this.isLoading = false;
      }
    }
  },
};
</script>

<style scoped>

h3 {
  color: #38598a;
}

button {
  color: #1976d2;
}

v-text-field{
  width: 4em;
}

ul {
  list-style-type: none;
  padding-top: 1em;
  padding-bottom: 2em;
}

li {
  padding-top: 1em;
}

i {
  font-size: 1.25em;
}

</style>
