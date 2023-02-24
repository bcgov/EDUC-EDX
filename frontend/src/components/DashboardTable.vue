<template>
  <v-row class="d-flex justify-center">
    <v-col md="5" sm="10">
      <v-row no-gutters>
        <v-col cols="6">
          <v-card id="secureMessageInboxCard" class="mt-0 mb-5" width="22em"  outlined rounded @click="redirectToInbox()">
            <v-row class="pl-4">
              <v-col cols="4">
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
              <v-col class="mt-2">
                <v-row no-gutters>
                  <v-col>
                    <h4 class="dashboard-title">{{ title }}</h4>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col>
                    <span>{{exchangeCount}} messages, {{unreadExchangeCount}} unread</span>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
        <v-col v-if="isLoggedInDistrictUser && isDistrictActive" cols="6">
          <v-card id="districtDetailsCard" width="22em"  class="mt-0 mb-5" outlined rounded @click="redirectToDistrictDetails()">
            <v-row class="pl-4">
              <v-col cols="4">
                <div>
                  <v-icon aria-hidden="false" color="rgb(0, 51, 102)" size="100">
                    mdi-domain
                  </v-icon>
                </div>
              </v-col>
              <v-col class="mt-2">
                <v-row no-gutters>
                  <v-col>
                    <h4 class="dashboard-title">{{ PAGE_TITLES.DISTRICT_DETAILS }}</h4>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col>
                    <span>Last updated:</span>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col>
                    <span>{{districtLastUpdateDate}}</span>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
        <v-col v-if="isLoggedInDistrictUser && isDistrictActive" cols="6">
          <v-card id="districtContactsCard" width="22em"  class="mt-0 mb-5" outlined rounded @click="redirectToDistrictContacts()">
            <v-row class="pl-4">
              <v-col cols="4">
                <div>
                  <v-icon aria-hidden="false" color="rgb(0, 51, 102)" size="100">
                    mdi-account-multiple-outline
                  </v-icon>
                </div>
              </v-col>
              <v-col class="mt-2">
                <v-row no-gutters>
                  <v-col>
                    <h4 class="dashboard-title">{{ PAGE_TITLES.DISTRICT_CONTACTS }}</h4>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col>
                    <span>Last updated:</span>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col>
                    <span>{{districtContactsLastUpdateDate}}</span>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
        <v-col v-if="isLoggedInSchoolUser && isSchoolActive" cols="6">
          <v-card id="schoolContactsCard" class="mt-0 mb-5" width="22em" outlined rounded @click="redirectToSchoolContacts()">
            <v-row class="pl-4">
              <v-col cols="4">
                <div>
                  <v-icon aria-hidden="false" color="rgb(0, 51, 102)" size="100">
                    mdi-account-multiple-outline
                  </v-icon>
                </div>
              </v-col>
              <v-col class="mt-2">
                <v-row no-gutters>
                  <v-col>
                    <h4 class="dashboard-title">{{ PAGE_TITLES.SCHOOL_CONTACTS }}</h4>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col>
                    <span>Last updated:</span>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col>
                    <span>{{schoolContactsLastUpdateDate}}</span>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
        <v-col v-if="isLoggedInDistrictUser && isDistrictActive" cols="6">
          <v-card width="22em" id="districtUserSchoolContactsCard" class="mt-0 mb-5" outlined rounded @click="redirectToSchools()">
            <v-row class="pl-4">
              <v-col cols="4">
                <div>
                  <v-icon aria-hidden="false" color="rgb(0, 51, 102)" size="100">
                    mdi-library
                  </v-icon>
                </div>
              </v-col>
              <v-col class="mt-2">
                <v-row no-gutters>
                  <v-col>
                    <h4 class="dashboard-title">{{ PAGE_TITLES.SCHOOLS }}</h4>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col>
                    <span>Last updated:</span>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col>
                    <span>{{schoolsLastUpdateDate}}</span>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
        <v-col v-if="isLoggedInSchoolUser && isSchoolActive" cols="6">
          <v-card id="schoolDetailsCard" class="mt-0 mb-5" width="22em" outlined rounded @click="redirectToSchoolDetails()">
            <v-row class="pl-4">
              <v-col cols="4">
                <div>
                  <v-icon aria-hidden="false" color="rgb(0, 51, 102)" size="100">
                    mdi-domain
                  </v-icon>
                </div>
              </v-col>
              <v-col class="mt-2">
                <v-row no-gutters>
                  <v-col>
                    <h4 class="dashboard-title">{{ PAGE_TITLES.SCHOOL_DETAILS }}</h4>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col>
                    <span>Last updated:</span>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col>
                    <span>{{schoolLastUpdateDate}}</span>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-col>

  </v-row>
</template>
<script>
import omit from 'lodash/omit';
import ApiService from '../common/apiService';
import {ApiRoutes, PAGE_TITLES} from '../utils/constants';
import router from '../router';
import { authStore } from '../store/modules/auth';
import { appStore } from '../store/modules/app';
import { mapState } from 'pinia';
import alertMixin from '../mixins/alertMixin';
import {formatDateTime} from '../utils/format';
import {isEmpty, omitBy} from 'lodash';
import {DateTimeFormatter, LocalDate} from '@js-joda/core';

export default {
  name: 'DashboardTable.vue',
  mixins: [alertMixin],
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
      schoolsLastUpdateDate: '',
      districtLastUpdateDate: '',
      schoolContactsLastUpdateDate: '',
      districtContactsLastUpdateDate: '',
      schoolLastUpdateDate: '',
      activeUserSchools: [],
      activeUserDistricts:[],
      headerSearchParams: {
        sequenceNumber: '',
        contact: '',
        subject: '',
        createDate: [],
        secureExchangeStatusCode: ''
      },
      PAGE_TITLES: PAGE_TITLES
    };
  },
  computed: {
    ...mapState(appStore, ['activeSchoolsMap','activeDistrictsMap']),
    ...mapState(authStore, ['isAuthenticated','userInfo']),
    dataReady: function () {
      return this.userInfo;
    },
    isLoggedInDistrictUser(){
      return this.userInfo.activeInstituteType === 'DISTRICT';
    },
    isLoggedInSchoolUser(){
      return this.userInfo.activeInstituteType === 'SCHOOL';
    },
  },
  created() {
    this.getExchangesCount();

    if(this.isLoggedInSchoolUser) {
      this.getSchoolContactsLastUpdate();
      this.getSchoolLastUpdateDate();
      this.isSchoolActive();
    }
    if(this.isLoggedInDistrictUser){
      this.getDistrictsLastUpdateDate();
      this.getDistrictSchoolsLastUpdateDate();
      this.getDistrictContactsLastUpdate();
      this.isDistrictActive();
    }
  },
  methods: {
    omit(object, key) {
      return omit(object, key);
    },
    getExchangesCount() {
      this.loadingTable = true;
      this.requests = [];

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
        console.error(error);
        this.setFailureAlert(error.response?.data?.message || error.message);
      }).finally(() => {
        this.loadingTable = false;
      });
    },
    redirectToInbox(){
      router.push('/inbox');
    },
    getDistrictsLastUpdateDate() {
      this.loading = true;

      ApiService.apiAxios.get(ApiRoutes.district.BASE_URL + '/' + this.userInfo.activeInstituteIdentifier, {
      }).then(response => {
        this.districtLastUpdateDate = this.formatDate(response.data.updateDate.substring(0,19));
      }).catch(error => {
        console.error(error);
      }).finally(() => {
        this.loading = false;
      });
    },
    formatDate(dateTime) {
      return formatDateTime(dateTime,'uuuu-MM-dd\'T\'HH:mm:ss','uuuu/MM/dd', true);
    },
    getDistrictSchoolsLastUpdateDate() {
      this.loadingTable = true;
      this.schools = [];
      let searchParams = {};

      searchParams.districtID = this.userInfo.activeInstituteIdentifier;

      ApiService.apiAxios.get(ApiRoutes.school.ALL_SCHOOLS_BY_CRIT, {
        params: {
          pageNumber: 0,
          pageSize: 1,
          sort: {
            updateDate: 'DESC'
          },
          searchParams: omitBy(searchParams, isEmpty),
        }
      }).then(response => {
        this.schoolsLastUpdateDate = this.formatDate(response.data.content[0].updateDate.substring(0,19));
      }).catch(error => {
        console.error(error);
      }).finally(() => {
        this.loadingTable = false;
      });
    },
    getSchoolLastUpdateDate() {
      this.loading = true;

      ApiService.apiAxios.get(ApiRoutes.school.SCHOOL_DETAILS_BY_ID + '/' + this.userInfo.activeInstituteIdentifier, {
      }).then(response => {
        this.schoolLastUpdateDate = this.formatDate(response.data.updateDate.substring(0,19));
      }).catch(error => {
        console.error(error);
      }).finally(() => {
        this.loading = false;
      });
    },
    redirectToSchools(){
      router.push('/schools');
    },
    redirectToDistrictDetails(){
      router.push('/districtDetails/' + this.userInfo.activeInstituteIdentifier);
    },
    getSchoolContactsLastUpdate(){
      if(this.userInfo.activeInstituteType === 'SCHOOL') {
        ApiService.apiAxios.get(ApiRoutes.school.SCHOOL_DETAILS_BY_ID + `/${this.userInfo.activeInstituteIdentifier}`).then(response => {

          for (const contact of response.data.contacts) {
            let rawDate = contact.updateDate === null ? contact.effectiveDate : contact.updateDate;
            let thisContactLastUpdated = new LocalDate.parse(rawDate.substring(0,19), DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss'));

            if (thisContactLastUpdated !== null && this.schoolContactsLastUpdateDate) {
              if (thisContactLastUpdated > this.schoolContactsLastUpdateDate) {
                this.schoolContactsLastUpdateDate = thisContactLastUpdated;
              }
            }
          }
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loadingTable = false;
        });
      }
    },
    getDistrictContactsLastUpdate(){
      if(this.userInfo.activeInstituteType === 'DISTRICT') {
        ApiService.apiAxios.get(ApiRoutes.district.BASE_URL + '/' + this.userInfo.activeInstituteIdentifier).then(response => {

          for (const contact of response.data.contacts) {
            let rawDate = contact.updateDate === null ? contact.effectiveDate : contact.updateDate;
            let thisContactLastUpdated = new LocalDate.parse(rawDate.substring(0,19), DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss'));

            if (thisContactLastUpdated !== null) {
              if (thisContactLastUpdated > this.districtContactsLastUpdateDate) {
                this.districtContactsLastUpdateDate = thisContactLastUpdated;
              }
            }
          }
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loadingTable = false;
        });
      }
    },
    redirectToSchoolContacts(){
      router.push({name: 'schoolContacts', params: {schoolID: this.userInfo.activeInstituteIdentifier}});
    },
    redirectToSchoolDetails() {
      this.$router.push({name: 'schoolDetails', params: {schoolID: this.userInfo.activeInstituteIdentifier}});
    },
    redirectToDistrictContacts(){
      router.push({name: 'districtContacts', params: {districtID: this.userInfo.activeInstituteIdentifier}});
    },
    isSchoolActive(){
      appStore().getInstitutesData().finally(() => {
        this.isTableLoading = false;
        const schoolsMap = this.activeSchoolsMap;
        this.activeUserSchools = this.userInfo?.userSchoolIDs?.map(function (value) {
          return {
            'mincode': schoolsMap.get(value)?.mincode,
            'schoolID': value
          };
        });
      });
      return this.activeUserSchools.length > 0;
    },
    isDistrictActive(){
      appStore().getInstitutesData().finally(() => {
        this.isTableLoading = false;
        const districtMap = this.activeDistrictsMap;
        this.activeUserDistricts = this.userInfo?.userDistrictIDs?.map(function (value) {
          return {
            'districtNumber': districtMap.get(value)?.districtNumber,
            'districtID': value
          };
        });
      });
      return this.activeUserDistricts.length > 0;
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
  font-size: 20px;
}
</style>

