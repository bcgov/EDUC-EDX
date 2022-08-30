<template>
  <v-container class="containerSetup" fluid>
    <v-row class="pt-0">
      <v-col class="pt-0">
        <v-row class='d-flex justify-end pb-2'>
          <v-col class='d-flex justify-end'>
            <PrimaryButton
              :large-icon=true
              icon="mdi-plus"
              id="newMessageBtn"
              text="New Message"
              @click.native="newMessageSheet = !newMessageSheet"
            ></PrimaryButton>
          </v-col>
        </v-row>
        <v-expansion-panels flat style="border-radius: 6px">
          <v-expansion-panel id="filtersToggle" @click="onExpansionPanelClick" style="background: #ebedef">
            <v-expansion-panel-header class="pt-0 pb-0" disable-icon-rotate>
              <v-radio-group
                  @click.native.stop
                  color="#003366"
                  v-model="statusRadioGroup"
                  :disabled="!statusRadioGroupEnabled"
                  row
                  class="pt-0 pb-0 mt-0 mb-0"
              >
                <v-radio class="mt-2 radio-blue-text"
                         label="Active Only"
                         color="#003366"
                         value="statusFilterActive"
                         @click.native="statusFilterActiveClicked"
                >
                  <template v-slot:label>
                    <span :class="{ 'activeRadio' : statusRadioGroupEnabled }">Active Only</span>
                  </template>
                </v-radio>
                <v-radio class="mt-2 radio-blue-text"
                         label="All"
                         color="#003366"
                         value="statusFilterAll"
                         @click.native="filterRequests"
                >
                  <template v-slot:label>
                    <span :class="{ 'activeRadio' : statusRadioGroupEnabled }">All</span>
                  </template>
                </v-radio>
              </v-radio-group>
              <template v-slot:actions>
                <v-btn id="filterid"
                       title="filter"
                       color="#003366"
                       outlined
                       class="mt-0 pt-0 filterButton"
                >
                  <v-icon color="#003366" class="ml-n1" :nudge-down="4" right dark>mdi-filter-outline</v-icon>
                  <span v-if="$vuetify.breakpoint.mdAndUp" class="ml-1">{{ filterText }}</span>
                </v-btn>
              </template>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-row>
                <v-col cols="12" md="4">
                  <v-text-field
                    class="pt-0 mt-0"
                    id="subjectInput"
                    v-model="subjectFilter"
                    label="Subject"
                    prepend-inner-icon="mdi-book-open-variant"
                    clearable
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4" :class="{'pl-12 pr-12': $vuetify.breakpoint.mdAndUp}">
                  <v-menu
                      id="messageDate"
                      ref="messageDateFilter"
                      v-model="messageDateFilter"
                      :close-on-content-click="false"
                      transition="scale-transition"
                      offset-y
                      min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                          id="messageDateTextField"
                          class="pt-0 mt-0"
                          v-model="messageDate"
                          label="Message Date"
                          prepend-inner-icon="mdi-calendar"
                          clearable
                          readonly
                          v-bind="attrs"
                          v-on="on"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                        v-model="messageDate"
                        :active-picker.sync="activeMessageDatePicker"
                        :max="(new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10)"
                        min="2022-01-01"
                        @change="saveMessageDate"
                    ></v-date-picker>
                  </v-menu>
                </v-col>
                <v-col cols="12" md="4">
                  <v-select
                      v-model="statusSelectFilter"
                      id="statusSelector"
                      :items="secureExchangeStatusCodes"
                      item-text="label"
                      class="pt-0 mt-0"
                      item-value="secureExchangeStatusCode"
                      prepend-inner-icon="mdi-alert-circle-outline"
                      label="Status"
                      single-line
                      clearable
                  >
                    <template v-slot:item="{ item }">
                      <v-row>
                        <v-col cols="12" class="pr-0">
                          <v-icon :color="getStatusColor(item.label)">
                            mdi-circle-medium
                          </v-icon>
                          <span class="body-2">{{ item.label }}</span>
                        </v-col>
                      </v-row>
                    </template>
                  </v-select>
                </v-col>
                <v-col cols="12" md="4" class="pt-0">
                  <v-select
                    class="pt-0 mt-0"
                    id="contactNameSelect"
                    v-model="contactNameFilter"
                    label="Contact Name"
                    item-text="teamName"
                    item-value="ministryOwnershipTeamId"
                    :items="ministryContactName"
                    prepend-inner-icon="mdi-book-open-variant"
                    clearable
                  ></v-select>
                </v-col>
                <v-col cols="12" md="4" class="pt-0" :class="{'pl-12 pr-12': $vuetify.breakpoint.mdAndUp}">
                  <v-text-field
                      id="messageIdInput"
                      class="pt-0 mt-0"
                      v-model="messageIDFilter"
                      label="Message ID"
                      prepend-inner-icon="mdi-pound"
                      clearable
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="4" class="pt-0">
                  <v-text-field
                      class="pt-0 mt-0"
                      v-model="studentIDFilter"
                      label="Student PEN"
                      prepend-inner-icon="mdi-account"
                      maxlength="9"
                      counter="9"
                      clearable
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row no-gutters class="justify-end mt-n2">
                <v-col cols="12" class="d-flex justify-end">
                  <PrimaryButton class="mr-3" id="search-clear" :secondary="true" @click.native="clearSearch"
                                 text="Clear"></PrimaryButton>
                  <PrimaryButton @click.native="filterRequests" :loading="loadingTable" :disabled="!searchEnabled" id="searchButton" text="Search"></PrimaryButton>
                </v-col>
              </v-row>
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
                  <v-row @click="openExchange(item.secureExchangeID)" style="cursor: pointer;">
                    <v-col cols="8" lg="7" xl="9" class="pb-0 pt-0">
                      <v-row class="mb-n4">
                        <v-col cols="12" class="pb-2 pt-2 pr-0">
                          <span class="subjectHeading" :style="{color: item.isReadByExchangeContact ? 'black': '#1f7cef'}">{{ getSubject(item.subject) }}</span><span style="color: gray"> - {{ getLatestComment(item) }}</span>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="12" class="pb-1 pr-0">
                          <span class="ministryLine" style="color: black">{{
                              getMinistryTeamName(item.ministryOwnershipTeamID)
                            }} - {{ item.createDate }}</span>
                        </v-col>
                      </v-row>
                    </v-col>
                    <v-col cols="4" lg="5" xl="3" style="text-align: end" class="pb-0 pt-0">
                      <v-row>
                        <v-col class="pb-1">
                          <v-icon class="pb-1" :color="getStatusColor(item.secureExchangeStatusCode)" right dark>
                            mdi-circle-medium
                          </v-icon>
                          <span class="statusCodeLabel">{{ item.secureExchangeStatusCode }}</span>
                          <v-icon style="margin-bottom: 0.15em" color="grey darken-3" right size="medium" dark>
                            mdi-pound
                          </v-icon>
                          <span class="statusCodeLabel">{{ item.sequenceNumber }}</span>
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
    <v-bottom-sheet
      v-model="newMessageSheet"
      inset
      no-click-animation
      scrollable
      persistent
    >
      <v-card
        v-if="newMessageSheet"
        class="information-window-v-card">
        <v-card-title class="sheetHeader pt-1 pb-1">New Message</v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <NewMessagePage
            :mincodeSchoolNames="mincodeSchoolNames"
            @secure-exchange:messageSent="messageSent"
            @secure-exchange:cancelMessage="newMessageSheet = false"
          >
          </NewMessagePage>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </v-container>
</template>

<script>

import ApiService from '../../common/apiService';
import {ApiRoutes} from '@/utils/constants';
import PrimaryButton from '../util/PrimaryButton';
import NewMessagePage from './NewMessagePage';
import {mapState} from 'vuex';
import {isEmpty, omitBy} from 'lodash';
import alertMixin from '@/mixins/alertMixin';

export default {
  name: 'ExchangeInbox',
  mixins: [alertMixin],
  components: {
    PrimaryButton,
    NewMessagePage
  },
  data() {
    return {
      newMessageSheet: false,
      statusSelectFilter: null,
      statusRadioGroup: 'statusFilterActive',
      statusRadioGroupEnabled: true,
      messageDateFilter: false,
      activeMessageDatePicker: null,
      messageDate: null,
      subjectFilter: '',
      filterText: 'More Filters',
      contactNameFilter: '',
      messageIDFilter:'',
      studentIDFilter: '',
      headers: [
        {
          text: 'Status',
          align: 'start',
          sortable: false,
          value: 'secureExchangeStatusCode',
        }
      ],
      selectedItem: 0,
      pageNumber: 1,
      pageSize: 15,
      totalRequests: 0,
      itemsPerPageOptions: [15],
      loadingTable: false,
      dateMenu: false,
      headerSearchParams: {
        sequenceNumber: '',
        contact: '',
        subject: '',
        createDate: [],
        secureExchangeStatusCode: ''
      },
      requests: [],
      isActiveMessagesTabEnabled: true,
    };
  },
  computed: {
    ...mapState('app', ['mincodeSchoolNames']),
    ...mapState('edx', ['statuses']),
    ...mapState('edx', ['ministryTeams']),
    secureExchangeStatusCodes() {
      return this.statuses;
    },
    searchEnabled(){
      return (this.subjectFilter !== '' && this.subjectFilter !== null) || (this.messageIDFilter !== '' && this.messageIDFilter !== null) || (this.studentIDFilter !== '' && this.studentIDFilter !== null) || this.messageDate !== null || (this.contactNameFilter !== '' && this.contactNameFilter !== null) || this.secureExchangeStatusCodes.some(item => item.secureExchangeStatusCode === this.statusSelectFilter);
    },
    ministryContactName() {
      return this.ministryTeams;
    },
    getSheetWidth(){
      switch (this.$vuetify.breakpoint.name) {
      case 'xs':
      case 'sm':
        return 60;
      default:
        return 30;
      }
    },
  },
  created() {
    this.$store.dispatch('edx/getExchangeStatusCodes');
    this.$store.dispatch('edx/getMinistryTeams');
    this.$store.dispatch('app/getMincodeSchoolNames');
    this.headerSearchParams.secureExchangeStatusCode = ['OPEN'];
    this.getExchanges();
  },
  methods: {
    openExchange(secureExchangeID){
      this.$router.push({name: 'viewExchange', params: {secureExchangeID: secureExchangeID}});
    },
    messageSent(){
      this.newMessageSheet = !this.newMessageSheet;
      this.getExchanges();
    },
    getMinistryTeamName(ministryOwnershipTeamId){
      return this.ministryTeams.find(item => item.ministryOwnershipTeamId === ministryOwnershipTeamId).teamName;
    },
    setFilterStatusAll() {
      this.headerSearchParams.secureExchangeStatusCode = ['OPEN', 'CLOSED'];
    },
    setFilterStatusActive() {
      this.headerSearchParams.secureExchangeStatusCode = ['OPEN'];
    },
    statusFilterActiveClicked() {
      this.setFilterStatusActive();
      this.resetPageNumber();
      this.getExchanges();
    },
    resetPageNumber(){
      this.pageNumber = 1;
    },
    clearSearch(runSearch = true){
      this.subjectFilter = '';
      this.messageDate = null;
      this.messageDateFilter = null;
      this.statusSelectFilter = '';
      this.contactNameFilter = '';
      this.messageIDFilter ='';
      this.studentIDFilter = '';
      if(runSearch){
        this.setFilterStatusAll();
        this.getExchanges();
      }
    },
    onExpansionPanelClick(event) {
      if (event.currentTarget.classList.contains('v-expansion-panel-header--active')) {
        this.filterText = 'More Filters';
        this.statusRadioGroupEnabled = true;
        this.statusRadioGroup = 'statusFilterActive';
        this.setFilterStatusActive();
        this.clearSearch(false);
        this.resetPageNumber();
        this.getExchanges();
      } else {
        this.setFilterStatusAll();
        this.statusRadioGroup = 'statusFilterAll';
        this.filterText = 'Less Filters';
        this.statusRadioGroupEnabled = false;
        this.resetPageNumber();
        this.clearSearch();
      }

    },
    saveMessageDate(date) {
      this.$refs.messageDateFilter.save(date);
    },
    getStatusColor(status) {
      if (status === 'Open') {
        return 'green';
      } else if (status === 'Closed') {
        return 'red';
      }
    },
    getSubject(subject) {
      if (subject.length > 16) {
        switch (this.$vuetify.breakpoint.name) {
        case 'xs':
        case 'sm':
          return this.getContentString(subject, 15);
        case 'md':
          return this.getContentString(subject, 20);
        case 'lg':
          return this.getContentString(subject, 30);
        default:
          return this.getContentString(subject, 40);
        }
      }
      return subject;
    },
    getContentString(content, length) {
      if (content.length > length) {
        return content.substring(0, length) + '...';
      }
      return content;
    },
    getLatestComment(item) {
      let content = item.commentsList.reduce((a, b) => (a.createDate > b.createDate ? a : b)).content;
      if (content.length > 25) {
        switch (this.$vuetify.breakpoint.name) {
        case 'xs':
        case 'sm':
          return this.getContentString(content, 30);
        case 'md':
          return this.getContentString(content, 40);
        case 'lg':
        case 'xl':
          return this.getContentString(content, 60);
        default:
          return content;
        }
      }
      return content;
    },
    getCompletedMessages() {
      this.headerSearchParams.secureExchangeStatusCode = ['CLOSED'];
      this.isActiveMessagesTabEnabled = false;
      this.getExchanges();
    },
    filterRequests(){
      this.setFilterStatusAll();
      this.resetPageNumber();
      this.getExchanges();
    },
    getExchanges() {
      this.loadingTable = true;
      this.requests = [];
      const sort = {
        createDate: 'DESC'
      };

      this.headerSearchParams.subject = this.subjectFilter;
      this.headerSearchParams.createDate = this.messageDate === null ? null : [this.messageDate];
      this.headerSearchParams.ministryOwnershipTeamID = this.contactNameFilter;
      this.headerSearchParams.sequenceNumber = this.messageIDFilter;
      this.headerSearchParams.studentPEN = this.studentIDFilter;
      if(this.statusSelectFilter !== null && this.statusSelectFilter !== '') {
        this.headerSearchParams.secureExchangeStatusCode = [this.statusSelectFilter];
      }

      ApiService.apiAxios.get(ApiRoutes.edx.EXCHANGE_URL, {
        params: {
          pageNumber: this.pageNumber - 1,
          pageSize: this.pageSize,
          sort,
          searchParams: omitBy(this.headerSearchParams, isEmpty),
        }
      }).then(response => {
        this.requests = response.data.content;
        if (this.isActiveMessagesTabEnabled) {
          this.totalRequests = response.data.totalElements;
        }
      }).catch(error => {
        console.error(error);
        this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get a list of Secure Exchanges. Please try again later.');
      }).finally(() => {
        this.loadingTable = false;
      });
    },
    getActiveMessages() {
      this.headerSearchParams.secureExchangeStatusCode = ['OPEN'];
      this.isActiveMessagesTabEnabled = true;
      this.getExchanges();
    }
  },
  watch: {
    pageSize() {
      this.getExchanges();
    },
    pageNumber() {
      this.getExchanges();
    }
  }
};
</script>

<style scoped>

.sheetHeader{
  background-color: #003366;
  color: white;
  font-size: medium !important;
  font-weight: bolder !important;
}

.tableRow {
  cursor: pointer;
}

.unread {
  font-weight: bold;
}

.v-data-table >>> .v-data-table__wrapper {
  overflow-x: hidden;
}

.filterButton.v-btn--outlined {
  border: thin solid #ebedef;
}

.v-radio >>> .v-icon {
  color: #003366;
}

.activeRadio {
  color: #003366;
}

.subjectHeading {
  font-size: large;
  cursor: pointer;
  font-weight: bold;
}

.ministryLine {
  color: black;
  font-size: medium;
}

.statusCodeLabel {
  font-size: large;
}

.v-dialog__content >>> .v-bottom-sheet {
  width: 30% !important;
}

.v-expansion-panel-header:not(.v-expansion-panel-header--mousedown):focus::before {
  display: none;
}

@media screen and (max-width: 801px){
  .subjectHeading {
    font-size: medium;
  }

  .statusCodeLabel{
    font-size: inherit;
  }

  .ministryLine{
    font-size: inherit;
  }
}
@media screen and (max-width: 950px){
  .v-dialog__content /deep/ .v-bottom-sheet {
    width: 60% !important;
  }
}

.containerSetup{
  padding-right: 32em !important;
  padding-left: 32em !important;
}

@media screen and (max-width: 1950px) {
  .containerSetup{
    padding-right: 20em !important;
    padding-left: 20em !important;
  }
}

@media screen and (max-width: 1200px) {
  .containerSetup{
    padding-right: 4em !important;
    padding-left: 4em !important;
  }
}

</style>
