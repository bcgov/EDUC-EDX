<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <p class="report-description">
          {{ reportDescription }}
        </p>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <DownloadLink
          label="Assessment Completions for Current Students"
          :download-action="downloadAssessmentCompletionReport"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import DownloadLink from '../../common/DownloadLink.vue';
import alertMixin from '../../../mixins/alertMixin';
import { mapState } from 'pinia';
import { authStore } from '../../../store/modules/auth';
import ApiService from '../../../common/apiService';
import { ApiRoutes } from '../../../utils/constants';
import { downloadBlobResponse } from '../../../utils/file';

export default {
  name: 'AssessmentCompletionForCurrentStudents',
  components: {
    DownloadLink
  },
  mixins: [alertMixin],
  computed: {
    ...mapState(authStore, ['userInfo']),
    isSchoolUser() {
      return this.userInfo?.activeInstituteType === 'SCHOOL';
    },
    reportDescription() {
      return this.isSchoolUser
        ? 'This report lists all current students at your school. For each student, it indicates whether they have completed each of the graduation assessments, meaning they have received a proficiency score, an Aegrotat, or an exemption for an assessment.'
        : 'This report lists all current students in your district. For each student, it indicates whether they have completed each of the graduation assessments, meaning they have received a proficiency score, an Aegrotat, or an exemption for an assessment.';
    }
  },
  methods: {
    async downloadAssessmentCompletionReport() {
      const instituteType = this.userInfo?.activeInstituteType?.toLowerCase();
      const url = `${ApiRoutes.assessments.BASE_REPORTS_URL}/${instituteType}/assessment-completions/current-students/download`;

      try {
        const response = await ApiService.apiAxios.get(url, {
          responseType: 'blob'
        });
        downloadBlobResponse(response, 'assessment-completions.csv');
      } catch (error) {
        console.error('Error downloading assessment completion current students CSV:', error);
        this.setFailureAlert('An error occurred while trying to export assessment completions. Please try again later.');
      }
    }
  }
};
</script>

<style scoped>
.report-description {
  color: #1a1a1a;
  font-size: 1rem;
  line-height: 1.45rem;
  margin-bottom: 1rem;
  max-width: 70rem;
}
</style>
