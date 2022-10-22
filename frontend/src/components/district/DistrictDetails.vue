<template>
  <v-form ref="districtForm" v-model="districtFormValid">
    <v-container class="containerSetup" fluid>
      <v-col class="mt-1 d-flex justify-start">
        <v-icon small color="#1976d2">mdi-arrow-left</v-icon>
        <a class="ml-1" @click="backButtonClick">Return to Dashboard</a>
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
          <v-row  class="d-flex justify-start">
            <v-col cols="6" class="d-flex justify-start">
              <h2 id="districtName">{{ district.districtNumber }} - {{ district.displayName }}</h2>
            </v-col>
            <v-col v-if="!editing" cols="6" class="d-flex justify-end">
              <PrimaryButton id="editButton" icon-left width="6em" icon="mdi-pencil" text="Edit" :disabled="!canEditDistrict()" @click.native="toggleEdit"></PrimaryButton>
            </v-col>
            <v-col v-else cols="6" class="d-flex justify-end">
              <PrimaryButton class="mr-2" secondary id="cancelButton" icon-left width="6em" text="Cancel" @click.native="cancelClicked"></PrimaryButton>
              <PrimaryButton id="saveButton" icon-left width="6em" text="Save" :disabled="!districtFormValid" @click.native="saveDistrict"></PrimaryButton>
            </v-col>
          </v-row>
          <v-row class="d-flex justify-start">
            <v-col class="d-flex">
              <v-icon class="pb-1" :color="getStatusColor()" right dark>
                mdi-circle-medium
              </v-icon>
              <span v-if="!editing">{{getStatusText()}}</span>
              <span v-else class="mt-5">{{getStatusText()}}</span>
            </v-col>
            <v-col class="d-flex">
              <v-icon class="mb-1 mr-1" aria-hidden="false">
                mdi-phone-outline
              </v-icon>
              <span v-if="!editing">{{ formatPhoneNumber(district.phoneNumber) }}</span>
              <v-text-field v-else class="shrink py-0" @keypress="isNumber($event)" required :maxlength="10" :rules="phNumRules" v-model="districtCopy.phoneNumber">
              </v-text-field>
            </v-col>
            <v-col class="d-flex">
              <v-icon class="mb-1 mr-1" aria-hidden="false">
                mdi-at
              </v-icon>
              <span v-if="!editing">{{ district.email }}</span>
              <v-text-field v-else class="py-0" required :rules="emailRules" :maxlength="255" v-model="districtCopy.email">
              </v-text-field>
            </v-col>
            <v-col class="d-flex">
              <v-icon class="mb-1 mr-1" aria-hidden="false">
                mdi-fax
              </v-icon>
              <span v-if="!editing">{{ formatPhoneNumber(district.faxNumber) }}</span>
              <v-text-field v-else class="shrink py-0" @keypress="isNumber($event)" :rules="faxNumRules" :maxlength="10" v-model="districtCopy.faxNumber">
              </v-text-field>
            </v-col>
            <v-col class="d-flex">
              <v-icon class="mb-1 mr-1" aria-hidden="false">
                mdi-web
              </v-icon>
              <a v-if="cleanWebsiteUrl && !editing" :href="cleanWebsiteUrl" target="_blank">{{ cleanWebsiteUrl }}</a>
              <v-text-field v-else class="py-0" :rules="websiteRules" :maxlength="255" v-model="districtCopy.website">
              </v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-divider class="divider"></v-divider>
            </v-col>
          </v-row>
          <v-row class="d-flex justify-start">
            <v-col cols="12" class="d-flex justify-start">
              <h2>Addresses</h2>
            </v-col>
          </v-row>
          <v-row no-gutters class="d-flex justify-start">
            <v-col v-if="hasMailingAddress()" cols="3">
              <v-row>
                <v-col>
                  <v-icon class="pb-1 mr-1" right >
                    mdi-email-outline
                  </v-icon>
                  <span>Mailing Address</span>
                </v-col>
              </v-row>
              <v-row v-if="!editing" no-gutters>
                <v-col>
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
              </v-row>
              <v-row v-else no-gutters>
                <v-col>
                  <v-row class="ml-9" no-gutters>
                    <v-col style="color: grey">
                      Line 1
                    </v-col>
                  </v-row>
                  <v-row class="ml-9" no-gutters>
                    <v-col cols="8">
                      <v-text-field id="mailAddressLine1" required :rules="addressLine1Rules" :maxlength="255" class="shrink mt-n5 mb-3" v-model="getMailingAddressCopy()[0].addressLine1">
                      </v-text-field>
                    </v-col>
                  </v-row>
                  <v-row class="ml-9" no-gutters>
                    <v-col style="color: grey">
                      Line 2
                    </v-col>
                  </v-row>
                  <v-row class="ml-9" no-gutters>
                    <v-col cols="8">
                      <v-text-field id="mailAddressLine2" class="shrink mt-n5 mb-3" :maxlength="255" v-model="getMailingAddressCopy()[0].addressLine2">
                      </v-text-field>
                    </v-col>
                  </v-row>
                  <v-row class="ml-9" no-gutters>
                    <v-col style="color: grey">
                      City
                    </v-col>
                  </v-row>
                  <v-row class="ml-9" no-gutters>
                    <v-col cols="8">
                      <v-text-field id="mailAddressCity" required :rules="cityRules" class="shrink mt-n5 mb-3" :maxlength="255" v-model="getMailingAddressCopy()[0].city">
                      </v-text-field>
                    </v-col>
                  </v-row>
                  <v-row class="ml-9" no-gutters>
                    <v-col style="color: grey">
                      Province
                    </v-col>
                  </v-row>
                  <v-row class="ml-9" no-gutters>
                    <v-col cols="8" class="d-flex">
                      <v-select
                        id="mailAddressProvince"
                        :items="this.provinceCodeValues"
                        item-text="label"
                        item-value="provinceCode"
                        v-model="getMailingAddressCopy()[0].provinceCode"
                        dense
                        outlined
                        :rules="provinceRules"
                        required
                        class="mt-2"
                        style="color: black">
                      </v-select>
                    </v-col>
                  </v-row>
                  <v-row class="ml-9" no-gutters>
                    <v-col style="color: grey">
                      Country
                    </v-col>
                  </v-row>
                  <v-row class="ml-9" no-gutters>
                    <v-col cols="8" class="d-flex">
                      <v-select
                        id="mailAddressCountry"
                        :items="this.countryCodeValues"
                        item-text="label"
                        item-value="countryCode"
                        :rules="countryRules"
                        v-model="getMailingAddressCopy()[0].countryCode"
                        dense
                        outlined
                        class="mt-2 mb-2"
                        style="color: black">
                      </v-select>
                    </v-col>
                  </v-row>
                  <v-row class="ml-9" no-gutters>
                    <v-col style="color: grey">
                      Postal Code
                    </v-col>
                  </v-row>
                  <v-row class="ml-9" no-gutters>
                    <v-col cols="8">
                      <v-text-field :maxlength="6" required :rules="postalRules"  id="mailAddressPostal" class="shrink mt-n5 mb-3" v-model="getMailingAddressCopy()[0].postal">
                      </v-text-field>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="3">
              <v-row>
                <v-col>
                  <v-icon class="pb-1 mr-1" right >
                    mdi-home-outline
                  </v-icon>
                  <span>Physical Address</span>
                </v-col>
              </v-row>
              <v-row v-if="!hasSamePhysicalAddress && !editing" no-gutters>
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
                    <v-col v-if="sameAsMailingCheckbox && !editing" class="fontItalic">
                      <span>Same as Mailing Address</span>
                    </v-col>
                    <v-col v-else>
                      <v-row no-gutters>
                        <v-col>
                          <v-row no-gutters>
                            <v-col>
                              <v-row v-if="!sameAsMailingCheckbox" no-gutters>
                                <v-col>
                                  <v-row no-gutters>
                                    <v-col style="color: grey">
                                      Line 1
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col cols="8">
                                      <v-text-field id="physicalAddressLine1" required :rules="addressLine1Rules" :maxlength="255" class="shrink mt-n5 mb-3" v-model="getPhysicalAddressCopy()[0].addressLine1">
                                      </v-text-field>
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col style="color: grey">
                                      Line 2
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col cols="8">
                                      <v-text-field id="physicalAddressLine2" class="shrink mt-n5 mb-3" v-model="getPhysicalAddressCopy()[0].addressLine2">
                                      </v-text-field>
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col style="color: grey">
                                      City
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col cols="8">
                                      <v-text-field id="physicalAddressCity" required :rules="cityRules" :maxlength="255" class="shrink mt-n5 mb-3" v-model="getPhysicalAddressCopy()[0].city">
                                      </v-text-field>
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col style="color: grey">
                                      Province
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col cols="8">
                                      <v-select
                                        id="physicalAddressProvince"
                                        :items="this.provinceCodeValues"
                                        item-text="label"
                                        item-value="provinceCode"
                                        v-model="getPhysicalAddressCopy()[0].provinceCode"
                                        dense
                                        required
                                        :rules="provinceRules"
                                        outlined
                                        class="mt-2"
                                        style="color: black">
                                      </v-select>
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col style="color: grey">
                                      Country
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col cols="8">
                                      <v-select
                                        id="physicalAddressCountry"
                                        :items="this.countryCodeValues"
                                        item-text="label"
                                        item-value="countryCode"
                                        v-model="getPhysicalAddressCopy()[0].countryCode"
                                        dense
                                        :rules="countryRules"
                                        required
                                        outlined
                                        class="mt-2 mb-2"
                                        style="color: black">
                                      </v-select>
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col style="color: grey">
                                      Postal Code
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col cols="8">
                                      <v-text-field id="physicalAddressPostal" required :rules="postalRules" :maxlength="6" class="shrink mt-n5 mb-3" v-model="getPhysicalAddressCopy()[0].postal">
                                      </v-text-field>
                                    </v-col>
                                  </v-row>
                                </v-col>
                              </v-row>
                              <v-row no-gutters>
                                <v-col>
                                  <v-checkbox
                                    dense
                                    id="sameAsMailingCheckbox"
                                    @click.native="clickSameAsAddressButton"
                                    v-model="sameAsMailingCheckbox"
                                    label="Same as mailing address"
                                    class="mt-n3 pt-0"
                                  ></v-checkbox>
                                </v-col>
                              </v-row>
                            </v-col>
                          </v-row>
                        </v-col>
                      </v-row>
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

import ApiService from '../../common/apiService';
import {ApiRoutes} from '@/utils/constants';
import alertMixin from '@/mixins/alertMixin';
import PrimaryButton from '@/components/util/PrimaryButton';
import {formatPhoneNumber} from '@/utils/format';
import {sanitizeUrl} from '@braintree/sanitize-url';
import {deepCloneObject} from '@/utils/common';
import {mapGetters, mapState} from 'vuex';

export default {
  name: 'DistrictDetailsPage',
  mixins: [alertMixin],
  components: {PrimaryButton},
  props: {
    districtID: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      district: null,
      districtCopy: null,
      districtFormValid: true,
      sameAsMailingCheckbox: true,
      editing: false,
      loading: false,
      provinceCodeValues: null,
      countryCodeValues: null,
      cleanWebsiteUrl: '',
      addressLine1Rules: [
        v => !!v || 'Address Line 1 is required'
      ],
      cityRules: [
        v => !!v || 'City is required'
      ],
      provinceRules: [
        v => !!v || 'Province is required'
      ],
      countryRules: [
        v => !!v || 'Country is required'
      ],
      postalRules: [
        v => !!v || 'Postal code is required',
        v => /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i.test(v) || 'Postal code must be valid',
      ],
      phNumRules: [
        v => !!v || 'Phone Number is required',
        v => (v && v.length <= 10) || 'Phone Number must be 10 digits',
        v => /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(v) || 'Phone Number must be valid',
      ],
      faxNumRules: [
        v => !v || /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(v) || 'Fax Number must be valid',
      ],
      emailRules: [
        v => !!v || 'E-mail is required',
        v => /^[a-z\d]+@[a-z]+\.[a-z]{2,3}$/.test(v) || 'E-mail must be valid',
      ],
      websiteRules: [
        v => /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/.test(v) || 'Website must be valid',
      ],
    };
  },
  computed:{
    ...mapState('institute', ['provinceCodes', 'countryCodes']),
    ...mapGetters('auth', ['userInfo']),
    hasSamePhysicalAddress(){
      return !this.district.addresses.filter(address => address.addressTypeCode === 'PHYSICAL').length > 0;
    }
  },
  created() {
    this.$store.dispatch('institute/getProvinceCodes').then(() => {
      this.provinceCodeValues = this.provinceCodes.filter(province =>  province.provinceCode === 'BC' || province.provinceCode === 'YT');
    });
    this.$store.dispatch('institute/getCountryCodes').then(() => {
      this.countryCodeValues = this.countryCodes;
    });
    this.getDistrict();
  },
  methods: {
    formatPhoneNumber,
    deepCloneObject,
    canEditDistrict(){
      return this.userInfo?.activeInstitutePermissions?.filter(perm => perm === 'EDX_USER_DISTRICT_ADMIN').length > 0;
    },
    getDistrict() {
      this.loading = true;

      ApiService.apiAxios.get(ApiRoutes.district.BASE_URL + '/' + this.districtID, {
      }).then(response => {
        this.district = response.data;
        this.cleanWebsiteUrl = this.district.website ? sanitizeUrl(this.district.website) : '';
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
    saveDistrict() {
      this.loading = true;

      if(this.sameAsMailingCheckbox){
        this.districtCopy.addresses = this.districtCopy.addresses.filter(address => address.addressTypeCode === 'MAILING');
      }

      const payload = this.districtCopy;
      ApiService.apiAxios.post(`${ApiRoutes.district.BASE_URL}` + '/' + this.districtCopy.districtId, payload)
        .then(() => {
          this.setSuccessAlert('Success! The district has been updated.');
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while saving the district information. Please try again later.');
        })
        .finally(() => {
          this.toggleEdit();
          this.getDistrict();
        });
    },
    getMailingAddressCopy(){
      return this.districtCopy.addresses.filter(address => address.addressTypeCode === 'MAILING');
    },
    getPhysicalAddressCopy(){
      return this.districtCopy.addresses.filter(address => address.addressTypeCode === 'PHYSICAL');
    },
    async toggleEdit(){
      this.districtCopy = this.deepCloneObject(this.district);
      this.setHasSamePhysicalFlag();
      this.addAddressesIfRequired(this.districtCopy);
      this.editing = !this.editing;
      await this.$nextTick();
      this.$refs.districtForm.validate();
    },
    isNumber: function(evt) {
      let charCode = (evt.which) ? evt.which : evt.keyCode;
      if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46) {
        evt.preventDefault();
      } else {
        return true;
      }
    },
    addAddressesIfRequired(district){
      let addresses = district.addresses;
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
    hasMailingAddress(){
      return this.district.addresses.filter(address => address.addressTypeCode === 'MAILING').length > 0;
    },
    hasPhysicalAddress(){
      return this.district.addresses.filter(address => address.addressTypeCode === 'PHYSICAL').length > 0;
    },
    async clickSameAsAddressButton(){
      await this.$nextTick();
      this.$refs.districtForm.validate();
    },
    getMailingAddressItem(item){
      let mailingAddress = this.district.addresses.filter(address => address.addressTypeCode === 'MAILING');
      for (const x in mailingAddress[0]) {
        if(x === item){
          return mailingAddress[0][item];
        }
      }
    },
    getPhysicalAddressItem(item){
      let physicalAddress = this.district.addresses.filter(address => address.addressTypeCode === 'PHYSICAL');
      for (const x in physicalAddress[0]) {
        if(x === item){
          return physicalAddress[0][item];
        }
      }
    },
    cancelClicked(){
      this.editing = false;
      this.setHasSamePhysicalFlag();
    },
    backButtonClick() {
      this.$router.push({name: 'home'});
    },
  }
};
</script>

<style scoped>
.divider {
  border-color: #FCBA19;
  border-width: medium;
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

@media screen and (max-width: 1200px) {
  .containerSetup{
    padding-right: 4em !important;
    padding-left: 4em !important;
  }
}

</style>
