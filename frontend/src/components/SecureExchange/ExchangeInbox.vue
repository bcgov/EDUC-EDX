<template>
  <v-container
    class="containerSetup"
    fluid
  >
    <v-row>
      <v-col>
        <v-row class="pt-0">
          <v-col class="mt-1 d-flex justify-start">
            <v-icon
              small
              color="#1976d2"
            >
              mdi-arrow-left
            </v-icon>
            <a
              class="ml-1"
              @click="backButtonClick"
            >Return to Dashboard</a>
          </v-col>
          <v-col class="d-flex justify-end">
            <PrimaryButton
              id="newMessageBtn"
              :icon-left="true"
              :large-icon="true"
              icon="mdi-plus"
              text="New Message"
              :click-action="openNewMessageSheet"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-expansion-panels
              flat
              style="border-radius: 6px"
            >
              <v-expansion-panel
                id="filtersToggle"
                style="background: #ebedef"
              >
                <v-expansion-panel-title
                  class="pt-0 pb-0"
                  disable-icon-rotate
                  @click="onExpansionPanelClick"
                >
                  <v-radio-group
                    v-model="statusRadioGroup"
                    color="#123262"
                    class="mt-4"
                    :disabled="!statusRadioGroupEnabled"
                    direction="horizontal"
                    inline
                  >
                    <v-radio
                      label="Active Only"
                      color="#123262"
                      value="statusFilterActive"
                      @click.stop.prevent="statusFilterActiveClicked"
                    >
                      <template #label>
                        <span :class="{ 'activeRadio' : statusRadioGroupEnabled }">Active Only</span>
                      </template>
                    </v-radio>
                    <v-radio
                      label="All"
                      color="#123262"
                      value="statusFilterAll"
                      @click="filterRequests"
                    >
                      <template #label>
                        <span :class="{ 'activeRadio' : statusRadioGroupEnabled }">All</span>
                      </template>
                    </v-radio>
                  </v-radio-group>
                  <template #actions="{ expanded }">
                    <v-btn
                      id="filterid"
                      title="filter"
                      variant="text"
                    >
                      <v-icon
                        color="#003366"
                        class="ml-n1"
                        :nudge-down="4"
                        right
                        dark
                        icon="mdi-filter-outline"
                      />
                      <span
                        v-if="$vuetify.display.mdAndUp"
                        style="color: #003366"
                        class="ml-1"
                      >{{ filterText }}</span>
                    </v-btn>
                  </template>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-row class="mt-2">
                    <v-col
                      cols="12"
                      md="4"
                      class="pt-0 px-7"
                    >
                      <v-select
                        id="contactNameSelect"
                        v-model="contactNameFilter"
                        label="Contact"
                        variant="underlined"
                        item-title="teamName"
                        item-value="ministryOwnershipTeamId"
                        :items="ministryContactName"
                        prepend-inner-icon="mdi-card-account-mail-outline"
                        :clearable="true"
                      >
                        <template #selection="{ item, index }">
                          <span id="contactNameLabel">{{ item.title }}</span>
                        </template>
                      </v-select>
                    </v-col>
                    <v-col
                      cols="12"
                      md="4"
                      class="pt-0 px-7"
                    >
                      <v-text-field
                        id="subjectInput"
                        v-model="subjectFilter"
                        class="pt-0 mt-0"
                        variant="underlined"
                        label="Subject"
                        prepend-inner-icon="mdi-book-open-variant"
                        :clearable="true"
                        @keyup.enter="filterRequests()"
                      />
                    </v-col>
                    <v-col
                      cols="12"
                      md="4"
                      :class="{'pt-0 px-7': $vuetify.display.mdAndUp}"
                    >
                      <DatePicker
                        id="messageDateTextField"
                        v-model="messageDate"
                        label="Message Date"
                        model-type="yyyy-MM-dd'T'00:00:00"
                        @keyup.enter="filterRequests()"
                      />
                    </v-col>
                    <v-col
                      cols="12"
                      md="4"
                      class="pt-0 px-7"
                    >
                      <v-select
                        id="statusSelector"
                        v-model="statusSelectFilter"
                        :items="secureExchangeStatusCodes"
                        label="Status"
                        variant="underlined"
                        :menu-props="{
                          closeOnClick: true,
                          closeOnContentClick: true,
                        }"
                      >
                        <template #prepend-inner>
                          <v-icon :color="getStatusColor(statusSelectFilter ? statusSelectFilter[0].label : '')">
                            mdi-circle-medium
                          </v-icon>
                        </template>
                        <template #selection="{ item, index }">
                          <span id="statusLabel">{{ item.value.label }}</span>
                        </template>

                        <template #item="{ item, index }">
                          <v-list-item @click="selectItem(item)">
                            <v-icon
                              :color="getStatusColor(item.value.label)"
                              icon="mdi-circle-medium"
                            />
                            <span>{{ item.raw.label }}</span>
                          </v-list-item>
                        </template>
                      </v-select>
                    </v-col>
                    <v-col
                      cols="12"
                      md="4"
                      :class="{'pt-0 px-7': $vuetify.display.mdAndUp}"
                    >
                      <v-text-field
                        id="messageIdInput"
                        v-model="messageIDFilter"
                        variant="underlined"
                        class="pt-0 mt-0"
                        label="Message ID"
                        prepend-inner-icon="mdi-pound"
                        :clearable="true"
                        @keyup.enter="filterRequests()"
                        @keypress="isNumber($event)"
                      />
                    </v-col>
                    <v-col
                      cols="12"
                      md="4"
                      class="pt-0 px-7"
                    >
                      <v-text-field
                        id="studentIDInput"
                        v-model="studentIDFilter"
                        variant="underlined"
                        label="Student PEN"
                        prepend-inner-icon="mdi-account"
                        maxlength="9"
                        counter="9"
                        :clearable="true"
                        @keyup.enter="filterRequests()"
                        @keypress="isNumber($event)"
                      />
                    </v-col>
                  </v-row>
                  <v-row
                    no-gutters
                    class="justify-end mt-n2"
                  >
                    <v-col
                      cols="12"
                      class="d-flex justify-end"
                    >
                      <PrimaryButton
                        id="search-clear"
                        class="mr-3"
                        :secondary="true"
                        :click-action="clearSearch"
                        text="Clear"
                      />
                      <PrimaryButton
                        id="searchButton"
                        :click-action="filterRequests"
                        :loading="loadingTable"
                        :disabled="!searchEnabled"
                        text="Search"
                      />
                    </v-col>
                  </v-row>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-col>
        </v-row>

        <Spinner
          v-if="loadingTable"
          flat
        />
        <v-row v-else>
          <v-col>
            <v-data-table-server
              v-model:items-per-page="pageSize"
              v-model:page="pageNumber"
              v-model:items="requests"
              v-model:items-length="totalRequests"
              :items-per-page-options="itemsPerPageOptions"
              :loading="loadingTable"
              class="elevation-1 rounded"
              hide-default-header
              mobile-breakpoint="0"
            >
              <template #no-data>
                <v-row no-gutters>
                  <v-col class="d-flex justify-center">
                    There are no messages.
                  </v-col>
                </v-row>
              </template>
              <template #item="{ item, index }">
                <v-row
                  class="hoverTable pl-3 pt-1 pb-1 pr-3"
                  no-gutters
                  @click="openExchange(item.raw.secureExchangeID)"
                >
                  <v-col
                    cols="8"
                    lg="7"
                    xl="9"
                    class="pb-0 pt-0"
                  >
                    <v-row
                      no-gutters
                      class="mb-n1"
                    >
                      <v-col
                        cols="12"
                        class="pb-2 pt-2 pr-0"
                      >
                        <span
                          class="subjectHeading"
                          :style="{color: item.raw.isReadByExchangeContact ? 'black': '#1f7cef'}"
                        >{{ getSubject(item.raw.subject) }}</span><span style="color: gray"> - {{ getLatestComment(item.raw) }}</span>
                        <v-icon
                          v-if="item?.raw?.documentList?.length > 0"
                          size="x-small"
                          class="mb-1"
                        >
                          mdi-paperclip
                        </v-icon>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col
                        cols="12"
                        class="pb-1 pr-0"
                      >
                        <span
                          class="ministryLine"
                          style="color: black"
                        >{{
                          getMinistryTeamName(item.raw.ministryOwnershipTeamID)
                        }} - {{ formatDate(item.raw.createDate) }}</span>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col
                    cols="4"
                    lg="5"
                    xl="3"
                    style="text-align: end"
                    class="pb-0 pt-0"
                  >
                    <v-row no-gutters>
                      <v-col class="pb-1 pt-2">
                        <v-icon
                          class="pb-1"
                          :color="getStatusColor(item.raw.secureExchangeStatusCode)"
                          right
                          dark
                        >
                          mdi-circle-medium
                        </v-icon>
                        <span class="statusCodeLabel">{{ item.raw.secureExchangeStatusCode }}</span>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col class="pb-1">
                        <v-icon
                          style="margin-bottom: 0.15em"
                          right
                          size="medium"
                          dark
                        >
                          mdi-pound
                        </v-icon>
                        <span class="statusCodeLabel">{{ item.raw.sequenceNumber }}</span>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
                <v-divider />
              </template>
            </v-data-table-server>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-bottom-sheet
      v-model="newMessageSheet"
      transition="no-click-animation"
      content-class="max-width-bottom-sheet"
      max-width="30%"
      persistent
    >
      <v-card
        v-if="newMessageSheet"
        class="information-window-v-card"
      >
        <v-card-title class="sheetHeader pt-1 pb-1">
          New Message
        </v-card-title>
        <v-divider />
        <v-card-text>
          <NewMessagePage    
            @secure-exchange:message-sent="messageSent"
            @secure-exchange:cancel-message="newMessageSheet = false"
          />
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </v-container>
</template>

<script>

import ApiService from '../../common/apiService';
import {ApiRoutes, EDX_SAGA_REQUEST_DELAY_MILLISECONDS} from '../../utils/constants';
import PrimaryButton from '../util/PrimaryButton.vue';
import NewMessagePage from './NewMessagePage.vue';
import { authStore } from '../../store/modules/auth';
import { edxStore } from '../../store/modules/edx';
import { mapState } from 'pinia';
import {isEmpty, omitBy} from 'lodash';
import alertMixin from '../../mixins/alertMixin';
import {appStore} from '../../store/modules/app';
import {isNumber} from '../../utils/institute/formInput';
import Spinner from '../common/Spinner.vue';
import DatePicker from '../util/DatePicker.vue';
import {formatDate} from '../../utils/format';

export default {
  name: 'ExchangeInbox',
  components: {
    DatePicker,
    Spinner,
    PrimaryButton,
    NewMessagePage
  },
  mixins: [alertMixin],
  data() {
    return {
      newMessageSheet: false,
      statusSelectFilter: null,
      statusRadioGroup: 'statusFilterActive',
      statusRadioGroupEnabled: true,
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
      itemsPerPageOptions: [
        {value: 15, title: '15'},
        {value: 25, title: '25'},
        {value: 50, title: '50'}
      ],
      loadingTable: false,
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
    ...mapState(edxStore, ['statuses','ministryTeams']),
    ...mapState(authStore, ['userInfo']),
    secureExchangeStatusCodes() {
      return this.statuses;
    },
    searchEnabled(){
      return (this.subjectFilter !== '' && this.subjectFilter !== null) || (this.messageIDFilter !== '' && this.messageIDFilter !== null) || (this.studentIDFilter !== '' && this.studentIDFilter !== null) || this.messageDate !== null || (this.contactNameFilter !== '' && this.contactNameFilter !== null) || (this.statusSelectFilter !== '' && this.statusSelectFilter !== null);
    },
    ministryContactName() {
      return this.ministryTeams;
    },
    getSheetWidth(){
      switch (this.$vuetify.display.name) {
      case 'xs':
      case 'sm':
        return 60;
      default:
        return 30;
      }
    },
  },
  watch: {
    pageSize() {
      this.getExchanges();
    },
    pageNumber() {
      this.getExchanges();
    }
  },
  created() {
    edxStore().getExchangeStatusCodes();
    edxStore().getMinistryTeams();
    appStore().getInstitutesData();
    this.headerSearchParams.secureExchangeStatusCode = ['OPEN'];
    this.getExchanges();
  },
  methods: {
    formatDate,
    selectItem(item){
      this.statusSelectFilter = [];
      this.statusSelectFilter.push(item.raw);
    },
    openExchange(secureExchangeID){
      this.$router.push({name: 'viewExchange', params: {secureExchangeID: secureExchangeID}});
    },
    messageSent(){
      this.newMessageSheet = !this.newMessageSheet;
      setTimeout(this.getExchanges, EDX_SAGA_REQUEST_DELAY_MILLISECONDS);
    },
    getMinistryTeamName(ministryOwnershipTeamId){
      return this.ministryTeams.find(item => item.ministryOwnershipTeamId === ministryOwnershipTeamId)?.teamName;
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
      this.subjectFilter = null;
      this.messageDate = null;
      this.statusSelectFilter = null;
      this.contactNameFilter = null;
      this.messageIDFilter =null;
      this.studentIDFilter = null;
      if(runSearch){
        this.setFilterStatusAll();
        this.getExchanges();
      }
    },
    onExpansionPanelClick() {
      if (this.filterText !== 'More Filters') {
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
    getStatusColor(status) {
      if (status === 'Open') {
        return 'green';
      } else if (status === 'Closed') {
        return 'red';
      }
    },
    getSubject(subject) {
      if (subject.length > 16) {
        switch (this.$vuetify.display.name) {
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
        switch (this.$vuetify.display.name) {
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
    isNumber,
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
    backButtonClick() {
      this.$router.push({name: 'home'});
    },
    openNewMessageSheet(){
      this.newMessageSheet = !this.newMessageSheet;
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
        this.headerSearchParams.secureExchangeStatusCode = [this.statusSelectFilter[0].secureExchangeStatusCode];
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

.activeRadio {
  color: #123262;
}


.subjectHeading {
  font-size: large;
  cursor: pointer;
  font-weight: bold;
}

.hoverTable:hover{
  background-color: #e8e8e8;
  cursor: pointer;
}

.ministryLine {
  color: black;
  font-size: medium;
}

.statusCodeLabel {
  font-size: large;
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
