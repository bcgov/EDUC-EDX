<template>
  <v-container class="containerSetup mb-5">
    <v-row class="pr-4">
      <v-col class="pb-0 mt-4">
        <div style="display: flex;">
          <h2>School Year: {{ schoolYear }}</h2>
          <v-btn
            variant="text"
            @click="goToSchoolYearRegistrations()"
          >
            <span
              class="ml-1 pr-2"
              style="color: #003366"
            >View all Open Sessions in the current school year</span>
            <v-icon
              color="#003366"
              class="ml-n1 mr-1"
              right
              icon="mdi-arrow-right"
              dark
            />
          </v-btn>
        </div>
      </v-col>
    </v-row>
    <v-row 
      v-for="(sessions, index) in activeSessions" 
      :key="index"
    >
      <v-col 
        v-for="session in sessions" 
        :key="session.sessionid" 
        cols="5"
      >
        <SessionCard
          :session="session"
          :school-year = "schoolYear"
        />
      </v-col>
    </v-row>
    <v-divider class="py-6 mt-6" />
    <v-row>
      <v-icon icon="mdi-history pt-3" />
      <h2 class="pl-2">Assessment Session History</h2>
    </v-row>
    <v-row>
      <v-data-table
          v-if="!loading"
        id="session-history-dataTable"
        v-model:items-per-page="itemsPerPage"
        :page="pageNumber"
        :items="historicalSessions"
        :items-length="historicalSessions?.length"
        :search="search"
        :headers="headers"
        :items-per-page-options="[
          { value: 5, title: '5' },
          { value: 10, title: '10' },
          { value: 25, title: '25' },
          { value: 50, title: '50' },
          { value: 100, title: '100' },
        ]"
        :hover="true"
        class="fill-height"
        style="border-radius: 0"
        @click:row="goToHistoricalSessionRegistrations"
      >
        <template #top>
          <v-text-field
            v-model="search"
            clearable
            hide-details="auto"
            label="Search"
            class="pa-4"
          />
        </template>
      </v-data-table>
    </v-row>
    <v-dialog
      v-model="editSessionSheet"
      :inset="true"
      :no-click-animation="true"
      :scrollable="true"
      :persistent="true"
      max-width="40%"
      min-height="28%"
    >
      
    </v-dialog>
  </v-container>
</template>

<script>
import SessionCard from './sessions/SessionCard.vue';
import ApiService from '../../common/apiService';
import { ApiRoutes } from '../../utils/constants';
import { authStore } from '../../store/modules/auth';
import { mapState } from 'pinia';
import moment from 'moment';
import { LocalDateTime } from "@js-joda/core";

export default {
  name: 'AssessmentSessions',
  components: {
    SessionCard,
  },
  props: {
    institutionID: {
      type: String,
      required: true,
      default: '',
    },
  },
  data() {
    return {
      schoolYear: null,
      search: null,      
      itemsPerPage: 5,
      pageNumber: 1,
      allSessions: [],
      headers: [
        { title: 'School Year', key: 'schoolYear' },
        { title: 'Course Month', key: 'courseMonth' },
        { title: 'Course Year', key: 'courseYear' },        
        { title: 'Open Date', key: 'activeFromDate' },
        { title: 'Close Date', key: 'activeUntilDate' },
      ],
      editSessionSheet: false,
      editSession: null,
      headerSearchParams: {},
      headerSortParams: {},
      loading: true
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    activeSessions() {
      const orderedSessions = [];
      const allSessions = this.allSessions
          .filter(session => session.schoolYear === this.schoolYear)
          .map(session => ({
            ...session,
            courseMonth: this.formatMonth(session.courseMonth)
          }))
          .sort((a, b) =>
              LocalDateTime.parse(a.activeUntilDate).compareTo(LocalDateTime.parse(b.activeUntilDate))
          );

      for (let i = 0; i < allSessions.length; i += 2) {
        orderedSessions.push(allSessions.slice(i, i + 2));
      }
      return orderedSessions;
    },
    historicalSessions() {
      const allSessions = this.allSessions
        .filter(session => session.schoolYear !== this.schoolYear)
        .map((entry) => {
          return {
            ...entry,
            activeFromDate: this.formattoDate(entry.activeFromDate),
            activeUntilDate: this.formattoDate(entry.activeUntilDate),
            courseMonth: this.formatMonth(entry.courseMonth),
          };
        });
      return allSessions;
    },
  },
  created() {
    this.getAllAssessmentSessions();
  },
  methods: {
    getAllAssessmentSessions() {
      this.loading = true;
      ApiService.apiAxios
          .get(`${ApiRoutes.assessments.GET_ASSESSMENT_SESSIONS}` + '/' + this.userInfo.activeInstituteType, {})
          .then((response) => {
            this.allSessions = response.data.sort((a, b) =>
                LocalDateTime.parse(b.activeUntilDate).compareTo(LocalDateTime.parse(a.activeUntilDate))
            );
            if (this.allSessions.length > 0) {
              this.schoolYear = this.allSessions[0].schoolYear;
            }
          })
          .catch((error) => {
            console.error(error);
          })
          .finally(() => {
            this.loading = false;
          });
    },
    formattoDate(date) {
      return moment(JSON.stringify(date), 'YYYY-MM-DDTHH:mm:ss').format('YYYY/MM/DD');
    },
    formatMonth(month) {
      return moment(month, 'MM').format('MMMM');
    },
    goToSchoolYearRegistrations() {
      if(this.userInfo.activeInstituteType === 'DISTRICT'){
        this.$router.push({name: 'district-assessment-session-detail', params: {schoolYear:  this.schoolYear?.replace(/\//g, '-'), sessionID: null}});
      } else {
        this.$router.push({name: 'school-assessment-session-detail', params: {schoolYear:  this.schoolYear?.replace(/\//g, '-'), sessionID: null}});
      }
    },
    goToHistoricalSessionRegistrations(e, { item }) {
      if(this.userInfo.activeInstituteType === 'DISTRICT'){
        this.$router.push({name: 'district-assessment-session-detail', params: {schoolYear:  item?.schoolYear?.replace(/\//g, '-'), sessionID: item?.sessionID}});
      } else {
        this.$router.push({name: 'school-assessment-session-detail', params: {schoolYear:  item?.schoolYear?.replace(/\//g, '-'), sessionID: item?.sessionID}});
      }
    },
    backButtonClick() {
      this.$router.push({name: 'home'});
    }
  },
};
</script>
