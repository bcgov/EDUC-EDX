<template>
  <v-container fluid>
    <v-row class="mr-3 ml-3">
      <v-col>
        <v-row class='d-flex justify-lg-end pb-2'>
          <v-col class='d-flex justify-lg-end'>
            <PrimaryButton
              :large-icon=true
              icon="mdi-plus"
              id="newMessageBtn"
              text="New Message"
              to="newExchange"
            ></PrimaryButton>
          </v-col>
        </v-row>
        <v-expansion-panels>
          <v-expansion-panel style="background: #dddddd8a">
            <v-expansion-panel-header class="pt-0 pb-0" disable-icon-rotate>
              <v-radio-group
                @click.native.stop
                v-model="statusFilter"
                row
                class="pt-0 pb-0 mt-0 mb-0"
              >
                <v-radio class="mt-2"
                  label="Active Only"
                  value="statusFilterActive"
                ></v-radio>
                <v-radio class="mt-2"
                  label="All"
                  value="statusFilterAll"
                ></v-radio>
              </v-radio-group>
              <template v-slot:actions>
                <v-btn id="filterid"
                       title="filter"
                       color="black"
                       outlined
                       class="mt-0 pt-0"

                >
                  <v-icon color="black" class="ml-n1" :nudge-down="4" right dark>mdi-filter-outline</v-icon>
                  <span v-if="$vuetify.breakpoint.mdAndUp" class="ml-1">More Filters</span>
                </v-btn>
              </template>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
        <v-row>
          <v-col>
            <v-data-table
              :items-per-page.sync="pageSize"
              :page.sync="pageNumber"
              :headers="headers"
              :footer-props="{
                      'items-per-page-options': itemsPerPageOptions
                    }"
              :items="requests"
              :loading="loadingTable"
              :server-items-length="totalRequests"
              class="elevation-1"
              hide-default-header
              mobile-breakpoint="0"
            >

              <template v-slot:item.secureExchangeStatusCode="{ item }">
                <v-row>
                  <v-col cols="6" md="10" class="pb-0 pt-0">
                    <v-row class="mb-n4">
                      <v-col cols="12" class="pb-2 pt-2 pr-0">
                        <h3 class="subjectHeading">{{ getSubject(item.subject) }}</h3>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12" class="pb-1 pr-0">
                        <span style="color: gray">{{ getLatestComment(item) }}</span>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col cols="6" md="2" style="text-align: end" class="pb-0 pt-0">
                    <v-row class="mb-n4">
                      <v-col cols="12" class="pb-1">
                        <v-icon class="pb-1" :color="item.secureExchangeStatusCode === 'In Progress' ? 'yellow darken-2' : 'blue'" right dark>mdi-circle-medium</v-icon>
                        <span>{{ item.secureExchangeStatusCode }}</span>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12" class="pb-2">
                        <v-icon class="pb-1" color="black" right dark>mdi-clock-outline</v-icon>
                        <span>{{ item.createDate }}</span>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </template>

              <template v-slot:no-data>There are no messages.</template>

            </v-data-table>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

import ApiService from '../../common/apiService';
import {ApiRoutes} from '@/utils/constants';
import PrimaryButton from '../util/PrimaryButton';
import {mapState} from 'vuex';
import {isEmpty, omitBy} from 'lodash';

export default {
  name: 'ExchangeInbox',
  components: {
    PrimaryButton,
  },
  data() {
    return {
      headers: [
        {
          text: 'Status',
          align: 'start',
          sortable: false,
          value: 'secureExchangeStatusCode',
        }
      ],
      items: [
        {
          color: 'red lighten-2',
          icon: 'mdi-star',
        },
        {
          color: 'purple darken-1',
          icon: 'mdi-book-variant',
        },
        {
          color: 'green lighten-1',
          icon: 'mdi-airballoon',
        },
        {
          color: 'indigo',
          icon: 'mdi-buffer',
        }
      ],
      selectedItem: 0,
      pageNumber: 1,
      pageSize: 25,
      totalRequests: 0,
      itemsPerPageOptions: [10],
      loadingTable: false,
      dateMenu: false,
      headerSearchParams: {
        sequenceNumber: '',
        contact: '',
        subject: '',
        createDate: [],
        secureExchangeStatusCode: ''
      },
      headerSortParams: {
        currentSort: 'createDate',
        currentSortDir: true
      },
      requests: [],
      isActiveMessagesTabEnabled: true,
    };
  },
  computed: {
    ...mapState('edx', ['statuses'])
  },
  created() {
    this.$store.dispatch('edx/getCodes');
    this.headerSearchParams.secureExchangeStatusCode = ['NEW', 'INPROG'];
    this.getRequests();
  },
  methods: {
    getSubject(subject){
      if(subject.length > 12){
        switch (this.$vuetify.breakpoint.name) {
        case 'xs':
        case 'sm':
          return this.getContentString(subject, 12);
        case 'md':
          return this.getContentString(subject, 40);
        case 'lg':
          return this.getContentString(subject, 100);
        default:
          return this.getContentString(subject, 150);
        }
      }
      return subject;
    },
    getContentString(content, length){
      if(content.length > length) {
        return content.substring(0, length) + '...';
      }
      return content;
    },
    getLatestComment(item){
      var content = item.commentsList.reduce((a, b) => (a.createDate > b.createDate ? a : b)).content;
      if(content.length > 25){
        switch (this.$vuetify.breakpoint.name) {
        case 'xs':
        case 'sm':
          return this.getContentString(content, 25);
        case 'md':
          return this.getContentString(content, 100);
        case 'lg':
          return this.getContentString(content, 130);
        case 'xl':
          return this.getContentString(content, 220);
        default:
          return content;
        }
      }
      return content;
    },
    getCompletedMessages() {
      this.headerSearchParams.secureExchangeStatusCode = ['COMPLETE'];
      this.isActiveMessagesTabEnabled = false;
      this.getRequests();

    },
    getRequests() {
      this.loadingTable = true;
      this.requests = [];
      const sort = {
        isReadByExchangeContact: 'ASC',
        createDate: 'ASC'
      };

      ApiService.apiAxios.get(ApiRoutes.edx.EXCHANGE_URL, {
        params: {
          pageNumber: this.pageNumber - 1,
          pageSize: this.pageSize,
          sort,
          searchParams: omitBy(this.headerSearchParams, isEmpty),
        }
      }).then(response => {
        this.requests = response.data.content;
        if(this.isActiveMessagesTabEnabled){
          this.totalRequests = response.data.totalElements;
        }
      }).catch(error => {
        //to do add the alert framework for error or success
        console.error(error);
      }).finally(() => {
        this.loadingTable = false;
      });
    },
    getActiveMessages() {
      this.headerSearchParams.secureExchangeStatusCode = ['NEW', 'INPROG'];
      this.isActiveMessagesTabEnabled = true;
      this.getRequests();
    },
    getSecureExchangeStatusCodes(){
      const statusCodeComboBox = [];
      const item1 = {
        value: 'NEW',
        text: 'New',
      };
      const item2 = {
        value: 'INPROG',
        text: 'In Progress',
      };
      statusCodeComboBox.push(item1);
      statusCodeComboBox.push(item2);
      return statusCodeComboBox;
    },
  },
  watch: {
    pageSize() {
      this.getRequests();
    },
    pageNumber() {
      this.getRequests();
    }
  }
};
</script>

<style scoped>

.tableRow {
  cursor: pointer;
}

.unread {
  font-weight: bold;
}

.v-data-table >>> .v-data-table__wrapper {
  overflow-x: hidden;
}

@media screen and (max-width: 801px){
  .subjectHeading {
    font-size: medium;
  }
}



</style>
