<template>
  <v-container class="containerSetup" fluid>
    <Spinner flat v-if="loadingSchools"/>
    <div v-else>
      <v-row>
      <v-col class="mt-1 d-flex justify-start">
        <v-icon small color="#1976d2">mdi-arrow-left</v-icon>
        <a class="ml-1" @click="backButtonClick">Return to Dashboard</a>
      </v-col>
      </v-row>
      <v-row style="background: rgb(235, 237, 239);border-radius: 8px;" class="px-3">
        <v-col cols="12" md="5" class="d-flex justify-start">
          <v-autocomplete
            id="name-text-field"
            label="School Code & Name"
            item-value="schoolID"
            item-text="schoolCodeName"
            :items="schoolSearchNames"
            v-model="schoolCodeNameFilter"
            clearable>
          </v-autocomplete>
        </v-col>
        <v-col cols="12" md="2" class="d-flex justify-start">
          <v-select id="status-select-field" clearable :items="schoolStatus" v-model="schoolStatusFilter" item-text="name"
                    item-value="code" label="Status"></v-select>
        </v-col>
        <v-col cols="12" md="3" class="d-flex justify-start">
          <v-select
            id="status-select-field"
            clearable
            :items="schoolFacilityTypes"
            v-model="schoolFacilityTypeFilter"
            item-text="label"
            item-value="facilityTypeCode" label="Facility Type"></v-select>
        </v-col>
        <v-col cols="12" md="2" class="mt-6  d-flex justify-end">
          <PrimaryButton id="user-search-button" text="Clear" secondary @click.native="clearButtonClick"/>
          <PrimaryButton class="ml-3" width="8em" id="user-clear-button" text="Search" @click.native="searchButtonClick"
                         :disabled="!searchEnabled()"/>
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
              :items="schools"
              :loading="loadingTable"
              :server-items-length="totalSchools"
              class="elevation-1"
              hide-default-header
              mobile-breakpoint="0"
          >

            <template v-slot:item.secureExchangeStatusCode="{ item }">
              <v-row style="cursor: pointer;" @click="openSchool(item.schoolId)">
                <v-col class="pb-0 pt-0">
                  <v-row class="mb-n4">
                    <v-col cols="6">
                      <span class="subjectHeading">{{ item.mincode }} - {{ item.displayName }}</span>
                    </v-col>
                    <v-col cols="2" class="ml-n8">
                      <v-icon class="ml-0 mb-1" :color="getStatusColorAuthorityOrSchool(item.status)" right dark>
                        mdi-circle-medium
                      </v-icon>
                      <span class="statusCodeLabel">{{ item.status }}</span>
                    </v-col>
                    <v-col class="d-flex ml-n8">
                      <v-icon class="mb-3 mr-1" aria-hidden="false">
                        mdi-account-outline
                      </v-icon>
                      <span class="statusCodeLabel" style="color: black">{{item.principalsName}}</span>
                    </v-col>
                    <v-col class="d-flex justify-end" cols="1">
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn id="schoolContacts"
                                 color="#003366"
                                 outlined
                                 @click.native.stop="openSchoolContacts(item.schoolId)"
                                 class="mt-0 pt-0 filterButton"
                                 style="text-transform: initial"
                                 v-on="on"
                          >
                            <v-icon color="#003366" style="margin-top: 0.07em" dark>mdi-account-multiple-outline</v-icon>
                          </v-btn>
                        </template>
                        <span>View Contacts</span>
                      </v-tooltip>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="6" class="mt-n4">
                      <span class="ministryLine mt-n5" style="color: black">{{
                          item.schoolCategory
                        }} | {{ item.facilityType }}</span>
                    </v-col>
                    <v-col cols="2" class="mt-n2 ml-n8">
                      <v-icon class="mb-1" aria-hidden="false">
                        mdi-phone-outline
                      </v-icon>
                      <span class="statusCodeLabel">{{ formatPhoneNumber(item.phoneNumber) }}</span>
                    </v-col>
                    <v-col cols="4" class="d-flex mt-n2 ml-n8">
                      <v-icon class="ml-0 mr-1 mb-1" aria-hidden="false">
                        mdi-at
                      </v-icon>
                      <span class="statusCodeLabel centerSpan">{{ item.email }}</span>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </template>

            <template v-slot:no-data>There are no schools.</template>

          </v-data-table>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>

import ApiService from '../../common/apiService';
import {ApiRoutes} from '@/utils/constants';
import PrimaryButton from '../util/PrimaryButton';
import {mapGetters, mapState} from 'vuex';
import {isEmpty, omitBy} from 'lodash';
import alertMixin from '@/mixins/alertMixin';
import {formatPhoneNumber} from '@/utils/format';
import {getStatusColorAuthorityOrSchool,getStatusAuthorityOrSchool} from '@/utils/institute/status';

export default {
  name: 'SchoolListPage',
  mixins: [alertMixin],
  components: {
    PrimaryButton,
  },
  data() {
    return {
      statusSelectFilter: null,
      statusRadioGroup: 'statusFilterActive',
      statusRadioGroupEnabled: true,
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
      totalSchools: 0,
      itemsPerPageOptions: [15],
      loadingTable: false,
      dateMenu: false,
      headerSearchParams: {
        schoolNumber: '',
        status: '',
        category: '',
        type: ''
      },
      requests: [],
      isActiveMessagesTabEnabled: true,
      schools: [],
      schoolSearchNames: [],
      schoolStatus: [],
      schoolCodeNameFilter: '',
      schoolStatusFilter: '',
      schoolFacilityTypes: [],
      schoolCategoryTypes: [],
      schoolFacilityTypeFilter: '',
      loadingSchools: true,
    };
  },
  computed: {
    ...mapGetters('auth', ['userInfo']),
    ...mapState('app', ['schoolsMap']),
    ...mapState('institute', ['facilityTypeCodes']),
    ...mapState('institute', ['schoolCategoryTypeCodes']),

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
    this.$store.dispatch('edx/getMinistryTeams');
    this.$store.dispatch('app/getInstitutesData');
    this.$store.dispatch('institute/getFacilityTypeCodes').then(() => {
      this.schoolFacilityTypes = this.facilityTypeCodes;
    });
    this.$store.dispatch('institute/getSchoolCategoryTypeCodes').then(() => {
      this.schoolCategoryTypes = this.schoolCategoryTypeCodes;
    });

    this.setSchoolStatuses();
    this.getSchoolDropDownItems();
    this.getSchoolList();
  },
  methods: {
    setSchoolStatuses() {
      this.schoolStatus = [{name: 'Open', code: 'Open'}, {name: 'Opening', code: 'Opening'}, {name: 'Closing', code: 'Closing'}];
    },
    getSchoolDropDownItems(){
      this.loadingSchools = true;
      this.headerSearchParams.status = 'NotClosed';
      this.headerSearchParams.districtID = this.userInfo.activeInstituteIdentifier;
      this.headerSearchParams.pubEarlyLearning = 'true';
      ApiService.apiAxios.get(ApiRoutes.school.ALL_SCHOOLS_BY_CRIT, {
        params: {
          pageNumber: 0,
          pageSize: 5000,
          sort: {
            schoolNumber: 'ASC'
          },
          searchParams: omitBy(this.headerSearchParams, isEmpty),
        }
      }).then(response => {
        let schoolList = response.data.content;
        for(const school of schoolList){
          let schoolItem = {
            schoolCodeName: school.mincode +' - '+school.displayName,
            schoolID: school.schoolId,
          };
          this.schoolSearchNames.push(schoolItem);
        }
      }).catch(error => {
        console.error(error);
      }).finally(() => {
        this.loadingSchools = false;
      });
    },
    getSchoolList() {
      this.loadingTable = true;
      this.requests = [];
      this.schools = [];

      if(this.schoolCodeNameFilter !== null && this.schoolCodeNameFilter!== '') {
        this.headerSearchParams.schoolID = this.schoolCodeNameFilter;
      }else{
        this.headerSearchParams.schoolID = '';
      }

      if(!this.schoolStatusFilter){
        this.headerSearchParams.status = 'NotClosed';
      }else{
        this.headerSearchParams.status = this.schoolStatusFilter;
      }

      this.headerSearchParams.type = this.schoolFacilityTypeFilter;
      this.headerSearchParams.districtID = this.userInfo.activeInstituteIdentifier;

      ApiService.apiAxios.get(ApiRoutes.school.ALL_SCHOOLS_BY_CRIT, {
        params: {
          pageNumber: this.pageNumber - 1,
          pageSize: this.pageSize,
          sort: {
            schoolNumber: 'ASC'
          },
          searchParams: omitBy(this.headerSearchParams, isEmpty),
        }
      }).then(response => {
        let schoolList = response.data.content;
        for(const school of schoolList){
          this.populateExtraSchoolFields(school);
          this.schools.push(school);
        }
        this.totalSchools = response.data.totalElements;

      }).catch(error => {
        //to do add the alert framework for error or success
        console.error(error);
      }).finally(() => {
        this.loadingTable = false;
      });

    },
    populateExtraSchoolFields(school){
      school.status = getStatusAuthorityOrSchool(school);
      school.facilityType = this.getFacilityType(school);
      school.schoolCategory = this.getSchoolCategory(school);
      //Populate school principal from contacts list
      school.principalsName = this.getPrincipalsName(school.contacts);

    },
    getFacilityType(school){
      return this.schoolFacilityTypes.find((facility) => facility.facilityTypeCode === school.facilityTypeCode).label;
    },
    getSchoolCategory(school){
      return this.schoolCategoryTypeCodes.find((category) => category.schoolCategoryCode === school.schoolCategoryCode).label;
    },
    formatPhoneNumber,
    getPrincipalsName(contacts) {
      let principalsName = null;
      for (const contact of contacts){
        if(contact.schoolContactTypeCode === 'PRINCIPAL'){
          principalsName = contact.firstName + ' ' + contact.lastName;
        }
      }
      return principalsName;
    },
    getStatusColorAuthorityOrSchool,
    openSchool(schoolId){
      this.$router.push({name: 'schoolDetails', params: {schoolID: schoolId}});
    },
    openSchoolContacts(schoolId){
      this.$router.push({name: 'schoolContacts', params: {schoolID: schoolId}});
    },
    resetPageNumber(){
      this.pageNumber = 1;
    },
    searchEnabled(){
      return (this.schoolCodeNameFilter !== '' && this.schoolCodeNameFilter !== null) || (this.schoolStatusFilter !== '' && this.schoolStatusFilter !== null)
          || this.schoolFacilityTypeFilter !== '' && this.schoolFacilityTypeFilter !== null;
    },
    clearButtonClick() {
      this.schoolCodeNameFilter = '';
      this.schoolStatusFilter = '';
      this.schoolFacilityTypeFilter = '';

      this.headerSearchParams.schoolNumber = '';
      this.headerSearchParams.status = '';
      this.headerSearchParams.type = '';

      this.getSchoolList();
    },
    searchButtonClick() {
      this.resetPageNumber();
      this.getSchoolList();
    },
    backButtonClick() {
      this.$router.push({name: 'home'});
    },
  },
  watch: {
    pageSize() {
      this.getSchoolList();
    },
    pageNumber() {
      this.getSchoolList();
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
  border: thin solid #003366 !important;
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

.centerSpan {
  display: inline-flex;
  align-items: center;
}

.v-expansion-panel-header:not(.v-expansion-panel-header--mousedown):focus::before {
  display: none;
}

.filterButton.v-btn--outlined {
  border: thin solid #ebedef;
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
  padding-right: 24em !important;
  padding-left: 24em !important;
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
