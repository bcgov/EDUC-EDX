<template>
  <v-alert outlined height="100%" width="100%" class="pa-3 bootstrap-success" v-if="isSagaInProgress">
    <p class="mb-2" ><strong>Thank you. Your request has been accepted.</strong></p>
  </v-alert>
  <v-alert outlined height="100%" width="100%" class="pa-3 bootstrap-success" v-else-if="status === requestStatuses.INITREV || status === requestStatuses.SUBSREV">
    <p class="mb-2" v-if="status === requestStatuses.INITREV"><strong>Your email has been verified and your PEN request has now been submitted for processing.</strong></p>
    <p class="mb-2" v-else><strong>Your PEN request has now been re-submitted for processing.</strong></p>
    <ul>
      <li>Requests are processed M-F 8am – 4:30pm excluding stat holidays</li>
      <li>In most cases you will get a response within 1-3 business days</li>
      <li>You will receive an email when your request has been processed. You can also log into GetMyPEN after one business day to check on status of your request</li>
    </ul>
  </v-alert>
  <v-alert outlined height="100%" width="100%" class="pa-3 bootstrap-warning" v-else-if="status === requestStatuses.DRAFT && timedout">
    <p class="mb-2"><strong>Your email verification was not completed within the time limited. Repeat the email verification process.</strong></p>
    <ol>
      <li>Click the 'Resend Verification Email' button below</li>
      <li>Go to your email inbox for {{ request.email }} and check for an email from {{ ministry }}. Check your spam folder too</li>
      <li>Open the email and click on the link within 24 hours to complete the verification process</li>
    </ol>
  </v-alert>
  <v-alert outlined height="100%" width="100%" class="pa-3 bootstrap-warning" v-else-if="status === requestStatuses.DRAFT && ! timedout">
    <p class="mb-2"><strong>You are almost finished. To complete your request, you must verify the email address you provided by completing the following steps:</strong></p>
    <p>
      <ol>
        <li>Go to your email inbox for <strong>{{ request.email }}</strong> and look for an email from {{ ministry }}. You may need to check your spam folder</li>
        <li><strong>Within 24 hours</strong> you must click on the link in the email to complete your request</li>
      </ol>
    </p>
    <p>If the email has expired or is not in your Inbox (or spam folder) click on the 'Resend Verification Email' button below to receive a new email and then follow the 2 steps listed above.</p>
  </v-alert>
  <v-alert outlined height="100%" width="100%" class="pa-3 bootstrap-warning" v-else-if="status === requestStatuses.RETURNED">
    <p class="mb-2"><strong>Additional information is required.</strong> See the request below.</p>
  </v-alert>
  <v-alert outlined height="100%" width="100%" class="pa-3 bootstrap-warning" v-else-if="status === requestStatuses.REJECTED">
    <p class="mb-2"><strong>Your request to get your PEN could not be completed, for the following reason:</strong></p>
    <p>
      <ul>
        <li>{{ request.failureReason }}</li>
      </ul>
    </p>
    <p>If needed, you can submit another request using the button below.</p>
  </v-alert>
  <v-alert outlined height="100%" width="100%" class="pa-3 bootstrap-success" v-else-if="status === requestStatuses.AUTO || status === requestStatuses.MANUAL">
    <p class="mb-1"><strong>Your PEN request is complete. Your PEN is:</strong></p>
    <p class="mb-2 pen"><strong>{{student.pen}}</strong></p>
    <p class="mb-2 comment" v-if="request.completeComment && request.completeComment.length > 0">{{request.completeComment}}</p>
    <p class="mb-2">Below is the key information the Ministry of Education has on file for you. If any of this information is not current, please proceed to <router-link to="ump">Update My PEN Info page</router-link>.</p>
    <v-container class="pen-info pt-0 pb-2 px-0 px-sm-3" justify="center">
      <v-row no-gutters class="py-0 px-2">
        <v-col xl="4" lg="4" md="4" sm="4">
          <p class="mb-2">Legal Last Name:</p>
        </v-col>
        <v-col xl="4" lg="5" md="5" sm="5">
          <p class="mb-2"><strong>{{ student.legalLastName }}</strong></p>
        </v-col>
      </v-row>
      <v-row no-gutters class="py-0 px-2">
        <v-col xl="4" lg="4" md="4" sm="4">
          <p class="mb-2">Legal First Name(s):</p>
        </v-col>
        <v-col xl="4" lg="5" md="5" sm="5">
          <p class="mb-2"><strong>{{ student.legalFirstName }}</strong></p>
        </v-col>
      </v-row>   
      <v-row no-gutters class="py-0 px-2">
        <v-col xl="4" lg="4" md="4" sm="4">
          <p class="mb-2" color="green">Legal Middle Name(s):</p>
        </v-col>
        <v-col xl="4" lg="5" md="5" sm="5">
          <p class="mb-2"><strong>{{ student.legalMiddleNames }}</strong></p>
        </v-col>
      </v-row>
      <v-row no-gutters class="py-0 px-2">
        <v-col xl="4" lg="4" md="4" sm="4">
          <p class="mb-2">Date of Birth:</p>
        </v-col>
        <v-col xl="4" lg="5" md="5" sm="5">
          <p class="mb-2"><strong>{{ student.dob }}</strong></p>
        </v-col>
      </v-row>
      <v-row no-gutters class="py-0 px-2">
        <v-col xl="4" lg="4" md="4" sm="4">
          <p class="mb-2">Gender:</p>
        </v-col>
        <v-col xl="4" lg="5" md="5" sm="5">
          <p class="mb-2"><strong>{{ student.sexLabel }}</strong></p>
        </v-col>
      </v-row>
    </v-container>
    <p class="mb-2">{{ request.tomorrow ? 'As of tomorrow morning 8am PST, you may use your PEN to' : 'You now may wish to use your PEN to:' }}
      <ul>
        <li>
          <a :href="transcriptUrl" target="_blank">
            Order Transcripts & Certificates - StudentTranscripts Service
          </a>
        </li>
      </ul>
    </p>
    <p class="mb-2">You can log back into GetMyPEN at any time to see your PEN.</p>
  </v-alert>
  <v-alert outlined height="100%" width="100%" class="pa-3 bootstrap-warning" v-else-if="status === requestStatuses.ABANDONED">
    <p class="mb-2"><strong>Your PEN Request was not actioned within {{numDaysAllowedInDraftStatus}} days and was therefore cancelled. Please fill out the form again and verify your email to submit a new request.</strong></p>
  </v-alert>
</template>

<script>
import { mapGetters,mapActions } from 'vuex';
import { PenRequestStatuses } from '@/utils/constants';

export default {
  name: 'messageCard',
  data() {
    return {
      transcriptUrl: 'https://www2.gov.bc.ca/gov/content?id=040EB8CF78CF4F2090D9C6FFF6F3CDA0'
    };
  },
  computed: {
    ...mapGetters('auth', ['userInfo']),
    ...mapGetters('penRequest', ['request', 'sexInfo']),
    ...mapGetters(['student']),
    ...mapGetters('config',['numDaysAllowedInDraftStatus']),

    isSagaInProgress() {
      return this.request.sagaInProgress;
    },
    status() {
      return this.request.penRequestStatusCode;
    },
    ministry() {
      return 'the Ministry of Education';
    },
    requestStatuses() {
      return PenRequestStatuses;
    },
    timedout() {
      return Math.floor(new Date() - new Date(this.request.statusUpdateDate)) / (1000*60*60) > 24;
    },
    sexLabel() { 
      return this.sexInfo(this.student.sexCode).label;
    }
  },
  async created(){
    await this.getNumDaysAllowedInDraftStatus();
  },
  methods: {
    ...mapActions('config',['getNumDaysAllowedInDraftStatus']),
  }
};
</script>

<style scoped>
.pen {
  font-size: 1.2rem;
}

.pen-info{
  line-height: 1.2;
}

</style>
