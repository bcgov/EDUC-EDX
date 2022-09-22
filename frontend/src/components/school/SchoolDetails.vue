<template>
  <v-container class="containerSetup" fluid>
    <v-row v-if="loading">
      <v-col class="d-flex justify-center">
        <v-progress-circular
          class="mt-16"
          :size="70"
          :width="7"
          color="primary"
          indeterminate
          :active="loading"
        ></v-progress-circular>
      </v-col>
    </v-row>
    <v-row v-else no-gutters>
      <v-col>
        <v-row class="pl-3">
          <v-col cols="12" class="pb-3 pt-0">
            <v-row cols="2">
              <v-col class="pb-0" cols="12">
                <v-row>
                  <v-col cols="6" class="d-flex justify-start">
                    <v-row no-gutters>
                      <v-col cols="12">
                        <h2 class="subjectHeading">{{school.mincode}} - {{school.displayName}}</h2>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col cols="6" class="d-flex justify-end">
                    <PrimaryButton width="6em" icon="mdi-pencil" text="Edit"></PrimaryButton>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row class="pb-2">
              <v-col class="pt-0 mt-n2" cols="12">
                <div class="ministryOwnershipTeamName"  style="color: black">{{district.districtNumber}} - {{district.name}}</div>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="2" lg="2" class="pb-0 pt-0">
                <v-icon class="ml-n1 pr-3" :color="getStatusColor(school.status)" dark>
                  mdi-circle-medium
                </v-icon>
                <span class="ml-n1">{{ school.status }}</span>
              </v-col>
              <v-col cols="12" lg="2" class="pb-0 pt-0">
                <v-icon aria-hidden="false" class="pr-3">
                  mdi-phone-outline
                </v-icon>
                <span class="ml-n1">{{ formatPhoneNumber(school.phoneNumber) }}</span>
              </v-col>
              <v-col cols="12" lg="3" class="pb-0 pt-0">
                <v-icon aria-hidden="false" class="pr-3">
                  mdi-at
                </v-icon>
                <span class="ml-n1">{{ school.email }}</span>
              </v-col>
              <v-col cols="12" lg="2" class="pb-0 pt-0">
                <v-icon aria-hidden="false" class="pr-3">
                  mdi-fax
                </v-icon>
                <span class="ml-n1">{{ formatPhoneNumber(school.faxNumber) }}</span>
              </v-col>
              <v-col  lg="3" sm="4" class="pb-0 pt-0">
                <v-icon class="mr-1" aria-hidden="false">
                  mdi-web
                </v-icon>
                <a target="_blank" :href="school.website">{{ school.website }}</a>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <v-divider class="divider"></v-divider>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <h2 class="subjectHeading pt-4">School Details</h2>
          </v-col>
        </v-row>
        <v-row class="pl-3">
          <v-col cols="4" lg="3" class="pb-0 pt-0">
            <v-row no-gutters>
              <v-col cols="10" class="pt-2 pr-0">
                <span style="color: grey">Open Date</span>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="10" class="pb-1 pr-0">
                <span class="ministryLine" style="color: black">{{ formatDate(school.openedDate) }}</span>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="4" lg="3" class="pb-0 pt-0">
            <v-row no-gutters>
              <v-col cols="10" class=" pt-2 pr-0">
                <span style="color: grey">Close Date</span>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="10" class="pb-1 pr-0">
                <span class="ministryLine" style="color: black">{{ formatDate(school.closedDate) }}</span>
              </v-col>
            </v-row>
          </v-col>
            <v-col cols="4" lg="3" class="pb-0 pt-0">
              <v-row no-gutters>
                <v-col cols="10" class="pt-2 pr-0">
                  <span style="color: grey">Facility Type</span>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="10" class="pb-1 pr-0">
                  <span class="ministryLine" style="color: black">{{school.facilityType}}</span>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="4" lg="3" class="pb-0 pt-0">
              <v-row no-gutters>
                <v-col cols="10" class="pt-2 pr-0">
                  <span style="color: grey">School Category</span>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="10" class="pb-1 pr-0">
                  <span class="ministryLine" style="color: black">{{ school.schoolCategory }}</span>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        <v-row class="pt-5 pl-3">
          <v-col cols="4" lg="3" class="pb-0 pt-0">
            <v-row no-gutters>
              <v-col cols="10" class="pt-2 pr-0">
                <span style="color: grey">Grades Offered</span>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="10" class="pb-1 pr-0">
                <span class="ministryLine" style="color: black">{{ getGradesOffered(school.grades) }}</span>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="4" lg="3" class="pb-0 pt-0">
            <v-row no-gutters>
              <v-col cols="10" class="pt-2 pr-0">
                <span style="color: grey">School Organization</span>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="10" class="pb-1 pr-0">
                <span class="ministryLine" style="color: black">{{ getSchoolOrganization(school) }}</span>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="4" lg="3" class="pb-0 pt-0">
            <v-row no-gutters>
              <v-col cols="10" class="pt-2 pr-0">
                <span style="color: grey">NLC Activity</span>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="10" class="pb-1 pr-0">
                <span class="ministryLine" style="color: black">{{ getNLCActivity(school) }}</span>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <h2 class="subjectHeading pt-4">Addresses</h2>
          </v-col>
        </v-row>
        <v-row class="pl-3">
          <v-col cols="4" lg="3" class="pb-0 pt-0">
            <v-row no-gutters>
              <v-col cols="10" class="pt-2 pr-0">
                <v-icon aria-hidden="false" class="pr-1">
                  mdi-email-outline
                </v-icon>
                <span style="color: grey">Mailing Addresses</span>
              </v-col>
            </v-row>
            <v-row class="ml-7">
              <v-col cols="10" class="pr-0 pt-0" v-for="address in school.addresses" :key="address.addressId">
                <v-row v-if="address.addressTypeCode === 'MAILING'">
                  <v-col>
                    <v-row>
                      <span class="ministryLine" style="color: black">{{ address.addressLine1 }}</span>
                    </v-row>
                    <v-row>
                      <span>{{ address.city }}, {{ address.provinceCode }} {{getCountryName(address.countryCode)}}</span>
                    </v-row>
                    <v-row>
                      <span>{{address.postal}}</span>
                    </v-row>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="4" lg="3" class="pb-0 pt-0">
            <v-row no-gutters>
              <v-col cols="10" class="pt-2 pr-0">
                <v-icon aria-hidden="false" class="pr-1">
                  mdi-home-outline
                </v-icon>
                <span style="color: grey">Physical Addresses</span>
              </v-col>
            </v-row>
            <v-row v-if="!hasSamePhysicalAddress" class="ml-7">
              <v-col cols="10" class="pb-1 pr-0" v-for="address in school.addresses" :key="address.addressId">
                <v-row v-if="address.addressTypeCode === 'PHYSICAL'">
                  <v-col>
                    <v-row>
                      <span class="ministryLine" style="color: black">{{ address.addressLine1 }}</span>
                    </v-row>
                    <v-row>
                      <span>{{ address.city }}, {{ address.provinceCode }} {{getCountryName(address.countryCode)}}</span>
                    </v-row>
                    <v-row>
                      <span>{{address.postal}}</span>
                    </v-row>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row class="ml-7 pl-0" v-else>
              <v-col class="pl-0 fontItalic">
                <span>Same as Mailing Address</span>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

import PrimaryButton from '../util/PrimaryButton';
import {mapGetters, mapState} from 'vuex';
import alertMixin from '@/mixins/alertMixin';
import ApiService from '@/common/apiService';
import {ApiRoutes} from '@/utils/constants';
import {formatPhoneNumber} from '@/utils/format';
import {DateTimeFormatter, LocalDate} from '@js-joda/core';

export default {
  name: 'SchoolDetailsPage',
  mixins: [alertMixin],
  components: {
    PrimaryButton,
  },
  props: {
    schoolID: {
      type: String,
      required: false
    },
  },
  data() {
    return {
      school: '',
      district: '',
      schoolFacilityTypes: [],
      schoolCategoryTypes: [],
      schoolOrganizationTypes: [],
      schoolNeighborhoodLearningTypes: [],
      schoolGradeTypes: [],
      loading: true
    };
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated','userInfo']),
    ...mapState('institute', ['facilityTypeCodes']),
    ...mapState('institute', ['schoolCategoryTypeCodes']),
    ...mapState('institute', ['schoolOrganizationTypeCodes']),
    ...mapState('institute', ['schoolNeighborhoodLearningCodes']),
    ...mapState('institute', ['gradeCodes']),
    dataReady: function () {
      return this.userInfo;
    },
    hasSamePhysicalAddress(){
      return !this.school.addresses.filter(address => address.addressTypeCode === 'PHYSICAL').length > 0;
    }
  },
  created() {
    this.$store.dispatch('institute/getFacilityTypeCodes').then(() => {
      this.schoolFacilityTypes = this.facilityTypeCodes;
    });
    this.$store.dispatch('institute/getSchoolCategoryTypeCodes').then(() => {
      this.schoolCategoryTypes = this.schoolCategoryTypeCodes;
    });
    this.$store.dispatch('institute/getSchoolOrganizationTypeCodes').then(() => {
      this.schoolOrganizationTypes = this.schoolOrganizationTypeCodes;
    });
    this.$store.dispatch('institute/getSchoolNeighborhoodLearningCodes').then(() => {
      this.schoolNeighborhoodLearningTypes = this.schoolNeighborhoodLearningCodes;
    });
    this.$store.dispatch('institute/getGradeCodes').then(() => {
      this.schoolGradeTypes = this.gradeCodes;
    });
    this.getThisSchoolsDetails();
  },
  methods: {
    getThisSchoolsDetails(){
      this.loading = true;
      this.school = '';

      let searchSchoolID = this.schoolID ? this.schoolID: this.userInfo.activeInstituteIdentifier;

      ApiService.apiAxios.get(ApiRoutes.school.SCHOOL_DETAILS_BY_ID + '/' + searchSchoolID)
        .then(response => {
          this.school = response.data;
          this.populateExtraSchoolFields(this.school);
          this.getDistrictDetails(this.school.districtId);
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loading = false;
        });
    },
    getDistrictDetails(districtId){
      this.district = '';
      ApiService.apiAxios.get(ApiRoutes.institute.DISTRICT + '/'+ districtId)
        .then(response => {
          this.district = response.data;
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loading = false;
        });
    },
    populateExtraSchoolFields(school){
      school.status = this.getSchoolStatus(school);
      school.facilityType = this.getFacilityType(school);
      school.schoolCategory = this.getSchoolCategory(school);
    },
    getGradesOffered(rawGrades){
      let gradeList = [];
      for(const grade of rawGrades){
        gradeList.push(this.schoolGradeTypes.find((facility) => facility.schoolGradeCode === grade.schoolGradeCode).label.replaceAll('Grade ', ''));
      }
      let onlyNumbers = gradeList.filter(Number);
      let onlyLetters = gradeList.filter(x => !onlyNumbers.includes(x));

      onlyNumbers = onlyNumbers.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      gradeList = onlyNumbers.concat(onlyLetters);
      return gradeList.toString().replace(/,/g, ', ');
    },
    getSchoolOrganization(school){
      return this.schoolOrganizationTypes.find((facility) => facility.schoolOrganizationCode === school.schoolOrganizationCode).label;
    },
    getNLCActivity(school){
      let nLCActivityList = [];
      for(const nl of school.neighborhoodLearning){
        nLCActivityList.push(this.schoolNeighborhoodLearningTypes.find((facility) => facility.neighborhoodLearningTypeCode === nl.neighborhoodLearningTypeCode).label);
      }
      nLCActivityList.sort();
      return nLCActivityList.toString().replace(/,/g, ', ');
    },
    getFacilityType(school){
      return this.schoolFacilityTypes.find((facility) => facility.facilityTypeCode === school.facilityTypeCode).label;
    },
    getSchoolCategory(school){
      return this.schoolCategoryTypeCodes.find((category) => category.schoolCategoryCode === school.schoolCategoryCode).label;
    },
    getSchoolStatus: function (school) {
      const currentDate = LocalDate.now();
      let openedDate = school.openedDate;
      let closedDate = school.closedDate;

      if (!openedDate) {
        return 'Never Opened';
      }
      const parsedOpenDate = new LocalDate.parse(openedDate, DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss'));

      let parsedCloseDate = null;
      if(closedDate){
        parsedCloseDate = new LocalDate.parse(closedDate, DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss'));
      }

      if (parsedOpenDate <= currentDate && parsedCloseDate === null) {
        return 'Open';
      } else if (parsedOpenDate > currentDate) {
        return 'Opening';
      } else if (parsedOpenDate <= currentDate && parsedCloseDate > currentDate) {
        return 'Closing';
      }

      return 'Closed';
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
    formatDate(date){
      if(date) {
        return new Date(date).toISOString().slice(0, 10).replace(/-/g, '/');
      } else {
        return '-';
      }
    },
    formatPhoneNumber,
    getCountryName(countryCode){
      let countryName = '';
      if(countryCode === 'CA'){
        countryName = 'Canada';
      }
      return countryName;
    }
  }
};
</script>

<style scoped>
.fontBolder{
  font-weight: bolder;
}

.fontItalic{
  font-style: italic;
}

.divider {
  border-color: #FCBA19;
  border-width: unset;
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
  
