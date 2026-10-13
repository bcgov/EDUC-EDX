import ApiService from '../common/apiService';
import {ApiRoutes} from '../utils/constants';
import {isEmpty, omitBy} from 'lodash';

// Shared by the school and district graduation submission summaries.
export default {
  data() {
    return {
      selectedReportingYear: 'Current Year',
      previousReportingPeriod: null,
      isChangingReportingYear: false,
    };
  },
  computed: {
    selectedReportingPeriod() {
      return this.selectedReportingYear === 'Previous Year' ? this.previousReportingPeriod : this.collectionObject;
    },
  },
  methods: {
    async changeReportingYear() {
      this.clearAllIntervals();
      this.isChangingReportingYear = true;
      try {
        if (this.selectedReportingYear === 'Previous Year' && !this.previousReportingPeriod) {
          const response = await ApiService.apiAxios.get(`${ApiRoutes.gdc.BASE_URL}/previous-reporting-period`);
          if (!response.data?.reportingPeriodID) {
            throw new Error('Previous reporting period is unavailable.');
          }
          this.previousReportingPeriod = response.data;
        }
      } catch (error) {
        console.error(error);
        this.selectedReportingYear = 'Current Year';
        this.setFailureAlert('Unable to retrieve the previous reporting year. Please try again later.');
      }
      this.pageNumber = 1;
      this.pageNumberFinal = 1;
      this.filesetList = [];
      this.finalFilesetList = [];
      this.totalElements = 0;
      this.totalElementsFinal = 0;
      await Promise.all([this.getFilesetPaginated(), this.getFinalFilesetPaginated()]);
      this.isChangingReportingYear = false;
    },
    getFilesetPaginated() {
      return this.getSubmissionFilesets(false);
    },
    getFinalFilesetPaginated() {
      return this.getSubmissionFilesets(true);
    },
    async getSubmissionFilesets(isFinal) {
      const reportingPeriod = this.selectedReportingPeriod;
      if (!reportingPeriod?.reportingPeriodID) return;
      this.isLoading = true;
      const page = isFinal ? this.pageNumberFinal : this.pageNumber;
      const pageSize = isFinal ? this.pageSizeFinal : this.pageSize;
      try {
        const response = await ApiService.apiAxios.get(`${this.submissionFilesetUrl}${isFinal ? '/final' : ''}`, {
          params: {
            pageNumber: page - 1,
            pageSize,
            searchParams: omitBy({...this.filterSearchParams, collectionObject: reportingPeriod}, isEmpty),
            sort: {updateDate: 'DESC'},
          },
        });
        if (reportingPeriod !== this.selectedReportingPeriod) return;
        if (isFinal) {
          this.finalFilesetList = response.data.content;
          this.totalElementsFinal = response.data.totalElements;
        } else {
          this.filesetList = response.data.content;
          this.totalElements = response.data.totalElements;
          this.clearAllIntervals();
          if (this.selectedReportingYear === 'Current Year') this.startPollingStatus();
        }
      } catch (error) {
        if (reportingPeriod !== this.selectedReportingPeriod) return;
        if (!isFinal) this.clearAllIntervals();
        console.error(error);
        this.setFailureAlert('An error occurred while trying to get fileset list. Please try again later.');
      } finally {
        if (reportingPeriod === this.selectedReportingPeriod) this.isLoading = false;
      }
    },
  },
};
