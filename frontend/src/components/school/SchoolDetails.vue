<template>
  <v-container 
    class="containerSetup"
    fluid
  >
    <v-col class="mt-1 mb-1">
      <v-icon
        small
        color="#1976d2"
      >
        mdi-arrow-left
      </v-icon>
      <a
        v-if="isDistrictUser()"
        class="ml-1"
        @click="backButtonClick"
      >Return to School List</a>
      <a
        v-else
        class="ml-1"
        @click="backButtonClick"
      >Return to Dashboard</a>
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
        />
      </v-col>
    </v-row>
    <v-row
      v-else
      no-gutters
    >
      <v-col>
        <v-row class="d-flex justify-start">
          <v-col class="d-flex justify-start">
            <h2>
              {{
                school.mincode
              }}
            </h2>
            <h2 class="pl-1 pr-1">
              -
            </h2>
            <div>
              <div>
                <h2 id="displayName">
                  {{
                    school.displayName
                  }}
                </h2>
              </div>
              <div
                v-if="school.displayNameNoSpecialChars"
                class="safe-name"
                style="font-style: italic; color: grey"
              >
                {{
                  school.displayNameNoSpecialChars
                }}
              </div>
            </div>
          </v-col>
        </v-row>
        <v-row
          v-if="!['OFFSHORE', 'INDEPEND'].includes(school.schoolCategoryCode)"
          no-gutters
          class="d-flex justify-start"
        >
          <v-col class="d-flex">
            <div
              class="ministryOwnershipTeamName"
              style="color: black"
            >
              {{
                district.districtNumber
              }} -
              {{
                district.name
              }}
            </div>
          </v-col>
        </v-row>
        <v-row
          v-else
          no-gutters
          class="d-flex justify-start"
        >
          <v-col class="d-flex">
            <div
              class="ministryOwnershipTeamName"
              style="color: black"
            >
              {{
                authority.authorityNumber
              }} -
              {{
                authority.name
              }}
            </div>
          </v-col>
        </v-row>
        <v-row
          no-gutters
          class="mt-1 d-flex justify-start"
        >
          <v-col class="d-flex">
            <v-icon
              :color="getStatusColorAuthorityOrSchool(school.status)"
              dark
            >
              mdi-circle-medium
            </v-icon>
            <span>{{
              school.status
            }}</span>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-divider class="divider" />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <v-tabs style="color: #38598a" v-model="tab">
              <v-tab value="details">
                Details
              </v-tab>
              <v-tab id="schoolContactsTab" value="contacts">
                Contacts
              </v-tab>
            </v-tabs>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <v-card-text class="pt-0">
              <v-window v-model="tab">
                <v-window-item value="details">
                  <SchoolDetailsForm
                    :school-i-d="schoolID"
                    :function-name="type"
                  />
                </v-window-item>
                <v-window-item value="contacts">
                  <SchoolContactsForm
                    :function-name="type"
                    :school-i-d="schoolID"
                  />
                </v-window-item>
              </v-window>
            </v-card-text>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { authStore } from '../../store/modules/auth';
import { mapState } from 'pinia';
import alertMixin from '../../mixins/alertMixin';
import SchoolDetailsForm from '../common/forms/SchoolDetailsForm.vue';
import ApiService from '../../common/apiService';
import {ApiRoutes} from '../../utils/constants';
import {sanitizeUrl} from '@braintree/sanitize-url';
import {getStatusAuthorityOrSchool, getStatusColorAuthorityOrSchool} from '../../utils/institute/status';
import SchoolContactsForm from '../common/forms/SchoolContactsForm.vue';

export default {
  name: 'SchoolDetailsPage',
  components: {
    SchoolDetailsForm,
    SchoolContactsForm
  },
  mixins: [alertMixin],
  props: {
    schoolID: {
      type: String,
      required: false,
      default: null
    },
  },
  data() {
    return {
      type: 'DETAILS',
      loading: false,
      school: '',
      district: '',
      authority: '',
      tab: null,
      items: [
        'Details', 'Contacts'
      ]
    };
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated','userInfo']),
    dataReady: function () {
      return this.userInfo;
    },
  },
  created() {
    this.getThisSchoolsDetails();
    this.setTab();
  },
  methods: {
    getStatusColorAuthorityOrSchool,
    setTab(){
      if(this.$route.query?.contacts){
        this.tab = 'contacts';
      }
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
    getThisSchoolsDetails(){
      this.loading = true;
      this.school = '';

      let searchSchoolID = this.schoolID ? this.schoolID: this.userInfo.activeInstituteIdentifier;

      ApiService.apiAxios.get(ApiRoutes.school.SCHOOL_DETAILS_BY_ID + '/' + searchSchoolID)
        .then(response => {
          this.school = response.data;
          this.populateExtraSchoolFields(this.school);
          this.getDistrictDetails(this.school.districtId);
          if(this.school.independentAuthorityId){
            this.getAuthorityDetails(this.school.independentAuthorityId);
          }
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
    populateExtraSchoolFields(school) {
      school.status = getStatusAuthorityOrSchool(school);
    },
    getAuthorityDetails(authorityId) {
      this.authority = '';
      ApiService.apiAxios.get(ApiRoutes.institute.AUTHORITY_DATA_URL + '/' + authorityId)
        .then(response => {
          this.authority = response.data;
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loading = false;
          console.log('authority: ', this.authority);
        });
    }
  }
};
</script>

<style scoped>

:deep(div.v-input__prepend > i){
  margin-top: 5px;
  margin-right: -10px;
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

@media screen and (max-width: 1800px) {
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

.divider {
  border-color: #FCBA19;
  border-width: 3px;
  opacity: unset;
}

.active-display {
  color: #38598a;
}

.v-tab {
  text-transform: none !important;
  font-size: 16px;
  font-weight: bold;
}

.tab-divider {
  border-right: 1px solid lightgray;
  border-radius: 0;
}

.tab-divider:last-child {
  border-right: 0
}
</style>
  
