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
              <PrimaryButton class="mr-2 mb-3" secondary id="viewContactsButton" icon="mdi-account-multiple-outline" text="View District Contacts" :clickAction="redirectToDistrictContacts"></PrimaryButton>
              <PrimaryButton id="editButton" icon-left width="6em" icon="mdi-pencil" text="Edit" :disabled="!canEditDistrict()" :clickAction="toggleEdit"></PrimaryButton>
            </v-col>
            <v-col v-else cols="6" class="d-flex justify-end">
              <PrimaryButton class="mr-2" secondary id="cancelButton" icon-left width="6em" text="Cancel" :clickAction="cancelClicked"></PrimaryButton>
              <PrimaryButton id="saveButton" icon-left width="6em" text="Save" :disabled="!districtFormValid" :clickAction="saveDistrict"></PrimaryButton>
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
              <div v-if="!editing">
                <span v-if="district.phoneNumber" class="ml-n1">{{ formatPhoneNumber(district.phoneNumber) }}</span>
                <a v-if="showEditLinks(district.phoneNumber)" class="editField" @click="toggleEdit">+Phone</a>
              </div>
              <v-text-field variant="underlined" id="districtPhone" v-else class="py-0" @keypress="isNumber($event)" required :maxlength="10" :rules="[rules.required(), rules.phoneNumber()]" v-model="districtCopy.phoneNumber">
              </v-text-field>
            </v-col>
            <v-col class="d-flex">
              <v-icon class="mb-1 mr-1" aria-hidden="false">
                mdi-at
              </v-icon>
              <div v-if="!editing">
                <span v-if="district.email" class="ml-n1">{{ district.email }}</span>
                <a v-if="showEditLinks(district.email)" class="editField" @click="toggleEdit">+Email</a>
              </div>
              <v-text-field variant="underlined" id="districtEmail" v-else class="py-0" required :rules="[rules.required(), rules.email()]" :maxlength="255" v-model="districtCopy.email">
              </v-text-field>
            </v-col>
            <v-col class="d-flex">
              <v-icon class="mb-1 mr-1" aria-hidden="false">
                mdi-fax
              </v-icon>
              <div v-if="!editing">
                <span v-if="district.faxNumber" class="ml-n1">{{ formatPhoneNumber(district.faxNumber) }}</span>
                <a v-if="showEditLinks(district.faxNumber)" class="editField" @click="toggleEdit">+Fax</a>
              </div>
              <v-text-field variant="underlined" v-else class="py-0" @keypress="isNumber($event)" :rules="[rules.phoneNumber('Fax number must be valid')]" :maxlength="10" v-model="districtCopy.faxNumber">
              </v-text-field>
            </v-col>
            <v-col class="d-flex">
              <v-icon class="mb-1 mr-1" aria-hidden="false">
                mdi-web
              </v-icon>
              <div v-if="!editing">
                <a v-if="cleanWebsiteUrl" :href="cleanWebsiteUrl" target="_blank">{{ cleanWebsiteUrl }}</a>
                <a v-if="showEditLinks(cleanWebsiteUrl)" class="editField" @click="toggleEdit">+Website</a>
              </div>
              <v-text-field variant="underlined" v-if="editing" class="py-0" :rules="[rules.website()]" :maxlength="255" v-model="districtCopy.website">
              </v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-divider class="divider"></v-divider>
            </v-col>
          </v-row>
          <v-row class="d-flex justify-start mb-2">
            <v-col cols="12" class="d-flex justify-start">
              <h2>Addresses</h2>
            </v-col>
          </v-row>
          <v-row v-if="!hasMailingAddress() && !editing" no-gutters class="d-flex justify-start">
            <v-col>
              <a class="editField" v-if="canEditDistrict()" @click="toggleEdit">+Address</a>
            </v-col>
          </v-row>
          <v-row v-else no-gutters class="d-flex justify-start">
            <v-col v-if="editing || hasMailingAddress()" cols="3">
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
                  <v-row class="ml-7" no-gutters>
                    <v-col>
                      <span style="word-break: break-all;">{{ getMailingAddressItem('addressLine1') }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="ml-7">
                      <span style="word-break: break-all;">{{ getMailingAddressItem('addressLine2') }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="ml-7">
                      <span style="word-break: break-all;">{{ getMailingAddressItem('city') + ', ' + getMailingAddressItem('provinceCode')  + ', ' + getMailingAddressItem('countryCode') }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="ml-7">
                      <span style="word-break: break-all;">{{ getMailingAddressItem('postal') }}</span>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
              <v-row class="mt-8" v-else no-gutters>
                <v-col>
                  <v-row class="ml-7" no-gutters>
                    <v-col cols="8">
                      <v-text-field label="Line 1" variant="underlined" id="mailAddressLine1" required :rules="[rules.required()]" :maxlength="255" class="mt-n5 mb-3" v-model="getMailingAddressCopy()[0].addressLine1">
                      </v-text-field>
                    </v-col>
                  </v-row>
                  <v-row class="ml-7" no-gutters>
                    <v-col cols="8">
                      <v-text-field label="Line 2" variant="underlined" id="mailAddressLine2" class="mt-n5 mb-3" :maxlength="255" v-model="getMailingAddressCopy()[0].addressLine2">
                      </v-text-field>
                    </v-col>
                  </v-row>
                  <v-row class="ml-7" no-gutters>
                    <v-col cols="8">
                      <v-text-field label="City" variant="underlined" id="mailAddressCity" required :rules="[rules.required()]" class="mt-n5 mb-3" :maxlength="255" v-model="getMailingAddressCopy()[0].city">
                      </v-text-field>
                    </v-col>
                  </v-row>
                  <v-row class="ml-7" no-gutters>
                    <v-col cols="8" class="d-flex">
                      <v-select
                        id="mailAddressProvince"
                        label="Province"
                        :items="this.provinceCodeValues"
                        variant="underlined"
                        item-title="label"
                        item-value="provinceCode"
                        v-model="getMailingAddressCopy()[0].provinceCode"
                        dense
                        outlined
                        :rules="[rules.required()]"
                        required
                        class="mt-n3"
                        style="color: black">
                      </v-select>
                    </v-col>
                  </v-row>
                  <v-row class="ml-7" no-gutters>
                    <v-col cols="8" class="d-flex">
                      <v-select
                        id="mailAddressCountry"
                        label="Country"
                        variant="underlined"
                        :items="this.countryCodeValues"
                        item-title="label"
                        item-value="countryCode"
                        :rules="[rules.required()]"
                        v-model="getMailingAddressCopy()[0].countryCode"
                        dense
                        outlined
                        class="mb-4"
                        style="color: black">
                      </v-select>
                    </v-col>
                  </v-row>
                  <v-row class="ml-7" no-gutters>
                    <v-col cols="8">
                      <v-text-field label="Postal Code" variant="underlined" :maxlength="6" required :rules="[rules.required(), rules.postalCode()]"  id="mailAddressPostal" class="mt-n5 mb-3" v-model="getMailingAddressCopy()[0].postal">
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
                    <v-col class="ml-7">
                      <span style="word-break: break-all;">{{ getPhysicalAddressItem('addressLine1') }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="ml-7">
                      <span style="word-break: break-all;">{{ getPhysicalAddressItem('addressLine2') }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="ml-7">
                      <span style="word-break: break-all;">{{ getPhysicalAddressItem('city') + ', ' + getPhysicalAddressItem('provinceCode')  + ', ' + getPhysicalAddressItem('countryCode') }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="ml-7">
                      <span style="word-break: break-all;">{{ getPhysicalAddressItem('postal') }}</span>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
              <v-row v-else no-gutters>
                <v-col>
                  <v-row class="ml-7" no-gutters>
                    <v-col v-if="sameAsMailingCheckbox && !editing" class="fontItalic">
                      <span>Same as Mailing Address</span>
                    </v-col>
                    <v-col v-else>
                      <v-row no-gutters>
                        <v-col>
                          <v-row no-gutters>
                            <v-col>
                              <v-row class="mt-8" v-if="!sameAsMailingCheckbox" no-gutters>
                                <v-col>
                                  <v-row no-gutters>
                                    <v-col cols="8">
                                      <v-text-field label="Line 1" variant="underlined" id="physicalAddressLine1" required :rules="[rules.required()]" :maxlength="255" class="mt-n5 mb-3" v-model="getPhysicalAddressCopy()[0].addressLine1">
                                      </v-text-field>
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col cols="8">
                                      <v-text-field label="Line 2" variant="underlined" id="physicalAddressLine2" :maxlength="255" class="mt-n5 mb-3" v-model="getPhysicalAddressCopy()[0].addressLine2">
                                      </v-text-field>
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col cols="8">
                                      <v-text-field label="City" variant="underlined" id="physicalAddressCity" required :rules="[rules.required()]" :maxlength="255" class="mt-n5 mb-3" v-model="getPhysicalAddressCopy()[0].city">
                                      </v-text-field>
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col cols="8">
                                      <v-select
                                        id="physicalAddressProvince"
                                        label="Province"
                                        variant="underlined"
                                        :items="this.provinceCodeValues"
                                        item-title="label"
                                        item-value="provinceCode"
                                        v-model="getPhysicalAddressCopy()[0].provinceCode"
                                        dense
                                        required
                                        :rules="[rules.required()]"
                                        outlined
                                        class="mt-n3"
                                        style="color: black">
                                      </v-select>
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col cols="8">
                                      <v-select
                                        label="Country"
                                        variant="underlined"
                                        id="physicalAddressCountry"
                                        :items="this.countryCodeValues"
                                        item-title="label"
                                        item-value="countryCode"
                                        v-model="getPhysicalAddressCopy()[0].countryCode"
                                        dense
                                        :rules="[rules.required()]"
                                        required
                                        outlined
                                        class="mb-4"
                                        style="color: black">
                                      </v-select>
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col cols="8">
                                      <v-text-field label="Postal Code" variant="underlined" id="physicalAddressPostal" required :rules="[rules.required(), rules.postalCode()]" :maxlength="6" class="mt-n5 mb-3" v-model="getPhysicalAddressCopy()[0].postal">
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
                                    label="Same as Mailing Address"
                                    class="mt-n3 pt-0 ml-n3"
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
    <ConfirmationDialog ref="confirmSchoolDetailsUpdateAndSave">
      <template v-slot:message>
        <p>All changes made to district details will be <strong>available to the public on save</strong>.</p>
        <p>Please be sure to review your changes carefully before you publish them.</p>
      </template>
    </ConfirmationDialog>
  </v-form>
</template>

<script>

import ApiService from '../../common/apiService';
import {ApiRoutes} from '../../utils/constants';
import alertMixin from '../../mixins/alertMixin';
import PrimaryButton from '../util/PrimaryButton.vue';
import {formatPhoneNumber} from '../../utils/format';
import {sanitizeUrl} from '@braintree/sanitize-url';
import {deepCloneObject} from '../../utils/common';
import { mapState } from 'pinia';
import { authStore } from '../../store/modules/auth';
import { instituteStore } from '../../store/modules/institute';
import * as Rules from '../../utils/institute/formRules';
import {isNumber} from '../../utils/institute/formInput';
import ConfirmationDialog from '../../components/util/ConfirmationDialog.vue';

export default {
  name: 'DistrictDetailsPage',
  mixins: [alertMixin],
  components: {
    PrimaryButton,
    ConfirmationDialog,
  },
  props: {
    districtID: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      district: null,
      districtCopy:  {},
      districtFormValid: true,
      sameAsMailingCheckbox: true,
      editing: false,
      loading: false,
      provinceCodeValues: null,
      countryCodeValues: null,
      cleanWebsiteUrl: '',
      rules: Rules,
    };
  },
  computed:{
    ...mapState(instituteStore, ['provinceCodes', 'countryCodes']),
    ...mapState(authStore, ['userInfo']),
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
    formatPhoneNumber,
    isNumber,
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
    async saveDistrict() {
      const confirmation = await this.$refs.confirmSchoolDetailsUpdateAndSave.open('Confirm Updates to District Details', null, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Publish Changes', rejectText: 'Return to District Details'});
      if (!confirmation) {
        return;
      }
      this.loading = true;

      if(this.sameAsMailingCheckbox){
        this.districtCopy.addresses = this.districtCopy.addresses.filter(address => address.addressTypeCode === 'MAILING');
      }

      const payload = this.districtCopy;
      ApiService.apiAxios.post(`${ApiRoutes.district.BASE_URL}` + '/' + this.districtCopy.districtId, payload)
        .then(() => {
          this.setSuccessAlert('Success! The district details have been updated.');
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
    showEditLinks(fieldValue) {
      return this.canEditDistrict() && !fieldValue;
    },
    redirectToDistrictContacts(){
      this.$router.push({name: 'districtContacts', params: {districtID: this.districtID}});
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
  },
};
</script>

<style scoped>
.divider {
  border-color: #FCBA19;
  border-width: unset;
  opacity: unset;
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
.editField {
  font-size: 14px;
  color: rgb(0, 51, 102);
  vertical-align: super;
}

.editField:hover {
  text-decoration: underline;
}

</style>
