<template>
  <v-alert outlined height="100%" width="100%" class="pa-3 bootstrap-success" v-if="isSagaInProgress">
    <p class="mb-2" ><strong>Thank you. Your request has been accepted.</strong></p>
  </v-alert>
  <v-alert outlined height="100%" width="100%" class="pa-3 bootstrap-success" v-else-if="status === requestStatuses.INITREV || status === requestStatuses.SUBSREV">
    <p class="mb-2" v-if="request.email === request.recordedEmail && status === requestStatuses.INITREV"><strong>Your request to update your student information with the changes below has been submitted.</strong></p>
    <p class="mb-2" v-else-if="status === requestStatuses.INITREV"><strong>Your email has been verified and your UpdateMyPENInfo request has now been submitted for processing.</strong></p>
    <p class="mb-2" v-else><strong>Your UpdateMyPENInfo request has now been re-submitted for processing.</strong></p>
    <ul>
      <li>Requests are processed M-F 8am - 4:30pm excluding stat holidays</li>
      <li>In most cases you will get a response within 1-3 business days</li>
      <li>You will receive an email when your request has been processed. You can also log into UpdateMyPENInfo after one business day to check on the status of your request</li>
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
    <p class="mb-2"><strong>You are almost finished. To complete your request for the changes below, you must verify the email address you provided by completing the following steps:</strong></p>
    <ol>
      <li>Go to your email for {{request.email}} and look for an email from the Ministry of Education.  You may need to check your spam folder</li>
      <li>Within 24 hours you must click on the link in the email to complete your request</li>
    </ol>
    <br/>
    <p>If the email has expired or is not in your Inbox (or spam folder) click on the "Resend Verification Email" button below to receive a new email and the follow the 2 steps listed above.</p>
  </v-alert>
  <v-alert outlined height="100%" width="100%" class="pa-3 bootstrap-warning" v-else-if="status === requestStatuses.RETURNED">
    <p class="mb-2"><strong>Additional information is required.</strong> See the request below.</p>
  </v-alert>
  <v-alert outlined height="100%" width="100%" class="pa-3 bootstrap-warning" v-else-if="status === requestStatuses.REJECTED">
    <p class="mb-2"><strong>Your request to update your PEN information could not be completed for the following reason:</strong></p>
    <p>
      <ul>
        <li>{{ request.failureReason }}</li>
      </ul>
    </p>
    <p>If needed, you can submit another request using the button below.</p>
  </v-alert>
  <v-alert outlined height="100%" width="100%" class="pa-3 bootstrap-success" v-else-if="status === requestStatuses.COMPLETED">
    <p class="mb-2"><strong>Your request to update your PEN information is complete</strong></p>
    <p class="mb-2 comment" v-if="request.completeComment && request.completeComment.length > 0">{{request.completeComment}}</p>

    <p class="mb-2">For your reference, your student record at the Ministry of Education has been updated as shown below</p>
    <v-container class="pen-info pt-0 pb-2 px-0 px-sm-3" justify="center">
      <v-row no-gutters class="py-0 px-2">
        <v-col xl="2" lg="2" md="2" sm="3" xs="3">
          <p class="mb-2">PEN:</p>
        </v-col>
        <v-col xl="9" lg="9" md="9" sm="8" xs="8">
          <p class="mb-2"><strong>{{ student.pen }}</strong></p>
        </v-col>
      </v-row>
      <v-row no-gutters class="py-0 px-2">
        <v-col xl="2" lg="2" md="2" sm="3" xs="3">
          <p class="mb-2">Name:</p>
        </v-col>
        <v-col xl="9" lg="9" md="9" sm="8" xs="8">
          <p class="mb-2"><strong>{{ updatedFullName }}</strong></p>
        </v-col>
      </v-row>
      <v-row no-gutters class="py-0 px-2">
        <v-col xl="2" lg="2" md="2" sm="3" xs="3">
          <p class="mb-2">Birthdate:</p>
        </v-col>
        <v-col xl="9" lg="9" md="9" sm="8" xs="8">
          <p class="mb-2"><strong>{{ student.dob ? moment(student.dob).format('MMMM D, YYYY'):'' }}</strong></p>
        </v-col>
      </v-row>
      <v-row no-gutters class="py-0 px-2">
        <v-col xl="2" lg="2" md="2" sm="3" xs="3">
          <p class="mb-2">Gender:</p>
        </v-col>
        <v-col xl="9" lg="9" md="9" sm="8" xs="8">
          <p class="mb-2"><strong>{{ student.sexLabel }}</strong></p>
        </v-col>
      </v-row>
    </v-container>

    <p class="mb-2"><strong>If any of this information is not current, please submit a new request or contact <a href="mailto:pens.coordinator@gov.bc.ca">pens.coordinator@gov.bc.ca</a>.</strong></p>
    <p class="mb-2">{{ request.tomorrow ? 'As of tomorrow morning 8am PST, you may use your PEN to' : 'You now may wish to use your PEN to:' }}
      <ul>
        <li>
          <a :href="transcriptUrl" target="_blank">
            Order Transcripts & Certificates - StudentTranscripts Service
          </a>
        </li>
      </ul>
    </p>
    <p class="mb-2">You can log back into UpdateMyPENInfo at any time to see your PEN and current student information.</p>
  </v-alert>
  <v-alert outlined height="100%" width="100%" class="pa-3 bootstrap-warning" v-else-if="status === requestStatuses.ABANDONED">
    <p class="mb-2"><strong>Your Update PEN Info Request was not actioned within {{numDaysAllowedInDraftStatus}} days and was therefore cancelled. Please fill out the form again and verify your email to submit a new request.</strong></p>
  </v-alert>
</template>

<script>
import { mapGetters,mapActions } from 'vuex';
import { StudentRequestStatuses } from '@/utils/constants';

export default {
  name: 'messageCard',
  data() {
    return {
      transcriptUrl: 'https://www2.gov.bc.ca/gov/content?id=040EB8CF78CF4F2090D9C6FFF6F3CDA0'
    };
  },
  computed: {
    ...mapGetters('auth', ['userInfo']),
    ...mapGetters('studentRequest', ['request', 'genderInfo']),
    ...mapGetters(['student']),
    ...mapGetters('config',['numDaysAllowedInDraftStatus']),
    isSagaInProgress() {
      return this.request.sagaInProgress;
    },
    status() {
      return this.request.studentRequestStatusCode;
    },
    ministry() {
      return 'the Ministry of Education';
    },
    requestStatuses() {
      return StudentRequestStatuses;
    },
    timedout() {
      return Math.floor(new Date() - new Date(this.request.statusUpdateDate)) / (1000*60*60) > 24;
    },
    requestedFullName() {
      return this.fullName(this.request.legalFirstName, this.request.legalMiddleNames, this.request.legalLastName);
    },
    updatedFullName() {
      return this.fullName(this.student.legalFirstName, this.student.legalMiddleNames, this.student.legalLastName);
    },
    genderLabel() { 
      return this.request.genderCode && this.genderInfo(this.request.genderCode).label;
    },
  },
  async created(){
    await this.getNumDaysAllowedInDraftStatus();
  },
  methods: {
    ...mapActions('config',['getNumDaysAllowedInDraftStatus']),
    fullName(...names) {
      return names.filter(Boolean).join(' ').toUpperCase();
    },
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
