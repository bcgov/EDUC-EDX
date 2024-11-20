<template>
  <v-card
    :id="`sessioncard-${session.sessionid}`"
    fluid
    class="d-flex flex-column mt-4"
    height="100%"
  >
    <v-card-title class="text-wrap pb-0">
      <v-row no-gutters class="pr-4">
        <v-col>
          <strong class="sessionName">
            {{ session.courseMonth }} {{ session.courseYear }} Session
          </strong>
        </v-col>        
      </v-row>
    </v-card-title>
    <v-card-text class="mt-2 ml-2 mr-2">
      <v-list class="pt-0">
        <v-list-item min-height="inherit" class="pl-0">
          <v-row class="dates">
            <v-col cols="8">
              <v-icon small class="mr-1">mdi-calendar</v-icon>
              <span id="opendatelabel">Registration Open Date:</span>
            </v-col>

            <v-col cols="4">
              <span id="opendate">
                {{ formattoDate(session.activeFromDate) }}
              </span>
            </v-col>
          </v-row>
        </v-list-item>
        <v-list-item min-height="inherit" class="pl-0">
          <v-row>
            <v-col cols="8">
              <v-icon small class="mr-1">mdi-calendar</v-icon>
              <span id="closedatelabel">Registration Close Date:</span>
            </v-col>
            <v-col cols="4">
              <span id="closedate">
                {{ formattoDate(session.activeUntilDate) }}
              </span>
            </v-col>
          </v-row>
        </v-list-item>
      </v-list>
    </v-card-text>
    <v-spacer />
    <v-card-actions class="justify-end pt-0">
      <v-hover v-slot="{ hover }">
        <v-btn
            variant="text"
            @click="goToSessionRegistrations()">
          <span class="ml-1 pr-2" style="color: #003366">Continue</span>
          <v-icon
            color="#003366"
            class="ml-n1 mr-1"
            right
            icon="mdi-arrow-right"
            dark
          />
        </v-btn>
      </v-hover>
    </v-card-actions>
  </v-card>
</template>

<script>
import moment from 'moment';
import {mapState} from "pinia";
import {authStore} from "../../../store/modules/auth";

export default {
  name: 'SessionCard',
  props: {
    session: {
      type: Object,
      required: true,
    },
    schoolYear: {
      type: String,
      required: true,
    }
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
  },
  methods: {
    formattoDate(date) {
      return moment(JSON.stringify(date), 'YYYY-MM-DDTHH:mm:ss').format('YYYY/MM/DD');
    },
    goToSessionRegistrations() {
      if(this.userInfo.activeInstituteType === 'DISTRICT'){
        this.$router.push({name: 'district-assessment-session-detail', params: {schoolYear:  this.schoolYear?.replace(/\//g, '-'), sessionID: this.session.sessionID}});
      } else {
        this.$router.push({name: 'school-assessment-session-detail', params: {schoolYear:  this.schoolYear?.replace(/\//g, '-'), sessionID: this.session.sessionID}});
      }
    },
  },
};
</script>

<style scoped>

.sessionName {
  font-size: 1em;
}
</style>
