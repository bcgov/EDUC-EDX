<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <p class="report-description">
          This report lists all current students at your school. For each student, it indicates whether they have completed each of the graduation assessments, meaning they have received a proficiency score, an Aegrotat, or an exemption for an assessment.
        </p>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <DownloadLink
          label="Assessment Completions for Current Students"
          :download-action="downloadPlaceholderReport"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import DownloadLink from '../../common/DownloadLink.vue';
import alertMixin from '../../../mixins/alertMixin';

export default {
  name: 'AssessmentCompletionForCurrentStudents',
  components: {
    DownloadLink
  },
  mixins: [alertMixin],
  methods: {
    async downloadPlaceholderReport() {
      this.setWarningAlert('Download link placeholder only. CSV endpoint is not implemented yet.');
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
