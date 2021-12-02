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

  <v-container fluid class="full-height" v-else-if="isAuthenticated && hasPenRequest">
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
                <RequestCard :request="request"></RequestCard>
              </template>
            </RequestDisplay>
          </v-col>
        </v-row>
    </article>
  </v-container>

  <v-container fluid class="full-height" v-else-if="isAuthenticated && (hasInflightStudentRequest || hasCompletedStudentRequest)">
    <article id="request-display-container" class="top-banner full-height">
        <v-row align="center" justify="center" style="width: 1vw;margin-right: 0;margin-left: 0;margin-bottom: 5rem;">
          <v-col class="pt-1 pt-sm-3" xs="10" sm="8" md="6" lg="5" xl="3">
            <v-card class="student-request-card">
              <v-card-text>
                <p v-if="hasInflightStudentRequest" class="ma-0"><strong>You have an UpdateMyPEN request in progress.</strong></p>
                <p v-else class="ma-0"><strong>Hi {{student.legalFirstName || ''}}, you have been provided your PEN and don't need to request it again. Your PEN is {{student.pen}}.</strong></p>
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

  <v-container fluid class="full-height" v-else-if="isAuthenticated">
    <!-- pen request form -->
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
import RequestCard from './RequestCard';
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
    RequestCard,
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated', 'userInfo', 'isLoading']),
    ...mapGetters('penRequest', ['request']),
    ...mapGetters('studentRequest', {studentRequest: 'request'}),
    ...mapGetters(['student']),
    hasPen() {
      return !!this.student && !!this.student.pen;
    },
    hasPenRequest() {
      return !!this.request;
    },
    requestTitle() {
      return this.request && this.request.penRequestStatusCode === PenRequestStatuses.RETURNED ? 'Provide More Info for PEN Request' : 'PEN Request Status';
    },
    newRequestText() {
      return 'Create a new PEN Request';
    },
    hasInflightStudentRequest() {
      return this.studentRequest && values(pick(StudentRequestStatuses, ['DRAFT', 'INITREV', 'RETURNED', 'SUBSREV'])).some(status => status === this.studentRequest.studentRequestStatusCode);
    },
    hasCompletedStudentRequest() {
      return this.studentRequest && this.studentRequest.studentRequestStatusCode === StudentRequestStatuses.COMPLETED;
    }
  },
  created() {
    this.setRequestType('penRequest');
  },
  watch: {
    isLoading(val) {
      if(!val) {
        if(!this.hasPenRequest && !this.hasInflightStudentRequest) {
          this.$router.push({ name: 'gmp-step1' });
        }
      }
    }
  },
  methods: {
    ...mapMutations(['setRequestType']),
    canCreateRequest(status) {
      return status === PenRequestStatuses.REJECTED || status === PenRequestStatuses.ABANDONED;
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

