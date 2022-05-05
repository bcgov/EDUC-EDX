<template>
  <v-row>
    <v-col cols='2'>
      <v-expansion-panels :value="0">
        <v-expansion-panel>
          <v-expansion-panel-header> Secure Inbox</v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-list dense>
              <v-list-item-group v-model="selectedItem" color="primary">
                <v-list-item v-on:click="getActiveMessages()">
                  <v-list-item-content>Active Messages</v-list-item-content>
                  <v-list-item-avatar>{{ totalRequests }}</v-list-item-avatar>
                </v-list-item>
                <v-list-item v-on:click="getCompletedMessages()">
                  <v-list-item-content>Completed Messages</v-list-item-content>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-col>
    <v-col>
      <v-row class='d-flex justify-lg-end pb-2'>
        <PrimaryButton
            id="newMessageBtn"
            text="New Message"
            to="newExchange"
        ></PrimaryButton>
      </v-row>
      <v-data-table
          :headers="headers"
          :items-per-page.sync="pageSize"
          :page.sync="pageNumber"
          :footer-props="{
              'items-per-page-options': itemsPerPageOptions
            }"
          :items="requests"
          :loading="loadingTable"
          :server-items-length="totalRequests"
      >
        <template v-slot:header.sequenceNumber="{ header }">
          <th
              id="sequence-number-header"
          >
            {{ header.text }}
          </th>
          <v-text-field
              id="sequence-number-text-field"
              v-model="headerSearchParams.sequenceNumber"
              class="header-text"
              outlined
              dense
              clearable
          ></v-text-field>
        </template>
        <template v-slot:header.contactIdentifier="{ header }">
          <th
              id="contact-header"
          >
            {{ header.text }}
          </th>
          <v-text-field
              id="contact-text-field"
              v-model="headerSearchParams.contact"
              item-text="contactIdentifierName"
              item-value="ministryOwnershipTeamID"
              class="header-text"
              outlined
              dense
              clearable
          ></v-text-field>
        </template>
        <template v-slot:header.subject="{ header }">
          <th
              id="subject-header"
          >
            {{ header.text }}
          </th>
          <v-text-field
              id="subject-text-field"
              v-model="headerSearchParams.subject"
              class="header-text"
              outlined
              dense
              clearable
          ></v-text-field>
        </template>
        <template v-slot:header.createDate="{ header }">
          <th
              id="create-date-header"
          >
            {{ header.text }}
          </th>
          <v-menu
              ref="dateMenu"
              v-model="dateMenu"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              min-width="290px"
          >
            <template v-slot:activator="{ on }">
              <v-text-field
                  id="date-picker-text-field"
                  :value="headerSearchParams.createDate? headerSearchParams.createDate.join(): ''"
                  outlined
                  dense
                  readonly
                  v-on="on"
                  @click:clear="headerSearchParams.createDate = []"
                  clearable
                  class="header-text"
              ></v-text-field>
            </template>
            <v-date-picker
                id="date-picker"
                v-model="headerSearchParams.createDate"
                no-title
                range
            >
              <v-spacer></v-spacer>
              <PrimaryButton id="date-picker-ok-button" text="OK"
                             @click.native="dateMenu=false"></PrimaryButton>
            </v-date-picker>
          </v-menu>
        </template>
        <template v-slot:header.secureExchangeStatusCode="{ header }">
          <th
              id="status-header"
          >
            {{ header.text }}
          </th>
          <v-select
              id="status-text-field"
              v-model="headerSearchParams.secureExchangeStatusCode"
              :items="getSecureExchangeStatusCodes()"
              :disabled="!isActiveMessagesTabEnabled"
              class="header-text"
              outlined
              dense
              clearable
          >
          </v-select>
        </template>
        <template v-slot:item="{ item, index }">
          <tr
              :key="index"
              :class="[{'unread': item.isReadByExchangeContact === 'N'}, 'tableRow']">
            <td>{{ item.sequenceNumber }}</td>
            <td>{{ item.contactIdentifierName }}</td>
            <td>{{ item.subject }}</td>
            <td>{{ item.createDate }}</td>
            <td>{{ item.secureExchangeStatusCode }}</td>
          </tr>
        </template>
        <template v-slot:no-data>There are no messages.</template>

      </v-data-table>
    </v-col>
  </v-row>
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
      selectedItem: 0,
      pageNumber: 1,
      pageSize: 25,
      totalRequests: 0,
      itemsPerPageOptions: [10, 15, 25, 50, 100],
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
    ...mapState('edx', ['statuses']),
    headers() {
      return [
        {
          text: 'Id',
          value: 'sequenceNumber',
          sortable: false
        },
        {
          text: 'Contact',
          value: 'contactIdentifier',
          sortable: false
        },
        {
          text: 'Subject',
          value: 'subject',
          sortable: false
        },
        {
          text: 'Request Date',
          value: 'createDate',
          sortable: false
        },
        {
          text: 'Status',
          value: 'secureExchangeStatusCode',
          sortable: false
        }
      ];
    }
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

</style>
