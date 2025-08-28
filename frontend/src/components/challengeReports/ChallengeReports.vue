<template>
  <v-container
    v-if="!loading"
    class="containerSetup mb-5"
  >
    <v-row
      no-gutters
      align="center"
    >
      <h3>
        Successful Course Challenge Reports - {{ startingYear }}/{{ endingYear }}
      </h3>
      <v-spacer />
      <div class="tooltip-wrapper">
        <v-chip
          v-if="activePeriod.challengeReportsSessionStatus"
          ref="chipRef"
          :color="chipDetails.color"
        >
          <strong>{{ chipDetails.text }}</strong>
          <v-icon
            icon="mdi-help-circle"
            class="ml-1 help-icon"
            size="small"
            @mouseover="showTooltip"
            @mouseleave="hideTooltip"
          />
        </v-chip>
        <div
          v-if="showCustomTooltip"
          class="custom-tooltip"
          :style="{ width: tooltipWidth }"
        >
          <div v-if="activePeriod.challengeReportsSessionStatus === REPORT_STATUS_NOT_YET_AVAILABLE">
            The ministry has not yet released the preliminary data on course challenges. Your district’s Enrolment Data Collection Administrator will be emailed when data is available.
          </div>
          <div v-else-if="activePeriod.challengeReportsSessionStatus === REPORT_STATUS_PRELIMINARY">
            Data corrections can be made through <strong>GRAD File Upload</strong> or a <a
              href="https://forms.gov.bc.ca/education-training/trax-change-form"
              target="_blank"
              rel="noopener noreferrer"
            >GRAD Change Form</a>.
            Changes submitted before the due date will be reflected in the report data.
            Changes submitted past the due date will not be reflected in the report and are not eligible for funding.
            Your district’s Enrolment Data Collection Administrator will be emailed when the final data is available.
          </div>
          <div v-else-if="activePeriod.challengeReportsSessionStatus === REPORT_STATUS_FINAL">
            The data reported is final. It reflects the course challenges that will be funded for your district.
          </div>
        </div>
      </div>
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
      v-if="activePeriod.challengeReportsSessionStatus !== REPORT_STATUS_NOT_YET_AVAILABLE && !districtCountsPayload?.schoolsWithCounts?.length"
      no-gutters
      align="center"
      class="mt-4"
    >
      <v-alert
        type="info"
        class="elevation-0 custom-info-alert mt-4"
        prominent
      >
        There were no course challenges found for your district for the school year.
      </v-alert>
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
    <v-row
      v-if="activePeriod.challengeReportsSessionStatus !== REPORT_STATUS_NOT_YET_AVAILABLE && districtCountsPayload"
      no-gutters
      align="center"
      class="mt-5 mb-2"
    >
      <h4>
        Summary of District's Course Challenges
      </h4>
      <v-data-table
        :items="tableData"
        :headers="headers"
        class="elevation-1 mt-2 challenge-report-table"
        :hide-default-footer="true"
        items-per-page="100"
      >
        <template #item="{ item }">
          <tr :class="{ 'district-row-blue': item.depth === 0 }">
            <td :style="{ 'font-weight': item.depth === 0 ? 'bold' : 'normal' }">
              <div :style="{ 'padding-left': item.depth * 30 + 'px' }">
                {{ item.value.name }}
              </div>
            </td>
            <td style="text-align: center;">
              {{ item.value.count }}
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-row>
  </v-container>
</template>

<script>
const REPORT_STATUS_NOT_YET_AVAILABLE = 'Not Yet Available';
const REPORT_STATUS_PRELIMINARY = 'Preliminary';
const REPORT_STATUS_FINAL = 'Final';

import ApiService from '../../common/apiService';
import { ApiRoutes } from '../../utils/constants';
import { setSuccessAlert } from '../composable/alertComposable';
import DownloadLink from '../common/DownloadLink.vue';
import alertMixin from '../../mixins/alertMixin';

export default {
  name: 'ChallengeReports',
  components: {
    DownloadLink,
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
      districtCountsPayload: null,
      disableDownload: false,
      REPORT_STATUS_NOT_YET_AVAILABLE,
      REPORT_STATUS_PRELIMINARY,
      REPORT_STATUS_FINAL,
      showCustomTooltip: false,
      timeoutId: null,
      tooltipWidth: 'auto',
      headers: [
        { title: 'School', key: 'value.name', align: 'start', sortable: false },
        { title: 'Successful Course Challenges', key: 'value.count', align: 'center', sortable: false },
      ],
    };
  },
  computed: {
    chipDetails() {
      const status = this.activePeriod.challengeReportsSessionStatus;

      const statusMap = {
        [this.REPORT_STATUS_NOT_YET_AVAILABLE]: {
          text: this.REPORT_STATUS_NOT_YET_AVAILABLE,
          color: 'gray',
        },
        [this.REPORT_STATUS_PRELIMINARY]: {
          text: `Preliminary - Updates due by ${this.activePeriod.preliminaryCompletionDate}`,
          color: 'orange',
        },
        [this.REPORT_STATUS_FINAL]: {
          text: `Final - Data as of ${this.activePeriod.finalCompletionDate}`,
          color: 'green',
        },
      };

      return statusMap[status] || { text: 'Unknown Status', color: 'grey' };
    },
    tableData() {
      if (!this.districtCountsPayload) {
        return [];
      }
      const data = [];

      const districtDisplayName = this.districtCountsPayload.districtName || 'District Data Unavailable';

      data.push({
        depth: 0,
        value: {
          name: districtDisplayName,
          count: this.districtCountsPayload.districtSum,
        },
      });

      this.districtCountsPayload.schoolsWithCounts?.forEach((school) => {
        const schoolDisplayName = school.schoolName || 'School Data Unavailable';
        data.push({
          depth: 1,
          value: {
            name: schoolDisplayName,
            count: school.count,
          },
        });
      });
      return data;
    },
  },
  created() {
    this.populateYearFields();
    Promise.all([this.getReportStatus(), this.getDistrictCounts()])
      .finally(() => {
        this.loading = false;
      });
  },
  methods: {
    populateYearFields() {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();

      if (currentMonth > 5) {
        this.startingYear = currentYear - 1;
      } else {
        this.startingYear = currentYear - 2;
      }
      this.endingYear = this.startingYear + 1;
    },
    async getReportStatus() {
      this.loading = true;
      return ApiService.apiAxios
        .get(`${ApiRoutes.challengeReports.BASE_URL}/active-period`)
        .then((response) => {
          this.activePeriod = response.data;
          if (this.activePeriod.challengeReportsSessionStatus === 'Not Yet Available') {
            this.disableDownload = true;
          }
        })
        .catch((error) => {
          console.error(error);
          this.setFailureAlert(
            error?.response?.data?.message
              ? error?.response?.data?.message
              : 'An error occurred while trying to retrieve the status of Challenge Reports.'
          );
        });
    },
    async getDistrictCounts() {
      this.loading = true;
      return ApiService.apiAxios
        .get(`${ApiRoutes.challengeReports.BASE_URL}/${this.districtID}`)
        .then((response) => {
          this.districtCountsPayload = response.data;
          if (!this.districtCountsPayload?.schoolsWithCounts?.length) {
            this.disableDownload = true;
          }
        })
        .catch((error) => {
          console.error(error);
          this.setFailureAlert(
            error?.response?.data?.message
              ? error?.response?.data?.message
              : 'An error occurred while trying to retrieve your district\'s report.'
          );
        });
    },
    downloadDistrictReport() {
      ApiService.apiAxios
        .get(`${ApiRoutes.challengeReports.BASE_URL}/${this.districtID}/download`)
        .then((response) => {
          if (response.data && response.data.type === 'Buffer' && Array.isArray(response.data.data)) {
            const byteArray = new Uint8Array(response.data.data);
            const blob = new Blob([byteArray], { type: 'text/csv' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);

            if (this.activePeriod.challengeReportsSessionStatus === REPORT_STATUS_PRELIMINARY) {
              link.download = `Preliminary District Level Funding Report for Course Challenges ${this.startingYear}-${this.endingYear}.csv`;
            } else {
              link.download = `District Level Funding Report for Course Challenges ${this.startingYear}-${this.endingYear}.csv`;
            }

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
            setSuccessAlert('Challenge Report downloaded successfully.');
          } else {
            console.error('Unexpected response format for file download:', response.data);
            this.setFailureAlert('Failed to process the report data. Unexpected format.');
          }
        })
        .catch((error) => {
          console.error(error);
          this.setFailureAlert(
            error?.response?.data?.message
              ? error?.response?.data?.message
              : 'An error occurred while trying to retrieve your district\'s report.'
          );
        });
    },
    showTooltip() {
      this.tooltipWidth = this.$refs.chipRef.$el.offsetWidth + 'px';
      clearTimeout(this.timeoutId);
      this.showCustomTooltip = true;
    },
    hideTooltip() {
      this.timeoutId = setTimeout(() => {
        this.showCustomTooltip = false;
        this.tooltipWidth = 'auto';
      }, 2000);
    },
  },
};
</script>

<style scoped>
.tooltip-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.custom-tooltip {
  position: absolute;
  top: calc(100% + 5px);
  left: 50%;
  transform: translateX(-50%);
  background-color: #f9f9f9;
  color: #333;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 4px;
  z-index: 10;
  white-space: normal;
  font-size: small;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.custom-tooltip a {
  color: #1976d2;
  text-decoration: underline;
}

.custom-info-alert {
  background-color: #e3f2fd !important;
  border: none !important;
  color: #1976d2 !important;
}

h3 {
  color: #38598a;
}

.challenge-report-table :deep(.v-data-table-footer),
.challenge-report-table :deep(.v-table__footer) {
  display: none !important;
}

.challenge-report-table :deep(thead th) {
  color: grey !important;
  font-weight: bold !important;
}

.challenge-report-table :deep(tr.district-row-blue td) {
  color: #38598a !important;
}
</style>
