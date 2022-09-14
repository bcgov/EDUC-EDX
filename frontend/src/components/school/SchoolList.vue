<template>
  <v-container class="containerSetup" fluid>
    <v-row style="background: rgb(235, 237, 239);border-radius: 8px;" class="px-3">
      <v-col cols="12" md="3" class="d-flex justify-start">
        <v-select id="name-text-field" label="School Code & Name" item-value="mincode" item-text="schoolCodeName"
                  :items="schoolSearchNames" v-model="schoolCodeNameFilter" clearable></v-select>
      </v-col>
      <v-col cols="12" md="2" class="d-flex justify-start">
        <v-select id="status-select-field" clearable :items="schoolStatus" v-model="schoolStatusFilter" item-text="name"
                  item-value="code" label="Status"></v-select>
      </v-col>
      <v-col cols="12" md="2" class="d-flex justify-start">
        <v-select id="status-select-field" clearable :items="schoolCategories" v-model="schoolCategoryFilter" item-text="name"
                  item-value="code" label="School Category"></v-select>
      </v-col>
      <v-col cols="12" md="3" class="d-flex justify-start">
        <v-select id="status-select-field" clearable :items="schoolFacilityTypes" v-model="schoolFacilityTypeFilter" item-text="name"
                  item-value="code" label="Facility Type"></v-select>
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
              <v-row @click="openSchool(item.schoolId)" style="cursor: pointer;">
                <v-col cols="12" lg="4" xl="5" class="pb-0 pt-0">
                  <v-row class="mb-n4">
                    <v-col cols="12" class="pb-2 pt-2 pr-0">
                      <span class="subjectHeading">{{ item.mincode }} - {{ item.displayName }}</span>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" class="pb-1 pr-0">
                      <span class="ministryLine" style="color: black">{{
                          item.schoolCategory
                        }} | {{ item.facilityType }}</span>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col cols="6" lg="5" xl="2" class="pb-0 pt-0 mt-2">
                  <v-row>
                    <v-col cols="8" class="pb-1 pr-0">
                      <v-icon class="pb-1" :color="getStatusColor(item.status)" right dark>
                        mdi-circle-medium
                      </v-icon>
                      <span class="statusCodeLabel">{{ item.status }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="8" class="pb-1 pr-0">
                      <v-icon class="mb-1" aria-hidden="false">
                        mdi-phone-outline
                      </v-icon>
                      <span class="statusCodeLabel"> {{ item.phoneNumber }}</span>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col cols="6" lg="5" xl="3" style="text-align: start" class="pb-0 pt-0 mt-2">
                  <v-row>
                    <v-col cols="12" class="pb-1 pr-0">
                      <v-icon class="mr-1" aria-hidden="false">
                        mdi-at
                      </v-icon>
                      <span class="statusCodeLabel">{{ item.email }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="12" class="pb-1 pr-0">
                      <v-icon class="mb-1 mr-1" aria-hidden="false">
                        mdi-account-outline
                      </v-icon>
                      <span class="statusCodeLabel" style="color: black">{{item.principalsName}}</span>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col lg="2" md="3" sm="4">
                  <v-row class="mb-2" no-gutters>
                    <v-col>
                      <v-btn id="schoolDetails"
                             color="#003366"
                             width="100%"
                             outlined
                             class="mt-0 pt-0 filterButton"
                      >
                        <v-icon color="#003366" style="margin-top: 0.07em" class="ml-n5 mr-1" right dark>mdi-newspaper-variant-outline</v-icon>
                        <span class="ml-1">School Details</span>
                      </v-btn>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col>
                      <v-btn id="schoolContacts"
                             color="#003366"
                             width="100%"
                             outlined
                             class="mt-0 pt-0 filterButton"
                      >
                        <v-icon color="#003366" style="margin-top: 0.07em" class="ml-n1 mr-1" right dark>mdi-account-multiple-outline</v-icon>
                        <span class="ml-1">School Contacts</span>
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
          </template>

          <template v-slot:no-data>There are no schools.</template>

        </v-data-table>
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
import alertMixin from '@/mixins/alertMixin';

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
      schoolCategories: [],
      schoolFacilityTypes: [],
      schoolCodeNameFilter: '',
      schoolStatusFilter: '',
      schoolCategoryFilter: '',
      schoolFacilityTypeFilter: '',
    };
  },
  computed: {
    ...mapState('app', ['schoolsMap']),

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

    this.setSchoolStatuses();
    this.setSchoolCategories();
    this.setSchoolFacilityTypes();
    this.getSchoolDropDownItems();
    this.getSchoolList();
    
  },
  methods: {
    setSchoolStatuses() {
      this.schoolStatus = [{name: 'Open', code: 'Open'}, {name: 'Opening', code: 'Opening'}, {name: 'Closing', code: 'Closing'}, {name: 'Closed', code: 'Closed'}];
    },
    setSchoolCategories() {
      this.schoolCategories = [{name: 'Public School', code:'PUBLIC'},{name: 'Independent School', code:'INDEPEND'},
        {name: 'Yukon School', code:'YUKON'},{name: 'Indigenous School', code:'FED_BAND'},{name: 'Offshore School', code:'OFFSHORE'}];
    },
    setSchoolFacilityTypes() {
      this.schoolFacilityTypes = [{name: 'Standard School', code:'STANDARD'},{name: 'Offshore School', code:'OFFSHORE'},{name: 'Distance Learning', code:'DIST_LEARN'}];
    },
    getSchoolDropDownItems(){
      ApiService.apiAxios.get(ApiRoutes.school.ALL_CACHE_SCHOOLS, {
        params: {}
      }).then(response => {
        let schoolList = response.data;
        for(const school of schoolList){
          let schoolItem = {
            schoolCodeName: school.mincode +' - '+school.schoolName,
            mincode: school.mincode,
          };
          this.schoolSearchNames.push(schoolItem);
        }
      }).catch(error => {
        //to do add the alert framework for error or success
        console.error(error);
      });
    },
    getSchoolList() {
      this.loadingTable = true;
      this.requests = [];
      this.schools = [];

      if(this.schoolCodeNameFilter !== null && this.schoolCodeNameFilter!== '') {
        this.headerSearchParams.schoolNumber = this.schoolCodeNameFilter.substring(3);
      }
      this.headerSearchParams.status = this.schoolStatusFilter;
      this.headerSearchParams.category = this.schoolCategoryFilter;
      this.headerSearchParams.type = this.schoolFacilityTypeFilter;

      ApiService.apiAxios.get(ApiRoutes.school.ALL_DIS_SCHOOLS, {
        params: {
          pageNumber: this.pageNumber - 1,
          pageSize: this.pageSize,
          sort: '',
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
      school.status = this.getSchoolStatus(school);
      school.facilityType = this.getFacilityType(school);
      school.schoolCategory = this.getSchoolCategory(school);
      //Populate school principal from contacts list
      school.principalsName = this.getPrincipalsName(school.contacts);

    },
    getFacilityType(school){
      let type = null;
      if(school.facilityTypeCode === 'STANDARD'){
        type = 'Standard School';
      } else if(school.facilityTypeCode === 'OFFSHORE'){
        type = 'Offshore School';
      } else if(school.facilityTypeCode === 'DIST_LEARN'){
        type = 'Distance Learning';
      }
      return type;
    },
    getSchoolCategory(school){
      let category = null;
      if(school.schoolCategoryCode === 'PUBLIC'){
        category = 'Public School';
      } else if(school.schoolCategoryCode === 'INDEPEND'){
        category = 'Independent School';
      } else if(school.schoolCategoryCode === 'YUKON'){
        category = 'Yukon School';
      } else if(school.schoolCategoryCode === 'FED_BAND'){
        category = 'Indigenous School';
      } else if(school.schoolCategoryCode === 'OFFSHORE'){
        category = 'Offshore School';
      }
      return category;
    },
    getPrincipalsName(contacts) {
      let principalsName = null;
      for (const contact of contacts){
        if(contact.schoolContactTypeCode === 'PRINCIPAL'){
          principalsName = contact.firstName + ' ' + contact.lastName;
        }
      }
      return principalsName;
    },
    getSchoolStatus(school) {
      const currentDate = new Date();
      let openedDate = school.openedDate;
      let closedDate = school.closedDate;
      let status = null;

      if (openedDate <= currentDate || closedDate === null || closedDate > currentDate) {
        status = 'Open';
      } else if (openedDate > currentDate) {
        status = 'Opening';
      } else if (closedDate > currentDate) {
        status = 'Closing';
      } else {
        status = 'Closed';
      }

      return status;
    },
    getStatusColor(status) {
      if (status === 'Open') {
        return 'green';
      } else if (status === 'Opening'){
        return 'blue';
      } else if (status === 'Closing'){
        return 'orange';
      } else if (status === 'Closed') {
        return 'red';
      }
    },
    openSchool(schoolId){
      console.log('OPEN_SCHOOL_ID:= ' + schoolId);
      this.$router.push({name: 'viewSchool', params: {schoolID: schoolId}});
    },
    resetPageNumber(){
      this.pageNumber = 1;
    },
    searchEnabled(){
      return (this.schoolCodeNameFilter !== '' && this.schoolCodeNameFilter !== null) || (this.schoolStatusFilter !== '' && this.schoolStatusFilter !== null)
          || (this.schoolCategoryFilter !== '' & this.schoolCategoryFilter !== null) || this.schoolFacilityTypeFilter !== '' && this.schoolFacilityTypeFilter !== null;
    },
    clearButtonClick() {
      this.schoolCodeNameFilter = '';
      this.schoolStatusFilter = '';
      this.schoolCategoryFilter = '';
      this.schoolFacilityTypeFilter = '';

      this.headerSearchParams.schoolNumber = '';
      this.headerSearchParams.status = '';
      this.headerSearchParams.category = '';
      this.headerSearchParams.type = '';

      this.getSchoolList();
    },
    searchButtonClick() {
      this.resetPageNumber();
      this.getSchoolList();
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
