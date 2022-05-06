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
            >

              <template v-slot:item.secureExchangeStatusCode="{ item }">
                <v-row class="mb-n4">
                  <v-col cols="12">
                    <v-icon class="pb-1" :color="item.secureExchangeStatusCode === 'In Progress' ? 'yellow darken-2' : 'blue'" right dark>mdi-circle-medium</v-icon>
                    <span>{{ item.secureExchangeStatusCode }}</span>
                  </v-col>
                </v-row>
                <v-row class="mb-n4">
                  <v-col cols="12">
                    <v-icon class="pb-1" color="black" right dark>mdi-account-outline</v-icon>
                    <span>{{ item.reviewer }}</span>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-icon class="pb-1" color="black" right dark>mdi-clock-outline</v-icon>
                    <span>{{ item.createDate }}</span>
                  </v-col>
                </v-row>
              </template>

              <template v-slot:item.subject="{ item }">
                <v-row>
                  <v-col cols="12">
                    <span>{{ item.subject.length > 35 ? item.subject.substring(0, 35) + '...' : item.subject }}</span>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <span>{{ item.contactIdentifier }}</span>
                  </v-col>
                </v-row>
              </template>

<!--              <template v-slot:item="{ item, index }">-->
<!--                <v-row class="ml-2">-->
<!--                  <v-col cols="11">-->
<!--                    <v-row>-->
<!--                      <v-col cols="12">-->
<!--                        <span>{{ item.subject.length > 40 ? item.subject.substring(0, 40) + '...' : item.subject }}</span>-->
<!--                      </v-col>-->
<!--                    </v-row>-->
<!--                    <v-row>-->
<!--                      <v-col cols="12">-->
<!--                        <span>{{ item.contactIdentifier }}</span>-->
<!--                      </v-col>-->
<!--                    </v-row>-->
<!--                  </v-col>-->
<!--                  <v-col cols="1">-->
<!--                    <v-row class="mb-n3">-->
<!--                      <v-col cols="12">-->
<!--                        <v-icon class="pb-1" :color="item.secureExchangeStatusCode === 'In Progress' ? 'yellow darken-2' : 'blue'" right dark>mdi-circle-medium</v-icon>-->
<!--                        <span>{{ item.secureExchangeStatusCode }}</span>-->
<!--                      </v-col>-->
<!--                    </v-row>-->
<!--                    <v-row class="mb-n3">-->
<!--                      <v-col cols="12">-->
<!--                        <v-icon class="pb-1" color="black" right dark>mdi-account-outline</v-icon>-->
<!--                        <span>{{ item.reviewer }}</span>-->
<!--                      </v-col>-->
<!--                    </v-row>-->
<!--                    <v-row class="mb-n3">-->
<!--                      <v-col cols="12">-->
<!--                        <v-icon class="pb-1" color="black" right dark>mdi-clock-outline</v-icon>-->
<!--                        <span>{{ item.createDate }}</span>-->
<!--                      </v-col>-->
<!--                    </v-row>-->
<!--                  </v-col>-->
<!--                </v-row>-->
<!--              </template>-->
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
          text: 'Details',
          align: 'start',
          sortable: false,
          value: 'subject',
        },
        {
          text: 'Status',
          align: 'end',
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
        console.log(JSON.stringify(this.requests));
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

</style>
