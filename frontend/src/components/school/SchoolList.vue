<template>
  <v-container
    class="containerSetup"
    :fluid="true"
  >
    <Spinner
      v-if="loadingTable"
      flat
    />
    <div v-else>
      <v-row>
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
      </v-row>
      <v-row
        class="px-3 py-0 align-center searchBox"
      >
        <v-col
          cols="12"
          md="4"
          lg="4"
          class="d-flex justify-start pb-0 pt-1"
        >
          <v-autocomplete
            id="name-text-field"
            v-model="schoolCodeNameFilter"
            label="School Code & Name"
            variant="underlined"
            item-value="schoolID"
            item-title="schoolCodeName"
            :items="schoolSearchNames"
            :clearable="true"
            @update:model-value="searchButtonClick"
          >
            <template #prepend-inner>
              <v-icon
                v-if="schoolCodeNameFilter"
                :color="getStatusColor(schoolSearchNames.find(item=>item.schoolID===schoolCodeNameFilter)?.status)"
              >
                mdi-circle-medium
              </v-icon>
            </template>
            <template #item="{ props, item }">
              <v-list-item
                v-bind="props"
                prepend-icon="mdi-circle-medium"
                :base-color="getStatusColor(item.raw.status)"
                title=""
              >
                <v-list-item-title style="color: black !important;">
                  {{
                    item.title
                  }}
                </v-list-item-title>
              </v-list-item>
            </template>
          </v-autocomplete>
        </v-col>
        <v-col
          cols="12"
          md="2"
          class="d-flex justify-start pb-0 pt-1"
        >
          <v-select
            id="status-select-field"
            v-model="schoolStatusFilter"
            :clearable="true"
            :items="schoolStatus"
            item-title="name"
            item-value="code"
            label="Status"
            variant="underlined"
            :menu-props="{
              closeOnClick: true,
              closeOnContentClick: true,
            }"
            @update:model-value="searchButtonClick"
          >
            <template #prepend-inner>
              <v-icon
                v-if="schoolStatusFilter"
                :color="getStatusColor(schoolStatusFilter[0].code)"
              >
                mdi-circle-medium
              </v-icon>
            </template>
            <template #selection="{ item, index }">
              {{ item.title }}
            </template>

            <template #item="{ item, index }">
              <v-list-item @click="selectItem(item)">
                <v-icon
                  :color="getStatusColor(item.title)"
                  icon="mdi-circle-medium"
                />
                <span>{{ item.title }}</span>
              </v-list-item>
            </template>
          </v-select>
        </v-col>
        <v-col
          cols="12"
          md="3"
          class="d-flex justify-start pb-0 pt-1"
        >
          <v-select
            id="status-select-field"
            v-model="schoolFacilityTypeFilter"
            :clearable="true"
            variant="underlined"
            :items="schoolActiveFacilityTypes"
            item-title="label"
            item-value="facilityTypeCode"
            label="Facility Type"
            @update:model-value="searchButtonClick"
          />
        </v-col>
        <v-col
          cols="12"
          md="3"
          class="d-flex justify-end"
        >
          <PrimaryButton
            id="user-search-button"
            text="Clear"
            secondary
            :click-action="clearButtonClick"
          />
          <PrimaryButton
            id="user-clear-button"
            class="ml-3"
            width="8em"
            text="Search"
            :click-action="searchButtonClick"
            :disabled="!searchEnabled()"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col class="pb-0 pr-0 pl-0">
          <v-data-table-server
            id="schoolListTable"
            v-model:items-per-page="pageSize"
            v-model:page="pageNumber"
            v-model:items="schools"
            v-model:items-length="totalSchools"
            :footer-props="{
              'items-per-page-options': itemsPerPageOptions
            }"
            :loading="loadingTable"
            class="elevation-1 rounded"
            hide-default-header
            mobile-breakpoint="0"
          >
            <template #headers />
            <template #no-data>
              <v-row no-gutters>
                <v-col class="d-flex justify-center">
                  There are no schools.
                </v-col>
              </v-row>
            </template>
            <template #item="{ item, index }">
              <v-row
                no-gutters
                class="hoverTable pt-1"
                @click="openSchool(item.schoolId)"
              >
                <v-col class="pb-0 pt-0 ml-2 mt-1 mb-1">
                  <v-row
                    no-gutters
                    class="mb-n1"
                  >
                    <v-col cols="6">
                      <span class="subjectHeading">{{ item.mincode }} - {{ item.displayName }}</span>
                    </v-col>
                    <v-col
                      cols="2"
                    >
                      <v-icon
                        class="ml-0 mb-1"
                        :color="getStatusColorAuthorityOrSchool(item.status)"
                        right
                        dark
                      >
                        mdi-circle-medium
                      </v-icon>
                      <span class="statusCodeLabel">{{ item.status }}</span>
                    </v-col>
                    <v-col class="d-flex">
                      <v-icon
                        class="mb-3 mr-1"
                        aria-hidden="false"
                      >
                        mdi-account-outline
                      </v-icon>
                      <span
                        class="principalName statusCodeLabel"
                        style="color: black"
                      >{{ item.principalsName }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="6">
                      <span
                        class="ministryLine"
                        style="color: black"
                      >{{
                        item.schoolCategory
                      }} | {{ item.facilityType }}</span>
                    </v-col>
                    <v-col
                      cols="2"
                    >
                      <v-icon
                        class="mb-1"
                        aria-hidden="false"
                      >
                        mdi-phone-outline
                      </v-icon>
                      <span class="statusCodeLabel">{{ formatPhoneNumber(item.phoneNumber) }}</span>
                    </v-col>
                    <v-col
                      cols="4"
                      class="d-flex pr-2"
                    >
                      <v-icon
                        class="ml-0 mr-1 mb-1"
                        aria-hidden="false"
                      >
                        mdi-at
                      </v-icon>
                      <span class="statusCodeLabel centerSpan">{{ item.email }}</span>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>

              <v-divider />
            </template>
          </v-data-table-server>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>

import ApiService from '../../common/apiService';
import {ApiRoutes} from '../../utils/constants';
import Spinner from '../common/Spinner.vue';
import PrimaryButton from '../util/PrimaryButton.vue';
import { authStore } from '../../store/modules/auth';
import { instituteStore } from '../../store/modules/institute';
import { appStore } from '../../store/modules/app';
import { mapState } from 'pinia';
import {isEmpty, omitBy} from 'lodash';
import alertMixin from '../../mixins/alertMixin';
import {formatPhoneNumber, formatContactName} from '../../utils/format';
import {getStatusColorAuthorityOrSchool, getStatusAuthorityOrSchool, isContactCurrent} from '../../utils/institute/status';
import {edxStore} from '../../store/modules/edx';

export default {
  name: 'SchoolListPage',
  components: {
    PrimaryButton,Spinner
  },
  mixins: [alertMixin],
  data() {
    return {
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
      schoolCodeNameFilter: null,
      schoolStatusFilter: null,
      schoolFacilityTypes: [],
      schoolActiveFacilityTypes: [],
      schoolCategoryTypes: [],
      schoolFacilityTypeFilter: null
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    ...mapState(appStore, ['schoolsMap']),
    ...mapState(instituteStore, ['facilityTypeCodes','validFacilityTypeCodes','schoolCategoryTypeCodes']),
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
      this.getSchoolList();
    },
    pageNumber() {
      this.getSchoolList();
    }
  },
  created() {
    edxStore().getMinistryTeams();
    appStore().getInstitutesData();
    instituteStore().getFacilityTypeCodes().then(() => {
      this.schoolFacilityTypes = this.facilityTypeCodes;
    });
    instituteStore().getAllActiveFacilityTypeCodes().then(() => {
      this.schoolActiveFacilityTypes = this.validFacilityTypeCodes;
    });
    instituteStore().getSchoolCategoryTypeCodes().then(() => {
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
            status: getStatusAuthorityOrSchool(school)
          };
          this.schoolSearchNames.push(schoolItem);
        }
      }).catch(error => {
        console.error(error);
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
        this.headerSearchParams.status = this.schoolStatusFilter[0].code;
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
      return this.schoolFacilityTypes?.find((facility) => facility.facilityTypeCode === school.facilityTypeCode)?.label;
    },
    getSchoolCategory(school){
      return this.schoolCategoryTypeCodes?.find((category) => category.schoolCategoryCode === school.schoolCategoryCode).label;
    },
    formatPhoneNumber,
    getPrincipalsName(contacts) {
      let oldestPrincipal = null;
      for (const contact of contacts) {
        if (contact.schoolContactTypeCode !== 'PRINCIPAL') {
          continue;
        }
        if (!isContactCurrent(contact)) {
          continue;
        }
        if ((oldestPrincipal !== null) && (new Date(oldestPrincipal.effectiveDate) < new Date(contact.effectiveDate))) {
          continue;
        }
        oldestPrincipal = contact;
      }
      if (oldestPrincipal == null) {
        return '';
      }
      return formatContactName(oldestPrincipal);
    },
    getStatusColorAuthorityOrSchool,
    openSchool(schoolId){
      this.$router.push({name: 'schoolDetails', params: {schoolID: schoolId}});
    },
    resetPageNumber(){
      this.pageNumber = 1;
    },
    searchEnabled(){
      return (this.schoolCodeNameFilter !== '' && this.schoolCodeNameFilter !== null) || (this.schoolStatusFilter !== '' && this.schoolStatusFilter !== null)
          || this.schoolFacilityTypeFilter !== '' && this.schoolFacilityTypeFilter !== null;
    },
    getStatusColor(status) {
      if (status === 'Open') {
        return 'green';
      } else if (status === 'Opening') {
        return 'blue';
      } else if (status === 'Closing') {
        return 'orange';
      }
    },
    selectItem(item){

      this.schoolStatusFilter = [];
      this.schoolStatusFilter.push(item.raw);
      this.searchButtonClick();
    },
    clearButtonClick() {
      this.schoolCodeNameFilter = null;
      this.schoolStatusFilter = null;
      this.schoolFacilityTypeFilter = null;

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
  }
};
</script>

<style scoped>

.subjectHeading {
  cursor: pointer;
  font-weight: bold;
}

.ministryLine {
  color: black;
}

.statusCodeLabel {
  word-break: break-word;
}

.centerSpan {
  display: inline-flex;
  align-items: center;
}

.hoverTable:hover{
  background-color: #e8e8e8;
  cursor: pointer;
}

:deep(.v-data-table-footer__items-per-page) {
  display: none;
}

.searchBox {
  padding-left: 1em;
  padding-right: 1em;
  border-radius: 5px;
  background-color: rgb(235, 237, 239);
}

@media screen and (max-width: 1200px){

  .statusCodeLabel{
    font-size: .9rem;
  }

  .ministryLine{
    font-size: .9rem;
  }
}

.containerSetup{
  padding-right: 24em !important;
  padding-left: 24em !important;
}

@media screen and (max-width: 1950px) {
  .containerSetup{
    padding-right: 10em !important;
    padding-left: 10em !important;
  }
}

@media screen and (max-width: 1200px) {
  .containerSetup{
    padding-right: 4em !important;
    padding-left: 4em !important;
  }
}

</style>
