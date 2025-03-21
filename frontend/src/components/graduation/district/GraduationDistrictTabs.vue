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
            Data Submission
          </v-tab>
          <v-tab
            id="gradReports"
            value="gradReports"
            prepend-icon="mdi-finance"
          >
            Reports
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
        </v-tabs>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col>
        <v-card-text class="pt-0">
          <v-window v-model="tab">
            <v-window-item value="uploadData">
              <GradDistrictUploadDataComponent
                :district-i-d="districtID"
              />
            </v-window-item>
            <v-window-item value="gradReports">
              <GradDistrictReportsAndTranscripts
                :school-i-d="districtID"
              />
            </v-window-item>
            <v-window-item value="studentSearch">
              <GradDistrictStudentSearch
                :district-i-d="districtID"
              />
            </v-window-item>
            <v-window-item value="currentStudents">
              <GradDistrictCurrentStudents
                :district-i-d="districtID"
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
import GradDistrictReportsAndTranscripts from './reports/GradDistrictReportsAndTranscripts.vue';
import GradDistrictStudentSearch from './students/GradDistrictStudentSearch.vue';
import GradDistrictCurrentStudents from './students/GradDistrictCurrentStudents.vue';
import GradDistrictUploadDataComponent from './upload/GradDistrictUploadDataComponent.vue';

export default {
  name: 'GraduationSchoolTabs',
  components: {
    GradDistrictUploadDataComponent,
    GradDistrictReportsAndTranscripts,
    GradDistrictCurrentStudents,
    GradDistrictStudentSearch
  },
  mixins: [alertMixin],
  props: {
    districtID: {
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
