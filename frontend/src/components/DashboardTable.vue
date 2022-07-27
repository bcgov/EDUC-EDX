<template>
  <v-card class="mt-0 mb-5" height="100%" width="100%" outlined rounded @click="redirectToInbox()">
    <v-row class="px-4">
      <v-col md="5">
        <div v-if="unreadExchangeCount > 0">
          <v-badge bordered top color="rgb(0, 51, 102)" circle offset-x="23" offset-y="30">
            <v-icon aria-hidden="false" color="rgb(0, 51, 102)" size="100">
              mdi-email-outline
            </v-icon>
          </v-badge>
        </div>
        <div v-else >
          <v-icon aria-hidden="false" color="rgb(0, 51, 102)" size="100">
            mdi-email-outline
          </v-icon>
        </div>
      </v-col>
      <v-col class="mt-4 mr-1">
        <v-card-title class="pa-0">
          <h4>
            <v-row class="dashboard-title mr-4">{{ title }}</v-row>
          </h4>
        </v-card-title>
        <v-row class="mr-4"><span> {{exchangeCount}} messages, {{unreadExchangeCount}} unread</span></v-row>
      </v-col>
    </v-row>
  </v-card>
</template>
<script>
import omit from 'lodash/omit';
import ApiService from '../common/apiService';
import {ApiRoutes} from '@/utils/constants';
import router from '@/router';

export default {
  name: 'DashboardTable.vue',
  props: {
    tableData: {
      type: Array,
      required: true
    },
    title: {
      type: String,
      required: false
    },
    colour: {
      type: String
    }
  },
  components: {
  },
  data() {
    return {
      exchangeCount: '',
      unreadExchangeCount: '',
      headerSearchParams: {
        sequenceNumber: '',
        contact: '',
        subject: '',
        createDate: [],
        secureExchangeStatusCode: ''
      }
    };
  },
  created() {
    this.getExchangesCount();
  },
  methods: {
    omit(object, key) {
      return omit(object, key);
    },
    getExchangesCount() {
      this.loadingTable = true;
      this.requests = [];

      this.headerSearchParams.subject = this.subjectFilter;
      this.headerSearchParams.createDate = this.messageDate === null ? null : [this.messageDate];
      this.headerSearchParams.ministryOwnershipTeamID = this.contactNameFilter;
      this.headerSearchParams.sequenceNumber = this.messageIDFilter;

      ApiService.apiAxios.get(ApiRoutes.edx.EXCHANGE_COUNT_URL, {
        params: {
          pageNumber: 0,
          pageSize: 50000,
          sort: '',
        }
      }).then(response => {
        this.exchangeCount = response.data.exchangeCount;
        this.unreadExchangeCount = response.data.unreadExchangeCount;
      }).catch(error => {
        //to do add the alert framework for error or success
        console.error(error);
      }).finally(() => {
        this.loadingTable = false;
      });
    },
    redirectToInbox(){
      router.push('/inbox');
    }
  }
};
</script>

<style scoped>
.listCol {
  align-self: center;
}
.dashboard-title {
  word-break: break-word;
}
</style>

