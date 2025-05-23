<template>
  <v-container
    fluid
    class="px-16"
  >
    <v-row no-gutters>
      <v-col>
        <v-tabs
          v-model="activeTab"
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
          <v-window v-model="activeTab">
            <v-window-item 
              value="uploadData"
              transition="false"
              reverse-transition="false"
            >
              <GradDistrictUploadDataComponent
                v-if="collectionObject"
                :district-i-d="districtID"
                :collection-object="collectionObject"
              />
            </v-window-item>
            <v-window-item 
              value="studentSearch"
              transition="false"
              reverse-transition="false"
            >
              <GradDistrictStudentSearch
                v-if="collectionObject"
                :district-i-d="districtID"
                :collection-object="collectionObject"
              />
            </v-window-item>
            <v-window-item 
              value="gradReports"
              transition="false"
              reverse-transition="false"
            >
              <GradDistrictReportsAndTranscripts
                v-if="collectionObject"
                :district-i-d="districtID"
                :collection-object="collectionObject"
              />
            </v-window-item>
            <v-window-item 
              value="currentStudents"
              transition="false"
              reverse-transition="false"
            >
              <GradDistrictCurrentStudents
                v-if="collectionObject"
                :district-i-d="districtID"
                :collection-object="collectionObject"
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
import GradDistrictReportsAndTranscripts from './reports/GradDistrictReportsAndTranscripts.vue';
import GradDistrictStudentSearch from './students/GradDistrictStudentSearch.vue';
import GradDistrictCurrentStudents from './students/GradDistrictCurrentStudents.vue';
import GradDistrictUploadDataComponent from './upload/GradDistrictUploadDataComponent.vue';
import ApiService from '../../../common/apiService';
import router from '../../../router';

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
    }
  },
  data() {
    return {
      validTabs: ['uploadData', 'studentSearch', 'gradReports', 'currentStudents'],
      PAGE_TITLES: PAGE_TITLES,
      collectionObject: null
    };
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated','userInfo']),
    ...mapState(appStore, ['config']),
    activeTab: {
      get() {
        return this.validTabs.includes(this.$route.query?.activeTab) ? this.$route.query?.activeTab : 'uploadData';
      },
      set(value) {
        if (!this.validTabs.includes(value)) {
          return;
        }
        router.push({name: 'graduationDistrictTabs', params: { districtID: this.districtID }, query: { activeTab: value }});
      }
    },
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
