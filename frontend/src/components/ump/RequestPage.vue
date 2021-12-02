<template>
  <v-container fluid class="full-height" v-if="isAuthenticated && hasInflightGMPRequest">
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
  <v-container fluid class="full-height" v-else-if="isAuthenticated">
    <!-- request form -->
    <article id="request-form-container" class="top-banner full-height">
      <v-row align="center" justify="center">
        <v-col xs="10" sm="10" md="10" lg="10" xl="10">
        <RequestStepper
          :steps="steps"
          :titles="titles"
        ></RequestStepper>
        </v-col>
      </v-row>
    </article>
  </v-container>
</template>

<script>
import RequestStepper from '../RequestStepper';
import { mapGetters } from 'vuex';
import { PenRequestStatuses } from '@/utils/constants';
import { pick, values } from 'lodash';
export default {
  name: 'requestPage',
  components: {
    RequestStepper,
  },
  data() {
    return {
      steps: 3,
      titles: ['Current Student Information', 'Requested Changes to Student Information', 'Confirm Changes', 'Submit Changes'],
    };
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated', 'userInfo']),
    ...mapGetters('penRequest', {penRequest: 'request'}),
    ...mapGetters('ump', ['recordedData', 'updateData']),
    hasPen() {
      return !!this.userInfo && !!this.userInfo.pen;
    },
    hasInflightGMPRequest() {
      return this.penRequest && values(pick(PenRequestStatuses, ['DRAFT', 'INITREV', 'RETURNED', 'SUBSREV'])).some(status => status === this.penRequest.penRequestStatusCode);
    },
  },
  watch: {
    'updateData.email': function(newVal) {
      if(newVal && this.updateData.email !== this.recordedData.email) {
        this.steps = 4;
      } else if(newVal && this.updateData.email === this.recordedData.email) {
        this.steps = 3;
      }
    },
  },
  mounted() {
    if(!(this.isAuthenticated)){
      this.$router.push('home');
    }
  },
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
.student-request-card{
  background: #F2E8D5;
}
</style>
