<template>
  <v-container
    class="containerSetup"
    fluid
  >
    <v-row>
      <v-col class="mt-1 mb-4 d-flex justify-start">
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
          <v-col
            cols="6"
            class="d-flex justify-start"
          >
            <h2 id="districtName">
              {{
                district.districtNumber
              }} - {{
                district.displayName
              }}
            </h2>
          </v-col>
        </v-row>

        <v-row
          no-gutters
          class="mt-1 d-flex justify-start"
        >
          <v-col
            class="d-flex"
          >
            <v-icon
              class="pb-1"
              :color="getStatusColor()"
              right
              dark
            >
              mdi-circle-medium
            </v-icon>
            <span>{{
              getStatusText()
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
            <v-tabs style="color: #38598a" v-model="activeTab">
              <v-tab  value="details">
                Details
              </v-tab>
              <v-tab value="contacts">
                Contacts
              </v-tab>
            </v-tabs>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <v-card-text class="pt-0">
              <v-window v-model="activeTab">
                <v-window-item value="details">
                  <DistrictDetailsTab
                    :district-i-d="districtID"
                    :has-access="canEditDistrict"
                    @updateDistrict="updateDistrictDetails"
                  />
                </v-window-item>
                <v-window-item value="contacts">
                  <DistrictContacts
                    :district-i-d="districtID"
                    :has-access="canEditDistrict"
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

import ApiService from '../../common/apiService';
import {ApiRoutes} from '../../utils/constants';
import alertMixin from '../../mixins/alertMixin';
import { mapState } from 'pinia';
import { authStore } from '../../store/modules/auth';
import { instituteStore } from '../../store/modules/institute';
import * as Rules from '../../utils/institute/formRules';
import {isNumber} from '../../utils/institute/formInput';
import DistrictDetailsTab from './DistrictDetailsTab.vue';
import DistrictContacts from './DistrictContacts.vue';
import {PERMISSION} from '../../utils/constants/Permission';
import router from '../../router';

export default {
  name: 'DistrictDetailsPage',
  components: {
    DistrictDetailsTab,
    DistrictContacts
  },
  mixins: [alertMixin],
  props: {
    districtID: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      validTabs: ['details', 'contacts'],
      district: null,
      districtCopy:  {},
      districtFormValid: true,
      sameAsMailingCheckbox: true,
      loading: false,
      provinceCodeValues: null,
      countryCodeValues: null,
      rules: Rules
    };
  },
  computed:{
    ...mapState(instituteStore, ['provinceCodes', 'countryCodes']),
    ...mapState(authStore, ['userInfo']),
    activeTab: {
      get() {
        return this.validTabs.includes(this.$route.params?.activeTab) ? this.$route.params?.activeTab : 'details';
      },
      set(value) {
        if (!this.validTabs.includes(value)) {
          return;
        }
        router.push({name: 'districtDetails', params: {districtID: this.districtID, activeTab: value}});
      }
    },
    canEditDistrict(){
      return this.userInfo?.activeInstitutePermissions?.filter(perm => perm === PERMISSION.EDX_DISTRICT_EDIT).length > 0;
    },
    hasSamePhysicalAddress(){
      return !this.district.addresses.filter(address => address.addressTypeCode === 'PHYSICAL').length > 0;
    }
  },
  created() {
    instituteStore().getProvinceCodes().then(() => {
      this.provinceCodeValues = this.provinceCodes.filter(province =>  province.provinceCode === 'BC' || province.provinceCode === 'YT');
    });
    instituteStore().getCountryCodes().then(() => {
      this.countryCodeValues = this.countryCodes;
    });
    this.getDistrict();
  },
  methods: {
    isNumber,
    getDistrict() {
      this.loading = true;
      ApiService.apiAxios.get(`${ApiRoutes.district.BASE_URL}/${this.districtID}`, {
      }).then(response => {
        this.district = response.data;
      }).catch(error => {
        console.error(error);
      }).finally(() => {
        this.setHasSamePhysicalFlag();
        this.loading = false;
      });
    },
    setHasSamePhysicalFlag(){
      this.sameAsMailingCheckbox = this.hasSamePhysicalAddress;
    },
    getStatusColor() {
      if (this.district.districtStatusCode === 'ACTIVE') {
        return 'green';
      } else {
        return 'red';
      }
    },
    getStatusText() {
      if (this.district.districtStatusCode === 'ACTIVE') {
        return 'Active';
      } else {
        return 'Inactive';
      }
    },
    async updateDistrictDetails(districtDetailsCopy) {
      this.loading = true;

      ApiService.apiAxios.post(`${ApiRoutes.district.BASE_URL}/${districtDetailsCopy.districtId}`, districtDetailsCopy)
        .then(() => {
          this.setSuccessAlert('Success! The district details have been updated.');
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while saving the district information. Please try again later.');
        })
        .finally(() => {
          this.getDistrict();
        });
    },
    backButtonClick() {
      this.$router.push({name: 'home'});
    },
  },
};
</script>

<style scoped>
.divider {
  border-color: #FCBA19;
  border-width: unset;
  opacity: unset;
}

:deep(div.v-input__prepend > i){
  margin-top: 5px;
  margin-right: -10px;
}

.fontItalic{
  font-style: italic;
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
