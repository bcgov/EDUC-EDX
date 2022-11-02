<template>
  <v-form ref="schoolDetailsForm" v-model="schoolDetailsFormValid">
  <v-container class="containerSetup" fluid>
    <v-col class="mt-1 d-flex justify-start">
      <v-icon small color="#1976d2">mdi-arrow-left</v-icon>
      <a v-if="isDistrictUser()" class="ml-1" @click="backButtonClick">Return to School List</a>
      <a v-else class="ml-1" @click="backButtonClick">Return to Dashboard</a>
    </v-col>
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
        <v-row class="d-flex justify-start">
          <v-col cols="6" class="d-flex justify-start">
            <h2 class="subjectHeading">{{ school.mincode }} - {{ school.displayName }}</h2>
          </v-col>
          <v-col v-if="!editing" cols="6" class="d-flex justify-end">
            <PrimaryButton id="schoolDetailsEditButton" icon-left width="6em" icon="mdi-pencil" text="Edit"
                           :disabled="!canEditSchoolDetails()" @click.native="toggleEdit"></PrimaryButton>
          </v-col>
          <v-col v-else cols="6" class="d-flex justify-end">
            <PrimaryButton class="mr-2" secondary id="cancelButton" icon-left width="6em" text="Cancel"
                           @click.native="cancelClicked"></PrimaryButton>
            <PrimaryButton id="saveButton" icon-left width="6em" text="Save" :disabled="!schoolDetailsFormValid"
                           @click.native="updateSchoolDetails"></PrimaryButton>
          </v-col>
        </v-row>
        <v-row class="d-flex justify-start">
          <v-col class="d-flex">
                <div class="ministryOwnershipTeamName"  style="color: black">{{district.districtNumber}} - {{district.name}}</div>
              </v-col>
            </v-row>
        <v-row class="d-flex justify-start">
          <v-col class="d-flex">
                <v-icon class="ml-n1 pr-3" :color="getStatusColorAuthorityOrSchool(school.status)" dark>
                  mdi-circle-medium
                </v-icon>
            <span v-if="!editing">{{ school.status }}</span>
            <span v-else class="mt-5">{{ school.status }}</span>
              </v-col>
          <v-col class="d-flex">
            <v-icon class="mb-1 mr-1" aria-hidden="false">
                  mdi-phone-outline
                </v-icon>
                <span v-if="!editing" class="ml-n1">{{ formatPhoneNumber(school.phoneNumber) }}</span>
                <v-text-field v-else class="shrink py-0" @keypress="isNumber($event)" required :maxlength="10" :rules="[rules.required(), rules.phoneNumber()]" v-model="schoolDetailsCopy.phoneNumber"/>
              </v-col>
          <v-col class="d-flex">
            <v-icon class="mb-1 mr-1" aria-hidden="false">
                  mdi-at
                </v-icon>
                <span v-if="!editing" class="ml-n1">{{ school.email }}</span>
                <v-text-field v-else class="py-0" required :rules="[rules.required(), rules.email()]" :maxlength="255" v-model="schoolDetailsCopy.email"/>
              </v-col>
          <v-col class="d-flex">
            <v-icon class="mb-1 mr-1" aria-hidden="false">
                  mdi-fax
                </v-icon>
                <span v-if="!editing" class="ml-n1">{{ formatPhoneNumber(school.faxNumber) }}</span>
                <v-text-field v-else class="shrink py-0" @keypress="isNumber($event)" :rules="[rules.phoneNumber('Fax number must be valid')]" :maxlength="10" v-model="schoolDetailsCopy.faxNumber"/>
              </v-col>
          <v-col class="d-flex">
            <v-icon class="mb-1 mr-1" aria-hidden="false">
                  mdi-web
                </v-icon>
                <a v-if="cleanWebsiteUrl && !editing" :href="cleanWebsiteUrl" target="_blank">{{ cleanWebsiteUrl }}</a>
                <v-text-field v-if="editing" class="py-0" :rules="[rules.required(), rules.website()]" :maxlength="255" v-model="schoolDetailsCopy.website"/>
              </v-col>
            </v-row>
        <v-row>
          <v-col>
            <v-divider class="divider"></v-divider>
          </v-col>
        </v-row>
        <v-row class="d-flex justify-start">
          <v-col cols="12" class="d-flex justify-start">
            <h2 class="subjectHeading pt-4">School Details</h2>
          </v-col>
        </v-row>
        <v-row class="d-flex justify-start">
          <v-col cols="4" lg="3" class="pb-0 pt-0">
            <v-row no-gutters class="d-flex justify-start">
              <v-col cols="10" class="d-flex justify-start">
                <span style="color: grey">Open Date</span>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="10" class="d-flex justify-start">
                <span class="ministryLine" style="color: black">{{ formatDate(school.openedDate) || '-' }}</span>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="4" lg="3" class="pb-0 pt-0">
            <v-row no-gutters class="d-flex justify-start">
              <v-col cols="10" class="d-flex justify-start">
                <span style="color: grey">Close Date</span>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="10" class="d-flex justify-start">
                <span class="ministryLine" style="color: black">{{ formatDate(school.closedDate) || '-' }}</span>
              </v-col>
            </v-row>
          </v-col>
            <v-col cols="4" lg="3" class="pb-0 pt-0">
              <v-row no-gutters class="d-flex justify-start">
                <v-col cols="10" class="d-flex justify-start">
                  <span style="color: grey">Facility Type</span>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="10" class="d-flex justify-start">
                  <span class="ministryLine" style="color: black">{{school.facilityType}}</span>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="4" lg="3" class="pb-0 pt-0">
              <v-row no-gutters class="d-flex justify-start">
                <v-col cols="10" class="d-flex justify-start">
                  <span style="color: grey">School Category</span>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="10" class="d-flex justify-start">
                  <span class="ministryLine" style="color: black">{{ school.schoolCategory }}</span>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        <v-row class="d-flex justify-start">
          <v-col cols="4" lg="3" class="pb-0 pt-0">
            <v-row no-gutters>
              <v-col cols="10" class="pt-2 pr-0">
                <span style="color: grey">Grades Offered</span>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="10" class="d-flex justify-start">
                <span class="ministryLine" style="color: black">{{ getGradesOffered(school.grades) }}</span>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="4" lg="3" class="pb-0 pt-0">
            <v-row no-gutters class="d-flex justify-start">
              <v-col cols="10" class="d-flex justify-start">
                <span style="color: grey">School Organization</span>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="10" class="d-flex justify-start">
                <span v-if="!editing" class="ministryLine" style="color: black">{{ getSchoolOrganization(school) }}</span>
                <v-select v-else :items="schoolOrganizationTypeCodes"
                          item-value="schoolOrganizationCode"
                          item-text="label"
                          v-model="schoolDetailsCopy.schoolOrganizationCode"
                          single
                          required
                ></v-select>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="4" lg="3" class="pb-0 pt-0">
            <v-row no-gutters class="d-flex justify-start">
              <v-col cols="10" class="d-flex justify-start">
                <span style="color: grey">NLC Activity</span>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="10" class="d-flex justify-start">
                <span v-if="!editing" class="ministryLine" style="color: black">{{ getNLCActivity(school) }}</span>
                <v-select v-else :items="schoolNeighborhoodLearningTypes"
                          item-value="neighborhoodLearningTypeCode"
                          item-text="label"
                          v-model="schoolDetailsCopy.neighborhoodLearning"
                          multiple
                          ></v-select>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <v-row class="d-flex justify-start">
          <v-col cols="12" class="d-flex justify-start">
            <h2 class="subjectHeading pt-4">Addresses</h2>
          </v-col>
        </v-row>
        <v-row no-gutters class="d-flex justify-start">
          <v-col v-if="hasMailingAddress()" cols="3" >
            <v-row>
              <v-col>
                <v-icon class="pb-1 mr-1" right >
                  mdi-email-outline
                </v-icon>
                <span>Mailing Address</span>
              </v-col>
            </v-row>
            <v-row class="ml-9" no-gutters>
              <v-col>
                <span>{{ getMailingAddressItem('addressLine1') }}</span>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col class="ml-9">
                <span>{{ getMailingAddressItem('addressLine2') }}</span>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col class="ml-9">
                <span>{{ getMailingAddressItem('city') + ', ' + getMailingAddressItem('provinceCode')  + ', ' + getMailingAddressItem('countryCode') }}</span>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col class="ml-9">
                <span>{{ getMailingAddressItem('postal') }}</span>
              </v-col>
            </v-row>
          </v-col>
          <v-col v-if="!isOffshoreSchool" cols="3">
            <v-row>
              <v-col>
                <v-icon class="pb-1 mr-1" right >
                  mdi-home-outline
                </v-icon>
                <span>Physical Address</span>
              </v-col>
            </v-row>
            <v-row v-if="!hasSamePhysicalAddress" no-gutters>
              <v-col>
                <v-row no-gutters>
                  <v-col class="ml-9">
                    <span>{{ getPhysicalAddressItem('addressLine1') }}</span>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col class="ml-9">
                    <span>{{ getPhysicalAddressItem('addressLine2') }}</span>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col class="ml-9">
                    <span>{{ getPhysicalAddressItem('city') + ', ' + getPhysicalAddressItem('provinceCode')  + ', ' + getPhysicalAddressItem('countryCode') }}</span>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col class="ml-9">
                    <span>{{ getPhysicalAddressItem('postal') }}</span>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row v-else no-gutters>
              <v-col>
                <v-row class="ml-9" no-gutters>
                  <v-col class="fontItalic">
                    <span>Same as Mailing Address</span>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
  </v-form>
</template>

<script>

import PrimaryButton from '../util/PrimaryButton';
import {mapGetters, mapState} from 'vuex';
import alertMixin from '@/mixins/alertMixin';
import ApiService from '@/common/apiService';
import {ApiRoutes} from '@/utils/constants';
import {formatPhoneNumber, formatDate} from '@/utils/format';
import {getStatusColorAuthorityOrSchool,getStatusAuthorityOrSchool} from '@/utils/institute/status';
import {sanitizeUrl} from '@braintree/sanitize-url';
import {deepCloneObject} from '@/utils/common';
import * as Rules from '@/utils/institute/formRules';

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
      loading: true,
      cleanWebsiteUrl:'',
      schoolDetailsFormValid:true,
      editing: false,
      schoolDetailsCopy: {},
      sameAsMailingCheckbox: true,
      selectedNLCs:[],
      rules: Rules,
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
    },
    isOffshoreSchool(){
      return this.school.schoolCategoryCode === 'OFFSHORE';
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
          this.cleanWebsiteUrl = this.school.website ? sanitizeUrl(this.school.website) : '';
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
      school.status = getStatusAuthorityOrSchool(school);
      school.facilityType = this.getFacilityType(school);
      school.schoolCategory = this.getSchoolCategory(school);
    },
    getMailingAddressItem(item){
      let mailingAddress = this.school.addresses.filter(address => address.addressTypeCode === 'MAILING');
      for (const x in mailingAddress[0]) {
        if(x === item){
          return mailingAddress[0][item];
        }
      }
    },
    getPhysicalAddressItem(item){
      let physicalAddress = this.school.addresses.filter(address => address.addressTypeCode === 'PHYSICAL');
      for (const x in physicalAddress[0]) {
        if(x === item){
          return physicalAddress[0][item];
        }
      }
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
      return this.schoolOrganizationTypes.find((facility) => facility.schoolOrganizationCode === school?.schoolOrganizationCode).label;
    },
    getNLCActivity(school){
      let nLCActivityList = [];
      for(const nl of school.neighborhoodLearning){
        nLCActivityList.push(this.schoolNeighborhoodLearningTypes.find((facility) => facility.neighborhoodLearningTypeCode === nl?.neighborhoodLearningTypeCode).label);
      }
      nLCActivityList.sort();
      return nLCActivityList.toString().replace(/,/g, ', ');
    },
    getFacilityType(school){
      return this.schoolFacilityTypes.find((facility) => facility.facilityTypeCode === school?.facilityTypeCode).label;
    },
    getSchoolCategory(school){
      return this.schoolCategoryTypeCodes.find((category) => category.schoolCategoryCode === school?.schoolCategoryCode).label;
    },
    backButtonClick() {
      if(this.isDistrictUser()){
        this.$router.push({name: 'schools'});
      }else{
        this.$router.push({name: 'home'});
      }
    },
    isDistrictUser(){
      return this.userInfo.activeInstituteType === 'DISTRICT';
    },
    formatDate,
    formatPhoneNumber,
    getStatusColorAuthorityOrSchool,
    deepCloneObject,
    getCountryName(countryCode){
      let countryName = '';
      if(countryCode === 'CA'){
        countryName = 'Canada';
      }
      return countryName;
    },
    canEditSchoolDetails(){
      return this.userInfo?.activeInstitutePermissions?.filter(perm => perm === 'EDX_USER_DISTRICT_ADMIN'||'EDX_USER_SCHOOL_ADMIN').length > 0;
    },
    async toggleEdit(){
      this.schoolDetailsCopy = this.deepCloneObject(this.school);
      this.editing = !this.editing;
      await this.$nextTick();
      this.$refs.schoolDetailsForm.validate();
    },
    cancelClicked(){
      this.editing = false;
      this.setHasSamePhysicalFlag();
    },
    setHasSamePhysicalFlag(){
      this.sameAsMailingCheckbox = this.hasSamePhysicalAddress;
    },
    updateSchoolDetails() {
      this.loading = true;

      if(this.sameAsMailingCheckbox){
        this.schoolDetailsCopy.addresses = this.schoolDetailsCopy.addresses.filter(address => address.addressTypeCode === 'MAILING');
      }
      ApiService.apiAxios.put(`${ApiRoutes.school.BASE_URL}` + '/' + this.schoolDetailsCopy.schoolID, this.schoolDetailsCopy)
        .then(() => {
          this.setSuccessAlert('Success! The school details have been updated.');
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while saving the school information. Please try again later.');
        })
        .finally(() => {
          this.toggleEdit();
          this.getThisSchoolsDetails();
        });
    },
    hasMailingAddress(){
      return this.school.addresses.filter(address => address.addressTypeCode === 'MAILING').length > 0;
    },
    hasPhysicalAddress(){
      return this.school.addresses.filter(address => address.addressTypeCode === 'PHYSICAL').length > 0;
    },
    getMailingAddressCopy(){
      return this.schoolDetailsCopy.addresses.filter(address => address.addressTypeCode === 'MAILING');
    },
    getPhysicalAddressCopy(){
      return this.schoolDetailsCopy.addresses.filter(address => address.addressTypeCode === 'PHYSICAL');
    },
    addAddressesIfRequired(school){
      let addresses = school.addresses;
      if(!this.hasMailingAddress()){
        addresses.push({
          'createUser': null,
          'updateUser': null,
          'createDate': null,
          'updateDate': null,
          'addressId': null,
          'schoolId': null,
          'districtId': null,
          'independentAuthorityId': null,
          'phoneNumber': null,
          'email': null,
          'addressLine1': null,
          'addressLine2': null,
          'city': null,
          'postal': null,
          'addressTypeCode': 'MAILING',
          'provinceCode': null,
          'countryCode': null
        });
      }
      if(!this.hasPhysicalAddress()){
        addresses.push({
          'createUser': null,
          'updateUser': null,
          'createDate': null,
          'updateDate': null,
          'addressId': null,
          'schoolId': null,
          'districtId': null,
          'independentAuthorityId': null,
          'phoneNumber': null,
          'email': null,
          'addressLine1': null,
          'addressLine2': null,
          'city': null,
          'postal': null,
          'addressTypeCode': 'PHYSICAL',
          'provinceCode': null,
          'countryCode': null
        });
      }
    },
    isNumber: function(evt) {
      let charCode = (evt.which) ? evt.which : evt.keyCode;
      if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46) {
        evt.preventDefault();
      } else {
        return true;
      }
    },
  }
};
</script>

<style scoped>

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
  
