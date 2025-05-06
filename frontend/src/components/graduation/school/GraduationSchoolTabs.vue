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
            id="studentSearch"
            value="studentSearch"
            prepend-icon="mdi-account-search-outline"
          >
            Find Student in Data Submissions
          </v-tab>
          <v-tab
            id="gradReports"
            value="gradReports"
            prepend-icon="mdi-finance"
          >
            GRAD System Reports
          </v-tab>
          <v-tab
            id="currentStudents"
            value="currentStudents"
            prepend-icon="mdi-account-multiple-outline"
          >
            Current Students in GRAD System
          </v-tab>
        </v-tabs>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col>
        <v-card-text class="pt-0">
          <v-window v-model="tab">
            <v-window-item 
              value="uploadData"
              transition="false"
              reverse-transition="false"
            >
              <GradSchoolUploadDataComponent
                v-if="collectionObject"
                :school-i-d="schoolID"
                :collection-object="collectionObject"
              />
            </v-window-item>
            <v-window-item 
              value="studentSearch"
              transition="false"
              reverse-transition="false"
            >
              <GradSchoolStudentSearch
                :school-i-d="schoolID"
                :collection-object="collectionObject"
              />
            </v-window-item>
            <v-window-item 
              value="gradReports"
              transition="false"
              reverse-transition="false"
            >
              <GradReportsAndTranscripts
                :school-i-d="schoolID"
              />
            </v-window-item>
            <v-window-item 
              value="currentStudents"
              transition="false"
              reverse-transition="false"
            >
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
import {ApiRoutes, PAGE_TITLES} from '../../../utils/constants';
import GradSchoolUploadDataComponent from './upload/GradSchoolUploadDataComponent.vue';
import GradReportsAndTranscripts from './reports/GradSchoolReportsAndTranscripts.vue';
import GradSchoolStudentSearch from './students/GradSchoolStudentSearch.vue';
import GradSchoolCurrentStudents from './students/GradSchoolCurrentStudents.vue';
import ApiService from '../../../common/apiService';

export default {
  name: 'GraduationSchoolTabs',
  components: {
    GradSchoolCurrentStudents,
    GradSchoolStudentSearch,
    GradReportsAndTranscripts,
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
      tab: null,
      collectionObject: null
    };
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated','userInfo']),
    ...mapState(appStore, ['config'])
  },
  created() {
    this.getActiveReportingDates();
  },
  methods: {
    getActiveReportingDates() {
      ApiService.apiAxios.get(`${ApiRoutes.gdc.ACTIVE_REPORTING_PERIODS}`)
        .then(response => {
          this.collectionObject = response.data;
        });
    },
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
