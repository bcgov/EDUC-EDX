<template>
  <v-container
    fluid
    class="px-16"
  >
    <v-row no-gutters>
      <v-col>
        <v-tabs
          v-model="tab"
          style="color: #38598a"
        >
          <v-tab
            value="uploadData"
            prepend-icon="mdi-file-upload-outline"
          >
            Upload Data
          </v-tab>
          <v-tab
            id="gradProjections"
            value="gradProjections"
            prepend-icon="mdi-finance"
          >
            Graduation Projections & TVRs
          </v-tab>
          <v-tab
            id="gradReports"
            value="gradReports"
            prepend-icon="mdi-certificate-outline"
          >
            Graduation Reports & Transcripts
          </v-tab>
          <v-tab
            id="studentSearch"
            value="studentSearch"
            prepend-icon="mdi-account-search-outline"
          >
            Find Student in Data Submissions
          </v-tab>
          <v-tab
            id="currentStudents"
            value="currentStudents"
            prepend-icon="mdi-account-multiple-outline"
          >
            Current Students
          </v-tab>
          <v-tab
            id="historicalChange"
            value="historicalChange"
            prepend-icon="mdi-account-edit-outline"
            @click="openGradChangeForm"
          >
            Historical Change
          </v-tab>
        </v-tabs>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col>
        <v-card-text class="pt-0">
          <v-window v-model="tab">
            <v-window-item value="uploadData">
              <GradSchoolUploadDataComponent
                :school-i-d="schoolID"
              />
            </v-window-item>
            <v-window-item value="gradProjections">
              <GradProjectionsTVR
                :school-i-d="schoolID"
              />
            </v-window-item>
            <v-window-item value="gradReports">
              <GradReportsAndTranscripts
                :school-i-d="schoolID"
              />
            </v-window-item>
            <v-window-item value="studentSearch">
              <GradSchoolStudentSearch
                :school-i-d="schoolID"
              />
            </v-window-item>
            <v-window-item value="currentStudents">
              <GradSchoolCurrentStudents
                :school-i-d="schoolID"
              />
            </v-window-item>
          </v-window>
        </v-card-text>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import alertMixin from '../../../mixins/alertMixin';
import { authStore } from '../../../store/modules/auth';
import { appStore } from '../../../store/modules/app';
import { mapState } from 'pinia';
import {PAGE_TITLES} from '../../../utils/constants';
import GradSchoolUploadDataComponent from './upload/GradSchoolUploadDataComponent.vue';
import GradProjectionsTVR from '../district/reports/GradDistrictProjectionsTVR.vue';
import GradReportsAndTranscripts from './reports/GradSchoolReportsAndTranscripts.vue';
import GradSchoolStudentSearch from './students/GradSchoolStudentSearch.vue';
import GradSchoolCurrentStudents from './students/GradSchoolCurrentStudents.vue';

export default {
  name: 'GraduationSchoolTabs',
  components: {
    GradSchoolCurrentStudents,
    GradSchoolStudentSearch,
    GradReportsAndTranscripts,
    GradProjectionsTVR,
    GradSchoolUploadDataComponent
  },
  mixins: [alertMixin],
  props: {
    schoolID: {
      type: String,
      required: false,
      default: null
    },
  },
  data() {
    return {
      PAGE_TITLES: PAGE_TITLES,
      tab: null
    };
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated','userInfo']),
    ...mapState(appStore, ['config'])
  },
  methods: {
    backButtonClick() {
      this.$router.push({name: 'home'});
    },
    openGradChangeForm() {
      window.open('https://forms.gov.bc.ca/education-training/trax-change-form', '_blank', 'noopener');
      this.tab = 'uploadData';
    }
  }
};
</script>

<style scoped>
  .divider {
    border-color: #FCBA19;
    border-width: 2px;
    opacity: unset;
  }

</style>
