<template>
  <div class="status-card d-flex flex-wrap justify-space-between px-1 pb-2">
    <div class="py-0 pl-0">
        <v-card height="100%" width="100%" elevation=0>
            <v-row no-gutters>
                <v-col xl="auto" lg="auto" md="auto" sm="auto">
                  <p class="mb-3">Status of your request:</p>
                </v-col>
                <v-col xl="auto" lg="auto" md="auto" sm="auto">
                  <p class="ml-2 mb-3"><strong>{{statusLabel}}</strong></p>
                </v-col>
            </v-row>
            <v-row no-gutters>
                <v-col xl="auto" lg="auto" md="auto" sm="auto">
                  <p class="mb-3">Status was last updated:</p>
                </v-col>
                <v-col xl="auto" lg="auto" md="auto" sm="auto">
                  <p class="ml-2 mb-3"><strong>{{ request.statusUpdateDate ? moment(request.statusUpdateDate).fromNow():'' }}</strong>, at {{ request.statusUpdateDate ? moment(request.statusUpdateDate).format('YYYY-MM-DD LT'):'' }}</p>
                </v-col>
            </v-row>
            <v-row no-gutters v-if="showFirstSubmission">
                <v-col xl="auto" lg="auto" md="auto" sm="auto">
                  <p class="mb-3">Request was first Submitted:</p>
                </v-col>
                <v-col xl="auto" lg="auto" md="auto" sm="auto">
                  <p class="ml-2 mb-3"><strong>{{ request.initialSubmitDate ? moment(request.initialSubmitDate).fromNow():'' }}</strong>{{ request.initialSubmitDate ? ', at ' + moment(request.initialSubmitDate).format('YYYY-MM-DD LT'):'' }}</p>
                </v-col>
            </v-row>
        </v-card>
    </div>
    <div class="pa-0 align-self-start" v-if="canCreateRequest(status)">
      <v-card height="100%" width="100%" elevation=0>
        <v-row no-gutters justify="end" class="pb-5">
          <v-btn color="#38598a" dark class="ml-2 text-none" @click.stop="$router.push({ path: 'request', append: true })">{{newRequestText}}</v-btn>
        </v-row>
      </v-card>
    </div>
    <div class="pa-0 align-self-start" v-else-if="status === requestStatuses.DRAFT">
      <v-card height="100%" width="100%" elevation=0>
        <v-row no-gutters justify="end" class="pb-5">
          <v-btn color="#38598a" dark class="ml-2 text-none" @click.stop="resendVerificationEmail" :loading="sending">Resend Verification Email</v-btn>
        </v-row>
      </v-card>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { find } from 'lodash';
import { RequestStatuses } from '@/utils/constants';
import ApiService from '@/common/apiService';

export default {
  name: 'statusCard',
  props: {
    canCreateRequest: {
      type: Function,
      default: () => false
    },
    newRequestText: {
      type: String,
      default: ''
    },
    showFirstSubmission: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      sending: false,
    };
  },
  computed: {
    ...mapGetters(['requestType']),
    request() {
      return this.$store.getters[`${this.requestType}/request`];
    },
    statuses() {
      return this.$store.getters[`${this.requestType}/statuses`];
    },
    statusCodeName() {
      return `${this.requestType}StatusCode`;
    },
    status() {
      return this.request[this.statusCodeName];
    },
    statusLabel() {
      const statusCode = find(this.statuses, [this.statusCodeName, this.status]);
      return statusCode && statusCode.label;
    },
    requestStatuses() {
      return RequestStatuses;
    },
    timedout() {
      return Math.floor(new Date() - new Date(this.request.statusUpdateDate)) / (1000*60*60) > 24;
    }
  },
  methods: {
    resendVerificationEmail() {
      this.sending = true;
      ApiService.resendVerificationEmail(this.request[`${this.requestType}ID`], this.requestType).then(() => {
        this.$emit('success-alert', 'Your verification email has been sent successfully.');
      }).catch(() => {
        this.$emit('error-alert', 'Sorry, an unexpected error seems to have occurred. You can click on the resend button again later.');
      }).finally(() => 
        this.sending = false
      );
    },
  }
};
</script>

<style scoped>
.status-card {
  width: 100%;
  line-height: 1.2;
}
</style>
