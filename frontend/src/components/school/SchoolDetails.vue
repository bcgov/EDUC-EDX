<template>
  <v-container class="containerSetup" fluid>
    <div style="width: 100%;" :overlay=false>
      <v-row class="pt-0"
             :class="{'mr-0 ml-0': $vuetify.breakpoint.smAndDown, 'mr-3 ml-3': $vuetify.breakpoint.mdAndUp}">
        <v-col cols="10 pt-0">
          <div>
          <!--  <v-row> -->
              <!--<v-col class="pb-0 pt-0 d-flex justify-start"> -->
            <v-col class="pb-10 pt-0">
                <v-row cols="2">
                  <v-col cols="12" lg="10" class="pb-2 pt-2 pr-0" style="text-align: left">
                    <h2 class="subjectHeading">{{school.mincode}} - {{school.displayName}}</h2>
                    <div class="ministryOwnershipTeamName" style="color: black">{{district.districtNumber}} - {{district.name}}</div>
                  </v-col>
                  <v-col cols="12" lg="2" class="d-flex justify-end">
                    <PrimaryButton width="8em" primary icon="mdi-pencil" text="Edit"></PrimaryButton>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="2" lg="1" class="pb-0 pt-0">
                    <v-row class="mb-n4">
                      <v-col cols="10" class="pb-2 pt-2 pr-0">
                        <v-icon class="ml-n1 pr-3" :color="getStatusColor(school.status)" dark>
                          mdi-circle-medium
                        </v-icon>
                        <span class="ml-n1">{{ school.status }}</span>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col cols="4" lg="2" class="pb-0 pt-0">
                    <v-row class="mb-n4">
                      <v-col cols="10" class="pb-2 pt-2 pr-0">
                        <v-icon aria-hidden="false" class="pr-3">
                          mdi-phone-outline
                        </v-icon>
                        <span class="ml-n1">{{ formatPhoneNumber(school.phoneNumber) }}</span>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col cols="4" lg="3" class="pb-0 pt-0">
                    <v-row class="mb-n4">
                      <v-col cols="10" class="pb-2 pt-2 pr-0">
                        <v-icon aria-hidden="false" class="pr-3">
                          mdi-at
                        </v-icon>
                        <span class="ml-n1">{{ school.email }}</span>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col cols="4" lg="2" class="pb-0 pt-0">
                    <v-row class="mb-n4">
                      <v-col cols="10" class="pb-2 pt-2 pr-0">
                        <v-icon aria-hidden="false" class="pr-3">
                          mdi-fax
                        </v-icon>
                        <span class="ml-n1">{{ formatPhoneNumber(school.faxNumber) }}</span>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col cols="4" lg="2" class="pb-0 pt-0">
                    <v-row class="mb-n4">
                      <v-col cols="10" class="pb-2 pt-0 pr-0 pl-10">
                         <v-btn icon :href="`${school.website}`" target="_blank">
                          <v-icon aria-hidden="false" class="pr-3">mdi-web</v-icon>
                           {{school.website}} https://www.google.com
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-col>
            <v-row no-gutters>
              <v-col>
                <v-divider class="divider"></v-divider>
                <h2 class="subjectHeading pt-4">School Details</h2>
              </v-col>
            </v-row>
            <v-row class="pl-3">
              <v-col cols="4" lg="3" class="pb-0 pt-0">
                <v-row class="mb-n4">
                  <v-col cols="10" class="pb-2 pt-2 pr-0">
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
                <v-row class="mb-n4">
                  <v-col cols="10" class="pb-2 pt-2 pr-0">
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
                  <v-row class="mb-n4">
                    <v-col cols="10" class="pb-2 pt-2 pr-0">
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
                  <v-row class="mb-n4">
                    <v-col cols="10" class="pb-2 pt-2 pr-0">
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
            <!-- -->
            <v-row class="pt-5 pl-3">
              <v-col cols="4" lg="3" class="pb-0 pt-0">
                <v-row class="mb-n4">
                  <v-col cols="10" class="pb-2 pt-2 pr-0">
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
                <v-row class="mb-n4">
                  <v-col cols="10" class="pb-2 pt-2 pr-0">
                    <span style="color: grey">School Organization</span>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="10" class="pb-1 pr-0">
                    <span class="ministryLine" style="color: black">{{ getSchoolOrganization(school.schoolOrganizationCode) }}</span>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="4" lg="3" class="pb-0 pt-0">
                <v-row class="mb-n4">
                  <v-col cols="10" class="pb-2 pt-2 pr-0">
                    <span style="color: grey">NLC Activity</span>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="10" class="pb-1 pr-0">
                    <span class="ministryLine" style="color: black">{{ getNLCActivity(school.neighborhoodLearning) }}</span>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <h2 class="subjectHeading pt-4">Addresses</h2>
              </v-col>
            </v-row>
            <v-row class="pt-5 pl-3">
              <v-col cols="4" lg="3" class="pb-0 pt-0">
                <v-row class="mb-n4">
                  <v-col cols="10" class="pb-2 pt-2 pr-0">
                    <v-icon aria-hidden="false" class="pr-3">
                      mdi-email-outline
                    </v-icon>
                    <span style="color: grey">Mailing Addresses</span>
                  </v-col>
                </v-row>
                <v-row class="pl-3">
                  <v-col cols="10" class="pb-1 pr-0" v-for="address in school.addresses" :key="address.addressId">
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
                <v-row class="mb-n4">
                  <v-col cols="10" class="pb-2 pt-2 pr-0">
                    <v-icon aria-hidden="false" class="pr-3">
                      mdi-home-outline
                    </v-icon>
                    <span style="color: grey">Physical Addresses</span>
                  </v-col>
                </v-row>
                <v-row>
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
                    <v-row class="pl-4" v-else>
                      <span>Same as Mailing Address</span>
                    </v-row>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </div>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>

import PrimaryButton from '../util/PrimaryButton';
import {mapGetters} from 'vuex';
import alertMixin from '@/mixins/alertMixin';
import ApiService from '@/common/apiService';
import {ApiRoutes} from '@/utils/constants';

export default {
  name: 'SchoolDetailsPage',
  mixins: [alertMixin],
  components: {
    PrimaryButton,
  },
  data() {
    return {
      school: '',
      district: '',
    };
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated','userInfo']),
    dataReady: function () {
      return this.userInfo;
    }
  },
  created() {
    this.getThisSchoolsDetails();
  },
  methods: {
    
    getThisSchoolsDetails(){
      this.school = '';

      ApiService.apiAxios.get(ApiRoutes.school.SCHOOL_DETAILS_BY_ID + `/${this.userInfo.activeInstituteIdentifier}`)
        .then(response => {
          this.school = response.data;
          this.populateExtraSchoolFields(this.school);
          this.getDistrictDetails(this.school.districtId);
        }).catch(error => {
        //to do add the alert framework for error or success
          console.error(error);
        }).finally(() => {
          this.loadingTable = false;
        });
    },
    getDistrictDetails(districtId){
      this.district = '';
      ApiService.apiAxios.get(ApiRoutes.institute.DISTRICT + '/'+ districtId)
        .then(response => {
          this.district = response.data;
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
    },
    getGradesOffered(rawGrades){

      let gradeCodes = [];
      for(const grade of rawGrades){
        gradeCodes.push(grade.schoolGradeCode);
      }
      return this.convertSortGradeCodes(gradeCodes);
    },
    convertSortGradeCodes(gradeCodes){
      let gradeList = [];
      for(const gradeCode of gradeCodes ){
        switch (gradeCode){
        case 'GRADE01':
          gradeList.push('1');
          break;
        case 'GRADE02':
          gradeList.push('2');
          break;
        case 'GRADE03':
          gradeList.push('3');
          break;
        case 'GRADE04':
          gradeList.push('4');
          break;
        case 'GRADE05':
          gradeList.push('5');
          break;
        case 'GRADE06':
          gradeList.push('6');
          break;
        case 'GRADE07':
          gradeList.push('7');
          break;
        case 'GRADE08':
          gradeList.push('8');
          break;
        case 'GRADE09':
          gradeList.push('9');
          break;
        case 'GRADE10':
          gradeList.push('10');
          break;
        case 'GRADE11':
          gradeList.push('11');
          break;
        case 'GRADE12':
          gradeList.push('12');
          break;
        }
      }
      gradeList.sort();
      return gradeList.toString();
    },
    getSchoolOrganization(schoolOrganizationCode){
      let schoolOrg = '';
      switch(schoolOrganizationCode){
      case 'TWO_SEM':
        schoolOrg = 'Two Semesters';
        break;
      case 'TRIMESTER':
        schoolOrg = 'Trimester';
        break;
      case 'QUARTER':
        schoolOrg = 'Quarter';
        break;
      case 'TEN_MONTHS':
        schoolOrg = 'Ten Months';
        break;
      case 'PART_TEN':
        schoolOrg = 'Part ten month';
        break;
      case 'OTHER':
        schoolOrg = 'Other';
        break;
      default:
        schoolOrg = '-';
      }

      return schoolOrg;
    },
    getNLCActivity(neighborhoodLearning){
      let NLCActivity = '';
      for(const nl of neighborhoodLearning){
        switch(nl){
        case 'EARLYLEARN':
          NLCActivity = 'Early Learning';
          break;
        case 'AFTERSCHL':
          NLCActivity = 'After School Programs';
          break;
        case 'CONTINEDUC':
          NLCActivity = 'Continuing Education';
          break;
        case 'SENIORS':
          NLCActivity = 'Seniors';
          break;
        case 'SPORTRECR':
          NLCActivity = 'Sports and Recreation';
          break;
        case 'COMMUNITY':
          NLCActivity = 'Community Use';
          break;
        case 'INTEGRSERV':
          NLCActivity = 'Integrated Services';
          break;
        default:
          NLCActivity = '-';
        }
      }

      return NLCActivity;
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
    formatDate(date){
      if(date !== '' && date !== null) {
        return new Date(date).toISOString().slice(0, 10).replace(/-/g, '/');
      } else {
        return '-';
      }
    },
    formatPhoneNumber(phNumber){
      let formattedPhNum = '';
      let ph1 = phNumber.substring(0,3);
      let ph2 = phNumber.substring(3, 6);
      let ph3 = phNumber.substring(6, 10);
      formattedPhNum = ph1+'-'+ph2+'-'+ph3;
      return formattedPhNum;
    },
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
.divider {
  border-color: #FCBA19;
  border-width: medium;
}
</style>
  
