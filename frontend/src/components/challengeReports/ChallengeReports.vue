<template>
  <v-container class="containerSetup mb-5">
    <v-row
      no-gutters
      align="center"
    >
      <h3>
        Successful Course Challenge Reports - {{ startingYear }}/{{ endingYear }}
      </h3>
      <v-spacer />
      <v-chip
        v-if="reportsStatus"
        :color="setStatusColor"
      >
        <strong>{{ reportsStatus }}</strong>
        <v-tooltip
          :text="setTooltipText"
          location="bottom"
          width="30em"
        >
          <template #activator="{ props: tooltipProps }">
            <v-icon
              v-bind="tooltipProps"
              icon="mdi-help-circle"
              class="ml-1"
              size="small"
            />
          </template>
        </v-tooltip>
      </v-chip>
    </v-row>
    <v-row
      no-gutters
      align="center"
      class="mt-4"
      style="color: gray;font-size: small"
    >
      <strong>Includes students that were eligible for funding and received a passing grade when challenging a course in the {{ startingYear }}/{{ endingYear }} school year.</strong>
    </v-row>
    <v-row
      no-gutters
      align="center"
      class="mt-4"
    >
      <DownloadLink
        :download-action="downloadDistrictReport"
        icon="mdi-tray-arrow-down"
        :disabled="disableDownload"
        :label="`District-Level Successful Course Challenges - ${startingYear}/${endingYear}`"
      />
    </v-row>
  </v-container>
</template>

<script>


import ApiService from '../../common/apiService';
import {ApiRoutes} from '../../utils/constants';
import {setSuccessAlert} from '../composable/alertComposable';
import DownloadLink from '../common/DownloadLink.vue';
import alertMixin from '../../mixins/alertMixin';


export default {
  name: 'ChallengeReports',
  components: {
    DownloadLink
  },
  mixins: [alertMixin],
  props: {
    districtID: {
      type: String,
      required: true,
      default: '',
    },
  },
  data() {
    return {
      loading: true,
      startingYear: 0,
      endingYear: 0,
      activePeriod: {},
      reportsStatus: '',
      notYetTooltip: 'The ministry has not yet released the preliminary data on  course challenges. Your district’s superintendent will be emailed when data is available.',
      prelimTooltip: 'Data corrections can be made through GRAD File Upload or a GRAD Change Form. Changes submitted before the due date will be reflected in the report data. Changes submitted past the due date will not be reflected in the report and are not eligible for funding. Your district’s superintendent will be emailed when the final data is available.',
      finalTooltip: 'The data reported is final. It reflects the course challenges that will be funded for your district.',
      disableDownload: false
    };
  },
  computed: {
    setStatusColor() {
      switch (this.reportsStatus) {
      case 'Not Started':
        return '#4e6478';
      case 'Preliminary Stage':
        return '#81692c';
      case 'Finalized Stage':
        return '#234720';
      default:
        return '#4e6478';
      }
    },
    setTooltipText() {
      switch (this.reportsStatus) {
      case 'Not Started':
        return this.notYetTooltip;
      case 'Preliminary Stage':
        return this.prelimTooltip;
      case 'Finalized Stage':
        return this.finalTooltip;
      default:
        return 'Status information not available.';
      }
    }
  },
  created() {
    this.populateYearFields();
    this.getReportStatus();
  },
  methods: {
    populateYearFields() {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();

      if (currentMonth > 5) {
        this.startingYear = currentYear;
      } else {
        this.startingYear = currentYear - 1;
      }
      this.endingYear = this.startingYear + 1;
    },
    getReportStatus() {
      this.loading = true;

      ApiService.apiAxios.get(`${ApiRoutes.challengeReports.BASE_URL}/active-period`)
        .then(response => {
          this.reportsStatus = response.data.challengeReportsSessionStatus;
          this.challengeReportsSessionID = response.data.challengeReportsSessionID;
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to retrieve the status of Challenge Reports.');
        }).finally(() => {
          this.loading = false;
          if(this.reportsStatus === 'Not Started') {
            this.disableDownload = true;
          }
        });
    },
    downloadDistrictReport() {
      ApiService.apiAxios.get(`${ApiRoutes.challengeReports.BASE_URL}/${this.districtID}/download`)
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to retrieve your district\'s report.');
        }).finally(() => {
          setSuccessAlert('Challenge Report downloaded successfully.');
        });
    },
  }
};
</script>
<style scoped>
  h3 {
    color: #38598a;
  }

</style>
