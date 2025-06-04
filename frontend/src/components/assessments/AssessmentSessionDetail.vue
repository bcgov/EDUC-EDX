<template>
  <v-container class="containerSetup" :fluid="true">
    <v-row v-if="isLoading" class="mt-0">
      <v-col>
        <Spinner />
      </v-col>
    </v-row>
    <v-row v-else>
        <v-col>
          <v-tabs v-model="tab" style="color: #38598a">
            <v-tab 
              :value="1"
              prepend-icon="mdi-account-multiple-outline"
              >
              Registrations and Results 
            </v-tab>
            <v-tab 
              :value="2"
              prepend-icon="mdi-finance"
              >
              Reports
            </v-tab>
          </v-tabs>
          <v-window v-model="tab">
            <v-window-item :value="1" transition="false" reverse-transition="false">
              <StudentRegistrations v-if="schoolYearSessions.length > 0" :school-year="schoolYear"
                                    :school-year-sessions="schoolYearSessions" :session-ID="sessionID" />
            </v-window-item>
            <v-window-item :value="2" transition="false" reverse-transition="false">
              <AssessmentReports/>
            </v-window-item>
          </v-window>
        </v-col>
      </v-row>
  </v-container>
</template>
<script>
import alertMixin from '../../mixins/alertMixin';
import StudentRegistrations from './registrations/StudentRegistrations.vue';
import ApiService from '../../common/apiService';
import { ApiRoutes } from '../../utils/constants';
import { mapState } from 'pinia';
import Spinner from '../common/Spinner.vue';
import {authStore} from '../../store/modules/auth';
import { easStore } from '../../store/modules/eas';
import AssessmentReports from './reports/AssessmentReports.vue';

export default {
  name: 'AssessmentSessionDetail',
  components: {
    StudentRegistrations,
    Spinner,
    AssessmentReports
  },
  mixins: [alertMixin],
  props: {
    sessionID: {
      type: String,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      assessmentStudents: [],
      schoolYearSessions: [],
      isLoading: false,
      tab: '',
      session: ''
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    ...mapState(easStore, ['schoolYear'])   
  },
  async created() {    
    this.loading = true;
    easStore().getActiveSchoolYear(this.userInfo.activeInstituteType).then(() => this.getAllSessionsforYear());
  },
  methods: {
    async  getAllSessionsforYear() {
      this.loading = true;
      ApiService.apiAxios
        .get(
          `${ApiRoutes.assessments.GET_ASSESSMENT_SESSIONS}/school-year/` + this.schoolYear + '/' + this.userInfo.activeInstituteType,
          {}
        ).then((response) => {
          this.schoolYearSessions = response.data;          
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          this.loading = false;
        });
    }
  },
};
</script>
<style scoped>
.border {
  border: 2px solid grey;
  border-radius: 5px;
  padding: 35px;
  margin-bottom: 2em;
}
.heading {
  margin-top: 12px;
  margin-bottom: 1em;
  font-weight: bold;
  text-align: start;
  line-height: 1.5;
  font-size: 1rem;
  color: #38598AFF;
}
.containerSetup {
  padding-right: 5em !important;
  padding-left: 5em !important;
}

@media screen and (max-width: 1200px) {
  .containerSetup {
    padding-right: 3em !important;
    padding-left: 3em !important;
  }
}
</style>
