<!--suppress ALL -->
<template>
  <v-container fluid v-if="!isAuthenticated && !isLoading">
    <ModalJourney/>
    <!-- login article -->
    <article name="login-banner">
        <v-row align="center" justify="center" style="margin-right: 0;margin-left: 0">
          <Login></Login>
        </v-row>
    </article>
  </v-container>

  <v-container fluid class="full-height" v-else-if="isLoading">
    <article id="progress-display-container" class="top-banner full-height">
      <v-row align="center" justify="center">
        <v-progress-circular
                :size="60"
                :width="7"
                color="primary"
                indeterminate
        ></v-progress-circular>
      </v-row>
    </article>
  </v-container>

  <v-container fluid class="full-height" v-else-if="isAuthenticated && hasRequest">
    <article id="request-display-container" class="top-banner full-height">
        <v-row align="center" justify="center" style="width: 1vw;margin-right: 0;margin-left: 0;margin-bottom: 5rem;">
          <v-col class="pt-1 pt-sm-3" xs="11" sm="11" md="10" lg="8" xl="6">
            <RequestDisplay 
              :title="requestTitle"
              :can-create-request="canCreateRequest"
              :new-request-text="newRequestText"
            >
              <template v-slot:message>
                <MessageCard></MessageCard>
              </template>
              <template v-slot:request>
                <StudentInfoCard :request="request"></StudentInfoCard>
              </template>
            </RequestDisplay>
          </v-col>
        </v-row>

    </article>
  </v-container>

  <v-container fluid class="full-height" v-else-if="isAuthenticated && hasInflightGMPRequest">
    <article id="request-display-container" class="top-banner full-height">
        <v-row align="center" justify="center" style="width: 1vw;margin-right: 0;margin-left: 0;margin-bottom: 5rem;">
          <v-col class="pt-1 pt-sm-3" xs="10" sm="8" md="6" lg="5" xl="3">
            <v-card class="student-request-card">
              <v-card-text>
                <p class="ma-0"><strong>You have a PEN request in progress. Please wait for it to be completed before requesting updates to you PEN information.</strong></p>
              </v-card-text>
              <v-card-actions>
                <v-row align="center" justify="center">
                  <v-btn id="home-button" @click="$router.push('home')" class="mb-2" dark color="#003366">Home</v-btn>
                </v-row>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
    </article>
  </v-container>


  <v-container fluid class="full-height" v-else-if="isAuthenticated && !hasRequest">
    <!-- request form -->
    <article id="request-form-container" class="top-banner full-height">
        <v-row align="center" justify="center" style="width: 1vw;margin-right: 0;margin-left: 0;margin-bottom: 5rem;">
          <v-col xs="10" sm="10" md="10" lg="10" xl="10">
            <router-view></router-view>
          </v-col>
        </v-row>
    </article>
  </v-container>


  <v-container fluid class="full-height" v-else>
    <article id="request-form-container" class="top-banner full-height">
      <v-row align="center" justify="center">
        <v-skeleton-loader type="image"></v-skeleton-loader>
      </v-row>
    </article>
  </v-container>
</template>

<script>
import Login from '../Login';
import RequestDisplay from '../RequestDisplay';
import ModalJourney from '../ModalJourney';
import MessageCard from './MessageCard';
import StudentInfoCard from '../StudentInfoCard';
import { PenRequestStatuses, StudentRequestStatuses } from '@/utils/constants';
import { mapGetters, mapMutations } from 'vuex';
import { pick, values } from 'lodash';
export default {
  name: 'home',
  components: {
    Login,
    RequestDisplay,
    ModalJourney,
    MessageCard,
    StudentInfoCard,
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated', 'userInfo', 'isLoading']),
    ...mapGetters('penRequest', {penRequest: 'request'}),
    ...mapGetters('studentRequest', ['request']),
    ...mapGetters(['student']),
    hasStudentRecord() {
      return !!this.student;
    },
    hasRequest() {
      return !!this.request;
    },
    requestTitle() {
      return this.request && this.request.studentRequestStatusCode === StudentRequestStatuses.RETURNED ? 'Provide More Info for UpdateMyPENInfo Request' : 'UpdateMyPENInfo Request Status';
    },
    hasInflightGMPRequest() {
      return this.penRequest && values(pick(PenRequestStatuses, ['DRAFT', 'INITREV', 'RETURNED', 'SUBSREV'])).some(status => status === this.penRequest.penRequestStatusCode);
    },
    newRequestText() {
      return 'Create a new Request';
    }
  },
  created() {
    this.setRequestType('studentRequest');
  },
  watch: {
    isLoading(val) {
      if(!val) {
        if(!this.hasRequest && !this.hasInflightGMPRequest) {
          this.$router.push({ name: 'step1' });
        }
      }
    }
  },
  methods: {
    ...mapMutations(['setRequestType']),
    canCreateRequest(status) {
      return status === StudentRequestStatuses.REJECTED || status === StudentRequestStatuses.COMPLETED || status === StudentRequestStatuses.ABANDONED;
    },
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .container{
    padding: 0px;
  }
  .top-banner{
    background-color: aliceblue;
    background-size: cover;
    align-items: center;
    display: flex;
  }
  .full-height{
    height: 100%;
  }
  .infoTab{
    padding: 10px 0px;
    background-color: #fafafa
  }
  .bottomContainer{
    padding-bottom: 30px
  }
  .student-request-card{
    background: #F2E8D5;
  }
</style>

